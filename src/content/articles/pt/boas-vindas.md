---
title: "Otimização matemática em Rust: demonstração de renderização"
description: "Um exemplo completo de matemática numérica, código Rust, equações, figuras, citações e notas de rodapé."
lang: pt
translationKey: mathematical-rust-showcase
publishedAt: 2026-11-13
tags: [rust, metodos-numericos, matematica, markdown]
cover: "/article-diagram.svg"
publish: true
---

Este artigo demonstra a publicação de conteúdo técnico e introduz um problema simples de otimização numérica. Ele contém **negrito**, *itálico*, [links](https://doc.rust-lang.org/book/), tabelas, equações, uma figura, notas de rodapé, blocos de aviso e referências.

## 1. Um problema de otimização convexa

Considere a função quadrática $f:\mathbb{R}^2\to\mathbb{R}$,

$$
\begin{aligned}
\min_{\mathbf{x}\in\mathbb{R}^{2}}\quad
  & f(\mathbf{x}) =
    \frac{1}{2}\mathbf{x}^{\mathsf{T}}A\mathbf{x}
    -\mathbf{b}^{\mathsf{T}}\mathbf{x},\\
\text{sujeito a}\quad
  & \mathbf{x}\succeq\mathbf{0},\\
A &= \begin{bmatrix}4&1\\1&3\end{bmatrix},
\qquad
\mathbf{b}=\begin{bmatrix}1\\2\end{bmatrix}.
\end{aligned}
$$

Como $A$ é simétrica definida positiva (seus menores principais líderes são $4>0$ e $11>0$), existe um único mínimo sem restrições. O gradiente é $\nabla f(\mathbf{x})=A\mathbf{x}-\mathbf{b}$. Portanto,

$$
\mathbf{x}^{*}=A^{-1}\mathbf{b}
=\frac{1}{11}
\begin{bmatrix}3&-1\\-1&4\end{bmatrix}
\begin{bmatrix}1\\2\end{bmatrix}
=\begin{bmatrix}1/11\\7/11\end{bmatrix}.
$$

As duas coordenadas são positivas, de modo que essa solução também minimiza a função no conjunto viável.[^convexidade]

<figure>
  <img src="/article-diagram.svg" width="960" height="480" loading="lazy" alt="Elipses de nível ao redor do mínimo quadrático e uma sequência iterativa convergindo para ele." />
  <figcaption>Figura 1 — Curvas de nível ilustrativas e um caminho iterativo até o mínimo convexo. O diagrama é conceitual, não um gráfico dos coeficientes numéricos específicos acima.</figcaption>
</figure>

## 2. Método iterativo

Para uma aproximação $\mathbf{x}_k$, o método do gradiente utiliza

$$
\begin{aligned}
\mathbf{x}_{k+1}&=\mathbf{x}_k-\alpha\nabla f(\mathbf{x}_k),\\
\nabla f(\mathbf{x}_k)&=A\mathbf{x}_k-\mathbf{b}.
\end{aligned}
$$

Sua convergência depende do passo. Para $A$ simétrica definida positiva, escolher $0<\alpha<2/\lambda_{\max}(A)$ garante convergência no caso quadrático sem restrições.[^passo]

> [!NOTE] Estabilidade numérica
> Operações de ponto flutuante aproximam a aritmética real. Testes devem empregar tolerâncias em vez de exigir igualdade exata de resultados numéricos.

## 3. Implementação em Rust

Este exemplo autoral calcula um produto matriz-vetor e um passo do gradiente, sem dependências externas.

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

| Método | Custo por iteração | Consideração principal |
| --- | --- | --- |
| Gradiente descendente | Produto matriz-vetor | Escolha do passo |
| Método de Newton | Resolução de sistema linear | Estrutura da Hessiana |
| Gradientes conjugados | Produto matriz-vetor | Hipótese de matriz definida positiva |

## 4. Uma conexão com análise

O teorema fundamental do cálculo relaciona integração e diferenciação:

$$
\int_a^b f'(t)\,\mathrm{d}t = f(b)-f(a).
$$

Para uma série convergente, estudamos as somas parciais $S_n=\sum_{k=1}^{n}a_k$ e seu limite,

$$
\lim_{n\to\infty} S_n = \sum_{k=1}^{\infty} a_k.
$$

> “Premature optimization is the root of all evil (or at least most of it) in programming.”
>
> — Donald Knuth, *Structured Programming with go to Statements* (1974). Veja a referência abaixo.

> [!TIP] Anotações do Obsidian
> Callouts e notas de rodapé são interpretados durante o build Markdown. O arquivo de origem continua sendo Markdown e pode ser editado no Obsidian.

## 5. Referências

- Nocedal, Jorge e Stephen Wright. *Numerical Optimization*, 2ª ed. Springer, 2006.
- Knuth, Donald E. “Structured Programming with go to Statements.” *Computing Surveys*, 6(4), 1974. [DOI ACM](https://doi.org/10.1145/356635.356640).
- [The Rust Programming Language](https://doc.rust-lang.org/book/), documentação oficial.

[^convexidade]: A definição positiva garante convexidade estrita da função quadrática. Como o minimizador está no conjunto viável, também minimiza a função sob a restrição.
[^passo]: Essa condição sobre o passo se aplica ao método do gradiente sem restrições para uma quadrática com matriz simétrica definida positiva; métodos com restrições geralmente adicionam uma projeção.
