# Fase 3 — cvrp-solver-wasm

Espaço reservado para o futuro crate `wasm-bindgen` com o solver CVRP real.
Não existe um solver implementado nesta base; o catálogo marca o app como `planned`.

Quando o crate for implementado, inclua seu caminho em `Cargo.toml` na raiz,
use `wasm-pack build crates/cvrp-solver-wasm --target web --out-dir ../../public/wasm/cvrp-solver`
e mude `status` para `active` nos JSON de ambos os idiomas.
O registry em `src/wasm/registry.ts` já espera esse diretório em runtime.
