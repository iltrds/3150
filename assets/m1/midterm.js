/* Midterm 1 (Oct 8, 2026): questions 8–29 as written on the exam, transcribed from photos.
   Questions 1–7 were not captured. Where a correct choice gave itself away by length, the
   other choices were rewritten to match (noted in `rev`). Answers verified by computation. */
(function () {
  function tbl(head, rows) {
    var h = '<table class="mini ttable"><thead><tr>' + head.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) { h += '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>'; });
    return h + '</tbody></table>';
  }
  var E = '∅';
  var MATCH = ['0*10*', '1*∅', '0Σ*0 ∪ 1Σ*1 ∪ 0 ∪ 1', '(ΣΣΣ)*', 'None of the above'];
  var VALS = ['2', '3', '4', '(3, 4)', 'None of the above'];
  var CONV = ['The set difference method', 'Thompson’s construction method', 'The subset construction method', 'The set destruction method', 'None of the above'];

  var GROUPS = window.GROUPS = window.GROUPS || {};
  GROUPS['mt-fg'] = '<p>Consider the functions f and g, defined by the tables below. In g, rows are the first argument and columns are the second.</p>' +
    '<div class="tree-row">' + tbl(['n', 'f(n)'], [['1', '4'], ['2', '3'], ['3', '3'], ['4', '2']]) +
    tbl(['g', '2', '3', '4', '6'], [['0', '0', '1', '2', '5'], ['1', '1', '2', '3', '0'], ['2', '0', '3', '2', '1'], ['3', '4', '0', '1', '4']]) + '</div>';
  GROUPS['mt-match'] = '<p>Select your answer by matching the described language with an equivalent regular expression from the choices. Let Σ = {0, 1}.</p>';
  GROUPS['mt-nfa'] = '<p>Let N = (Q, Σ, δ, q₀, F), where Q = {q₀, …, q₆}, Σ = {a, b} and F = {q₄}. The transition function is:</p>' +
    tbl(['', 'a', 'b', 'ε'], [['→ q₀', '{q₂}', '{q₁}', '{q₅}'], ['q₁', '{q₃}', '{q₀}', '{q₅}'], ['q₂', '{q₄}', '{q₃}', '{q₆}'], ['q₃', '{q₄}', '{q₂}', '{q₆}'], ['* q₄', '{q₀}', '{q₄}', E], ['q₅', E, E, E], ['q₆', E, E, E]]) +
    '<p>→ marks the start state and * the accepting state.</p>';

  var M = [
    { mt: 8, g: 'mt-fg', t: 1, s: 'Functions', q: 'What is the value of g(2, 3)?', c: VALS, a: 1,
      x: 'Row 2, column 3 of the g table is 3. The first argument picks the row, the second the column.' },
    { mt: 9, g: 'mt-fg', t: 1, s: 'Functions', q: 'What is the value of g(1, f(4))?', c: VALS, a: 4,
      x: 'Work inside out: f(4) = 2, so this is g(1, 2), which is row 1, column 2: the value 1. That is not among (a)–(d).' },
    { mt: 10, g: 'mt-fg', t: 1, s: 'Functions', q: 'What is the domain of g?',
      c: ['{0, 1, 2, 3}', '{2, 3, 4, 6}', '{0, 1, 2, 3} × {2, 3, 4, 6}', '{2, 3, 4, 6} × {0, 1, 2, 3}', 'None of the above'], a: 2,
      x: 'g takes two arguments, so its domain is a set of pairs: first argument from {0, 1, 2, 3}, second from {2, 3, 4, 6}. Order matters in a Cartesian product, which rules out (d).' },
    { mt: 11, g: 'mt-fg', t: 1, s: 'Functions', q: 'What is the range of f?',
      c: ['{1, 2, 3, 4}', '{2, 3, 4}', '(2, 3, 3, 4)', 'None of these'], a: 1,
      x: 'The values f produces are 4, 3, 3, 2, which as a set is {2, 3, 4}. (a) is the domain, and (c) is a sequence (ordered, with repeats), not a set.' },
    { mt: 12, t: 3, s: 'Conversions', q: 'The method used to convert NFAs to DFAs is called', c: CONV, a: 2,
      x: 'The subset construction makes each DFA state a set of NFA states (Sipser Theorem 1.39).' },
    { mt: 13, t: 3, s: 'Conversions', q: 'The method used to convert regular expressions to NFAs is called', c: CONV, a: 1,
      x: 'Thompson’s construction builds an NFA piece by piece for each part of the regex (Sipser Lemma 1.55). Option (e) was cut off in the photo; “None of the above” is assumed.' },
    { mt: 14, t: 3, s: 'NFA → regex', rev: true,
      q: 'Which regular expression describes the language accepted by the NFA below? (On the exam it was drawn as a diagram.)' +
        tbl(['', '0', '1', 'ε'], [['→ q₀', E, E, '{q₁, q₃}'], ['q₁', '{q₁}', E, '{q₂}'], ['q₂', E, '{q₃}', E], ['q₃', E, '{q₄}', '{q₀}'], ['* q₄', E, E, E]]),
      c: ['1(0*1)*', '(0*1)*1', '(10*)*1', '0*(1*0)*1', 'None of the above'], a: 1,
      x: 'From q₀, the path q₁ (loop on 0) → q₂ → q₃ reads one block 0*1; the ε-arrow q₃ → q₀ lets you repeat it, and q₀ → q₃ skips it. From q₃, a final 1 reaches q₄. So L = (0*1)*1, which is “1” or any string ending in 11. Original choices: 1, (0*1)*1, 10*1, 0*1*.' },
    { mt: 15, g: 'mt-match', t: 3, s: 'Reading regexes', q: '{w | the length of w is a multiple of three}', c: MATCH, a: 3,
      x: '(ΣΣΣ)* adds exactly three symbols per repetition, and zero repetitions gives length 0.' },
    { mt: 16, g: 'mt-match', t: 3, s: 'Reading regexes', q: '{w | w starts and ends with the same symbol}', c: MATCH, a: 2,
      x: '0Σ*0 and 1Σ*1 handle strings of length 2 or more; the single symbols 0 and 1 also start and end with the same symbol.' },
    { mt: 17, g: 'mt-match', t: 3, s: 'Regex identities', q: 'The empty set.', c: MATCH, a: 1,
      x: 'Concatenating with ∅ always gives ∅, since there is no string to append. So 1*∅ = ∅.' },
    { mt: 18, t: 2, s: 'Reading DFAs', q: 'Which string does the following DFA NOT accept?' +
        tbl(['', '0', '1'], [['→ q₁', 'q₂', 'q₂'], ['q₂', 'q₃', 'q₃'], ['* q₃', 'q₁', 'q₁']]),
      c: ['ε', '11010', '10001010', 'Any string of length 11'], a: 0,
      x: 'Every symbol moves one step around q₁ → q₂ → q₃ → q₁, so the DFA accepts exactly the strings whose length is 2 more than a multiple of 3. Lengths 5, 8 and 11 qualify; ε has length 0 and ends in q₁.' },
    { mt: 19, t: 3, s: 'NFAs', rev: true, q: 'The difference between a DFA and an NFA is:',
      c: ['Nothing: they are exactly the same kind of machine', 'A DFA is a 5-tuple, while an NFA is a 6-tuple that adds ε', 'A DFA has exactly one move per state and symbol; an NFA may have 0, 1 or more', 'An NFA has exactly one move per state and symbol; a DFA may have 0, 1 or more', 'None of the above'], a: 2,
      x: 'Both are 5-tuples; the NFA’s δ returns a set of states (possibly empty) and may use ε. (d) has the two machines swapped. On the exam the correct option was much longer than the rest; the other choices were rewritten to match.' },
    { mt: 20, t: 3, s: 'Regex languages', q: 'L(a*ba) ∩ L(b*a) =',
      c: ['{a, b}', '{a, b, ab, ba}', '{ba}', '∅', 'None of the above'], a: 2,
      x: 'a*ba gives ba, aba, aaba, …; b*a gives a, ba, bba, …. The only string in both is ba (no a’s before the b, exactly one b).' },
    { mt: 21, t: 3, s: 'Regex languages', q: 'Which of the following are not members of the regular expression language [a*b]+, that is, (a*b)⁺?',
      c: ['b', 'aab', 'abb', 'bbb', 'All of the strings above are members.'], a: 4,
      x: '(a*b)⁺ is one or more blocks, each some a’s then a b: every nonempty string ending in b. b = b; aab = aab; abb = ab · b; bbb = b · b · b.' },
    { mt: 22, t: 4, s: 'Ambiguity', q: 'A grammar is said to be ambiguous if',
      c: ['a parse tree in the grammar generates at least two distinct left-most derivations.', 'a string in the language can be generated by at least two distinct right-most derivations.', 'a parse tree in the grammar generates at least two distinct strings (sentences) in the language.', 'None of the above.'], a: 1,
      x: 'Two distinct rightmost derivations of one string mean two parse trees, just as two leftmost derivations do. Each parse tree has exactly one leftmost derivation and exactly one yield, which rules out (a) and (c).' },
    { mt: 23, t: 2, s: 'Equivalence', q: 'Given two finite state automata, to determine if they are equivalent',
      c: ['minimize both and check for isomorphism', 'convert NFAs to DFAs', 'this is an undecidable problem', '(b) followed by (a)', 'None of the above'], a: 3,
      x: 'Minimization works on DFAs, so first convert any NFA with the subset construction, then minimize both and compare up to renaming states. The minimal DFA is unique, so this decides equivalence.' },
    { mt: 24, t: 3, s: 'GNFA', q: 'Which of the following best describes a Generalized Nondeterministic Finite Automaton (GNFA)?',
      c: ['A GNFA is a DFA in which every state must have exactly one outgoing transition.', 'A GNFA is similar to an NFA, but its transition labels may be regular expressions.', 'A GNFA is an NFA that does not allow ε-transitions.', 'A GNFA is an automaton in which every transition must be labelled by exactly one symbol from the alphabet.'], a: 1,
      x: 'GNFAs label arrows with whole regular expressions; ripping out states one at a time turns a DFA into a regex (Sipser Lemma 1.60).' },
    { mt: 25, g: 'mt-nfa', t: 3, s: 'Subset construction', q: 'In the absence of trap states, using ε-closures during the subset construction, which sequence of DFA states is traversed when the NFA processes the string aba from the start state?',
      c: ['{q₀,q₅} −a→ {q₂,q₆} −b→ {q₃,q₆} −a→ {q₄}', '{q₀} −a→ {q₂} −b→ {q₃} −a→ {q₄}', '{q₀,q₅} −a→ {q₂,q₆} −b→ {q₁,q₅} −a→ {q₃,q₆}', '{q₀,q₅} −a→ {q₄} −b→ {q₄} −a→ {q₀,q₅}'], a: 0,
      x: 'Start at E({q₀}) = {q₀, q₅}. On a: q₂, closure {q₂, q₆}. On b: q₃, closure {q₃, q₆}. On a: q₄, closure {q₄}. (b) forgets the ε-closures.' },
    { mt: 26, g: 'mt-nfa', t: 3, s: 'Subset construction', q: 'After applying the subset construction and removing both trap states and unreachable subsets, which of the following is exactly the set of reachable DFA states?',
      c: ['{{q₀,q₅}, {q₁,q₅}, {q₂,q₆}, {q₃,q₆}, {q₄}}', '{{q₀}, {q₁}, {q₂}, {q₃}, {q₄}, {q₅}, {q₆}}', '{{q₀,q₅}, {q₁,q₅}, {q₂,q₆}, {q₃,q₆}, {q₄}, ∅}', 'P({q₀, q₁, q₂, q₃, q₄, q₅, q₆})', '{{q₀}, {q₁}, {q₂}, {q₃}, {q₄}}'], a: 0,
      x: 'From {q₀,q₅}: a → {q₂,q₆}, b → {q₁,q₅}. From {q₁,q₅}: a → {q₃,q₆}, b → {q₀,q₅}. {q₂,q₆} and {q₃,q₆} go to {q₄} on a and to each other on b. {q₄}: a → {q₀,q₅}, b → {q₄}. Every move is defined, so no trap state ∅ is ever reached.' },
    { mt: 27, g: 'mt-nfa', t: 3, s: 'Subset construction', q: 'How many states are in the DFA directly formed from the NFA (before minimization)?',
      c: ['2', '3', '4', '5', 'None of these'], a: 3, x: 'The five reachable subsets from the previous question.' },
    { mt: 28, g: 'mt-nfa', t: 3, s: 'Subset + minimization', q: 'How many states are in the minimized DFA?',
      c: ['2', '3', '4', '5', 'None of these'], a: 1,
      x: 'Initial partition: {{q₄}} and the other four. On a, {q₂,q₆} and {q₃,q₆} reach {q₄} but {q₀,q₅} and {q₁,q₅} do not: split. Then nothing else splits: {q₀,q₅} ≡ {q₁,q₅} and {q₂,q₆} ≡ {q₃,q₆}. Three states, which count a’s mod 3; b never changes the group.' },
    { mt: 29, g: 'mt-nfa', t: 3, s: 'NFA → regex', q: 'Which of the following regular expressions describes the language accepted by N?',
      c: ['b*ab*ab*(ab*ab*ab*)*', 'b*(ab*)³(ab*ab*ab*)*', 'b*ab*(ab*ab*ab*)*', '(b*ab*ab*)*', 'None of the above.'], a: 0,
      x: 'The minimized DFA accepts exactly when the number of a’s is 2 more than a multiple of 3, with b’s anywhere. (a) has 2 + 3k a’s; (b) has 3 + 3k; (c) has 1 + 3k; (d) allows 0, 2, 4, … .' }
  ];

  M.forEach(function (q) { q.id = 'mt-' + (q.mt < 10 ? '0' : '') + q.mt; q.fmt = 'prof'; q.keep = true; q.src = 'midterm'; });
  window.QB = window.QB.concat(M);
  window.MIDTERM = M.map(function (q) { return q.id; });
})();
