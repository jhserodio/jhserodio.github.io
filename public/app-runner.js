// Browser-side integration for active apps. Planned modules never render a form.
document.querySelectorAll('form.app-runner').forEach((element) => {
  if (!(element instanceof HTMLFormElement)) return;
  const form = element;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const output = form.querySelector('pre.result');
    const button = form.querySelector('button');
    const textarea = form.querySelector('textarea');
    if (!output || !button || !textarea) return;
    button.disabled = true;
    output.textContent = '...';
    try {
      const payload = JSON.parse(textarea.value);
      if (form.dataset.type === 'api-backed') {
        if (!form.dataset.api) throw new Error('API not configured');
        const response = await fetch(form.dataset.api, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        output.textContent = await response.text();
      } else if (form.dataset.type === 'wasm-interactive') {
        if (form.dataset.module !== 'cvrp-solver') throw new Error('Unknown WASM module');
        const solver = await import('/wasm/cvrp-solver/cvrp_solver_wasm.js');
        await solver.default();
        if (typeof solver.solve !== 'function') throw new Error('WASM solve() not implemented');
        output.textContent = solver.solve(JSON.stringify(payload));
      } else {
        throw new Error('Unsupported app type');
      }
    } catch (error) {
      output.textContent = String(error);
    } finally {
      button.disabled = false;
    }
  });
});
