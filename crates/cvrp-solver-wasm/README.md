# CVRP Solver — WebAssembly adapter

This small wasm-bindgen adapter calls the **original exact Rust library**
from [logistic_problem_with_max_capacity](https://github.com/jhserodio/logistic_problem_with_max_capacity).
The solver Git revision is pinned in the crate manifest.

Run the Rust unit tests in the original repository. To build this WASM wrapper:

```sh
rustup target add wasm32-unknown-unknown
wasm-pack build crates/cvrp-solver-wasm --target web --out-dir ../../public/wasm/cvrp-solver
```

The adapter exposes `solve(input: string): string`, where the input is
an `Instance` JSON object and the result is JSON with `status`,
`routes` and `total_distance`. Browser work is performed inside a Worker.

Do not commit generated `public/wasm` assets. GitHub Pages publishes them
from the CI build instead.
