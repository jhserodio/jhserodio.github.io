---
title: "Math with Rust — Module 1: Algebraic Foundations & Divide and Conquer"
description: "Diving into binary exponentiation, binary search, arithmetic/geometric progressions, and custom logarithms implemented in bare-metal Rust."
lang: en
translationKey: math-with-rust-module-1-algebraic-foundations
publishedAt: 2026-08-16
tags: [rust, mathematics, numerical-analysis, algorithms, divide-and-conquer, math-with-rust]
cover: "/article-images/math-with-rust-module-1.jpg"
publish: true
---

> UNICENTRO — CEDETEG (Guarapuava — PR / Brazil)

Welcome to the first deep dive of our series on **Math with Rust**. You can explore the complete, tested codebase in my [quant-dev-roadmap](https://github.com/vnator/quant-dev-roadmap) repository.

In this module, we will explore the pure power of the **Divide and Conquer** paradigm and mathematical shortcuts. We will take naive algorithms that run in linear $\mathcal{O}(n)$ time and crush them down to logarithmic $\mathcal{O}(\log n)$ or even constant $\mathcal{O}(1)$ time.

Understanding these algorithms is not just an academic exercise; it is the foundation of writing high-performance software. We will explore the math, real-world market applications (with open-source examples), interview patterns, and bare-metal [Rust](https://doc.rust-lang.org/book/) implementations.



## 1. Fast Exponentiation (Binary Exponentiation)

If you want to calculate $x^n$ ($x$ to the power of $n$), the naive approach multiplies $x$ by itself $n$ times. If $n = 10^6$, that requires $10^6$ operations—an $\mathcal{O}(n)$ linear cost.

**Binary Exponentiation** uses algebraic properties to cut this complexity down to $\mathcal{O}(\log n)$. Instead of multiplying step-by-step, we halve the exponent at each step:

$$
x^n =
\begin{cases}
\left(x^{n/2}\right)^2 & \text{if } n \text{ is even}, \\
x \cdot \left(x^{(n-1)/2}\right)^2 & \text{if } n \text{ is odd}.
\end{cases}
$$

### Real-World Market Applications & Open Source

This is the absolute backbone of modern cryptography. When you send a message on WhatsApp or Signal, end-to-end encryption relies on cryptographic keys generated through modular exponentiation and elliptic curves. Without fast exponentiation, establishing a secure connection would take years instead of milliseconds.

- **OSS Framework:** Look at **`ring`** (a highly popular cryptography library in Rust) or OpenSSL. Their core RSA and Diffie-Hellman key exchange implementations rely entirely on optimized binary exponentiation to secure HTTPS traffic.

### Code Interviews (LeetCode)

- **LeetCode 50 — Pow(x, n) (Medium):** The classic interview question. You must implement `pow(x, n)` from scratch, handling negative exponents and edge cases in $\mathcal{O}(\log n)$ time.
- **LeetCode 372 — Super Pow (Medium):** Calculates $a^b \pmod{1337}$, where $b$ is a gigantic number represented as an array, combining fast exponentiation with modular arithmetic properties.

### The Rust Implementation

```rust title="binary_exponentiation.rs" {6-13}
/// Calculates base^exp in O(log n) time
pub fn binary_exponentiation(mut base: i64, mut exp: u32) -> i64 {
    let mut result: i64 = 1;

    while exp > 0 {
        // If the exponent is odd, accumulate the current base power
        if exp & 1 == 1 {
            result *= base;
        }
        // Square the base and halve the exponent
        base *= base;
        exp /= 2;
    }

    result
}
```

## 2. Binary Search & Bisection Method

Binary search finds a target in a sorted dataset by continually halving the search window. Mathematically, it relies on calculating the midpoint.

However, the naive formula `mid = (left + right) / 2` is famous for causing integer overflows in large systems. The safe arithmetic formula is:

$$
\text{mid} = \text{left} + \left\lfloor \frac{\text{right} - \text{left}}{2} \right\rfloor.
$$

**Extension:** The **Bisection Method** uses this exact same logic for continuous functions, finding roots by narrowing down a decimal interval $[a, b]$ where $f(a) \cdot f(b) < 0$.

### Real-World Market Applications & Open Source

Every major relational database relies on this concept. When you query a user by ID in an app like Instagram or Twitter, the database does not scan millions of rows; it traverses a B-Tree index using binary search principles.

- **OSS Framework:** The source code of **PostgreSQL** heavily implements these search patterns in its indexing engine.
- **DevOps Tooling:** Git features a command called `git bisect`, which uses binary search to pinpoint the exact commit that introduced a bug among thousands of changes, drastically reducing debugging time.

### Code Interviews (LeetCode)

- **LeetCode 704 — Binary Search (Easy):** The fundamental algorithm implementation on a standard array.
- **LeetCode 34 — Find First and Last Position of Element in Sorted Array (Medium):** Modifies binary search to find interval boundaries (left-most and right-most occurrences) in $\mathcal{O}(\log n)$ time.
- **LeetCode 875 — Koko Eating Bananas (Medium):** A brilliant problem requiring binary search on the Answer Space to find the minimum optimal eating rate.

### The Rust Implementation

```rust title="binary_search.rs" {8-18}
use std::cmp::Ordering;

/// Generic Binary Search in O(log n) time
pub fn binary_search<T: Ord>(arr: &[T], target: &T) -> Option<usize> {
    if arr.is_empty() { return None; }
    let mut left = 0;
    let mut right = arr.len() - 1;
    while left <= right {
        // Safe midpoint calculation preventing integer overflow
        let mid = left + (right - left) / 2;
        match arr[mid].cmp(target) {
            Ordering::Equal => return Some(mid),
            Ordering::Less => left = mid + 1,
            Ordering::Greater => {
                if mid == 0 { break; }
                right = mid - 1;
            },
        }
    }
    None
}
```

## 3. Arithmetic and Geometric Progression Sums

Instead of using loops to sum sequences of numbers, we can resolve them in $\mathcal{O}(1)$ time using closed-form algebraic identities:

- **Arithmetic Progression (AP):**

$$
S_n = \frac{n(a_1 + a_n)}{2}.
$$

- **Geometric Progression (GP):**

$$
S_n = a_1 \frac{r^n - 1}{r - 1} \quad (r \neq 1).
$$

### Real-World Market Applications & Open Source

These formulas are the heart of Fintech and Economics. Whenever you open a banking dashboard to review loan amortizations, mortgage projections, or compound interest, the backend utilizes geometric progression sums rather than $\mathcal{O}(n)$ simulation loops.

- **OSS Framework:** Open-source game engines like **Godot Engine** use arithmetic progressions in their physics engines to calculate uniformly accelerating object displacements without simulating every micro-frame computationally.

### Code Interviews (LeetCode)

- **LeetCode 754 — Reach a Number (Medium):** You stand at 0 on an infinite number line and take steps of increasing sizes ($1, 2, 3, \dots$). Finding the minimum steps to reach a target relies purely on the AP sum formula $n(n+1)/2$.
- **LeetCode 458 — Poor Pigs (Hard):** A famous mathematical puzzle modeled using exponential growth and dimensional geometric logic.

### The Rust Implementation

```rust title="progressions.rs" {4-12,16-19}
/// Arithmetic Progression Sum in O(1)
pub fn arithmetic_series_sum(n: u64, a1: i64, an: i64) -> i64 {
    let sum_extremes = a1 + an;
    // Divide the even factor first to prevent premature overflow
    if n & 1 == 0 {
        ((n / 2) as i64) * sum_extremes
    } else {
        (n as i64) * (sum_extremes / 2)
    }
}

/// Geometric Progression Sum in O(log n)
pub fn geometric_series_sum(n: u32, a1: i64, q: i64) -> i64 {
    if q == 1 { return a1 * (n as i64); }
    a1 * (binary_exponentiation(q, n) - 1) / (q - 1)
}
```

## 4. Logarithms (Natural and Custom Base)

Calculating the Natural Logarithm $\ln(x)$ from scratch is achieved using an optimized **Taylor Series**. By applying the algebraic substitution $z = \frac{x-1}{x+1}$, we create a rapidly converging infinite series:

$$
\ln(x) = 2 \sum_{k=0}^{\infty} \frac{1}{2k+1} \left(\frac{x-1}{x+1}\right)^{2k+1}.
$$

Once we have $\ln(x)$, we can evaluate logarithms for any base $b$ via the Change of Base formula:

$$
\log_b(x) = \frac{\ln(x)}{\ln(b)}.
$$

### Real-World Market Applications & Open Source

Machine Learning is built on logarithms. When neural networks are trained, their optimization is guided by **Cross-Entropy Loss**, which heavily relies on natural logarithms to penalize classification errors.

- **OSS Framework:** PyTorch and TensorFlow source code rely extensively on logarithmic transformations inside `nn.CrossEntropyLoss` and probability density calculations.
- **Product:** Audio streaming apps (Spotify) and digital audio workstations (Ableton Live) use logarithmic decibel scales because human hearing perceives sound intensity logarithmically, not linearly.

### Code Interviews (LeetCode)

- **LeetCode 231 — Power of Two (Easy):** While often solved via bitwise operations, checking whether a number is a power of a specific base can be elegantly resolved using custom logarithms.
- **LeetCode 204 — Count Primes (Medium):** Relies on the Prime Number Theorem, stating that prime density distribution is governed directly by $\frac{x}{\ln(x)}$.

### The Rust Implementation

```rust title="logarithms.rs" {6-23}
fn custom_abs(n: f64) -> f64 {
    if n < 0.0 { -n } else { n }
}

/// Natural Logarithm (ln) using optimized Taylor Series
pub fn custom_ln(x: f64) -> f64 {
    if x < 0.0 { return f64::NAN; }
    if x == 0.0 { return f64::NEGATIVE_INFINITY; }
    if x == 1.0 { return 0.0; }
    let z = (x - 1.0) / (x + 1.0);
    let z_square = z * z;
    let mut sum: f64 = 0.0;
    let mut current_power = z;
    let mut denominator: f64 = 1.0;
    const EPSILON: f64 = 1e-15;
    while custom_abs(current_power / denominator) > EPSILON {
        sum += current_power / denominator;
        current_power *= z_square;
        denominator += 2.0;
    }
    2.0 * sum
}

/// Logarithm of any base using Change of Base property
pub fn custom_log_base(x: f64, base: f64) -> f64 {
    if x <= 0.0 || base <= 0.0 || base == 1.0 {
        return f64::NAN;
    }
    custom_ln(x) / custom_ln(base)
}
```

## Wrapping Up Module 1

By combining foundational algebra with the **Divide and Conquer** strategy, we built highly optimized, bare-metal implementations of vital algorithms without relying on standard math libraries. We successfully reduced $\mathcal{O}(n)$ linear dependencies down to $\mathcal{O}(\log n)$ and $\mathcal{O}(1)$ performance.

**Next Steps:** In the next article of this series, we will dive into **Module 2: Array Optimization and Linear State**. We will tackle Dynamic Programming basics, covering Kadane’s Algorithm for contiguous subarrays and Prefix Sums to handle massive data queries in constant time. Stay tuned!

## References

- Cormen, Thomas H., Charles E. Leiserson, Ronald L. Rivest, and Clifford Stein. _Introduction to Algorithms_, 4th ed. MIT Press, 2022.

- Knuth, Donald E. _The Art of Computer Programming, Volume 1: Fundamental Algorithms_, 3rd ed. Addison-Wesley, 1997.
