---
title: "Math with Rust — Module 2: Array Optimization & Linear State"
description: "Mastering Kadane's algorithm, prefix sums for constant-time range queries, and computational divisibility criteria implemented in bare-metal Rust."
lang: en
translationKey: math-with-rust-module-2-array-optimization
publishedAt: 2026-11-09
tags: [rust, mathematics, numerical-analysis, algorithms, dynamic-programming]
cover: "/math-with-rust-mod2-cover.svg"
publish: true
---

> UNICENTRO — CEDETEG (Guarapuava — PR / Brazil)

Welcome back to our **Math with Rust** series!

In the previous module, we explored algebraic foundations and the Divide and Conquer paradigm. We saw how mathematical properties can transform expensive operations into much more efficient algorithms.

Now, we are going to change our perspective slightly. Instead of repeatedly processing the same information, we will learn how to maintain a compact computational state while traversing an array or how to preprocess data so that future queries become significantly cheaper.

This module focuses on three techniques:

- **Kadane’s Algorithm:** Finding the maximum sum of a contiguous subarray in linear time.
- **Prefix Sums:** Precomputing cumulative values to answer range queries in constant time.
- **Computational Divisibility Criteria:** Using mathematical properties of integers to simplify divisibility checks.

These techniques are particularly interesting because they demonstrate how a small amount of additional state can eliminate a considerable amount of unnecessary computation. Let’s explore them.

## 1. Kadane’s Algorithm (Maximum Subarray)

Imagine you have an array of integers and need to find the contiguous segment with the largest possible sum. A naive approach would be to examine every possible starting and ending position, calculating the sum of each interval. Depending on how the implementation is structured, this can require $\mathcal{O}(n^2)$ or even $\mathcal{O}(n^3)$ operations.

Kadane’s Algorithm solves this problem in $\mathcal{O}(n)$ time by maintaining only two values while traversing the array.

### The Mathematical Foundation

The maximum subarray problem asks for the largest possible sum of a non-empty contiguous subarray. Let $E(i)$ represent the maximum sum of a contiguous subarray that ends at index $i$.

At each position, we have two choices:

- Start a new subarray at the current element.
- Extend the best subarray ending at the previous position.

This gives us the recurrence:

$$
E(i) = \max\left(a[i],\, E(i - 1) + a[i]\right)
$$

The final result is the maximum value among all $E(i)$. In other words, we keep track of the best subarray ending at the current position, while maintaining the best result found so far.

For example, given: `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`
The maximum-sum contiguous subarray is: `[4, -1, 2, 1]`, and its sum is `6`.

### Real-World Market Applications

This algorithm has an interesting interpretation in quantitative finance. Imagine analyzing a time series containing daily profit and loss (P&L). You might want to identify the contiguous period with the largest cumulative positive result. Kadane’s Algorithm provides exactly that kind of optimization.

It can also be applied to additive return series, such as logarithmic returns. One important distinction: ordinary percentage returns compound multiplicatively, so summing them directly does not give the exact compounded return. The same idea is useful in time-series analysis, performance monitoring, and detecting periods of unusually strong cumulative performance.

### Code Interviews (LeetCode)

- **LeetCode 53 — Maximum Subarray (Medium):** The classic Kadane problem. The objective is to find the contiguous subarray with the largest sum.

### The Rust Implementation

We will use `i64` for the input values and `i128` for the accumulated sums, providing a wider range for intermediate calculations. An empty array returns `None`, and an array containing only negative values correctly returns its largest element rather than zero.

```rust title="kadane.rs"
/// Finds the maximum sum of a non-empty contiguous subarray.
/// Returns None when the input array is empty.
pub fn max_subarray_sum(values: &[i64]) -> Option<i128> {
    // Split the array into its first element and the remainder.
    let (&first, rest) = values.split_first()?;

    // Initialize the best sum ending at the first position.
    let mut best_ending_here = i128::from(first);
    // Initialize the global maximum.
    let mut best_overall = best_ending_here;

    // Process the remaining elements exactly once.
    for &value in rest {
        let value = i128::from(value);
        // Either extend the previous subarray or start a new one.
        best_ending_here = value.max(best_ending_here + value);
        // Update the best result found so far.
        best_overall = best_overall.max(best_ending_here);
    }
    Some(best_overall)
}
```

### Complexity Analysis

| Metric          | Complexity       |
| --------------- | ---------------- |
| Time            | $\mathcal{O}(n)$ |
| Auxiliary Space | $\mathcal{O}(1)$ |

This is a beautiful example of dynamic programming with a constant-size state.

## 2. Prefix Sums

Now imagine a different problem. You have an array containing millions of values, and your application needs to answer thousands of queries asking for the sum of elements between two positions.

Calculating each range from scratch would be expensive. If there are $q$ queries, the total cost could reach $\mathcal{O}(qn)$. Prefix Sums solve this by preprocessing the array once.

### The Mathematical Foundation

Prefix sums transform repeated range-sum calculations into constant-time queries. Given an array $a$, define a prefix-sum array $P$ as follows:

- $P(0) = 0$
- $P(k) = a[0] + a[1] + \dots + a[k - 1]$

The sum of the elements in the half-open interval $[l, r)$ is:

$$
\operatorname{sum}(l, r) = P(r) - P(l)
$$

For example, given $a = [3, -2, 5, 1, -6]$, the prefix-sum array is $P = [0, 3, 1, 6, 7, 1]$. To calculate the sum of the elements at indices 1, 2, and 3, we compute: $P(4) - P(1) = 7 - 3 = 4$.

After an $\mathcal{O}(n)$ preprocessing step, each range-sum query takes $\mathcal{O}(1)$ time.

### Real-World Market Applications & Open Source

Prefix Sums are especially useful when dealing with large datasets and repeated range queries. In quantitative systems, consider a historical sequence of trading volumes, daily P&L values, signed order-flow quantities, or transaction counts. If the data is static during the query phase, prefix sums allow us to calculate the aggregate value of any interval in constant time.

The same principle appears in image processing, where two-dimensional prefix sums can calculate the sum of values inside a rectangular region of a matrix.

Open-source references:

- **NumPy — `cumsum`:** Provides cumulative sums over array elements.
- **Python — `itertools.accumulate`:** Provides an iterator for accumulated sums.
- **LeetCode 303 — Range Sum Query (Immutable):** A classic implementation challenge based on prefix sums.

> [!NOTE]
> Ordinary prefix sums are ideal when the original array does not change. If frequent updates are required, structures such as Fenwick Trees or Segment Trees are generally more appropriate.

### The Rust Implementation

For this implementation, we will encapsulate the prefix array in a struct. This allows us to preprocess the original data once and execute multiple range queries afterward. We will also use `i128` for the accumulated values and explicitly validate query boundaries.

```rust title="prefix_sums.rs"
#[derive(Debug, PartialEq, Eq)]
pub enum PrefixSumError {
    InvalidRange,
    ArithmeticOverflow,
}

pub struct PrefixSums {
    prefix: Vec<i128>,
}

impl PrefixSums {
    /// Builds the prefix sum array in O(n) time.
    pub fn new(values: &[i64]) -> Result<Self, PrefixSumError> {
        // The first prefix is always zero.
        let mut prefix = Vec::with_capacity(values.len().saturating_add(1));
        let mut running_total = 0i128;
        prefix.push(running_total);

        // Calculate each cumulative sum.
        for &value in values {
            running_total = running_total
                .checked_add(i128::from(value))
                .ok_or(PrefixSumError::ArithmeticOverflow)?;
            prefix.push(running_total);
        }
        Ok(Self { prefix })
    }

    /// Returns the sum of the half-open interval [start, end).
    pub fn sum(&self, start: usize, end: usize) -> Result<i128, PrefixSumError> {
        // Validate the requested interval.
        if start > end || end >= self.prefix.len() {
            return Err(PrefixSumError::InvalidRange);
        }
        // Subtract the prefix before the interval
        // from the prefix at the end of the interval.
        self.prefix[end]
            .checked_sub(self.prefix[start])
            .ok_or(PrefixSumError::ArithmeticOverflow)
    }
}
```

### Complexity Analysis

| Operation       | Complexity       |
| --------------- | ---------------- |
| Preprocessing   | $\mathcal{O}(n)$ |
| Range Query     | $\mathcal{O}(1)$ |
| Auxiliary Space | $\mathcal{O}(n)$ |

The trade-off is straightforward: we spend additional memory and one linear preprocessing pass to make subsequent queries extremely cheap.

## 3. Computational Divisibility Criteria

This is a smaller mathematical detour, but an interesting one. Divisibility is a fundamental property of integers, and there are several mathematical criteria that allow us to determine whether a number is divisible by another without performing a general division operation.

### The Mathematical Foundation

For integers $n$ and $d$, where $d \neq 0$, divisibility is defined by: $d \mid n \iff n \pmod d == 0$.

This is the general computational test for integer divisibility. Some divisibility rules can also be derived from properties of the decimal number system. Every power of 10 leaves a remainder of 1 when divided by 3 or 9. Therefore:

- A number is divisible by 3 if and only if the sum of its digits is divisible by 3.
- A number is divisible by 9 if and only if the sum of its digits is divisible by 9.

Consider the number $123456$: $1 + 2 + 3 + 4 + 5 + 6 = 21$. Since 21 is divisible by 3 but not by 9, the original number is divisible by 3, but not by 9.

### Computational Applications

These criteria are useful in:

- Numeric validation.
- Parsing and processing decimal representations.
- Mathematical filters.
- Combinatorial problems involving divisibility.

For arbitrary divisors, the ordinary remainder operation remains the general solution. The digit-sum shortcut is specifically useful for divisibility by 3 and 9. One important implementation detail: divisibility is an exact integer property. Using floating-point numbers for this operation is not appropriate because floating-point representations can introduce rounding errors.

### Code Interviews (LeetCode)

- **LeetCode 412 — Fizz Buzz (Easy):** A simple exercise involving divisibility by multiple integers.

### The Rust Implementation

```rust title="divisibility.rs"
/// Checks whether an integer is divisible by another integer.
/// A divisor of zero is considered invalid.
pub fn is_divisible(n: i64, divisor: i64) -> bool {
    // Division by zero is undefined.
    if divisor == 0 {
        return false;
    }
    // unsigned_abs handles i64::MIN safely.
    n.unsigned_abs() % divisor.unsigned_abs() == 0
}

/// Calculates the sum of the decimal digits.
fn digit_sum(mut n: u64) -> u64 {
    let mut sum = 0;
    while n > 0 {
        // Extract the last decimal digit.
        sum += n % 10;
        // Remove the last decimal digit.
        n /= 10;
    }
    sum
}

// Divisibility criterion for 3.
pub fn is_divisible_by_3(n: u64) -> bool {
    digit_sum(n) % 3 == 0
}

// Divisibility criterion for 9.
pub fn is_divisible_by_9(n: u64) -> bool {
    digit_sum(n) % 9 == 0
}
```

### Complexity Analysis

| Operation                  | Complexity                 |
| -------------------------- | -------------------------- |
| Generic divisibility check | $\mathcal{O}(1)$           |
| Digit Sum                  | $\mathcal{O}(\log_{10} n)$ |
| Auxiliary Space            | $\mathcal{O}(1)$           |

For fixed-width integers, the number of decimal digits is bounded, so the digit-sum operation also has a constant upper bound. It is worth emphasizing that this mathematical shortcut is not necessarily faster than a hardware remainder operation on every processor. Its main value is the mathematical property it exposes and the way it simplifies certain classes of problems.

## Wrapping Up Module 2

In this module, we explored three different ways to avoid unnecessary computation.

Kadane’s Algorithm maintains the best contiguous subarray ending at the current position, reducing a potentially expensive search to a single traversal. Prefix Sums store cumulative information, allowing us to answer repeated range queries with a single subtraction. Computational Divisibility Criteria demonstrate how mathematical properties of decimal representations can simplify exact integer checks.

The common idea is that efficient algorithms do not necessarily require more complicated mathematics. Sometimes, the biggest improvement comes from recognizing what information we actually need to preserve.

## The Repository and What’s Next

I am developing and organizing the algorithms in my GitHub repository:

- [quant-dev-roadmap — GitHub](https://github.com/vnator/quant-dev-roadmap)

The repository is becoming the central reference for this series, containing the algorithm catalog, implementations, and tests. I have already explored and implemented algorithms from some of the upcoming modules, but I prefer to publish these articles gradually. Each group deserves enough time for its mathematical foundations, implementation details, edge cases, and testing strategy.

In the next article, we will move into **Module 3: Computational Number Theory**, exploring modular arithmetic, the Euclidean Algorithm, Least Common Multiple, the Sieve of Eratosthenes, and integer factorization.

There is still a lot of mathematics to translate into efficient code. And that is precisely what makes this journey so interesting. See you in the next module!
