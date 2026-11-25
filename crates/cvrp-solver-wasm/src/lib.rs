use logistic_problem_with_max_capacity::{solve as solve_cvrp, Instance};
use serde_json::{json, Value};
use wasm_bindgen::prelude::*;

/// Reuses the exact CVRP solver from the Rust CLI project.
/// The browser provides one complete instance encoded as JSON.
#[wasm_bindgen]
pub fn solve(input: &str) -> String {
    let result = (|| -> Result<Value, String> {
        let instance: Instance =
            serde_json::from_str(input).map_err(|error| format!("Invalid JSON: {error}"))?;
        match solve_cvrp(&instance)? {
            Some(solution) => Ok(json!({
                "status": "optimal",
                // Preserve u128 precision: JavaScript numbers cannot represent all such values.
                "total_distance": solution.total_distance.to_string(),
                "routes": solution.routes.iter().map(|route| json!({
                    "stops": route.stops,
                    "demand": route.demand,
                    "distance": route.distance
                })).collect::<Vec<_>>()
            })),
            None => Ok(json!({"status": "infeasible", "routes": []})),
        }
    })();

    match result {
        Ok(value) => value.to_string(),
        Err(message) => json!({"status": "error", "message": message}).to_string(),
    }
}
