---
title: "From JavaScript to Rust: Demystifying Ownership and Borrowing"
description: "Simplifying Rust memory management, ownership rules, and the borrow checker by drawing practical parallels with JavaScript."
lang: en
translationKey: from-javascript-to-rust-ownership
publishedAt: 2023-12-14
tags: [rust, javascript, web-development, memory-management, wasm]
cover: "/from-js-to-rust-cover.svg"
publish: true
---

In 2018, I chose to study Rust because WebAssembly (WASM) is a fantastic specialization for frontend development. Exploring Rust deepened my understanding of memory management, stacks, heaps, and low-level system details, ultimately elevating my technical skills. This immersion not only boosted my coding proficiency but also instilled a heightened sense of engineering responsibility. Grasping how code interacts with hardware and memory allocation cultivated a meticulous and disciplined approach to software development.

In this article, I will simplify Rust concepts by using JavaScript as a baseline. This approach allows developers to grasp Rust’s intricacies in a fraction of the time by leveraging the familiarity of JavaScript.

Software development often involves using multiple programming languages to build robust and efficient applications. Today, we will delve into the concept of **ownership** in Rust and its **borrow checker**, providing code examples in both [Rust](https://doc.rust-lang.org/book/) and JavaScript to help developers grasp these concepts easily.

## 1. Ownership and the Borrow Checker

One of Rust’s distinguishing features is its ownership system, designed to ensure memory safety without the need for a Garbage Collector. In simple terms, ownership refers to the responsibility of managing memory resources. Every value in Rust has a variable that is its _owner_, and there can only be one owner at a time. When the owner goes out of scope, Rust automatically deallocates the memory associated with the value on the heap.[^drop]

To prevent data races and ensure memory safety, Rust introduces the **borrow checker**. It analyzes the code at compile time to enforce strict rules on references, preventing common pitfalls like data races, dangling pointers, and null pointer dereferencing.

<figure>
  <img src="/from-js-to-rust-cover.svg" width="960" height="480" loading="lazy" alt="Diagram comparing stack and heap memory allocation between Rust move semantics and JavaScript shared references." />
  <figcaption>Figure 1 — Conceptual representation of stack pointers and heap memory during ownership transfer versus reference borrowing.</figcaption>
</figure>

## 2. Understanding Move Semantics by Example

Let us observe what happens when we assign a heap-allocated `String` from one variable to another in Rust:

```rust title="ownership_move.rs" {6,9}
// Ownership transfer (Move)
fn main() {
    // First, we declare carambola
    let carambola = String::from("Carambolas Quadradas");

    // Now, we create melancia and assign carambola to it
    let melancia = carambola;

    // Let's try to print both
    println!("{}", carambola);
    println!("{}", melancia);
}
```

If we attempt to compile and run this code, the compiler stops us with the following error:

```text title="compiler_output.txt" {9,12}
error[E0382]: borrow of moved value: `carambola`
 --> src/main.rs:9:20
  |
4 |     let carambola = String::from("Carambolas Quadradas");
  |         --------- move occurs because `carambola` has type `String`, which does not implement the `Copy` trait
5 |
6 |     let melancia = carambola;
  |                    --------- value moved here
...
9 |     println!("{}", carambola);
  |                    ^^^^^^^^^ value borrowed here after move
```

The explanation is straightforward: when we assigned `carambola` to `melancia`, the ownership of the value (the fat pointer on the stack consisting of pointer, length, and capacity pointing to the heap buffer) moved to `melancia`. The variable `carambola` was invalidated to prevent a _double free_ error when both variables go out of scope.

In JavaScript, we see a fundamentally different behavior with `Object` types that highlights why Rust enforces this strict rule:

```javascript title="shared_reference.js" {11,14-15}
// First, we declare our original object
let carambolasOriginal = { quadrada: "carambolas quadradas" };

// Now, we assign it to a new variable
let carambolasCopyOne = carambolasOriginal;

// And assign it to another variable
let carambolasCopyTwo = carambolasOriginal;

// We re-write only the carambolasCopyTwo value
carambolasCopyTwo.quadrada = "Never Die";

// Let's print both
console.log(carambolasCopyOne.quadrada);
console.log(carambolasCopyTwo.quadrada);
```

If you execute this script, the console outputs `"Never Die"` twice. This happens because in JavaScript, assigning an object to another variable does not move the value—it creates a shared reference to the exact same object in the heap. Modifying the object through one reference (`carambolasCopyTwo`) mutates the underlying memory visible to all references.

> [!NOTE] Shared mutability
> Implicit shared mutability is a primary source of side effects in large codebases. Rust prevents aliasing mutable state by default at compile time.

## 3. The Reference Operator `&` (Borrowing)

In Rust, the reference operator `&` is crucial for creating references to values without transferring ownership. Let us explore how to use it to fix our previous Rust code:

```rust title="borrowing.rs" {6}
// Borrowing with References
fn main() {
    // First, we declare carambola
    let carambola = String::from("Carambolas Quadradas");

    // Now, we use the '&' operator to borrow the value
    let melancia = &carambola;

    // We can successfully print both
    println!("{}", carambola);
    println!("{}", melancia);
}
```

Using the `&` operator in `let melancia = &carambola;` creates an immutable reference to the `String` owned by `carambola` rather than moving ownership.[^lifetimes] This means `melancia` is not a new string owner, but simply a pointer borrowing the existing one.

If we want to avoid side effects across variables in JavaScript—emulating independent state—we often use the spread operator (`...`):

```javascript title="shallow_copy.js" {7,9}
let carambolasOriginal = { quadrada: "carambolas quadradas" };

// Creating a shared reference
let carambolasCopyOne = carambolasOriginal;

// Creating a shallow copy to break the reference
let carambolasCopyTwo = { ...carambolasOriginal };

carambolasCopyTwo.quadrada = "Never Die";

console.log(carambolasCopyOne.quadrada); // Prints: "carambolas quadradas"
console.log(carambolasCopyTwo.quadrada); // Prints: "Never Die"
```

When you create `carambolasCopyTwo` using the spread operator, JavaScript allocates a new object and performs a shallow copy of the top-level properties, breaking the reference to `carambolasOriginal` and isolating the mutation.

## 4. Explicit Duplication with `.clone()`

What if we actually want to duplicate the heap data in Rust so that both variables have independent ownership? We explicitly call `.clone()`:

```rust title="cloning.rs" {6}
// Cloning values
fn main() {
    // First, we declare carambola
    let carambola = String::from("Carambolas Quadradas");

    // We use .clone() to create a deep copy in the heap
    let melancia = carambola.clone();

    // We can print both, and they are entirely independent
    println!("{}", carambola);
    println!("{}", melancia);
}
```

In this Rust code, `.clone()` does not transfer ownership; instead, it allocates a brand-new heap buffer with the exact same content as the original. Now, both `carambola` and `melancia` have independent ownership of their respective strings.

The table below summarizes how both languages handle assignment and duplication:

| Operation            | Rust Syntax               | JavaScript Equivalent  | Memory Behavior                            |
| -------------------- | ------------------------- | ---------------------- | ------------------------------------------ |
| Default Assignment   | `let b = a;`              | _No direct equivalent_ | Ownership moves to `b`; `a` is invalidated |
| Borrowing / Aliasing | `let b = &a;`             | `let b = a;`           | Both point to the same heap allocation     |
| Shallow Copy         | `Copy` trait (primitives) | `let b = { ...a };`    | Top-level stack/fields duplicated          |
| Deep Heap Copy       | `let b = a.clone();`      | `structuredClone(a)`   | Full independent heap allocation           |

> [!TIP] Performance awareness in Rust
> Because `.clone()` requires a new heap allocation and memory copy, making it explicit in the syntax helps engineers spot expensive operations during code review.

## 5. Conclusion

Understanding ownership and the borrow checker is crucial for writing safe and efficient Rust code. By drawing parallels with familiar concepts in JavaScript, developers can bridge the gap between the two languages and leverage Rust’s unique features for robust software architecture.

While Rust and JavaScript differ vastly in their approach to memory, the analogies highlight scenarios where unmanaged references lead to unintended consequences. In Rust, the borrow checker catches these issues at compile time, providing a strong guarantee of memory safety. In JavaScript, these issues might only become apparent during runtime, often causing bugs that are notoriously hard to trace.

## 6. References

- Klabnik, Steve and Carol Nichols. _The Rust Programming Language_. No Starch Press. [Official Book](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html).

- [MDN Web Docs — Memory Management in JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_management), Mozilla Foundation.

[^drop]: Automatically freeing memory when a variable goes out of scope is known in systems programming as RAII (_Resource Acquisition Is Initialization_), implemented in Rust via the `Drop` trait.

[^lifetimes]: The borrow checker also tracks _lifetimes_ to ensure that a reference (`&T`) never outlives the owner of the data it points to, preventing dangling pointers entirely.
