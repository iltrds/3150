/* Midterm 2 flashcards: t = topic, f = front, b = back */
window.CARDS = [
  /* Topic 1: CFG design and ambiguity */
  { t: 1, f: 'Grammar for a union L₁ ∪ L₂', b: 'Write a grammar for each part with start variables S₁, S₂, then add S → S₁ | S₂. Example: {0ⁿ1ⁿ} ∪ {1ⁿ0ⁿ}: S → S₁ | S₂, S₁ → 0S₁1 | ε, S₂ → 1S₂0 | ε.' },
  { t: 1, f: 'Grammar for aⁿbⁿcᵐdᵐ (n, m ≥ 1)', b: 'Independent halves, so concatenate: S → AB, A → aAb | ab, B → cBd | cd.' },
  { t: 1, f: 'Grammar for aⁿbᵐcᵐdⁿ (n, m ≥ 1)', b: 'Nested, so work from the outside in: S → aSd | aBd, B → bBc | bc.' },
  { t: 1, f: 'S → aB | bA,  A → a | aS | bAA,  B → b | bS | aBB', b: 'Generates the nonempty strings with equal numbers of a’s and b’s. A derives strings with one extra a, B with one extra b.' },
  { t: 1, f: 'S → bB | aSS,  B → ε | aS | bA,  A → aB | bAA', b: 'Strings with exactly one more b than a. Derivation of bab: S ⇒ bB ⇒ baS ⇒ babB ⇒ bab.' },
  { t: 1, f: 'Sipser 2.3: R → XRX | S, S → aTb | bTa, T → XTX | X | ε, X → a | b', b: 'L(G) = all non-palindromes over {a, b}. S forces a mismatched mirrored pair; T fills any middle; R adds outer symbols in matching numbers.' },
  { t: 1, f: '⇒ versus ⇒*', b: '⇒ is exactly one rule application; ⇒* is zero or more. So T ⇒* T is always true, but T ⇒ T is usually false.' },
  { t: 1, f: 'Ambiguous grammar', b: 'Some string has two distinct leftmost derivations, equivalently two distinct parse trees. Every string has both a leftmost and a rightmost derivation; that alone is not ambiguity.' },
  { t: 1, f: 'G₁: S → SS | AB … and G₄: S → SS | (S) | x | y | z', b: 'Both ambiguous: S → SS groups three blocks two ways (ababab in G₁, xyz in G₄).' },
  { t: 1, f: 'G₂: S → (L) | a, L → LS | S and G₃: S → AA, A → aA | b', b: 'Both unambiguous. In G₂ the list is built in one order; in G₃ each A ends at its first b, so the split of AA is forced.' },
  { t: 1, f: 'S → AS | a | b,  A → SS | ab', b: 'Ambiguous: abb has two parse trees (A → ab then S → b, or A → SS giving a, b then S → b).' },
  { t: 1, f: 'Why ambiguity matters', b: 'The parse tree gives the meaning. Two trees for x + y * z means two different values; the dangling else can attach to either if.' },
  { t: 1, f: 'Dangling else (Sipser 2.27)', b: '“if c then if c then s else s”: the else can belong to the inner or the outer if, so the IF-THEN / IF-THEN-ELSE grammar is ambiguous.' },

  /* Topic 2: Simplifying grammars and CNF */
  { t: 2, f: 'Nullable variable', b: 'A → ε makes A nullable; A → B₁…Bₙ with all Bᵢ nullable makes A nullable; nothing else is. Equivalently A ⇒* ε.' },
  { t: 2, f: 'Eliminating ε-rules', b: 'For every rule, add each version with some nullable variables deleted (never the empty right side), then drop the ε-rules. Keep S → ε only if S was nullable.' },
  { t: 2, f: 'S → AACD with A, D nullable (C not)', b: 'Becomes S → AACD | ACD | CD | AAC | AC | C. S is not nullable, so no S → ε.' },
  { t: 2, f: 'Unit production', b: 'A → B (a single variable). Remove it by giving A all of B’s right sides: S → C with C → aC | a becomes S → aC | a.' },
  { t: 2, f: 'Chomsky normal form', b: 'Every rule is A → BC or A → a, where B and C are not the start variable. S → ε is also allowed.' },
  { t: 2, f: 'CNF conversion steps (lecture order)', b: '1. Eliminate ε-rules. 2. Eliminate unit rules. 3. Make right sides a single terminal or only variables (Xₐ → a). 4. Split long rules into pairs of variables.' },
  { t: 2, f: 'Splitting S → ABC', b: 'S → AD, D → BC, or S → DC, D → AB. Either grouping works.' },
  { t: 2, f: 'Terminal inside a long rule (A → Aa)', b: 'Add Xₐ → a and rewrite as A → AXₐ.' },
  { t: 2, f: 'Derivation length in CNF', b: 'A string of length n ≥ 1 takes exactly 2n − 1 steps: n − 1 uses of A → BC and n uses of A → a.' },
  { t: 2, f: 'Which languages have CNF grammars?', b: 'Every context-free language (Sipser Theorem 2.9).' },

  /* Topic 3: PDAs */
  { t: 3, f: 'PDA', b: 'An NFA with a stack. The stack gives unbounded memory, so PDAs recognize exactly the context-free languages.' },
  { t: 3, f: 'PDA 6-tuple', b: '(Q, Σ, Γ, δ, q₀, F): states, input alphabet, stack alphabet, transition function, start state, accept states.' },
  { t: 3, f: 'PDA transition function', b: 'δ: Q × Σ_ε × Γ_ε → P(Q × Γ_ε). Given a state, input symbol or ε, and stack symbol or ε, it returns a set of (next state, push) pairs.' },
  { t: 3, f: 'Label a, b → c', b: 'Read a from the input, pop b from the stack, push c. Any of the three may be ε.' },
  { t: 3, f: 'PDA M₁ for 0ⁿ1ⁿ', b: 'Push $; push a 0 for each 0; pop a 0 for each 1; on $ go to accept. q₁ also accepts, so ε is accepted.' },
  { t: 3, f: 'Why push $ first?', b: 'A PDA cannot test for an empty stack. Seeing $ on top again means everything pushed has been matched.' },
  { t: 3, f: 'Instantaneous description (q, w, γ)', b: 'Current state, unread input, whole stack (top first). If δ(q, a, Z) ∋ (p, β): (q, aw, Zα) ⊢ (p, w, βα).' },
  { t: 3, f: 'M₁ on 0011', b: '(q₁,0011,ε) ⊢ (q₂,0011,$) ⊢ (q₂,011,0$) ⊢ (q₂,11,00$) ⊢ (q₃,1,0$) ⊢ (q₃,ε,$) ⊢ (q₄,ε,ε): accept.' },
  { t: 3, f: 'Deterministic PDA', b: 'No δ(q, a, Z) has more than one move, and if δ(q, ε, Z) is nonempty then δ(q, a, Z) is empty for every input a.' },
  { t: 3, f: 'PDA vs DPDA', b: 'DPDAs recognize only some CFLs. {wwᴿ} needs a nondeterministic guess of the middle. Unless stated otherwise, “PDA” means nondeterministic.' },
  { t: 3, f: 'Pushing several symbols (a, s → xyz)', b: 'Expand into a chain of new states: the first move reads a and replaces s; ε, ε → … moves push the rest without reading input.' },
  { t: 3, f: 'Regular vs context-free', b: 'Every regular language is context-free (a DFA is a PDA that ignores its stack). {0ⁿ1ⁿ} is context-free but not regular.' },

  /* Topic 4: Predictive parsing */
  { t: 4, f: 'Left recursion', b: 'A rule A → Aα. A top-down parser calls A() again before reading anything, looping until the stack overflows.' },
  { t: 4, f: 'Removing left recursion: A → Aα | β', b: 'A → βA′,  A′ → αA′ | ε.  So E → E + T | T becomes E → TE′, E′ → +TE′ | ε.' },
  { t: 4, f: 'Left factoring: A → αβ₁ | αβ₂', b: 'A → αA′,  A′ → β₁ | β₂. Example: stmt → if expr then stmt stmt′, stmt′ → else stmt | ε.' },
  { t: 4, f: 'LL(1)', b: 'Left-to-right scan, Leftmost derivation, 1 symbol of lookahead. LL(k) looks k symbols ahead.' },
  { t: 4, f: 'FIRST(α)', b: 'Terminals that can begin a string derived from α, plus ε if α ⇒* ε. FIRST(terminal) = {terminal}.' },
  { t: 4, f: 'FOLLOW(A)', b: 'Terminals that can appear right after A in some sentential form. $ ∈ FOLLOW(start). For A → αBβ: FIRST(β) − {ε} ⊆ FOLLOW(B); if β ⇒* ε, FOLLOW(A) ⊆ FOLLOW(B).' },
  { t: 4, f: 'FIRST sets for E → TE′, E′ → +TE′ | ε, T → FT′, T′ → *FT′ | ε, F → (E) | id', b: 'FIRST(E) = FIRST(T) = FIRST(F) = {(, id}; FIRST(E′) = {+, ε}; FIRST(T′) = {*, ε}.' },
  { t: 4, f: 'FOLLOW sets for the expression grammar', b: 'FOLLOW(E) = FOLLOW(E′) = {), $}; FOLLOW(T) = FOLLOW(T′) = {+, ), $}; FOLLOW(F) = {+, *, ), $}.' },
  { t: 4, f: 'Building the LL(1) table', b: 'For A → α: add it to M[A, a] for each a ∈ FIRST(α); if ε ∈ FIRST(α), also to M[A, b] for each b ∈ FOLLOW(A). Blank cells are errors.' },
  { t: 4, f: 'Predictive parser moves', b: 'Top = nonterminal: replace by M[top, input]. Top = matching terminal: pop and advance. Top = input = $: accept. Otherwise: error.' },
  { t: 4, f: 'When is a grammar not LL(1)?', b: 'When some table cell gets two productions, e.g. S → aA | aB puts both in M[S, a]. Left factoring often fixes it.' }
];
