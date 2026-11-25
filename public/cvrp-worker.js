// The exponential Rust CVRP solver runs only inside this dedicated Worker.
let initialized;
let modulePromise;

self.onmessage = async (event) => {
  const id = event.data?.id;
  try {
    if (!modulePromise) {
      modulePromise = import('/wasm/cvrp-solver/cvrp_solver_wasm.js');
    }
    const wasm = await modulePromise;
    if (!initialized) initialized = wasm.default();
    await initialized;
    const result = JSON.parse(wasm.solve(JSON.stringify(event.data.instance)));
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
