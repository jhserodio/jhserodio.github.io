---
title: "Matemática com Rust — Módulo 2: Otimização em Vetores e Estado Linear"
description: "Dominando o algoritmo de Kadane, somas de prefixos para consultas de intervalo em tempo constante e critérios de divisibilidade computacional implementados em Rust."
lang: pt
translationKey: math-with-rust-module-2-array-optimization
publishedAt: 2026-11-09
tags: [rust, mathematics, numerical-analysis, algorithms, dynamic-programming, math-with-rust]
cover: "/article-images/math-with-rust-module-2.webp"
publish: true
---

> UNICENTRO — CEDETEG (Guarapuava — PR / Brasil)

Seja bem-vindo de volta à nossa série **Matemática com Rust**!

No módulo anterior, exploramos fundamentos algébricos e o paradigma de Divisão e Conquista. Vimos como propriedades matemáticas podem transformar operações caras em algoritmos muito mais eficientes.

Agora, vamos mudar nossa perspectiva ligeiramente. Em vez de processar repetidamente a mesma informação, aprenderemos a manter um estado computacional compacto enquanto percorremos um vetor, ou como pré-processar dados para que consultas futuras se tornem significativamente mais baratas.

Este módulo foca em três técnicas:

- **Algoritmo de Kadane:** Encontrar a soma máxima de um subarray contíguo em tempo linear.
- **Somas de Prefixo (_Prefix Sums_):** Pré-computar valores cumulativos para responder a consultas de intervalo em tempo constante.
- **Critérios Computacionais de Divisibilidade:** Usar propriedades matemáticas de inteiros para simplificar verificações de divisibilidade.

Essas técnicas são particularmente interessantes porque demonstram como uma pequena quantidade de estado adicional pode eliminar uma quantidade considerável de computação desnecessária. Vamos explorá-las.

## 1. Algoritmo de Kadane (Subarray Máximo)

Imagine que você tem um vetor de inteiros e precisa encontrar o segmento contíguo com a maior soma possível. Uma abordagem ingênua examinaria todas as posições possíveis de início e fim, calculando a soma de cada intervalo. Dependendo de como a implementação é estruturada, isso pode exigir $\mathcal{O}(n^2)$ ou até $\mathcal{O}(n^3)$ operações.

O Algoritmo de Kadane resolve esse problema em tempo $\mathcal{O}(n)$ mantendo apenas dois valores enquanto percorre o vetor.

### A Fundamentação Matemática

O problema do subarray máximo busca a maior soma possível de um subarray contíguo não vazio. Seja $E(i)$ a soma máxima de um subarray contíguo que termina no índice $i$.

Em cada posição, temos duas escolhas:

- Iniciar um novo subarray no elemento atual.
- Estender o melhor subarray que termina na posição anterior.

Isso nos dá a recorrência:

$$
E(i) = \max\left(a[i],\, E(i - 1) + a[i]\right)
$$

O resultado final é o valor máximo entre todos os $E(i)$. Em outras palavras, rastreamos o melhor subarray terminando na posição atual, enquanto mantemos o melhor resultado encontrado até o momento.

Por exemplo, dado: `[-2, 1, -3, 4, -1, 2, 1, -5, 4]`
O subarray contíguo de soma máxima é: `[4, -1, 2, 1]`, e sua soma é `6`.

### Aplicações Reais de Mercado

Este algoritmo tem uma interpretação interessante em finanças quantitativas. Imagine analisar uma série temporal contendo lucros e perdas diários (P&L). Você pode querer identificar o período contíguo com o maior resultado positivo acumulado. O Algoritmo de Kadane fornece exatamente esse tipo de otimização.

Ele também pode ser aplicado a séries de retornos aditivos, como retornos logarítmicos. Uma distinção importante: retornos percentuais comuns se compõem de forma multiplicativa, então somá-los diretamente não dá o retorno composto exato. A mesma ideia é útil em análise de séries temporais, monitoramento de performance e detecção de períodos de forte desempenho cumulativo.

### Entrevistas de Código (LeetCode)

- **LeetCode 53 — Maximum Subarray (Médio):** O clássico problema de Kadane. O objetivo é encontrar o subarray contíguo com a maior soma.

### A Implementação em Rust

Usaremos `i64` para os valores de entrada e `i128` para as somas acumuladas, fornecendo um alcance maior para cálculos intermediários. Um vetor vazio retorna `None`, e um vetor contendo apenas valores negativos retorna corretamente seu maior elemento em vez de zero.

```rust title="kadane.rs"
/// Encontra a soma máxima de um subarray contíguo não vazio.
/// Retorna None quando o vetor de entrada está vazio.
pub fn max_subarray_sum(values: &[i64]) -> Option<i128> {
    // Separa o vetor no primeiro elemento e o restante.
    let (&first, rest) = values.split_first()?;

    // Inicializa a melhor soma terminando na primeira posição.
    let mut best_ending_here = i128::from(first);
    // Inicializa o máximo global.
    let mut best_overall = best_ending_here;

    // Processa os elementos restantes exatamente uma vez.
    for &value in rest {
        let value = i128::from(value);
        // Ou estende o subarray anterior ou inicia um novo.
        best_ending_here = value.max(best_ending_here + value);
        // Atualiza o melhor resultado encontrado até agora.
        best_overall = best_overall.max(best_ending_here);
    }
    Some(best_overall)
}
```

### Análise de Complexidade

| Métrica         | Complexidade     |
| --------------- | ---------------- |
| Tempo           | $\mathcal{O}(n)$ |
| Espaço Auxiliar | $\mathcal{O}(1)$ |

Este é um belo exemplo de programação dinâmica com um estado de tamanho constante.

## 2. Somas de Prefixo (_Prefix Sums_)

Agora imagine um problema diferente. Você tem um vetor com milhões de valores e sua aplicação precisa responder a milhares de consultas pedindo a soma de elementos entre duas posições.

Calcular cada intervalo do zero seria custoso. Se houver $q$ consultas, o custo total poderia atingir $\mathcal{O}(qn)$. Somas de Prefixo resolvem isso pré-processando o vetor uma única vez.

### A Fundamentação Matemática

Somas de prefixo transformam cálculos repetidos de soma de intervalos em consultas de tempo constante. Dado um vetor $a$, definimos um vetor de soma de prefixos $P$ como:

- $P(0) = 0$
- $P(k) = a[0] + a[1] + \dots + a[k - 1]$

A soma dos elementos no intervalo semiaberto $[l, r)$ é:

$$
\operatorname{sum}(l, r) = P(r) - P(l)
$$

O intervalo inclui o índice $l$ e exclui o índice $r$. Por exemplo, dado $a = [3, -2, 5, 1, -6]$, o vetor de soma de prefixos é $P = [0, 3, 1, 6, 7, 1]$. Para calcular a soma dos elementos nos índices 1, 2 e 3, computamos: $P(4) - P(1) = 7 - 3 = 4$.

Após um pré-processamento de $\mathcal{O}(n)$, cada consulta leva $\mathcal{O}(1)$ de tempo.

### Aplicações Reais de Mercado e Open Source

Somas de Prefixo são especialmente úteis ao lidar com grandes conjuntos de dados e consultas repetidas de intervalo. Em sistemas quantitativos, considere uma sequência histórica de volumes de negociação, valores diários de P&L, quantidades de fluxo de ordens assinadas ou contagens de transações. Se os dados forem estáticos durante a fase de consulta, as somas de prefixo permitem calcular o valor agregado de qualquer intervalo em tempo constante.

O mesmo princípio aparece no processamento de imagens, onde somas de prefixo bidimensionais podem calcular a soma de valores dentro de uma região retangular de uma matriz.

Referências open-source:

- **NumPy — `cumsum`:** Fornece somas cumulativas sobre arrays.
- **Python — `itertools.accumulate`:** Fornece um iterador para somas acumuladas.
- **LeetCode 303 — Range Sum Query (Immutable):** Um desafio clássico de implementação baseado em somas de prefixo.

> [!NOTE]
> Somas de prefixo ordinárias são ideais quando o vetor original não muda. Se houver atualizações frequentes, estruturas como Árvores de Fenwick ou Árvores de Segmentos são geralmente mais apropriadas.

### A Implementação em Rust

Para esta implementação, encapsularemos o array de prefixos em uma struct. Isso nos permite pré-processar os dados originais uma vez e executar múltiplas consultas de intervalo depois. Usaremos `i128` para os valores acumulados e validaremos os limites explicitamente.

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
    /// Constrói o vetor de somas de prefixo em tempo O(n).
    pub fn new(values: &[i64]) -> Result<Self, PrefixSumError> {
        // O primeiro prefixo é sempre zero.
        let mut prefix = Vec::with_capacity(values.len().saturating_add(1));
        let mut running_total = 0i128;
        prefix.push(running_total);

        // Calcula cada soma cumulativa.
        for &value in values {
            running_total = running_total
                .checked_add(i128::from(value))
                .ok_or(PrefixSumError::ArithmeticOverflow)?;
            prefix.push(running_total);
        }
        Ok(Self { prefix })
    }

    /// Retorna a soma do intervalo semiaberto [start, end).
    pub fn sum(&self, start: usize, end: usize) -> Result<i128, PrefixSumError> {
        // Valida o intervalo solicitado.
        if start > end || end >= self.prefix.len() {
            return Err(PrefixSumError::InvalidRange);
        }
        // Subtrai o prefixo anterior ao intervalo
        // do prefixo no final do intervalo.
        self.prefix[end]
            .checked_sub(self.prefix[start])
            .ok_or(PrefixSumError::ArithmeticOverflow)
    }
}
```

### Análise de Complexidade

| Operação              | Complexidade     |
| --------------------- | ---------------- |
| Pré-processamento     | $\mathcal{O}(n)$ |
| Consulta de Intervalo | $\mathcal{O}(1)$ |
| Espaço Auxiliar       | $\mathcal{O}(n)$ |

O compromisso é direto: gastamos memória adicional e uma passada linear de pré-processamento para tornar as consultas subsequentes extremamente baratas.

## 3. Critérios Computacionais de Divisibilidade

Este é um pequeno desvio matemático, mas bastante interessante. A divisibilidade é uma propriedade fundamental dos inteiros, e existem diversos critérios matemáticos que nos permitem determinar se um número é divisível por outro sem realizar uma operação de divisão geral.

### A Fundamentação Matemática

Para inteiros $n$ e $d$, onde $d \neq 0$, a divisibilidade é definida por: $d \mid n \iff n \pmod d == 0$.

Este é o teste computacional geral para divisibilidade de inteiros. Algumas regras de divisibilidade também podem ser derivadas das propriedades do sistema de numeração decimal. Cada potência de 10 deixa um resto de 1 quando dividida por 3 ou 9. Portanto:

- Um número é divisível por 3 se, e somente se, a soma de seus dígitos for divisível por 3.
- Um número é divisível por 9 se, e somente se, a soma de seus dígitos for divisível por 9.

Considere o número $123456$: $1 + 2 + 3 + 4 + 5 + 6 = 21$. Como 21 é divisível por 3, mas não por 9, o número original é divisível por 3, mas não por 9.

### Aplicações Computacionais

Esses critérios são úteis em:

- Validação numérica.
- Parsing e processamento de representações decimais.
- Filtros matemáticos.
- Problemas combinatórios envolvendo divisibilidade.

Para divisores arbitrários, a operação comum de resto permanece como a solução geral. O atalho da soma dos dígitos é especificamente útil para divisibilidade por 3 e 9. Um detalhe importante de implementação: a divisibilidade é uma propriedade inteira exata. Usar números de ponto flutuante para essa operação não é adequado porque representações de ponto flutuante podem introduzir erros de arredondamento.

### Entrevistas de Código (LeetCode)

- **LeetCode 412 — Fizz Buzz (Fácil):** Um exercício simples envolvendo divisibilidade por múltiplos inteiros.

### A Implementação em Rust

```rust title="divisibility.rs"
/// Verifica se um inteiro é divisível por outro.
/// Um divisor igual a zero é considerado inválido.
pub fn is_divisible(n: i64, divisor: i64) -> bool {
    // Divisão por zero não é definida.
    if divisor == 0 {
        return false;
    }
    // unsigned_abs lida com i64::MIN de forma segura.
    n.unsigned_abs() % divisor.unsigned_abs() == 0
}

/// Calcula a soma dos dígitos decimais.
fn digit_sum(mut n: u64) -> u64 {
    let mut sum = 0;
    while n > 0 {
        // Extrai o último dígito decimal.
        sum += n % 10;
        // Remove o último dígito decimal.
        n /= 10;
    }
    sum
}

// Critério de divisibilidade por 3.
pub fn is_divisible_by_3(n: u64) -> bool {
    digit_sum(n) % 3 == 0
}

// Critério de divisibilidade por 9.
pub fn is_divisible_by_9(n: u64) -> bool {
    digit_sum(n) % 9 == 0
}
```

### Análise de Complexidade

| Operação                            | Complexidade               |
| ----------------------------------- | -------------------------- |
| Checagem Genérica de divisibilidade | $\mathcal{O}(1)$           |
| Soma de Dígitos                     | $\mathcal{O}(\log_{10} n)$ |
| Espaço Auxiliar                     | $\mathcal{O}(1)$           |

Para inteiros de largura fixa, o número de dígitos decimais é limitado, então a operação de soma de dígitos também possui um limite superior constante. Vale ressaltar que este atalho matemático não é necessariamente mais rápido do que uma operação de resto via hardware em todos os processadores. Seu principal valor é a propriedade matemática que expõe e a forma como simplifica certas classes de problemas.

## Conclusão do Módulo 2

Neste módulo, exploramos três maneiras diferentes de evitar computação desnecessária.

O Algoritmo de Kadane mantém o melhor subarray contíguo terminando na posição atual, reduzindo uma busca potencialmente cara a uma única travessia. As Somas de Prefixo armazenam informações cumulativas, permitindo-nos responder a consultas repetidas de intervalo com uma única subtração. Os Critérios Computacionais de Divisibilidade demonstram como propriedades matemáticas das representações decimais podem simplificar verificações exatas de inteiros.

A ideia comum é que algoritmos eficientes não exigem necessariamente matemática mais complexa. Às vezes, a maior melhoria vem de reconhecer qual informação precisamos realmente preservar.

## O Repositório e Próximos Passos

Estou desenvolvendo e organizando os algoritmos no meu repositório do GitHub:

- [quant-dev-roadmap — GitHub](https://github.com/vnator/quant-dev-roadmap)

O repositório está se tornando a referência central para esta série, contendo o catálogo de algoritmos, implementações e testes. Já explorei e implementei algoritmos de alguns dos módulos futuros, mas prefiro publicar esses artigos gradualmente. Cada grupo merece tempo suficiente para seus fundamentos matemáticos, detalhes de implementação, casos limite e estratégia de testes.

No próximo artigo, entraremos no **Módulo 3: Teoria Computacional dos Números**, explorando aritmética modular, o Algoritmo de Euclides, o Mínimo Múltiplo Comum, o Crivo de Eratóstenes e a fatoração de inteiros.

Ainda há muita matemática para traduzir em código eficiente. E é exatamente isso que torna esta jornada tão interessante. Até o próximo módulo!
