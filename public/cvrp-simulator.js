import { defaultInstance, sampleInstance } from '/cvrp-sample.mjs';

const SVG_NS = 'http://www.w3.org/2000/svg';
const COLORS = ['#8fc9ff', '#3bc9a5', '#f59e67', '#b39bff', '#e5ba55', '#f08cb3'];

function svgNode(tag, attributes = {}, text) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attributes)) el.setAttribute(key, String(value));
  if (text !== undefined) el.textContent = String(text);
  return el;
}

function customerName(i) {
  return i === 0 ? '0' : String.fromCharCode(64 + i);
}

function drawGraph(svg, instance, routes = []) {
  svg.replaceChildren();
  if (!instance?.demands || !Array.isArray(instance.demands)) return;
  const n = instance.demands.length;
  if (n < 1 || n > 12) return;

  const positions = [{ x: 450, y: 283 }];
  for (let i = 0; i < n; i++) {
    const angle = -Math.PI / 2 + i * (2 * Math.PI / n);
    positions.push({
      x: 450 + 333 * Math.cos(angle),
      y: 282 + 203 * Math.sin(angle),
    });
  }

  const defs = svgNode('defs');
  for (let i = 0; i < COLORS.length; i++) {
    const marker = svgNode('marker', {
      id: 'cvrp-arrow-' + i, viewBox: '0 0 12 12',
      refX: 10, refY: 6, markerWidth: 7, markerHeight: 7, orient: 'auto',
    });
    marker.append(svgNode('path', { d: 'M 0 0 L 12 6 L 0 12 z', fill: COLORS[i] }));
    defs.append(marker);
  }
  svg.append(defs);

  for (let idx = 0; idx < routes.length; idx++) {
    const color = COLORS[idx % COLORS.length];
    const stops = routes[idx].stops;
    for (let j = 0; j + 1 < stops.length; j++) {
      const fromIndex = stops[j], toIndex = stops[j + 1];
      const from = positions[fromIndex], to = positions[toIndex];
      if (!from || !to || fromIndex === toIndex) continue;

      const dx = to.x - from.x, dy = to.y - from.y;
      const size = Math.hypot(dx, dy);
      if (size === 0) continue;
      const ux = dx / size, uy = dy / size;
      const aRadius = fromIndex === 0 ? 34 : 29;
      const bRadius = toIndex === 0 ? 34 : 29;
      const x1 = from.x + ux * aRadius, y1 = from.y + uy * aRadius;
      const x2 = to.x - ux * (bRadius + 7), y2 = to.y - uy * (bRadius + 7);
      svg.append(svgNode('line', {
        x1, y1, x2, y2, stroke: color, 'stroke-width': 3,
        'stroke-linecap': 'round', 'marker-end': 'url(#cvrp-arrow-' + (idx % COLORS.length) + ')',
      }));

      // The weight diamond sits directly on its corresponding edge.
      const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
      const diamond = svgNode('polygon', {
        points: [
          [cx, cy - 16], [cx + 22, cy], [cx, cy + 16], [cx - 22, cy],
        ].map(pair => pair.map(x => x.toFixed(1)).join(',')).join(' '),
        fill: '#e2e8f0', stroke: '#94a3b8', 'stroke-width': 1.7,
      });
      svg.append(diamond);
      const cost = instance.distances?.[fromIndex]?.[toIndex];
      svg.append(svgNode('text', {
        x: cx, y: cy + 5, 'font-size': 17, 'text-anchor': 'middle',
        'font-weight': 400, fill: '#64748b',
      }, cost === undefined ? '?' : cost));
    }
  }

  // Draw nodes last so no directed edge can obscure a customer label.
  for (let i = 0; i <= n; i++) {
    const p = positions[i], depot = i === 0;
    const g = svgNode('g');
    g.append(svgNode('circle', {
      cx: p.x, cy: p.y, r: depot ? 34 : 29,
      fill: depot ? '#fff1c2' : '#f8fafc',
      stroke: depot ? '#eab957' : '#8fc9ff', 'stroke-width': 3,
    }));
    g.append(svgNode('text', {
      x: p.x, y: p.y + 8, 'text-anchor': 'middle',
      'font-size': 26, 'font-weight': 400, fill: '#10151d',
    }, customerName(i)));
    if (i !== 0) {
      g.append(svgNode('text', {
        x: p.x, y: p.y + 49, 'text-anchor': 'middle', 'font-size': 15, fill: '#c6d6ea',
      }, 'd=' + instance.demands[i - 1]));
    }
    svg.append(g);
  }
}

function validateInstance(input) {
  if (!input || !Array.isArray(input.demands) || input.demands.length < 1 || input.demands.length > 12) {
    throw new Error('The browser demo supports 1–12 customers.');
  }
  const n = input.demands.length;
  const isPositive = x => Number.isSafeInteger(x) && x > 0;
  if (!input.demands.every(isPositive)) throw new Error('Demands must be positive integers.');
  if (!isPositive(input.vehicle_capacity) || !isPositive(input.max_route_distance)
    || !isPositive(input.max_vehicles)) throw new Error('Q, K and L must be positive integers.');
  if (!Array.isArray(input.distances) || input.distances.length !== n + 1
    || !input.distances.every((row, i) =>
      Array.isArray(row) && row.length === n + 1 &&
      row.every((v, j) => Number.isSafeInteger(v) && v >= 0 && (i !== j || v === 0)))) {
    throw new Error('Expected a square non-negative integer matrix with zero diagonal.');
  }
}

function appendText(parent, tag, content, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = String(content);
  parent.append(el);
  return el;
}

document.querySelectorAll('[data-cvrp-root]').forEach((root) => {
  const lang = root.dataset.lang === 'pt' ? 'pt' : 'en';
  const pt = lang === 'pt';
  const form = root.querySelector('[data-cvrp-form]');
  const textarea = root.querySelector('[data-cvrp-json]');
  const svg = root.querySelector('[data-cvrp-graph]');
  const status = root.querySelector('[data-cvrp-status]');
  const results = root.querySelector('[data-cvrp-results]');
  const runButton = root.querySelector('[data-cvrp-run]');
  const cancelButton = root.querySelector('[data-cvrp-cancel]');
  const regenerateButton = root.querySelector('[data-cvrp-generate]');
  const getInput = key => root.querySelector('[data-cvrp-' + key + ']');
  if (!form || !textarea || !svg || !status || !results || !runButton || !cancelButton) return;

  let activeWorker = null;
  let nextId = 0;

  function statusMessage(message, isError = false) {
    status.textContent = message;
    status.classList.toggle('cvrp-status-error', isError);
  }

  function finishWorker() {
    if (activeWorker) activeWorker.terminate();
    activeWorker = null;
    runButton.disabled = false;
    cancelButton.disabled = true;
  }

  function createSample() {
    const n = Number(getInput('n').value);
    const q = Number(getInput('q').value);
    const k = Number(getInput('k').value);
    const l = Number(getInput('l').value);
    const seed = Number(getInput('seed').value);
    const standard = n === 6 && q === 7 && k === 3 && l === 18 && seed === 7;
    return standard ? defaultInstance() : sampleInstance({ n, q, k, l, seed });
  }

  function regenerate() {
    if (activeWorker) finishWorker();
    try {
      const instance = createSample();
      textarea.value = JSON.stringify(instance, null, 2);
      results.replaceChildren();
      drawGraph(svg, instance);
      statusMessage(pt ? 'Instância gerada. Execute o solver para obter as rotas.' :
        'Instance generated. Run the solver to compute routes.');
    } catch (error) {
      statusMessage(String(error), true);
    }
  }

  for (const name of ['n', 'q', 'k', 'l', 'seed']) {
    getInput(name)?.addEventListener('change', regenerate);
  }
  regenerateButton?.addEventListener('click', regenerate);

  cancelButton.addEventListener('click', () => {
    finishWorker();
    statusMessage(pt ? 'Execução cancelada.' : 'Computation cancelled.');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (activeWorker) finishWorker();
    let instance;
    try {
      instance = JSON.parse(textarea.value);
      validateInstance(instance);
    } catch (error) {
      statusMessage(pt ? 'Entrada inválida: ' + String(error) : 'Invalid input: ' + String(error), true);
      return;
    }

    results.replaceChildren();
    drawGraph(svg, instance);
    statusMessage(pt ? 'Executando solver Rust/WASM…' : 'Running Rust/WASM solver…');
    runButton.disabled = true;
    cancelButton.disabled = false;
    const id = ++nextId;
    let worker;
    try {
      worker = new Worker('/cvrp-worker.js', { type: 'module' });
      activeWorker = worker;
    } catch (error) {
      finishWorker();
      statusMessage(String(error), true);
      return;
    }

    worker.onerror = (error) => {
      if (activeWorker !== worker) return;
      finishWorker();
      statusMessage(pt ? 'Falha ao carregar o solver WASM: ' + error.message :
        'Could not load WASM solver: ' + error.message, true);
    };
    worker.onmessage = (message) => {
      if (activeWorker !== worker || message.data.id !== id) return;
      finishWorker();

      if (message.data.error) {
        statusMessage(message.data.error, true);
        return;
      }
      const output = message.data.result;
      if (output.status === 'error') {
        statusMessage(output.message, true);
      } else if (output.status === 'infeasible') {
        statusMessage(pt ? 'Não existe solução viável para estes parâmetros.' :
          'No feasible solution exists for these parameters.');
      } else if (output.status === 'optimal') {
        statusMessage(pt ? 'Solução ótima encontrada pelo Rust.' : 'Optimal solution found by Rust.');
        appendText(results, 'p', (pt ? 'Distância total ótima: ' : 'Optimal total distance: ') +
          output.total_distance, 'cvrp-total');
        appendText(results, 'p', (pt ? 'Rotas utilizadas: ' : 'Vehicles used: ') +
          output.routes.length);
        const grid = document.createElement('div');
        grid.className = 'cvrp-route-grid';
        output.routes.forEach((route, index) => {
          const card = document.createElement('article');
          card.className = 'cvrp-route';
          card.style.setProperty('--route-color', COLORS[index % COLORS.length]);
          appendText(card, 'h4', (pt ? 'Rota ' : 'Route ') + (index + 1));
          appendText(card, 'p', route.stops.map(customerName).join(' → '));
          appendText(card, 'p', (pt ? 'Carga: ' : 'Load: ') + route.demand);
          appendText(card, 'p', (pt ? 'Distância: ' : 'Distance: ') + route.distance);
          grid.append(card);
        });
        results.append(grid);
        drawGraph(svg, instance, output.routes);
      } else {
        statusMessage(pt ? 'Resposta inesperada do solver.' : 'Unexpected solver response.', true);
      }
    };
    worker.postMessage({ id, instance });
  });

  regenerate();
});
