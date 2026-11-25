import test from 'node:test';
import assert from 'node:assert/strict';
import { createCvrpSession } from '../src/client/cvrp-session.mjs';

function fixture() {
  const workers = [], phases = [], results = [], errors = [];
  const session = createCvrpSession({
    createWorker: () => {
      const worker = {
        sent: [], terminated: false,
        onmessage: null, onerror: null, onmessageerror: null,
        postMessage(value) { this.sent.push(value); },
        terminate() { this.terminated = true; },
        deliver(data) { this.onmessage?.({ data }); },
        crash(message) { this.onerror?.({ message }); },
      };
      workers.push(worker);
      return worker;
    },
    onState: value => phases.push(value.phase),
    onResult: (result, instance) => results.push({ result, instance }),
    onError: message => errors.push(message),
  });
  const instance = i => ({ marker: i });
  function resolve(value = 'optimal') {
    const worker = workers.at(-1), message = worker.sent.at(-1);
    worker.deliver({ id: message.id, result: { status: value, id: message.id } });
  }
  return { session, workers, phases, results, errors, instance, resolve };
}

test('run -> solve -> edit -> run -> solve is repeatable, with no stuck busy state', () => {
  const f = fixture();
  for (let i = 1; i <= 12; i++) {
    f.session.start(f.instance(i));
    assert.equal(f.session.getSnapshot().phase, 'solving');
    assert.equal(f.session.getSnapshot().busy, true);
    f.resolve();
    assert.equal(f.session.getSnapshot().phase, 'resolved');
    assert.equal(f.session.getSnapshot().busy, false);
    assert.equal(f.results.at(-1).instance.marker, i);
    assert.ok(f.workers.at(-1).terminated);
    f.session.invalidate();
    assert.equal(f.session.getSnapshot().phase, 'idle');
  }
  assert.equal(f.results.length, 12);
  assert.equal(f.errors.length, 0);
});

test('invalidating or restarting a run terminates old worker and ignores stale reply', () => {
  const f = fixture();
  f.session.start(f.instance(1));
  const old = f.workers.at(-1), oldOnMessage = old.onmessage, oldId = old.sent[0].id;
  f.session.invalidate();
  assert.ok(old.terminated);
  f.session.start(f.instance(2));
  oldOnMessage({ data: { id: oldId, result: { status: 'optimal' } } });
  assert.equal(f.session.getSnapshot().phase, 'solving');
  assert.equal(f.results.length, 0);
  f.resolve();
  assert.equal(f.results.length, 1);
  assert.equal(f.results[0].instance.marker, 2);
});

test('explicit restart while busy always prioritizes newest instance', () => {
  const f = fixture();
  f.session.start(f.instance(1));
  const first = f.workers[0], reply = first.onmessage, id = first.sent[0].id;
  f.session.start(f.instance(2));
  assert.ok(first.terminated);
  reply({ data: { id, result: { status: 'optimal' } } });
  f.resolve('infeasible');
  assert.equal(f.results.length, 1);
  assert.equal(f.results[0].result.status, 'infeasible');
  assert.equal(f.results[0].instance.marker, 2);
});

test('cancel -> regenerate -> solve -> cancel -> solve has no stale output', () => {
  const f = fixture();
  f.session.start(f.instance(1));
  assert.equal(f.session.cancel(), true);
  assert.equal(f.session.cancel(), false);
  assert.equal(f.session.getSnapshot().phase, 'cancelled');
  f.session.invalidate();
  f.session.start(f.instance(2));
  assert.equal(f.session.cancel(), true);
  f.session.start(f.instance(3));
  f.resolve();
  assert.equal(f.results.length, 1);
  assert.equal(f.results[0].instance.marker, 3);
  assert.equal(f.workers.every(w => w.terminated), true);
});

test('worker errors and malformed worker responses recover to allow another run', () => {
  const f = fixture();
  f.session.start(f.instance(1));
  f.workers.at(-1).crash('wasm failed');
  assert.equal(f.session.getSnapshot().busy, false);
  assert.equal(f.errors[0], 'wasm failed');
  f.session.start(f.instance(2));
  const worker = f.workers.at(-1), id = worker.sent[0].id;
  worker.deliver({ id, error: 'invalid input' });
  assert.equal(f.errors[1], 'invalid input');
  f.session.start(f.instance(3));
  f.resolve();
  assert.equal(f.results.length, 1);
});

test('worker construction and postMessage failures restore idle controls', () => {
  const errors = [], phases = [];
  const failFactory = createCvrpSession({
    createWorker() { throw new Error('blocked by browser'); },
    onState: value => phases.push(value.phase),
    onError: value => errors.push(value),
  });
  failFactory.start({ demands: [] });
  assert.equal(failFactory.getSnapshot().busy, false);
  assert.deepEqual(phases, ['solving', 'error']);
  assert.deepEqual(errors, ['blocked by browser']);
  const badPost = createCvrpSession({
    createWorker() { return { postMessage() { throw Error('clone error'); }, terminate() {} }; },
    onError: value => errors.push(value),
  });
  badPost.start({});
  assert.equal(badPost.getSnapshot().busy, false);
  assert.equal(errors.at(-1), 'clone error');
});

test('cross-product of edit, regenerate, cancel and solve orders cannot leak state', () => {
  const operations = ['start', 'resolve', 'invalidate', 'cancel'];
  // Exhaust all 4^5 orderings to exercise every short transition sequence.
  for (let encoded = 0; encoded < 1024; encoded++) {
    let sequence = encoded;
    const f = fixture();
    let started = 0;
    for (let step = 0; step < 5; step++) {
      const op = operations[sequence % 4];
      sequence = Math.floor(sequence / 4);
      if (op === 'start') {
        started++;
        f.session.start(f.instance(started));
      } else if (op === 'resolve') {
        if (f.session.getSnapshot().busy) f.resolve();
      } else if (op === 'invalidate') {
        f.session.invalidate();
      } else {
        f.session.cancel();
      }
      assert.equal(f.session.getSnapshot().busy, f.session.getSnapshot().phase === 'solving');
    }
    f.session.invalidate();
    assert.equal(f.session.getSnapshot().phase, 'idle');
    assert.equal(f.workers.every(w => w.terminated), true);
    f.session.start(f.instance(987));
    f.resolve();
    assert.equal(f.session.getSnapshot().phase, 'resolved');
    assert.equal(f.results.at(-1).instance.marker, 987);
  }
});
