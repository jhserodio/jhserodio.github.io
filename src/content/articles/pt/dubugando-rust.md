---
title: "Debugging Rust from the Terminal with GDB"
description: "Inspecting live Rust processes, fat-pointer slices (&[i32]), and contiguous heap buffers from the terminal using Cargo and rust-gdb."
lang: pt
translationKey: debugging-rust-terminal-gdb
publishedAt: 2026-10-09
tags: [rust, gdb, debugging, cargo, linux, algorithms]
cover: "/debugging-rust-gdb-cover.svg"
publish: true
---

In a previous article, _Debugging C/C++ from the Terminal with GCC and GDB_, we explored how to inspect a live C process without relying on an IDE. Using a Binary Search implementation, we compiled our source code with debugging symbols, placed breakpoints inside an iteration, inspected local stack variables, and followed execution until the algorithm located its target.

Because we have been exploring [Rust](https://doc.rust-lang.org/book/) alongside C across our studies on algorithms, collections, and memory management, a natural question arises: how much does this debugging workflow change when moving to Rust?

Rust introduces high-level abstractions that govern how we interact with memory—most notably **Ownership**, **Borrowing**, slices (`&[T]`), and standard library collections (`Vec<T>`). However, those compile-time guarantees do not change the physical reality that source code ultimately compiles down to native machine instructions. Understanding the borrow checker is essential, yet it never replaces our ability to inspect the runtime state of an active process.

In this article, we will reproduce our Binary Search debugging session using **Rust**, **Cargo**, and **GDB**, observing how the debugger represents Rust types and how to inspect raw slice memory through **`rust-gdb`**—a wrapper provided by the Rust toolchain that preloads GDB with pretty-printers for Rust data structures.

<figure>
  <img src="/debugging-rust-gdb-cover.svg" width="960" height="480" loading="lazy" alt="Diagram showing a Rust fat-pointer slice (&[i32]) on the stack pointing to a contiguous Vec<i32> buffer on the heap during a rust-gdb session." />
  <figcaption>Figure 1 — Memory representation of a borrowed Rust slice (&[i32]) and interactive inspection via rust-gdb.</figcaption>
</figure>

## 1. Installing the Toolchain

We need three core tools: `rustc` (the Rust compiler), `cargo` (the build system and package manager), and `gdb` (the GNU debugger). Unlike raw C compilation, we do not have to pass debug flags manually on every build because Cargo's default development profile configures them out of the box.

Install the system dependencies for your Linux distribution, followed by the official `rustup` toolchain:

```bash title="install_rust_gdb.sh" {3,6,9,15,18}
# Ubuntu / Debian
sudo apt update
sudo apt install build-essential curl gdb

# Fedora
sudo dnf install gcc curl gdb

# Arch Linux
sudo pacman -Syu base-devel curl gdb

# ------------------------------------------
# Rust installation (all distributions)
# Official installer provided by Rustup
# ------------------------------------------
curl --proto '=https' --tlsv1.2 -sSf [https://sh.rustup.rs](https://sh.rustup.rs) | sh

# Load Cargo into the current shell session
. "$HOME/.cargo/env"

# Verify the installed toolchain
rustc --version
cargo --version
gdb --version
rust-gdb --version
```

If Rust is already installed via `rustup`, running `rustup update stable` is sufficient.

> [!NOTE] What is `rust-gdb`?
> `rust-gdb` is not a separate debugger binary. It is a shell wrapper distributed with the Rust toolchain that launches GNU GDB with Python pretty-printing scripts enabled, allowing GDB to format complex standard library types like `Vec<T>`, `String`, and `Option<T>` legibly.

## 2. Configuring Cargo Profiles for Debugging

In our C workflow, we explicitly passed `-g3 -O0 -fno-omit-frame-pointer` to GCC. Rust exposes equivalent compiler settings, managed declaratively through Cargo profiles.

By default, running `cargo build` uses the `dev` profile, which disables optimizations and embeds full debug symbols automatically:

```toml title="Cargo.toml" {2-3}
[profile.dev]
opt-level = 0
debug = true
```

You do not need to write these lines manually in `Cargo.toml` unless overriding custom workspace settings. Specifically, `opt-level = 0` prevents instruction reordering and variable inlining, while `debug = true` emits DWARF symbol tables.[^dwarf] For interactive debugging, avoid `cargo build --release`, as the `release` profile defaults to `opt-level = 3` and strips debug metadata.

## 3. Creating the Binary Search Project

We will implement the same Binary Search algorithm used in our C guide, but idiomatic to Rust: instead of managing a raw heap pointer via `malloc` and `free`, a `Vec<i32>` will own the heap buffer while our `binary_search` function borrows a slice view (`&[i32]`).

Initialize the Cargo project:

```bash title="init_cargo_project.sh"
cargo new binary-search-rust
cd binary-search-rust
ls -la
nvim src/main.rs
```

To allow entering integers separated by either spaces or newlines without requiring an `EOF` signal, we use a small `VecDeque<String>` token buffer:

```rust title="src/main.rs" {19-34}
use std::collections::VecDeque;
use std::error::Error;
use std::io::{self, Write};

// Reads whitespace-separated integers across one or multiple lines
fn next_number(tokens: &mut VecDeque<String>) -> Result<i32, Box<dyn Error>> {
    loop {
        if let Some(token) = tokens.pop_front() {
            return Ok(token.parse()?);
        }
        let mut line = String::new();
        if io::stdin().read_line(&mut line)? == 0 {
            return Err("Unexpected end of input".into());
        }
        tokens.extend(line.split_whitespace().map(str::to_owned));
    }
}

fn binary_search(array: &[i32], target: i32) -> Option<usize> {
    let mut left = 0;
    let mut right = array.len(); // Exclusive upper boundary
    while left < right {
        let mid = left + (right - left) / 2;
        if array[mid] == target {
            return Some(mid);
        }
        if array[mid] < target {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    None
}

fn main() -> Result<(), Box<dyn Error>> {
    let mut tokens = VecDeque::new();
    print!("Array size: ");
    io::stdout().flush()?;

    let size = next_number(&mut tokens)?;
    if size <= 0 {
        return Err("Array size must be positive".into());
    }
    let size = size as usize;

    let mut array = Vec::with_capacity(size);
    print!("Enter {size} sorted elements: ");
    io::stdout().flush()?;
    for _ in 0..size {
        array.push(next_number(&mut tokens)?);
    }

    if !array.windows(2).all(|pair| pair[0] <= pair[1]) {
        return Err("The array must be sorted".into());
    }

    print!("Target: ");
    io::stdout().flush()?;
    let target = next_number(&mut tokens)?;

    let index = binary_search(&array, target);
    match index {
        Some(position) => println!("Value {target} found at index {position}."),
        None => println!("Value {target} not found."),
    }
    Ok(())
}
```

Two architectural choices stand out compared to C:

1. **Half-Open Search Interval $[\text{left}, \text{right})$:** Because Rust indices use the unsigned `usize` type, setting `right = array.len()` and narrowing the upper bound via `right = mid` avoids integer underflow when `mid == 0` (where computing `mid - 1` would panic in debug mode).
2. **Type-Safe Absence (`Option<usize>`):** Instead of returning a sentinel `-1` inside a signed integer, the return type encodes success as `Some(mid)` and absence as `None`.

## 4. Compiling and Running the Program

Compile the project with the default development profile and verify its behavior:

```bash title="build_and_run.sh"
cargo build
ls -lh target/debug/binary-search-rust
./target/debug/binary-search-rust
```

Test the binary with a 10-element sorted sequence and search for `16`:

```text title="terminal_output.txt"
Array size: 10
Enter 10 sorted elements: 2 4 6 8 10 12 14 16 18 20
Target: 16
Value 16 found at index 7.
```

Choosing `16` forces the half-open binary search through exactly three comparisons, giving us three distinct states to inspect inside GDB.

## 5. Starting the Program Inside `rust-gdb`

Launch the debug binary through the `rust-gdb` wrapper:

```bash title="launch_rust_gdb.sh"
rust-gdb ./target/debug/binary-search-rust
```

Once at the `(gdb)` prompt, inspect the source around `binary_search` and register a breakpoint right after `mid` is computed:

```text title="set_rust_breakpoint.txt" {2,11,14}
(gdb) list src/main.rs:20
19	fn binary_search(array: &[i32], target: i32) -> Option<usize> {
20	    let mut left = 0;
21	    let mut right = array.len(); // Exclusive upper boundary
22	    while left < right {
23	        let mid = left + (right - left) / 2;
24	        if array[mid] == target {
25	            return Some(mid);
26	        }

(gdb) break src/main.rs:24
Breakpoint 1 at 0x18a4c: file src/main.rs, line 24.

(gdb) info breakpoints
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x0000000000018a4c in binary_search_rust::binary_search at src/main.rs:24
```

## 6. Running Through GDB

Execute `run` and supply the input sequence:

```text title="gdb_run_session.txt" {1,6-7}
(gdb) run
Starting program: /home/user/binary-search-rust/target/debug/binary-search-rust
Array size: 10
Enter 10 sorted elements: 2 4 6 8 10 12 14 16 18 20
Target: 16

Breakpoint 1, binary_search_rust::binary_search (array=..., target=16) at src/main.rs:24
24	        if array[mid] == target {
```

Just like in C, the OS process is suspended in memory immediately before evaluating `if array[mid] == target`.

## 7. Inspecting the Current State and Fat Pointers

Query the local variables, arguments, and the underlying type of `array`:

```text title="inspect_locals.txt" {1-4,7,10,13}
(gdb) print left
$1 = 0
(gdb) print right
$2 = 10
(gdb) print mid
$3 = 5
(gdb) print array[mid]
$4 = 12

(gdb) info locals
mid = 5
right = 10
left = 0

(gdb) info args
array = &[i32] (size = 10) = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20}
target = 16

(gdb) ptype array
type = struct &[i32] {
  data_ptr: *mut i32,
  length: usize,
}
```

The output of `ptype array` reveals how Rust implements borrowed slices at the machine level: whereas C required passing a raw pointer `const int *array` and a separate `int size` argument, Rust packs both into a single two-word **fat pointer** (`data_ptr` and `length`).[^fatptr]

In this first iteration over $[0, 10)$, we have:

$$\text{mid} = 0 + \left\lfloor \frac{10 - 0}{2} \right\rfloor = 5, \qquad A[5] = 12 < 16 \implies \text{left} \leftarrow 5 + 1 = 6.$$

## 8. Watching the Search Interval Contract

Register watch expressions with `display` and step through the remaining iterations with `continue`:

```text title="display_iterations.txt" {1-4,6,14,22}
(gdb) display left
(gdb) display right
(gdb) display mid
(gdb) display array[mid]

(gdb) continue
Continuing.

Breakpoint 1, binary_search_rust::binary_search (array=..., target=16) at src/main.rs:24
24	        if array[mid] == target {
1: left = 6
2: right = 10
3: mid = 8
4: array[mid] = 18

(gdb) continue
Continuing.

Breakpoint 1, binary_search_rust::binary_search (array=..., target=16) at src/main.rs:24
24	        if array[mid] == target {
1: left = 6
2: right = 8
3: mid = 7
4: array[mid] = 16
```

The table below summarizes the three observed states of the half-open interval $[\text{left}, \text{right})$:

| Iteration | `left` | `right` (exclusive) | `mid` | `array[mid]` | Branch Action                       |
| --------- | ------ | ------------------- | ----- | ------------ | ----------------------------------- |
| 1         | `0`    | `10`                | `5`   | `12`         | $12 < 16 \implies \text{left} = 6$  |
| 2         | `6`    | `10`                | `8`   | `18`         | $18 > 16 \implies \text{right} = 8$ |
| 3         | `6`    | `8`                 | `7`   | `16`         | $16 == 16 \implies \text{Some}(7)$  |

## 9. Inspecting Raw Slice Memory with `x`

Rust’s ownership rules govern compile-time aliasing, but at runtime our `Vec<i32>` still occupies a contiguous block of virtual memory. We can bypass Rust's type system inside GDB and inspect the raw bytes directly using the `x` (_examine_) command:

```text title="examine_raw_memory.txt" {2,5,8}
# Print the slice through rust-gdb's pretty-printer
(gdb) print array
$5 = &[i32] (size = 10) = {2, 4, 6, 8, 10, 12, 14, 16, 18, 20}

# Obtain the memory address of the first element
(gdb) print &array[0]
$6 = (*mut i32) 0x5555555a6af0

# Examine 10 consecutive 32-bit (4-byte) words in signed decimal format
(gdb) x/10dw &array[0]
0x5555555a6af0:	2	4	6	8
0x5555555a6b00:	10	12	14	16
0x5555555a6b10:	18	20
```

In `x/10dw`, `10` specifies the count, `d` formats values in decimal, and `w` sets the unit size to 4-byte words (`sizeof(i32)`). Ownership and Borrowing enforce safety before compilation finishes, yet the resulting heap layout is just as concrete and inspectable as a C array.

## 10. Controlling Execution and Using TUI Mode

Stepping through Rust code uses the exact same primitives as C:

- **`next` (`n`):** Steps over to the next source line in the current function without entering called functions.
- **`step` (`s`):** Steps into the function call on the current line (such as diving from `main` into `binary_search(&array, target)`).
- **`continue` (`c`):** Resumes execution until the next breakpoint triggers or the program exits.
- **`backtrace` (`bt`):** Prints the active call stack frames.

You can also launch the split-screen Text User Interface directly via the Rust wrapper:

```bash title="rust_gdb_tui.sh"
rust-gdb -tui ./target/debug/binary-search-rust
```

## 11. Moving Beyond `println!()`, `dbg!()`, and Backtraces

Rust provides ergonomic diagnostic macros such as `println!()` and `dbg!()`, alongside environment flags for inspecting stack unwinds on panic:

```bash title="rust_backtrace.sh"
# Print a concise stack trace if a panic! occurs
RUST_BACKTRACE=1 cargo run

# Print a verbose stack trace with all frames
RUST_BACKTRACE=full cargo run
```

While `dbg!()` and `RUST_BACKTRACE=1` are convenient for quick checks or post-mortem crash logs, they do not replace interactive debugging. A backtrace only tells you _where_ a program panicked after the fact; `rust-gdb` lets you pause execution _before_ a logical flaw corrupts state, inspect fat pointers and heap buffers live, and verify that your algorithm behaves exactly as modeled.

## 12. References

- Klabnik, Steve and Carol Nichols. _The Rust Programming Language_. No Starch Press. [Official Book](https://doc.rust-lang.org/book/).

- Stallman, Richard, Roland Pesch, Stan Shebs, et al. _Debugging with GDB: The GNU Source-Level Debugger_. Free Software Foundation. [Official GDB Manual](https://sourceware.org/gdb/current/onlinedocs/gdb/).

- [The Cargo Book — Profiles](https://doc.rust-lang.org/cargo/reference/profiles.html), official Rust documentation.

[^dwarf]: Cargo's `debug = true` setting instructs `rustc` (and its LLVM backend) to generate DWARF debugging sections inside the ELF binary, mapping machine instructions and mangled Rust symbols back to human-readable module paths and line numbers.

[^fatptr]: On a 64-bit architecture (`x86_64`), a Rust slice reference `&[T]` occupies 16 bytes (two 64-bit registers or stack words): an 8-byte pointer to the first element and an 8-byte `usize` element count.
