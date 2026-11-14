---
title: "First Steps with Programming Algorithms via Mathematical Problems (Control Flow)"
description: "Mastering foundational control flow structures in C and Rust through mathematical algorithms, from the Signum function and binary exponentiation to the Euclidean GCD."
lang: en
translationKey: algorithms-control-flow-mathematics
publishedAt: 2026-08-27
tags: [rust, c, algorithms, mathematics, control-flow]
cover: "/algorithms-control-flow-cover.svg"
publish: true
---

> “Understanding theory without putting it into practice builds a foundation on sand; applying knowledge directly to real problems builds a house on solid rock.”
>
> — Adapted from the Parable of the Wise and Foolish Builders (Matthew 7:24–26).

Learning to program from scratch is demanding. Beginners face a barrage of abstract concepts while instructors frequently rely on artificial analogies to make them palatable. In practice, those toy examples rarely translate to real engineering: you will seldom build a registry just to check someone's age in a conditional block, design a state machine merely to classify a vehicle as a car or truck, or write a loop solely to count passing grades in a classroom.

Instead of relying on trivial patterns, this article introduces **Control Flow** through concrete mathematical algorithms. The goal is to establish a pragmatic engineering mindset from day one—focused on bare-metal execution, scalar data manipulation, and algorithmic efficiency across both **C** and **[Rust](https://doc.rust-lang.org/book/)**.

<figure>
  <img src="/algorithms-control-flow-cover.svg" width="960" height="480" loading="lazy" alt="Diagram illustrating CPU branching, jump tables, and iterative vs. recursive state transitions in C and Rust." />
  <figcaption>Figure 1 — Control flow primitives mapped to mathematical state transitions and hardware branching.</figcaption>
</figure>

## 1. If / Else If / Else (The Signum Function)

Conditionals represent branching logic. They evaluate a Boolean expression and instruct the CPU to follow a specific execution path while bypassing all other branches.[^branch]

The **Directional Comparator ($\operatorname{sgn}$)** evaluates the order relation between two integers $a, b \in \mathbb{Z}$:

$$
\operatorname{sgn}(a - b) =
\begin{cases}
1 & \text{if } a > b, \\
-1 & \text{if } a < b, \\
0 & \text{if } a = b.
\end{cases}
$$

This three-way comparison forms the core of sorting routines and binary search boundaries, mapping inputs to three discrete states:

```c title="signum.c" {3,7,11}
int compare(int a, int b) {
    // Evaluates the primary branch first
    if (a > b) {
        return 1;
    }
    // Evaluates the inverted order
    else if (a < b) {
        return -1;
    }
    // Neutral fallback for equality
    else {
        return 0;
    }
}
```

```rust title="signum.rs" {2-8}
pub fn compare(a: i32, b: i32) -> i32 {
    if a > b {
        1
    } else if a < b {
        -1
    } else {
        0
    }
}
```

## 2. Switch Case & Pattern Matching (Simple State Machine)

A `switch` or `match` construct often compiles down to a **jump table**. Rather than evaluating sequential conditions one by one, the compiler maps a discrete input directly to its target instruction address, outperforming chained `if/else` blocks over fixed token sets.

A **Basic Lexical Evaluator** inspects an operator symbol $\circ \in \{+, -, \times, \div\}$ and computes $a \circ b$. This pattern underpins expression interpreters and binary protocol parsers where a header byte dictates the operation:

```c title="calculator.c" {2,7-8}
int calculate(char op, int a, int b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            // Guards against division-by-zero hardware traps
            return (b != 0) ? (a / b) : 0;
        default:
            // Fallback for unrecognized operator tokens
            return 0;
    }
}
```

```rust title="calculator.rs" {3-9}
pub fn calculate(op: char, a: i32, b: i32) -> i32 {
    // Exhaustive pattern matching enforced by the compiler
    match op {
        '+' => a + b,
        '-' => a - b,
        '*' => a * b,
        '/' => if b != 0 { a / b } else { 0 },
        _ => 0,
    }
}
```

> [!TIP] Practice problems
>
> - LeetCode 70 — _Climbing Stairs_
> - LeetCode 1716 — _Calculate Money in Leetcode Bank_

## 3. While Loop (Fast Exponentiation)

A `while` loop expresses indefinite iteration: the body repeats as long as a precondition holds true, which is ideal when the exact iteration count depends on dynamic bit lengths or convergence thresholds.

**Binary Exponentiation** computes $b^e$ in $\mathcal{O}(\log e)$ multiplications instead of $\mathcal{O}(e)$ by decomposing the exponent in base 2:

$$
b^e =
\begin{cases}
1 & \text{if } e = 0, \\
b \cdot \left(b^2\right)^{(e-1)/2} & \text{if } e \text{ is odd}, \\
\left(b^2\right)^{e/2} & \text{if } e \text{ is even}.
\end{cases}
$$

Halving the exponent at every step drastically reduces CPU cycles:

```c title="fast_power.c" {4,6,10-11}
long long fast_power(long long base, int exp) {
    long long result = 1;

    while (exp > 0) {
        // Odd exponent: accumulate current base power
        if (exp % 2 == 1) {
            result *= base;
        }
        // Square the base and halve the exponent
        base *= base;
        exp /= 2;
    }
    return result;
}
```

```rust title="fast_power.rs" {4-10}
pub fn fast_power(mut base: i64, mut exp: i32) -> i64 {
    let mut result: i64 = 1;

    while exp > 0 {
        if exp & 1 == 1 {
            result *= base;
        }
        base *= base;
        exp >>= 1; // Bitwise right shift divides by 2
    }
    result
}
```

> [!TIP] Practice problems
>
> - LeetCode 7 — _Reverse Integer_
> - LeetCode 9 — _Palindrome Number_

## 4. Do-While Loop (Reverse Digit Extraction)

A post-condition loop guarantees that its body executes **at least once** before testing the continuation predicate.

**Radix-10 Digit Extraction** isolates each digit $d_k = n \bmod 10$ from right to left via integer division $n \leftarrow \lfloor n / 10 \rfloor$. Evaluating the condition at the end of the block ensures that the input $n = 0$ still outputs a single `0` rather than skipping execution:

```c title="extract_digits.c" {7-11}
#include <stdio.h>
#include <stdlib.h>

void extract_digits(int n) {
    long long num = llabs((long long)n);

    do {
        int digit = num % 10;
        printf("%d\n", digit);
        num /= 10;
    } while (num > 0);
}
```

> [!NOTE] Post-condition loops in Rust
> Rust omits a dedicated `do-while` keyword. Instead, an unconditional `loop` paired with a trailing conditional `break` expresses the exact same control-flow graph.

```rust title="extract_digits.rs" {4-13}
pub fn extract_digits(n: i32) {
    let mut num = (n as i64).abs();

    loop {
        let digit = num % 10;
        println!("{}", digit);
        num /= 10;

        // Post-condition termination check
        if num == 0 {
            break;
        }
    }
}
```

> [!TIP] Practice problems
>
> - LeetCode 1281 — _Subtract the Product and Sum of Digits of an Integer_
> - LeetCode 507 — _Perfect Number_

## 5. For Loop (Space-Optimized Fibonacci)

A `for` loop expresses definite iteration over a known range $[a, b]$.

Using **Bottom-Up Dynamic Programming**, we evaluate the recurrence

$$
F_0 = 0, \quad F_1 = 1, \quad F_n = F_{n-1} + F_{n-2} \quad (n \ge 2)
$$

by sliding a two-variable window across $[2, n]$. This computes $F_n$ in $\mathcal{O}(n)$ time and $\mathcal{O}(1)$ auxiliary space, avoiding heap allocations or exponential call-tree overhead:

```c title="fibonacci.c" {9-13}
unsigned long long fibonacci(int n) {
    if (n == 0) return 0;
    if (n == 1) return 1;

    unsigned long long prev = 0;
    unsigned long long curr = 1;
    unsigned long long next;

    for (int i = 2; i <= n; i++) {
        next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}
```

```rust title="fibonacci.rs" {8-12}
pub fn fibonacci(n: u32) -> u64 {
    if n == 0 { return 0; }
    if n == 1 { return 1; }

    let mut prev: u64 = 0;
    let mut curr: u64 = 1;

    for _ in 2..=n {
        let next = prev + curr;
        prev = curr;
        curr = next;
    }
    curr
}
```

> [!TIP] Practice problems
>
> - LeetCode 1137 — _N-th Tribonacci Number_
> - LeetCode 172 — _Factorial Trailing Zeroes_

## 6. Recursion (The Euclidean Algorithm)

Recursion replaces explicit loop counters with function self-invocation, encoding intermediate state on the call stack until reaching a terminal base case.[^tailcall]

The **Euclidean Algorithm** computes the Greatest Common Divisor $\gcd(a, b)$ via the modular reduction identity:

$$
\gcd(a, b) =
\begin{cases}
a & \text{if } b = 0, \\
\gcd(b, a \bmod b) & \text{if } b > 0.
\end{cases}
$$

```c title="gcd.c" {3-5,7}
int mdc(int a, int b) {
    // Base case halts stack growth
    if (b == 0) {
        return a;
    }
    // Tail-recursive transition
    return mdc(b, a % b);
}
```

```rust title="gcd.rs" {2-6}
pub fn gcd(a: u32, b: u32) -> u32 {
    if b == 0 {
        a
    } else {
        gcd(b, a % b)
    }
}
```

> [!TIP] Practice problems
>
> - LeetCode 326 — _Power of Three_
> - LeetCode 397 — _Integer Replacement_

## 7. Summary of Control Flow Complexities

| Construct         | Mathematical Algorithm                      | Time Complexity                | Auxiliary Space                |
| ----------------- | ------------------------------------------- | ------------------------------ | ------------------------------ |
| `if / else`       | Signum Comparator $\operatorname{sgn}(a-b)$ | $\mathcal{O}(1)$               | $\mathcal{O}(1)$               |
| `switch / match`  | Lexical Operator Dispatch                   | $\mathcal{O}(1)$               | $\mathcal{O}(1)$               |
| `while`           | Binary Exponentiation $b^e$                 | $\mathcal{O}(\log e)$          | $\mathcal{O}(1)$               |
| `do-while / loop` | Base-10 Digit Extraction                    | $\mathcal{O}(\log_{10} n)$     | $\mathcal{O}(1)$               |
| `for`             | Sliding-Window Fibonacci $F_n$              | $\mathcal{O}(n)$               | $\mathcal{O}(1)$               |
| Recursion         | Euclidean $\gcd(a, b)$                      | $\mathcal{O}(\log(\min(a,b)))$ | $\mathcal{O}(\log(\min(a,b)))$ |

## 8. Moving Beyond Syntax

Learning programming syntax is only the entry point. Solid software engineering happens when you align hardware constraints with mathematical rigor. Practicing control flow through classic numerical algorithms rather than classroom abstractions builds a mental model rooted in predictable memory layout and computational efficiency.

## 9. References

- Cormen, Thomas H., Charles E. Leiserson, Ronald L. Rivest, and Clifford Stein. _Introduction to Algorithms_, 4th ed. MIT Press, 2022.

- Knuth, Donald E. _The Art of Computer Programming, Volume 2: Seminumerical Algorithms_, 3rd ed. Addison-Wesley, 1997.

- [The Rust Reference — Expressions and Control Flow](https://doc.rust-lang.org/reference/expressions.html), official documentation.

[^branch]: Modern superscalar processors rely on _branch predictors_ to guess the outcome of `if/else` instructions before evaluation finishes; mispredicted branches flush the instruction pipeline.

[^tailcall]: Because the recursive call in `gcd(b, a % b)` is in tail position, optimizing compilers (`gcc -O2` or `rustc -O`) apply _Tail Call Optimization_ (TCO), reusing the current stack frame in $\mathcal{O}(1)$ space.
