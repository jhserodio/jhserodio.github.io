/**
 * One active CVRP computation at a time. Results and errors are delivered only
 * for the latest request. The optional minimum loading duration affects UI
 * feedback, not computation or the Rust algorithm.
 */
export function createCvrpSession({
  createWorker,
  onState,
  onResult,
  onError,
  minLoadingMs = 0,
  now = () => performance.now(),
  schedule = (callback, delay) => setTimeout(callback, delay),
  unschedule = token => clearTimeout(token),
}) {
  let active = null;
  let revision = 0;
  let phase = 'idle';

  function state(next, extra = {}) {
    phase = next;
    onState?.({ phase: next, revision, ...extra });
  }

  function disposeActive() {
    if (!active) return;
    const { worker, timeout } = active;
    active = null;
    if (timeout !== null) unschedule(timeout);
    worker.onmessage = null;
    worker.onerror = null;
    worker.onmessageerror = null;
    worker.terminate();
  }

  function invalidate() {
    revision++;
    disposeActive();
    state('idle');
  }

  function cancel() {
    if (!active) return false;
    revision++;
    disposeActive();
    state('cancelled');
    return true;
  }

  function start(instance) {
    disposeActive();
    const id = ++revision;
    const startedAt = now();
    state('solving', { instance });
    let worker;

    try {
      worker = createWorker();
      active = { id, worker, timeout: null, settling: false };

      const settle = (result, error) => {
        if (active?.id !== id || active.worker !== worker || active.settling) return;
        active.settling = true;
        const finish = () => {
          if (active?.id !== id || active.worker !== worker) return;
          disposeActive();
          if (error !== null) {
            state('error');
            onError?.(String(error));
          } else {
            state('resolved');
            onResult?.(result, instance);
          }
        };
        const remaining = Math.max(0, minLoadingMs - (now() - startedAt));
        if (remaining > 0) active.timeout = schedule(finish, remaining);
        else finish();
      };

      worker.onmessage = ({ data }) => {
        if (data?.id !== id) return;
        if (data.error) settle(null, data.error);
        else settle(data.result, null);
      };
      const fail = error => settle(null, error?.message || String(error));
      worker.onerror = fail;
      worker.onmessageerror = fail;
      worker.postMessage({ id, instance });
    } catch (error) {
      if (active?.worker === worker) disposeActive();
      state('error');
      onError?.(error instanceof Error ? error.message : String(error));
    }
    return id;
  }

  return Object.freeze({
    start, cancel, invalidate,
    getSnapshot: () => ({ phase, revision, busy: active !== null }),
  });
}
