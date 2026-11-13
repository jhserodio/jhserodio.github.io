---
title: "Mathematical optimization in Rust: a rendering showcase"
description: "A self-contained example combining numerical mathematics, annotated Rust, equations, figures, citations, and footnotes."
lang: en
translationKey: mathematical-rust-showcase
publishedAt: 2026-11-13
tags: [rust, numerical-methods, mathematics, markdown]
cover: "/article-diagram.svg"
publish: true
---

This article serves two purposes: it introduces a small numerical optimization problem and verifies the site's ability to publish technical writing. It deliberately uses **emphasis**, *italics*, [external links](https://doc.rust-lang.org/book/), tables, equations, a figure, notes, callouts, and citations.

## 1. A convex optimization problem

Consider the quadratic objective $f:\mathbb{R}^2\to\mathbb{R}$,

$$
\begin{aligned}
\min_{\mathbf{x}\in\mathbb{R}^{2}}\quad
  & f(\mathbf{x}) =
    \frac{1}{2}\mathbf{x}^{\mathsf{T}}A\mathbf{x}
    -\mathbf{b}^{\mathsf{T}}\mathbf{x},\\
\text{subject to}\quad
  & \mathbf{x}\succeq\mathbf{0},\\
A &= \begin{bmatrix}4&1\\1&3\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}1\\2\end{bmatrix}.
\end{aligned}
$$

Since $A$ is symmetric positive definite (its leading principal minors are $4>0$ and $11>0$), this objective has a unique unconstrained minimizer. The gradient is $\nabla f(\mathbf{x})=A\mathbf{x}-\mathbf{b}$, hence

$$
\mathbf{x}^{*}=A^{-1}\mathbf{b}
=\frac{1}{11}
\begin{bmatrix}3&-1\\-1&4\end{bmatrix}
\begin{bmatrix}1\\2\end{bmatrix}
=\begin{bmatrix}1/11\\7/11\end{bmatrix}.
$$

Both coordinates are positive, so this point also solves the constrained problem.[^convexity]

<figure>
  <img src="/article-diagram.svg" width="960" height="480" loading="lazy" alt="Level-set ellipses around a quadratic minimum with a sequence of iterates approaching it." />
  <figcaption>Figure 1 — Illustrative level sets and an iterative path to a convex minimum. The diagram is conceptual rather than a plot of the specific numerical coefficients above.</figcaption>
</figure>

## 2. Iterative approaches

For an iterate $\mathbf{x}_k$, gradient descent uses

$$
\begin{aligned}
\mathbf{x}_{k+1}&=\mathbf{x}_k-\alpha\nabla f(\mathbf{x}_k),\\
\nabla f(\mathbf{x}_k)&=A\mathbf{x}_k-\mathbf{b}.
\end{aligned}
$$

This becomes an affine iteration. Its convergence depends on the step size; for a symmetric positive definite $A$, choosing $0<\alpha<2/\lambda_{\max}(A)$ guarantees convergence for the unconstrained quadratic.[^step]

> [!NOTE] A note on numerical stability
> Floating-point calculations approximate real arithmetic. Tests should assert tolerances, not exact equality, when comparing computed results.

## 3. A small Rust implementation

The following original example computes a matrix-vector product and one gradient step without external dependencies.

```rust title="gradient_step.rs" {2-4}
fn gradient_step(x: [f64; 2], alpha: f64) -> [f64; 2] {
    let a = [[4.0, 1.0], [1.0, 3.0]];
    let b = [1.0, 2.0];
    let gradient = [
        a[0][0] * x[0] + a[0][1] * x[1] - b[0],
        a[1][0] * x[0] + a[1][1] * x[1] - b[1],
    ];
    [x[0] - alpha * gradient[0], x[1] - alpha * gradient[1]]
}

fn main() {
    let next = gradient_step([0.0, 0.0], 0.1);
    assert!((next[0] - 0.1).abs() < 1e-12);
    assert!((next[1] - 0.2).abs() < 1e-12);
}
```

A simple comparison helps distinguish numerical properties:

| Method | Per-step cost | Main consideration |
| --- | --- | --- |
| Gradient descent | Matrix–vector product | Step-size selection |
| Newton's method | Linear system solve | Hessian structure |
| Conjugate gradient | Matrix–vector product | SPD assumption |

## 4. A connection to analysis

The fundamental theorem of calculus relates integration and differentiation:

$$
\int_a^b f'(t)\,\mathrm{d}t = f(b)-f(a).
$$

For a convergent series, one might instead study the partial sums $S_n=\sum_{k=1}^{n}a_k$ and their limit,

$$
\lim_{n\to\infty} S_n = \sum_{k=1}^{\infty} a_k.
$$

> “Premature optimization is the root of all evil (or at least most of it) in programming.”
>
> — Donald Knuth, *Structured Programming with go to Statements* (1974). See the reference below.

> [!TIP] Reading notes from Obsidian
> Standard callouts and footnotes are interpreted during the Markdown build. The source file remains plain Markdown and can be edited in Obsidian.

## 5. References

- Nocedal, Jorge and Stephen Wright. *Numerical Optimization*, 2nd ed. Springer, 2006.
- Knuth, Donald E. “Structured Programming with go to Statements.” *Computing Surveys*, 6(4), 1974. [ACM DOI](https://doi.org/10.1145/356635.356640).
- [The Rust Programming Language](https://doc.rust-lang.org/book/), official Rust documentation.

[^convexity]: Positive definiteness guarantees strict convexity of the quadratic. Since the minimizer lies in the feasible set, it also minimizes the constrained objective.
[^step]: This step-size condition applies to unconstrained gradient descent on a quadratic with a symmetric positive definite matrix; constrained methods typically introduce an additional projection.
