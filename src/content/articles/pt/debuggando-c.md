---
title: "Depurando C/C++ pelo Terminal com GCC e GDB"
description: "Indo além do printf: como compilar C/C++ com símbolos DWARF, anexar o GDB pelo terminal, definir breakpoints e inspecionar estados reais de uma Busca Binária em execução."
lang: pt
translationKey: debugging-c-cpp-gcc-gdb
publishedAt: 2026-09-30
tags: [c, cpp, gdb, gcc, debugging, linux, algorithms]
cover: "/debugging-gcc-gdb-cover.svg"
publish: true
---

A maioria dos desenvolvedores aprende a depurar código de trás para frente. Em vez de inspecionar o processo em execução, espalham chamadas `printf()` pelo código-fonte, recompilam o programa, executam novamente, alteram outro `printf()` e repetem todo o ciclo até que o bug finalmente se torne visível.

Imprimir valores na tela é útil para telemetria, mas isso não é depuração interativa. Um _debugger_ permite pausar um processo em execução em uma instrução específica, inspecionar seu estado atual na pilha, avançar pela execução linha por linha, examinar endereços de memória e retomar o programa exatamente de onde ele parou.

Neste artigo, vamos construir esse fluxo completo diretamente pelo terminal utilizando **C**, **GCC** e **GDB** — sem necessidade de nenhuma IDE. Compilaremos uma implementação de Busca Binária (_Binary Search_), iniciaremos o binário dentro do GDB, posicionaremos um _breakpoint_ dentro do laço de busca e observaremos os limites do algoritmo contraírem enquanto o processo está vivo na memória.

<figure>
  <img src="/debugging-gcc-gdb-cover.svg" width="960" height="480" loading="lazy" alt="Diagrama mostrando o GCC compilando código C com símbolos de debug DWARF e o GDB inspecionando stack frames e breakpoints em um processo em execução." />
  <figcaption>Figura 1 — Pipeline de compilação com símbolos de depuração (-g3 -O0) e inspeção interativa de processos via GDB.</figcaption>
</figure>

## 1. Instalando a Toolchain

Precisamos de quatro ferramentas básicas: `gcc` (compilador C), `g++` (compilador C++), `gdb` (depurador do projeto GNU) e `make` (automação de build). Instale-as de acordo com a sua distribuição Linux:

```bash title="install_toolchain.sh" {3,6,9}
# Ubuntu / Debian
sudo apt update
sudo apt install build-essential gdb

# Fedora
sudo dnf install gcc gcc-c++ make gdb

# Arch Linux
sudo pacman -Syu base-devel gdb

# Verifique as versões instaladas
gcc --version
g++ --version
gdb --version
make --version
```

## 2. Compilando Código para Depuração

Uma compilação comum descarta os metadados do código-fonte e gera apenas instruções de máquina:

```bash title="standard_build.sh"
gcc main.c -o binary_search
```

Para depuração interativa, contudo, instruímos o GCC a preservar as informações de mapeamento do código-fonte (símbolos DWARF) e desativar a reordenação de instruções:[^dwarf]

```bash title="debug_build.sh" {3-4,10-11}
# C (Padrão C17)
gcc -std=c17 \
    -Wall -Wextra -Wpedantic \
    -g3 -O0 -fno-omit-frame-pointer \
    main.c \
    -o binary_search

# C++ (Padrão C++20)
g++ -std=c++20 \
    -Wall -Wextra -Wpedantic \
    -g3 -O0 -fno-omit-frame-pointer \
    main.cpp \
    -o binary_search
```

Cada flag cumpre um papel específico no diagnóstico:

| Flag do Compilador         | Papel Técnico                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| `-g3`                      | Embute o nível máximo de informações de debug (incluindo macros) no binário                |
| `-O0`                      | Desativa otimizações do compilador para manter correspondência 1:1 com o código-fonte      |
| `-fno-omit-frame-pointer`  | Preserva o registrador de quadro de pilha (`%rbp`), facilitando a inspeção da _call stack_ |
| `-Wall -Wextra -Wpedantic` | Habilita avisos estritos de análise estática antes mesmo de iniciar o debugger             |

> [!NOTE] Por que desativar otimizações durante o debug?
> Otimizações de produção (`-O2`, `-O3`) aplicam _inlining_ de funções, eliminam variáveis locais mantendo-as apenas em registradores e reordenam operações. O uso de `-O0` garante que a execução passo a passo no GDB siga exatamente a ordem lógica escrita no seu arquivo.

## 3. Criando o Projeto de Busca Binária

Crie o diretório do projeto e abra o arquivo `main.c`:

```bash title="init_project.sh"
mkdir -p ~/gdb-binary-search
cd ~/gdb-binary-search
touch main.c
nvim main.c
```

A Busca Binária é excelente para demonstrar o GDB porque seu estado interno é enxuto e matematicamente expressivo:

$$\mathcal{S}_k = (\text{left}, \text{right}, \text{mid}, \text{target}, A[\text{mid}]), \qquad \text{mid} = \text{left} + \left\lfloor \frac{\text{right} - \text{left}}{2} \right\rfloor.$$

A cada iteração $k$, metade do espaço de busca restante $[\text{left}, \text{right}]$ é descartada em tempo $\mathcal{O}(\log n)$:

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

A Busca Binária exige monotonicidade ($A[i-1] \le A[i]$). Sem ordenação prévia, eliminar metade do espaço de busca não possui justificativa matemática.

## 4. Compilando e Executando o Programa

Compile o binário com as flags de depuração e execute-o normalmente no mesmo terminal:

```bash title="compile_and_run.sh"
gcc -std=c17 \
    -Wall -Wextra -Wpedantic \
    -g3 -O0 -fno-omit-frame-pointer \
    main.c \
    -o binary_search

ls -lh ./binary_search
./binary_search
```

Forneça um vetor ordenado de 10 elementos e busque pelo valor `18`:

```text title="terminal_io.txt"
Array size: 10
Enter 10 sorted elements: 2 4 6 8 10 12 14 16 18 20
Target: 18
Value 18 found at index 8.
```

Como `scanf("%d", ...)` ignora espaços em branco e quebras de linha comuns, passar toda a entrada em uma única linha (`10 2 4 6 8 10 12 14 16 18 20 18`) também funciona perfeitamente. Agora deixaremos de olhar apenas para a saída final do programa e inspecionaremos sua execução interna.

## 5. Iniciando o Programa Dentro do GDB

Inicie o GDB apontando para o executável gerado:

```bash title="start_gdb.sh"
gdb ./binary_search
```

O prompt mudará para `(gdb)`. Neste momento, o programa **ainda não iniciou**. O GDB carregou o executável ELF e sua tabela de símbolos, mas nenhum processo foi instanciado no sistema operacional.

Inspecione o código da função `binary_search` e crie um _breakpoint_ logo após o cálculo de `mid`:

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

> [!TIP] Atenção à numeração das linhas
> Não utilize o número da linha às cegas. Sempre consulte a numeração exata do seu arquivo local com `list binary_search` antes de definir o `break`. Um _breakpoint_ significa: execute em velocidade normal até alcançar esta linha e, então, suspenda o processo _imediatamente antes_ de executá-la.

## 6. Executando o Processo via GDB

Inicie a execução com o comando `run`:

```text title="gdb_run.txt" {1,6-7}
(gdb) run
Starting program: /home/user/gdb-binary-search/binary_search
Array size: 10
Enter 10 sorted elements: 2 4 6 8 10 12 14 16 18 20
Target: 18

Breakpoint 1, binary_search (array=0x5555555596b0, size=10, target=18) at main.c:20
20	        if (array[mid] == target) {
```

Observe que o `scanf()` funciona normalmente dentro do GDB. Assim que a execução entra em `binary_search` e calcula o primeiro `mid`, o GDB congela o processo na linha 20. O processo continua vivo na memória — ele apenas foi suspenso antes de avaliar a condição `if (array[mid] == target)`.

## 7. Inspecionando o Estado Atual

Agora consulte os valores atuais das variáveis, o quadro local da pilha e os argumentos recebidos pela função:

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

O primeiro estado $\mathcal{S}_0$ da Busca Binária é portanto:

```text title="state_0.txt"
índice: 0   1   2   3  [4]  5   6   7   8   9
valor:  2   4   6   8  10  12  14  16  18  20
                        ^
                       mid (left = 0, right = 9)
```

Como $A[4] = 10 < 18$, o algoritmo executará o ramo `left = mid + 1`, atualizando `left` para `5`. Não estamos mais tentando adivinhar o comportamento do programa lendo o código estático; estamos lendo o estado real em tempo de execução.

## 8. Observando a Contração da Busca Binária

Em vez de digitar vários comandos `print` a cada parada, podemos instruir o GDB a exibir expressões específicas automaticamente toda vez que o processo pausar usando `display`:

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

O alvo foi encontrado. O que normalmente acontece em poucos ciclos de clock da CPU foi decomposto em estados observáveis:

$$[0 \dots 9] \xrightarrow{\text{mid}=4,\; 10 < 18} [5 \dots 9] \xrightarrow{\text{mid}=7,\; 16 < 18} [8 \dots 9] \xrightarrow{\text{mid}=8} A[8] = 18.$$

## 9. Executando Uma Linha por Vez: `next` vs. `step`

Um _breakpoint_ define onde a execução para; a partir dali, você escolhe como ela avança:

- **`next` (`n`):** Executa a próxima linha do código-fonte na função atual. Se a linha contiver uma chamada de função (ex: `binary_search(array, size, target)`), o GDB executa a função inteira e para na linha seguinte ao retorno (_step over_).
- **`step` (`s`):** Executa a próxima linha e **entra** em qualquer função chamada naquela linha, permitindo depurar seu interior (_step into_).
- **`continue` (`c`):** Retoma a execução contínua até encontrar outro _breakpoint_ ou encerrar o programa.

## 10. Fluxo Básico de Comandos do GDB

Os comandos essenciais e suas formas abreviadas para uso diário resumem-se a:

| Comando            | Atalho | Ação                                                       |
| ------------------ | ------ | ---------------------------------------------------------- |
| `list <func>`      | `l`    | Exibe o código-fonte ao redor de uma função ou linha       |
| `break <local>`    | `b`    | Define um breakpoint em `arquivo.c:linha` ou função        |
| `info breakpoints` | `i b`  | Lista todos os breakpoints ativos                          |
| `run [args]`       | `r`    | Inicia (ou reinicia) o processo sob depuração              |
| `next`             | `n`    | Avança para a próxima linha sem entrar em funções          |
| `step`             | `s`    | Avança para a próxima linha entrando em chamadas de função |
| `continue`         | `c`    | Continua a execução até o próximo breakpoint               |
| `print <expr>`     | `p`    | Avalia e imprime uma variável ou expressão C               |
| `display <expr>`   | `disp` | Imprime `<expr>` automaticamente a cada pausa              |
| `info locals`      | `i lo` | Lista todas as variáveis locais do stack frame atual       |
| `info args`        | `i ar` | Lista os argumentos recebidos pela função atual            |
| `quit`             | `q`    | Encerra a sessão do GDB                                    |

## 11. Utilizando o GDB TUI (Text User Interface)

O GDB também possui uma interface visual dividida diretamente no terminal (`-tui`) que mantém o código-fonte visível enquanto você digita os comandos:

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

Continua sendo exatamente o mesmo depurador; o modo TUI apenas elimina a troca de contexto constante entre o editor de texto e o terminal de debug.

## 12. Indo Além do `printf()` e do Código-Fonte

À primeira vista, o GDB parece apenas uma ferramenta para checar valores de variáveis, mas essa é só a superfície. Quando escrevemos:

```c title="midpoint.c"
int mid = left + (right - left) / 2;
```

o GCC transforma essa abstração em instruções de máquina operando sobre registradores, quadros de pilha (_stack frames_), alocações na _heap_ e desvios de controle de fluxo.[^ptrace] Enquanto um `printf("%d\n", mid);` modifica o programa para emitir texto enquanto a execução segue adiante, um _breakpoint_ suspende a própria execução do processo.

Em nossa sessão, o _breakpoint_ parou três vezes na exata mesma linha de código (`main.c:20`), mas o estado do processo era diferente em cada uma delas. É nesse ponto que a depuração transforma seu modelo mental: deixamos de perguntar apenas _"O que esta linha de código diz?"_ e passamos a perguntar _"Qual é o estado exato da máquina quando esta linha é executada?"_.

Além disso, dominar o GDB pelo terminal reduz sua dependência de interfaces gráficas específicas. Uma vez que você compreende o funcionamento do depurador em si, qualquer IDE passa a ser apenas mais uma interface opcional sobre uma ferramenta que você já domina.

## 13. Referências

- Stallman, Richard, Roland Pesch, Stan Shebs, et al. _Debugging with GDB: The GNU Source-Level Debugger_. Free Software Foundation. [Manual Oficial do GDB](https://sourceware.org/gdb/current/onlinedocs/gdb/).

- Matloff, Norman e Peter Jay Salzman. _The Art of Debugging with GDB, DDD, and Eclipse_. No Starch Press, 2008.

- [GCC Online Documentation — Options for Debugging Your Program](https://gcc.gnu.org/onlinedocs/gcc/Debugging-Options.html), GNU Project.

[^dwarf]: DWARF (_Debugging With Attributed Record Formats_) é o formato padrão de dados de depuração embutido em binários ELF no Linux para mapear instruções de máquina de volta para linhas de código, tipos e variáveis em C/C++/Rust.

[^ptrace]: No Linux, o GDB controla e inspeciona a memória e os registradores do processo-alvo principalmente por meio da chamada de sistema `ptrace(2)`.
