---
title: "De JavaScript para Rust: Desmistificando Ownership e Borrowing"
description: "Simplificando o gerenciamento de memória, as regras de ownership e o borrow checker do Rust através de paralelos práticos com JavaScript."
lang: pt
translationKey: from-javascript-to-rust-ownership
publishedAt: 2023-12-14
tags: [rust, javascript, web-development, memory-management, wasm]
cover: "/from-js-to-rust-cover.svg"
publish: true
---

Em 2018, decidi estudar Rust porque o WebAssembly (WASM) se mostrou uma especialização fantástica para o desenvolvimento frontend. Explorar Rust aprofundou meu entendimento sobre gerenciamento de memória, _stack_, _heap_ e detalhes de sistemas de baixo nível, elevando minhas habilidades técnicas. Essa imersão não apenas aprimorou minha proficiência em código, mas também instilou um senso mais rigoroso de responsabilidade de engenharia. Compreender como o código interage com o hardware e com a alocação de memória cultivou uma abordagem meticulosa e disciplinada para o desenvolvimento de software.

Neste artigo, vou simplificar os conceitos do Rust utilizando o JavaScript como linha de base. Essa abordagem permite compreender as particularidades do Rust em uma fração do tempo ao aproveitar a familiaridade com o JavaScript.

O desenvolvimento de software frequentemente envolve o uso de múltiplas linguagens de programação para construir aplicações robustas e eficientes. Hoje, vamos mergulhar no conceito de **ownership** (posse) em Rust e no seu **borrow checker** (verificador de empréstimos), fornecendo exemplos práticos em [Rust](https://doc.rust-lang.org/book/) e JavaScript para facilitar a assimilação.

## 1. Ownership e o Borrow Checker

Uma das características mais marcantes do Rust é o seu sistema de _ownership_, projetado para garantir segurança de memória sem a necessidade de um _Garbage Collector_ (Coletor de Lixo). Em termos simples, _ownership_ refere-se à responsabilidade de gerenciar recursos de memória. Cada valor em Rust possui uma variável que é sua _dona_ (_owner_), e só pode haver um único dono por vez. Quando o dono sai de escopo, o Rust desaloca automaticamente a memória associada ao valor na _heap_.[^drop]

Para prevenir condições de corrida (_data races_) e garantir segurança de memória, o Rust introduz o **borrow checker**. Ele analisa o código em tempo de compilação para impor regras estritas sobre referências, prevenindo armadilhas clássicas como _dangling pointers_ (ponteiros soltos) e desreferenciação de ponteiros nulos.

<figure>
  <img src="/from-js-to-rust-cover.svg" width="960" height="480" loading="lazy" alt="Diagrama comparando a alocação de memória na stack e na heap entre a semântica de move do Rust e referências compartilhadas no JavaScript." />
  <figcaption>Figura 1 — Representação conceitual de ponteiros na stack e memória na heap durante a transferência de posse versus empréstimo por referência.</figcaption>
</figure>

## 2. Entendendo a Semântica de Move na Prática

Vamos observar o que acontece quando atribuímos uma `String` alocada na _heap_ de uma variável para outra em Rust:

```rust title="ownership_move.rs" {6,9}
// Transferência de posse (Move)
fn main() {
    // Primeiro, declaramos carambola
    let carambola = String::from("Carambolas Quadradas");

    // Agora, criamos melancia e atribuímos carambola a ela
    let melancia = carambola;

    // Tentamos imprimir ambas no console
    println!("{}", carambola);
    println!("{}", melancia);
}
```

Se tentarmos compilar e executar este código, o compilador interrompe o processo com o seguinte erro:

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

A explicação é simples: quando atribuímos `carambola` para `melancia`, a posse (_ownership_) do valor (o ponteiro na _stack_ que aponta para o buffer na _heap_) foi movida para `melancia`. A variável original `carambola` tornou-se inválida para evitar um erro de _double free_ (dupla liberação de memória) quando ambas saírem de escopo.

No JavaScript, observamos um comportamento fundamentalmente diferente com objetos (`Object`), o que evidencia por que o Rust exige essa regra estrita:

```javascript title="shared_reference.js" {11,14-15}
// Primeiro, declaramos nosso objeto original
let carambolasOriginal = { quadrada: "carambolas quadradas" };

// Agora, atribuímos a uma nova variável
let carambolasCopyOne = carambolasOriginal;

// E atribuímos a outra variável
let carambolasCopyTwo = carambolasOriginal;

// Reescrevemos apenas o valor através de carambolasCopyTwo
carambolasCopyTwo.quadrada = "Never Die";

// Vamos imprimir ambos
console.log(carambolasCopyOne.quadrada);
console.log(carambolasCopyTwo.quadrada);
```

Se você executar esse código, o console imprimirá `"Never Die"` duas vezes. Isso ocorre porque, em JavaScript, quando um objeto é atribuído a outra variável, ele não move o valor — ele cria uma referência compartilhada para o exato mesmo objeto na _heap_. Modificar o objeto por meio de uma referência (`carambolasCopyTwo`) afeta todas as variáveis que apontam para ele.

> [!NOTE] Mutabilidade compartilhada
> A mutabilidade compartilhada implícita é uma das maiores fontes de efeitos colaterais em bases de código extensas. O Rust previne o _aliasing_ de estado mutável por padrão em tempo de compilação.

## 3. O Operador de Referência `&` (Borrowing)

Em Rust, o operador de referência `&` é essencial para criar referências a valores sem transferir a posse. Veja como utilizá-lo para corrigir nosso código anterior em Rust:

```rust title="borrowing.rs" {6}
// Empréstimo com Referências (Borrowing)
fn main() {
    // Primeiro, declaramos carambola
    let carambola = String::from("Carambolas Quadradas");

    // Agora, usamos o operador '&' para emprestar o valor
    let melancia = &carambola;

    // Conseguimos imprimir ambos com segurança
    println!("{}", carambola);
    println!("{}", melancia);
}
```

Usar o operador `&` em `let melancia = &carambola;` cria uma referência imutável para a `String` pertencente a `carambola` em vez de transferir sua posse.[^lifetimes] Isso significa que `melancia` não é dona de uma nova string, mas apenas um ponteiro que pega a string existente emprestada para leitura segura.

Se quisermos criar cópias independentes no JavaScript — simulando uma posse independente para evitar efeitos colaterais — costumamos usar o operador _spread_ (`...`):

```javascript title="shallow_copy.js" {7,9}
let carambolasOriginal = { quadrada: "carambolas quadradas" };

// Criando uma referência compartilhada
let carambolasCopyOne = carambolasOriginal;

// Criando uma cópia rasa (shallow copy) para quebrar a referência
let carambolasCopyTwo = { ...carambolasOriginal };

carambolasCopyTwo.quadrada = "Never Die";

console.log(carambolasCopyOne.quadrada); // Imprime: "carambolas quadradas"
console.log(carambolasCopyTwo.quadrada); // Imprime: "Never Die"
```

Ao criar `carambolasCopyTwo` usando o operador _spread_, o JavaScript aloca um novo objeto e duplica as propriedades de primeiro nível, quebrando a referência com `carambolasOriginal` e isolando a mutação.

## 4. Duplicação Explícita com `.clone()`

E se realmente precisarmos duplicar os dados na _heap_ em Rust para que ambas as variáveis tenham posse totalmente independente? Utilizamos o método `.clone()`:

```rust title="cloning.rs" {6}
// Clonando valores
fn main() {
    // Primeiro, declaramos carambola
    let carambola = String::from("Carambolas Quadradas");

    // Usamos .clone() para criar uma cópia profunda na heap
    let melancia = carambola.clone();

    // Podemos imprimir ambos; eles são totalmente independentes
    println!("{}", carambola);
    println!("{}", melancia);
}
```

Neste código em Rust, o método `.clone()` não transfere a posse; em vez disso, aloca um novo buffer na _heap_ com o mesmo conteúdo do original. Agora, tanto `carambola` quanto `melancia` possuem _ownership_ independente de suas respectivas strings.

A tabela abaixo resume como ambas as linguagens lidam com atribuição e duplicação de memória:

| Operação              | Sintaxe em Rust           | Equivalente em JavaScript | Comportamento na Memória                        |
| --------------------- | ------------------------- | ------------------------- | ----------------------------------------------- |
| Atribuição Padrão     | `let b = a;`              | _Sem equivalente direto_  | Posse movida para `b`; `a` é invalidada         |
| Empréstimo / Aliasing | `let b = &a;`             | `let b = a;`              | Ambas apontam para a mesma alocação na _heap_   |
| Cópia Rasa (Shallow)  | Trait `Copy` (primitivos) | `let b = { ...a };`       | Valores de topo / _stack_ duplicados            |
| Cópia Profunda (Deep) | `let b = a.clone();`      | `structuredClone(a)`      | Nova alocação completa e independente na _heap_ |

> [!TIP] Consciência de performance em Rust
> Como `.clone()` exige uma nova alocação na _heap_ e cópia de memória, deixá-lo explícito na sintaxe ajuda engenheiros a identificar operações custosas rapidamente durante revisões de código.

## 5. Conclusão

Compreender o sistema de _ownership_ e o _borrow checker_ é fundamental para escrever código Rust seguro e eficiente. Ao traçar paralelos com conceitos familiares do JavaScript, desenvolvedores conseguem diminuir a distância entre as duas linguagens e aproveitar os recursos únicos do Rust para construir arquiteturas de software robustas.

Embora Rust e JavaScript difiram profundamente em sua abordagem de memória, as analogias destacam cenários onde referências não gerenciadas levam a efeitos colaterais indesejados. No Rust, o _borrow checker_ intercepta esses problemas em tempo de compilação, fornecendo uma garantia sólida de segurança de memória. No JavaScript, esses problemas costumam se manifestar apenas em tempo de execução, gerando bugs notoriamente difíceis de rastrear.

## 6. Referências

- Klabnik, Steve e Carol Nichols. _The Rust Programming Language_. No Starch Press. [Livro Oficial](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html).

- [MDN Web Docs — Gerenciamento de Memória em JavaScript](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Memory_management), Mozilla Foundation.

[^drop]: A liberação automática de memória quando uma variável sai de escopo é conhecida em programação de sistemas como RAII (_Resource Acquisition Is Initialization_), implementada em Rust através da trait `Drop`.

[^lifetimes]: O _borrow checker_ também rastreia tempos de vida (_lifetimes_) para garantir que uma referência (`&T`) nunca sobreviva ao dono dos dados para os quais ela aponta, eliminando ponteiros soltos (_dangling pointers_).
