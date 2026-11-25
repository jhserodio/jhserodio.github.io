/**
 * Transactional worker lifecycle for the CVRP browser app.
 * A result is accepted only from the currently active worker and request id.
 * Every edit/generation/cancellation invalidates the previous solution.
 */
export function createCvrpSession({ createWorker, onState, onResult, onError }) {
  let active = null;
  let revision = 0;
  let phase = 'idle';

  function state(next, extra = {}) {
    phase = next;
    onState?.({ phase: next, revision, ...extra });
  }

  function disposeActive() {
    if (!active) return;
    const worker = active.worker;
    active = null;
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
    if (active) disposeActive();
    const id = ++revision;
    state('solving', { instance });
    let worker;
    try {
      worker = createWorker();
      active = { id, worker };
      worker.onmessage = ({ data }) => {
        if (active?.worker !== worker || active.id !== id || data?.id !== id) return;
        disposeActive();
        if (data.error) {
          state('error');
          onError?.(String(data.error));
          return;
        }
        state('resolved');
        onResult?.(data.result, instance);
      };
      const fail = (error) => {
        if (active?.worker !== worker || active.id !== id) return;
        disposeActive();
        state('error');
        onError?.(error?.message || String(error));
      };
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
    getSnapshot: () => ({ phase, revision, busy: !!active }),
  });
}
