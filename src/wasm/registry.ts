/**
 * O bundle só é carregado ao executar o app. O diretório public/wasm
 * é preenchido por wasm-pack na Fase 3 e não é versionado.
 */
export const wasmModules = {
  'cvrp-solver': async () => {
    const path = '/wasm/cvrp-solver/cvrp_solver_wasm.js';
    return import(/* @vite-ignore */ path) as Promise<{
      default: (url?: string | URL) => Promise<unknown>;
      solve?: (input: string) => string;
    }>;
  },
} as const;
export type WasmModuleName = keyof typeof wasmModules;
