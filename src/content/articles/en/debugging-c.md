---
title: "Debugging C/C++ from the Terminal with GCC and GDB"
description: "Moving beyond printf debugging: how to compile C/C++ with DWARF symbols, attach GDB from the terminal, set breakpoints, and inspect live Binary Search states."
lang: en
translationKey: debugging-c-cpp-gcc-gdb
publishedAt: 2026-09-30
tags: [c, cpp, gdb, gcc, debugging, linux, algorithms]
cover: "/debugging-gcc-gdb-cover.svg"
publish: true
---

Most developers learn debugging backwards. Rather than inspecting a live process, they scatter `printf()` calls across the source file, recompile the binary, run it again, tweak another `printf()`, and repeat the cycle until the defect surfaces.

Printing values is helpful for logging, but it is not interactive debugging. A debugger allows us to halt a running process at a specific instruction, inspect its current stack frame and registers, step through execution line by line, examine memory addresses, and resume execution from the exact point where it paused.

In this article, we will build a complete terminal debugging workflow using **C**, **GCC**, and **GDB**—with no IDE required. We will compile a Binary Search implementation, run it inside GDB, place a breakpoint inside the search loop, and observe the search interval contract while the process is alive in memory.

<figure>
  <img src="/debugging-gcc-gdb-cover.svg" width="960" height="480" loading="lazy" alt="Diagram showing GCC compiling C source with DWARF debug symbols and GDB inspecting stack frames and breakpoints in a running process." />
  <figcaption>Figure 1 — Compilation pipeline with debug symbols (-g3 -O0) and interactive process inspection via GDB.</figcaption>
</figure>

## 1. Installing the Toolchain

We need four foundational tools: `gcc` (C compiler), `g++` (C++ compiler), `gdb` (the GNU Project Debugger), and `make` (build automation). Install them according to your Linux distribution:

```bash title="install_toolchain.sh" {3,6,9}
# Ubuntu / Debian
sudo apt update
sudo apt install build-essential gdb

# Fedora
sudo dnf install gcc gcc-c++ make gdb

# Arch Linux
sudo pacman -Syu base-devel gdb

# Verify installed versions
gcc --version
g++ --version
gdb --version
make --version
```

## 2. Compiling Code for Debugging

A standard compilation command strips context down to raw machine instructions:

```bash title="standard_build.sh"
gcc main.c -o binary_search
```

For interactive debugging, however, we instruct GCC to preserve source-level metadata (DWARF symbols) and disable instruction reordering:[^dwarf]

```bash title="debug_build.sh" {3-4,10-11}
# C (C17 standard)
gcc -std=c17 \
    -Wall -Wextra -Wpedantic \
    -g3 -O0 -fno-omit-frame-pointer \
    main.c \
    -o binary_search

# C++ (C++20 standard)
g++ -std=c++20 \
    -Wall -Wextra -Wpedantic \
    -g3 -O0 -fno-omit-frame-pointer \
    main.cpp \
    -o binary_search
```

Each flag serves a specific diagnostic purpose:

| Compiler Flag              | Technical Role                                                                 |
| -------------------------- | ------------------------------------------------------------------------------ |
| `-g3`                      | Embeds maximum debugging symbols (including macro definitions) into the binary |
| `-O0`                      | Disables compiler optimizations so machine instructions match source lines 1:1 |
| `-fno-omit-frame-pointer`  | Retains the frame pointer register (`%rbp`), keeping stack backtraces intact   |
| `-Wall -Wextra -Wpedantic` | Enables strict static warnings before debugging even begins                    |

> [!NOTE] Why disable optimizations during debugging?
> Compiler optimizations (`-O2`, `-O3`) inline functions, eliminate dead variables into registers, and unroll loops. Using `-O0` guarantees that stepping through code in GDB follows the exact control flow written in your source file.

## 3. Creating the Binary Search Project

Create a dedicated workspace and open `main.c`:

```bash title="init_project.sh"
mkdir -p ~/gdb-binary-search
cd ~/gdb-binary-search
touch main.c
nvim main.c
```

Binary Search is an ideal subject for GDB because its internal state is compact and mathematically expressive:

$$\mathcal{S}_k = (\text{left}, \text{right}, \text{mid}, \text{target}, A[\text{mid}]), \qquad \text{mid} = \text{left} + \left\lfloor \frac{\text{right} - \text{left}}{2} \right\rfloor.$$

At every iteration $k$, half of the remaining search interval $[\text{left}, \text{right}]$ is discarded in $\mathcal{O}(\log n)$ time:

```c title="main.c" {15-31}
#include <stdio.h>
#include <stdlib.h>

static int is_sorted(const int *array, int size)
{
    for (int i = 1; i < size; i++) {
        if (array[i - 1] > array[i]) {
            return 0;
        }
    }
    return 1;
}

static int binary_search(const int *array, int size, int target)
{
    int left = 0;
    int right = size - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (array[mid] == target) {
            return mid;
        }
        if (array[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1;
}

int main(void)
{
    int size;
    printf("Array size: ");
    fflush(stdout);
    if (scanf("%d", &size) != 1 || size <= 0) {
        fprintf(stderr, "Invalid size.\n");
        return EXIT_FAILURE;
    }

    int *array = malloc((size_t)size * sizeof *array);
    if (array == NULL) {
        fprintf(stderr, "Memory allocation failed.\n");
        return EXIT_FAILURE;
    }

    printf("Enter %d sorted elements: ", size);
    fflush(stdout);
    for (int i = 0; i < size; i++) {
        if (scanf("%d", &array[i]) != 1) {
            fprintf(stderr, "Invalid input.\n");
            free(array);
            return EXIT_FAILURE;
        }
    }

    if (!is_sorted(array, size)) {
        fprintf(stderr, "The array must be sorted.\n");
        free(array);
        return EXIT_FAILURE;
    }

    int target;
    printf("Target: ");
    fflush(stdout);
    if (scanf("%d", &target) != 1) {
        fprintf(stderr, "Invalid input.\n");
        free(array);
        return EXIT_FAILURE;
    }

    int index = binary_search(array, size, target);
    if (index >= 0) {
        printf("Value %d found at index %d.\n", target, index);
    } else {
        printf("Value %d not found.\n", target);
    }

    free(array);
    return EXIT_SUCCESS;
}
```

Binary Search requires monotonicity ($A[i-1] \le A[i]$). Without a sorted invariant, discarding half of the search space has no mathematical justification.

## 4. Compiling and Running Normally

Compile the binary with debug flags and verify its standard execution:

```bash title="compile_and_run.sh"
gcc -std=c17 \
    -Wall -Wextra -Wpedantic \
    -g3 -O0 -fno-omit-frame-pointer \
    main.c \
    -o binary_search

ls -lh ./binary_search
./binary_search
```

Provide a 10-element sorted input and search for `18`:

```text title="terminal_io.txt"
Array size: 10
Enter 10 sorted elements: 2 4 6 8 10 12 14 16 18 20
Target: 18
Value 18 found at index 8.
```

Because `scanf("%d", ...)` consumes any whitespace separator, passing the entire sequence on a single line (`10 2 4 6 8 10 12 14 16 18 20 18`) produces the exact same result. Now let us stop looking solely at the final output and inspect the internal execution.

## 5. Starting the Program Inside GDB

Launch GDB pointing to the compiled binary:

```bash title="start_gdb.sh"
gdb ./binary_search
```

The prompt changes to `(gdb)`. At this stage, GDB has loaded the ELF binary and its symbol table into memory, but **no OS process is running yet**.

List the source lines around `binary_search` and register a breakpoint right after `mid` is computed:

```text title="gdb_breakpoints.txt" {2,5,8}
(gdb) list binary_search
14	static int binary_search(const int *array, int size, int target)
15	{
16	    int left = 0;
17	    int right = size - 1;
18	    while (left <= right) {
19	        int mid = left + (right - left) / 2;
20	        if (array[mid] == target) {
21	            return mid;
22	        }

(gdb) break main.c:20
Breakpoint 1 at 0x11c9: file main.c, line 20.

(gdb) info breakpoints
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x00000000000011c9 in binary_search at main.c:20
```

> [!TIP] Line numbers vary
> Always verify the exact line number using `list binary_search` on your local file before setting `break main.c:<line>`. A breakpoint instructs GDB to run at full CPU speed until that source line is reached, and then suspend the process _before_ executing that line.

## 6. Running the Process Through GDB

Start the child process inside GDB using `run`:

```text title="gdb_run.txt" {1,6-7}
(gdb) run
Starting program: /home/user/gdb-binary-search/binary_search
Array size: 10
Enter 10 sorted elements: 2 4 6 8 10 12 14 16 18 20
Target: 18

Breakpoint 1, binary_search (array=0x5555555596b0, size=10, target=18) at main.c:20
20	        if (array[mid] == target) {
```

Standard input via `scanf()` works normally. As soon as execution enters `binary_search` and calculates `mid`, the process freezes at line 20. The program has not terminated—it is suspended in memory awaiting inspection.

## 7. Inspecting the Live Process State

Query individual variables, local stack state, and function arguments:

```text title="gdb_inspect.txt" {1-4,7,10}
(gdb) print left
$1 = 0
(gdb) print right
$2 = 9
(gdb) print mid
$3 = 4
(gdb) print array[mid]
$4 = 10

(gdb) info locals
mid = 4
left = 0
right = 9

(gdb) info args
array = 0x5555555596b0
size = 10
target = 18
```

The initial Binary Search state $\mathcal{S}_0$ is concrete:

```text title="state_0.txt"
index:  0   1   2   3  [4]  5   6   7   8   9
value:  2   4   6   8  10  12  14  16  18  20
                        ^
                       mid (left = 0, right = 9)
```

Since $A[4] = 10 < 18$, the algorithm will branch to `left = mid + 1`, shifting the lower boundary to `5`. We are no longer guessing behavior from static source code; we are reading actual memory state.

## 8. Watching the Search Space Contract

Instead of typing `print` on every pause, register automatic watch expressions with `display` and advance across iterations with `continue`:

```text title="gdb_display_loop.txt" {1-4,6,14,22}
(gdb) display left
(gdb) display right
(gdb) display mid
(gdb) display array[mid]

(gdb) continue
Continuing.

Breakpoint 1, binary_search (array=0x5555555596b0, size=10, target=18) at main.c:20
20	        if (array[mid] == target) {
1: left = 5
2: right = 9
3: mid = 7
4: array[mid] = 16

(gdb) continue
Continuing.

Breakpoint 1, binary_search (array=0x5555555596b0, size=10, target=18) at main.c:20
20	        if (array[mid] == target) {
1: left = 8
2: right = 9
3: mid = 8
4: array[mid] = 18
```

What normally executes in nanoseconds inside the CPU is now decomposed into three discrete, observable states:

$$[0 \dots 9] \xrightarrow{\text{mid}=4,\; 10 < 18} [5 \dots 9] \xrightarrow{\text{mid}=7,\; 16 < 18} [8 \dots 9] \xrightarrow{\text{mid}=8} A[8] = 18.$$

## 9. Stepping Line by Line: `next` vs. `step`

Once suspended at a breakpoint, you control the granularity of execution:

- **`next` (`n`):** Executes the next source line in the current function. If that line contains a function call, GDB executes the entire call at full speed and stops on the following line (_step over_).
- **`step` (`s`):** Executes the next source line, diving _into_ any called function so you can inspect its internal stack frame (_step into_).
- **`continue` (`c`):** Resumes normal execution until the next breakpoint triggers or the process exits.

## 10. Essential GDB Command Reference

You only need a small core of commands—and their single-letter aliases—for daily terminal debugging:

| Command            | Alias  | Action                                               |
| ------------------ | ------ | ---------------------------------------------------- |
| `list <func>`      | `l`    | Display source code around a function or line        |
| `break <loc>`      | `b`    | Set a breakpoint at `file.c:line` or function name   |
| `info breakpoints` | `i b`  | List all active breakpoints and hit counts           |
| `run [args]`       | `r`    | Start (or restart) the debugged process              |
| `next`             | `n`    | Step over to the next source line                    |
| `step`             | `s`    | Step into a function call                            |
| `continue`         | `c`    | Resume execution until the next breakpoint           |
| `print <expr>`     | `p`    | Evaluate and print a C expression or variable        |
| `display <expr>`   | `disp` | Automatically print `<expr>` every time GDB pauses   |
| `info locals`      | `i lo` | Print all local variables in the current stack frame |
| `info args`        | `i ar` | Print parameters passed to the current function      |
| `quit`             | `q`    | Terminate the debugging session                      |

## 11. Using GDB TUI (Text User Interface)

GDB includes a built-in split-screen terminal interface (`-tui`) that keeps source code, assembly, or registers visible above the command prompt:

```bash title="start_gdb_tui.sh"
gdb -tui ./binary_search
```

```text title="tui_layout.txt"
┌── main.c ───────────────────────────────────────────────────┐
│  18      while (left <= right) {                            │
│  19          int mid = left + (right - left) / 2;           │
│B>20          if (array[mid] == target) {                    │
│  21              return mid;                                │
│  22          }                                              │
├─────────────────────────────────────────────────────────────┤
│ (gdb) p mid                                                 │
│ $1 = 7                                                      │
│ (gdb)                                                       │
└─────────────────────────────────────────────────────────────┘
```

It is the exact same debugger underneath; TUI simply eliminates context switching between your editor and the GDB prompt.

## 12. Moving Beyond `printf()` and Source Abstractions

At first glance, GDB looks like a tool for checking variable values. In reality, it exposes the bridge between C syntax and hardware execution. When you write:

```c title="midpoint.c"
int mid = left + (right - left) / 2;
```

GCC translates that expression into machine instructions operating on CPU registers, stack frames, and virtual memory addresses.[^ptrace] Unlike `printf("%d\n", mid);`, which mutates the binary just to emit text while execution races ahead, a breakpoint freezes time inside the process.

In our session, GDB paused three times on the exact same line of C code (`main.c:20`), yet the underlying process state evolved each time. That shift in perspective—from asking _"What does this line of code say?"_ to _"What is the exact state of memory when the CPU reaches this instruction?"_—is the foundation of systems engineering.

## 13. References

- Stallman, Richard, Roland Pesch, Stan Shebs, et al. _Debugging with GDB: The GNU Source-Level Debugger_. Free Software Foundation. [Official GDB Manual](https://sourceware.org/gdb/current/onlinedocs/gdb/).

- Matloff, Norman and Peter Jay Salzman. _The Art of Debugging with GDB, DDD, and Eclipse_. No Starch Press, 2008.

- [GCC Online Documentation — Options for Debugging Your Program](https://gcc.gnu.org/onlinedocs/gcc/Debugging-Options.html), GNU Project.

[^dwarf]: DWARF (_Debugging With Attributed Record Formats_) is the standard debugging data format used inside ELF binaries on Linux to map machine addresses back to C/C++ source lines, types, and variable names.

[^ptrace]: On Linux, GDB controls and inspects the target process primarily through the `ptrace(2)` system call and hardware debug registers.
