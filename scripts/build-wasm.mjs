import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const manifest = 'crates/cvrp-solver-wasm/Cargo.toml';
if (!existsSync(manifest)) {
  console.log('[wasm] Fase 3 ainda não iniciada: pulando compilação Rust.');
  process.exit(0);
}
const result = spawnSync('wasm-pack', [
  'build', 'crates/cvrp-solver-wasm', '--target', 'web', '--out-dir',
  '../../public/wasm/cvrp-solver',
], { stdio: 'inherit', shell: process.platform === 'win32' });
if (result.error) {
  console.error('[wasm] Instale wasm-pack e o target wasm32-unknown-unknown para compilar o crate.');
  process.exit(1);
}
process.exit(result.status ?? 1);
