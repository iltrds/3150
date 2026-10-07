/* Questions in Dr. Obimbo's format, modelled on the class practice test (Oct 6, 2026):
   five choices (a)–(e) in fixed order, shared setups ("For questions 4 to 6 consider…"),
   automata given as transition tables, parse trees drawn as pictures.
   Extra fields: fmt:'prof' (practice-test style), g (shared-setup group id), pt (from the practice test itself). */
(function () {
  /* ---------- helpers ---------- */
  function tbl(head, rows) {
    var h = '<table class="mini ttable"><thead><tr>' + head.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>';
    rows.forEach(function (r) { h += '<tr>' + r.map(function (c, i) { return i === 0 ? '<th scope="row">' + c + '</th>' : '<td>' + c + '</td>'; }).join('') + '</tr>'; });
    return h + '</tbody></table>';
  }

  // Parse tree as inline SVG. spec = [label, child, child, …]; a plain string is a leaf (terminal).
  function ptree(spec, caption) {
    var W = 40, LH = 46, leaves = 0, maxDepth = 0, nodes = [], edges = [];
    function depthOf(n, d) { if (typeof n === 'string') { maxDepth = Math.max(maxDepth, d); return; } n.slice(1).forEach(function (c) { depthOf(c, d + 1); }); }
    depthOf(spec, 0);
    function lay(n, d) {
      if (typeof n === 'string') { var x = leaves++ * W + W / 2; nodes.push({ x: x, y: maxDepth * LH + 26, t: n, leaf: true }); return { x: x, y: maxDepth * LH + 26 }; }
      var kids = n.slice(1).map(function (c) { return lay(c, d + 1); });
      var x = (kids[0].x + kids[kids.length - 1].x) / 2, y = d * LH + 20;
      kids.forEach(function (k) { edges.push([x, y + 6, k.x, k.y - 14]); });
      nodes.push({ x: x, y: y, t: n[0], leaf: false });
      return { x: x, y: y };
    }
    lay(spec, 0);
    var w = leaves * W, h = maxDepth * LH + 36;
    var s = '<svg class="ptree" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + (caption || 'Parse tree') + '">';
    edges.forEach(function (e) { s += '<line x1="' + e[0] + '" y1="' + e[1] + '" x2="' + e[2] + '" y2="' + e[3] + '"/>'; });
    nodes.forEach(function (n) { s += '<text x="' + n.x + '" y="' + n.y + '" text-anchor="middle" class="' + (n.leaf ? 'term' : 'var') + '">' + (n.leaf ? n.t : '⟨' + n.t + '⟩') + '</text>'; });
    return s + '</svg>';
  }
  window.ptree = ptree;
  function trees() { return '<div class="tree-row">' + Array.prototype.slice.call(arguments).join('') + '</div>'; }

  var EMPTY = '∅';
  var RO = ['Reflexive but not symmetric', 'Reflexive and symmetric but not transitive', 'Symmetric but not reflexive', 'An equivalence relation', 'None of the above'];
  var N5 = ['1', '2', '3', '4', '5'];

  /* ---------- shared setups ---------- */
  window.GROUPS = {
    'pt-nfa': '<p>Consider the following NFA <i>N</i> over Σ = {0, 1}:</p>' +
      tbl(['', '0', '1'], [['q₀', '{q₀, q₁}', '{q₀}'], ['q₁', EMPTY, '{q₂}'], ['q₂', '{q₂}', EMPTY]]) +
      '<p>The start state is q₀, and q₂ is the only accepting state.</p>',
    'pt-dfa': '<p>Consider the following DFA over Σ = {0, 1}:</p>' +
      tbl(['', '0', '1'], [['q₀', 'q₁', 'q₂'], ['q₁', 'q₀', 'q₃'], ['q₂', 'q₃', 'q₀'], ['q₃', 'q₂', 'q₁']]) +
      '<p>The start state is q₀, and the accepting states are F = {q₂, q₃}.</p>',
    'pg-d1': '<p>Consider the following DFA over Σ = {0, 1}:</p>' +
      tbl(['', '0', '1'], [['q₀', 'q₁', 'q₂'], ['q₁', 'q₃', 'q₄'], ['q₂', 'q₁', 'q₂'], ['q₃', 'q₃', 'q₄'], ['q₄', 'q₁', 'q₂']]) +
      '<p>The start state is q₀, and q₄ is the only accepting state.</p>',
    'pg-d2': '<p>Consider the following DFA over Σ = {0, 1}:</p>' +
      tbl(['', '0', '1'], [['q₀', 'q₀', 'q₁'], ['q₁', 'q₁', 'q₂'], ['q₂', 'q₂', 'q₃'], ['q₃', 'q₃', 'q₀']]) +
      '<p>The start state is q₀, and q₀ is the only accepting state.</p>',
    'pg-d3': '<p>Consider the following DFA over Σ = {0, 1}:</p>' +
      tbl(['', '0', '1'], [['q₀', 'q₀', 'q₁'], ['q₁', 'q₁', 'q₂'], ['q₂', 'q₂', 'q₃'], ['q₃', 'q₃', 'q₀']]) +
      '<p>The start state is q₀, and the accepting states are F = {q₀, q₂}.</p>',
    'pg-d4': '<p>Consider the following DFA over Σ = {0, 1}:</p>' +
      tbl(['', '0', '1'], [['q₀', 'q₁', 'q₀'], ['q₁', 'q₁', 'q₀'], ['q₂', 'q₁', 'q₂']]) +
      '<p>The start state is q₀, and q₁ is the only accepting state.</p>',
    'pg-n1': '<p>Consider the following NFA <i>N</i> over Σ = {0, 1}:</p>' +
      tbl(['', '0', '1'], [['q₀', '{q₀}', '{q₀, q₁}'], ['q₁', '{q₂}', '{q₂}'], ['q₂', EMPTY, EMPTY]]) +
      '<p>The start state is q₀, and q₂ is the only accepting state.</p>',
    'pg-n2': '<p>Consider the following NFA <i>N</i> over Σ = {a, b}, which has an ε-transition:</p>' +
      tbl(['', 'a', 'b', 'ε'], [['q₀', '{q₀}', EMPTY, '{q₁}'], ['q₁', EMPTY, '{q₁, q₂}', EMPTY], ['q₂', '{q₂}', EMPTY, EMPTY]]) +
      '<p>The start state is q₀, and q₂ is the only accepting state.</p>',
    'pg-n3': '<p>Consider the following NFA <i>N</i> over Σ = {0, 1}:</p>' +
      tbl(['', '0', '1'], [['q₀', '{q₀}', '{q₀, q₁}'], ['q₁', EMPTY, '{q₂}'], ['q₂', '{q₂}', '{q₂}']]) +
      '<p>The start state is q₀, and q₂ is the only accepting state.</p>',
    'pg-t2': '<p>Grammar: E → E + T | T,&nbsp; T → T × F | F,&nbsp; F → a. Consider this parse tree:</p>' +
      trees(ptree(['E', ['E', ['T', ['F', 'a']]], '+', ['T', ['T', ['F', 'a']], '×', ['F', 'a']]], 'Parse tree for a + a × a in the E, T, F grammar'))
  };

  var P = [
    /* ===================== The class practice test (Oct 6) ===================== */
    { id: 'pt-1', pt: 1, t: 1, s: 'Sets', q: 'Let A = {1, 2, 3, 4}, B = {3, 4, 5}. Which of the following is equal to A − B?',
      c: ['{1, 2, 5}', '{3, 4}', '{5}', '{1, 2}', '∅'], a: 3,
      x: 'A − B keeps the elements of A that are not in B: 1 and 2. {1, 2, 5} is the symmetric difference and {3, 4} is A ∩ B.' },
    { id: 'pt-2', pt: 2, t: 1, s: 'Power sets', q: 'Let S = {a, b, c}. Which of the following statements is true?',
      c: ['a ∈ 2<sup>S</sup>', '{a, b} ∈ 2<sup>S</sup>', '{a, b, {c}} ∈ 2<sup>S</sup>', '2<sup>S</sup> ⊆ S', 'ε ∈ 2<sup>S</sup>'], a: 1,
      x: 'The elements of 2<sup>S</sup> are the subsets of S. {a, b} ⊆ S, so {a, b} ∈ 2<sup>S</sup>. The symbol a is an element of S, not a subset ({a} would be). {c} is not an element of S, so {a, b, {c}} is not a subset of S. The elements of 2<sup>S</sup> are sets, so 2<sup>S</sup> ⊄ S. ε is a string, not a set; ∅ is in 2<sup>S</sup>, but ε is not.' },
    { id: 'pt-3', pt: 3, t: 1, s: 'Relations', q: 'Let A = {1, 2, 3} and let R = {(1,1), (2,2), (3,3), (1,2), (2,1)}. Which of the following best describes R?',
      c: RO, a: 3,
      x: 'Reflexive: (1,1), (2,2), (3,3) are all present. Symmetric: (1,2) and (2,1) are both present. Transitive: the only chains are (1,2),(2,1) → (1,1) and (2,1),(1,2) → (2,2), both present. So R is an equivalence relation, with classes {1, 2} and {3}.' },
    { id: 'pt-4', pt: 4, g: 'pt-nfa', t: 3, s: 'Subset construction', q: 'When applying the subset construction, suppose the DFA is currently in the state {q₀, q₁}. What DFA state is reached on input 1?',
      c: ['{q₀}', '{q₁, q₂}', '{q₀, q₂}', '{q₀, q₁, q₂}', '∅'], a: 2,
      x: 'Take the union of each member’s move on 1: δ(q₀, 1) = {q₀} and δ(q₁, 1) = {q₂}, giving {q₀, q₂}. There are no ε-arrows, so no closure step is needed.' },
    { id: 'pt-5', pt: 5, g: 'pt-nfa', t: 3, s: 'Subset construction', q: 'Which of the following DFA states is an accepting state after subset construction?',
      c: ['{q₀}', '{q₀, q₁}', '{q₁}', '{q₀, q₂}', 'Only {q₂}'], a: 3,
      x: 'A DFA state accepts if it contains at least one NFA accepting state. {q₀, q₂} contains q₂. “Only {q₂}” is wrong: every subset containing q₂ accepts, not just {q₂}.' },
    { id: 'pt-6', pt: 6, g: 'pt-nfa', t: 3, s: 'Subset + minimization', q: 'When minimized, how many states does the DFA have?',
      c: N5, a: 3,
      x: 'The subset construction reaches four states: {q₀}, {q₀,q₁}, {q₀,q₂} and {q₀,q₁,q₂}; the last two accept. Initial partition: {{q₀}, {q₀,q₁}} and {{q₀,q₂}, {q₀,q₁,q₂}}. On input 1, {q₀} → {q₀} (non-accepting) but {q₀,q₁} → {q₀,q₂} (accepting): split. On input 1, {q₀,q₂} → {q₀} but {q₀,q₁,q₂} → {q₀,q₂}: split. All four stay separate, so the minimal DFA has 4 states. (Language: the last 1 in the string is immediately preceded by a 0.)' },
    { id: 'pt-7', pt: 7, g: 'pt-dfa', t: 2, s: 'Minimization', q: 'What is the correct initial partition used in DFA minimization?',
      c: ['{{q₀, q₁, q₂, q₃}}', '{{q₀, q₁}, {q₂, q₃}}', '{{q₀, q₂}, {q₁, q₃}}', '{{q₀}, {q₁}, {q₂, q₃}}', '{{q₀, q₁, q₂}, {q₃}}'], a: 1,
      x: 'Partition refinement always starts with two groups: the non-accepting states Q − F = {q₀, q₁} and the accepting states F = {q₂, q₃}.' },
    { id: 'pt-8', pt: 8, g: 'pt-dfa', t: 2, s: 'Minimization', q: 'Using the DFA in the previous question, which statement is correct after completing the minimization procedure?',
      c: ['q₀ and q₁ are equivalent and may be merged.', 'q₂ and q₃ are equivalent and may be merged.', 'All four states are equivalent.', 'q₀ and q₂ are equivalent and may be merged.', 'Both (a) and (b) are true.'], a: 4,
      x: 'Signatures: q₀ and q₁ both go to a non-accepting state on 0 and an accepting state on 1; q₂ and q₃ both go to an accepting state on 0 and a non-accepting state on 1. Nothing splits, so {q₀, q₁} and {q₂, q₃} are final: 2 states. The DFA accepts strings with an odd number of 1s. q₀ and q₂ can never merge, because one accepts and the other does not.' },
    { id: 'pt-9', pt: 9, t: 4, s: 'Ambiguity', q: 'Consider the following parse trees for the string “a + a × a”.' +
        trees(ptree(['EXPR', ['EXPR', ['EXPR', 'a'], '+', ['EXPR', 'a']], '×', ['EXPR', 'a']], 'Parse tree grouping (a + a) × a'),
              ptree(['EXPR', ['EXPR', 'a'], '+', ['EXPR', ['EXPR', 'a'], '×', ['EXPR', 'a']]], 'Parse tree grouping a + (a × a)')) +
        'We can conclude from these parse trees that the corresponding grammar',
      c: ['is unambiguous because both trees generate the same string.', 'is ambiguous because the same string has two distinct parse trees.', 'is ambiguous only if the two parse trees produce different strings.', 'is unambiguous because “×” always has higher precedence than “+”.', 'None of these'], a: 1,
      x: 'A grammar is ambiguous when some string has two different parse trees (equivalently, two different leftmost derivations). That both trees yield the same string is exactly the point. The grammar does not enforce precedence, which is why the second tree exists.' },

    /* ===================== Topic 1, practice-test style ===================== */
    { id: 'p1-01', t: 1, s: 'Sets', q: 'Let A = {2, 4, 6, 8}, B = {1, 2, 3, 4}. Which of the following is equal to A ∩ B?',
      c: ['{2, 4}', '{1, 2, 3, 4, 6, 8}', '{6, 8}', '{1, 3}', '∅'], a: 0, x: 'A ∩ B is the set of elements in both: 2 and 4. Option (b) is A ∪ B, (c) is A − B, (d) is B − A.' },
    { id: 'p1-02', t: 1, s: 'Sets', q: 'Let A = {1, 2, 3, 4}, B = {3, 4, 5}. Which of the following is equal to (A − B) ∪ (B − A)?',
      c: ['{3, 4}', '{1, 2}', '{1, 2, 5}', '{1, 2, 3, 4, 5}', '∅'], a: 2, x: 'A − B = {1, 2} and B − A = {5}; their union is {1, 2, 5}, the elements in exactly one of the sets.' },
    { id: 'p1-03', t: 1, s: 'Sets', q: 'Let A = {1, 2, 3}, B = {4, 5}. Which of the following is equal to B − A?',
      c: ['{1, 2, 3}', '{4, 5}', '{1, 2, 3, 4, 5}', '∅', '{5}'], a: 1, x: 'A and B share no elements, so removing A’s elements from B removes nothing: B − A = B = {4, 5}.' },
    { id: 'p1-04', t: 1, s: 'Power sets', q: 'Let S = {a, b}. Which of the following is equal to 2<sup>S</sup>?',
      c: ['{a, b}', '{∅, {a}, {b}}', '{∅, {a}, {b}, {a, b}}', '{{a}, {b}, {a, b}}', '{ε, a, b, ab}'], a: 2, x: '2<sup>S</sup> contains every subset of S, including ∅ and S itself: 2² = 4 elements. (e) lists strings, not sets.' },
    { id: 'p1-05', t: 1, s: 'Power sets', q: 'Let S = {a, b, c}. Which of the following statements is FALSE?',
      c: ['∅ ∈ 2<sup>S</sup>', 'S ∈ 2<sup>S</sup>', '{c} ∈ 2<sup>S</sup>', '{a} ⊆ 2<sup>S</sup>', '{{a}} ⊆ 2<sup>S</sup>'], a: 3,
      x: '{a} ⊆ 2<sup>S</sup> would need a ∈ 2<sup>S</sup>, but a is a symbol, not a subset of S. In contrast, {{a}} ⊆ 2<sup>S</sup> is true because its only element, {a}, is in 2<sup>S</sup>. ∅ and S are always subsets of S.' },
    { id: 'p1-06', t: 1, s: 'Power sets', q: 'Let S = {1, 2}. Which of the following statements is true?',
      c: ['1 ∈ 2<sup>S</sup>', '{1} ⊆ 2<sup>S</sup>', '{{1}, {2}} ⊆ 2<sup>S</sup>', '2<sup>S</sup> has 3 elements', '∅ ∉ 2<sup>S</sup>'], a: 2,
      x: '2<sup>S</sup> = {∅, {1}, {2}, {1, 2}}. Both {1} and {2} are elements of it, so {{1}, {2}} ⊆ 2<sup>S</sup>. 1 is not a set of S’s elements, so (a) and (b) fail; 2<sup>S</sup> has 4 elements; ∅ ∈ 2<sup>S</sup>.' },
    { id: 'p1-07', t: 1, s: 'Power sets', q: 'How many elements does 2<sup>2<sup>∅</sup></sup> have?',
      c: ['0', '1', '2', '4', 'None of the above'], a: 2, x: '2<sup>∅</sup> = {∅}, a set with one element. Its power set is {∅, {∅}}, which has 2¹ = 2 elements.' },
    { id: 'p1-08', t: 1, s: 'Relations', q: 'Let A = {1, 2, 3} and let R = {(1,1), (2,2), (3,3), (1,2)}. Which of the following best describes R?',
      c: RO, a: 0, x: 'All three (x, x) pairs are present, so R is reflexive. (1,2) is present without (2,1), so R is not symmetric. (It happens to be transitive, but (a) is the only option that fits.)' },
    { id: 'p1-09', t: 1, s: 'Relations', q: 'Let A = {1, 2, 3} and let R = {(1,1), (2,2), (3,3), (1,2), (2,1), (2,3), (3,2)}. Which of the following best describes R?',
      c: RO, a: 1, x: 'Reflexive (all diagonal pairs) and symmetric (every pair has its mirror). Not transitive: (1,2) and (2,3) are present but (1,3) is not.' },
    { id: 'p1-10', t: 1, s: 'Relations', q: 'Let A = {1, 2, 3} and let R = {(1,2), (2,1)}. Which of the following best describes R?',
      c: RO, a: 2, x: '(1,2) and (2,1) mirror each other, so R is symmetric. No (x, x) pairs, so it is not reflexive. (It is also not transitive: (1,2),(2,1) would need (1,1).)' },
    { id: 'p1-11', t: 1, s: 'Relations', q: 'Let A = {1, 2, 3} and let R = {(1,1), (2,2), (1,2), (2,3), (1,3)}. Which of the following best describes R?',
      c: RO, a: 4, x: '(3,3) is missing, so R is not reflexive: (a), (b) and (d) are out. (1,2) has no mirror, so it is not symmetric: (c) is out. R is transitive, but no option says that, so the answer is None of the above.' },
    { id: 'p1-12', t: 1, s: 'Relations', q: 'Let A = {1, 2, 3} and let R = {(1,1), (2,2), (3,3)}. Which of the following best describes R?',
      c: RO, a: 3, x: 'This is the equality relation: reflexive, trivially symmetric and trivially transitive. Each element is in its own class.' },
    { id: 'p1-13', t: 1, s: 'Strings', q: 'Which of the following is NOT a prefix of the string 1011?',
      c: ['ε', '1', '10', '11', '1011'], a: 3, x: 'The prefixes of 1011 are ε, 1, 10, 101 and 1011. 11 is a suffix, not a prefix.' },
    { id: 'p1-14', t: 1, s: 'Strings', q: 'Let Σ = {a, b}. Which of the following is equal to Σ²?',
      c: ['{a, b}', '{aa, ab, ba, bb}', '{aa, bb}', '{ε, a, b}', '{ab, ba}'], a: 1, x: 'Σ² is the set of all strings of length 2 over Σ: 2² = 4 strings.' },
    { id: 'p1-15', t: 1, s: 'Sets', q: 'Let A = {1, 2} and B = {x, y}. Which of the following is equal to A × B?',
      c: ['{(1,x), (1,y), (2,x), (2,y)}', '{(x,1), (y,1), (x,2), (y,2)}', '{1, 2, x, y}', '{(1,x), (2,y)}', '∅'], a: 0, x: 'A × B pairs every element of A (first) with every element of B (second): 2 × 2 = 4 ordered pairs. Option (b) is B × A; (c) is A ∪ B.' },

    /* ===================== Topic 2, practice-test style ===================== */
    { id: 'p2-01', g: 'pg-d1', t: 2, s: 'Minimization', q: 'What is the correct initial partition used in DFA minimization?',
      c: ['{{q₀, q₁, q₂, q₃, q₄}}', '{{q₀, q₁, q₂, q₃}, {q₄}}', '{{q₀}, {q₁, q₂, q₃, q₄}}', '{{q₀, q₂}, {q₁, q₃}, {q₄}}', '{{q₀, q₄}, {q₁, q₂, q₃}}'], a: 1,
      x: 'Start with non-accepting vs accepting: {q₀, q₁, q₂, q₃} and {q₄}. (d) is the final partition, not the initial one.' },
    { id: 'p2-02', g: 'pg-d1', t: 2, s: 'Minimization', q: 'What is the partition after the first refinement round?',
      c: ['{{q₀, q₁, q₂, q₃}, {q₄}}', '{{q₀, q₂}, {q₁, q₃}, {q₄}}', '{{q₀}, {q₁}, {q₂}, {q₃}, {q₄}}', '{{q₀, q₁}, {q₂, q₃}, {q₄}}', '{{q₀, q₃}, {q₁, q₂}, {q₄}}'], a: 1,
      x: 'Signatures (group reached on 0, on 1), with N = non-accepting and F = {q₄}: q₀ → (N, N), q₁ → (N, F), q₂ → (N, N), q₃ → (N, F). So {q₀, q₂} and {q₁, q₃} split apart.' },
    { id: 'p2-03', g: 'pg-d1', t: 2, s: 'Minimization', q: 'Which statement is correct after completing the minimization procedure?',
      c: ['q₀ and q₂ are equivalent and may be merged.', 'q₁ and q₃ are equivalent and may be merged.', 'q₃ and q₄ are equivalent and may be merged.', 'Both (a) and (b) are true.', 'No two states are equivalent.'], a: 3,
      x: 'In the next round q₀ and q₂ both go to {q₁, q₃} on 0 and {q₀, q₂} on 1; q₁ and q₃ both go to {q₁, q₃} on 0 and {q₄} on 1. Nothing splits, so both pairs merge. q₄ accepts and q₃ does not.' },
    { id: 'p2-04', g: 'pg-d1', t: 2, s: 'Minimization', q: 'When minimized, how many states does the DFA have?',
      c: N5, a: 2, x: 'The final partition is {q₀, q₂}, {q₁, q₃}, {q₄}: three states.' },
    { id: 'p2-05', g: 'pg-d1', t: 2, s: 'Reading DFAs', q: 'Which language does this DFA recognize?',
      c: ['Strings ending in 01', 'Strings containing 01', 'Strings starting with 01', 'Strings ending in 1', 'None of the above'], a: 0,
      x: 'q₁ and q₃ mean “last symbol was 0”; q₄ is reached only by reading 1 from one of them, and any further symbol leaves q₄. So the DFA accepts exactly the strings ending in 01.' },
    { id: 'p2-06', g: 'pg-d2', t: 2, s: 'Minimization', q: 'What is the correct initial partition used in DFA minimization?',
      c: ['{{q₀, q₁, q₂, q₃}}', '{{q₀}, {q₁, q₂, q₃}}', '{{q₀, q₁}, {q₂, q₃}}', '{{q₀, q₂}, {q₁, q₃}}', '{{q₀}, {q₁}, {q₂}, {q₃}}'], a: 1,
      x: 'F = {q₀}, so the two starting groups are {q₀} and {q₁, q₂, q₃}.' },
    { id: 'p2-07', g: 'pg-d2', t: 2, s: 'Minimization', q: 'What is the partition after the first refinement round?',
      c: ['{{q₀}, {q₁, q₂, q₃}}', '{{q₀}, {q₁, q₂}, {q₃}}', '{{q₀}, {q₁}, {q₂, q₃}}', '{{q₀}, {q₁, q₃}, {q₂}}', '{{q₀}, {q₁}, {q₂}, {q₃}}'], a: 1,
      x: 'On 1, q₃ goes to q₀ (accepting) while q₁ → q₂ and q₂ → q₃ stay non-accepting. On 0 every state loops. So q₃ splits off: {q₀}, {q₁, q₂}, {q₃}.' },
    { id: 'p2-08', g: 'pg-d2', t: 2, s: 'Minimization', q: 'Which statement is correct after completing the minimization procedure?',
      c: ['q₁ and q₂ are equivalent and may be merged.', 'q₁ and q₃ are equivalent and may be merged.', 'q₂ and q₃ are equivalent and may be merged.', 'q₁, q₂ and q₃ are all equivalent.', 'No two states are equivalent.'], a: 4,
      x: 'In round 2, q₂ → q₃ on 1 (now its own group) but q₁ → q₂: they split. All four states are distinct; the DFA counts 1s mod 4 and accepts when the count is divisible by 4.' },
    { id: 'p2-09', g: 'pg-d3', t: 2, s: 'Minimization', q: 'When minimized, how many states does the DFA have?',
      c: N5, a: 1, x: 'Initial partition {q₀, q₂} and {q₁, q₃}. Every state stays in its group on 0 and switches group on 1, so nothing splits: 2 states. (Same table as before, different F, completely different answer.)' },
    { id: 'p2-10', g: 'pg-d3', t: 2, s: 'Reading DFAs', q: 'Which language does this DFA recognize?',
      c: ['Strings with an even number of 1s', 'Strings with an odd number of 1s', 'Strings whose number of 1s is divisible by 4', 'Strings with an even number of 0s', 'Strings of even length'], a: 0,
      x: 'The states count 1s mod 4 and 0s never change state. Accepting at counts 0 and 2 (mod 4) means accepting exactly when the number of 1s is even.' },
    { id: 'p2-11', g: 'pg-d4', t: 2, s: 'Minimization', q: 'The first step of minimizing this DFA removes which state(s)?',
      c: ['q₀', 'q₁', 'q₂', 'q₁ and q₂', 'No state is removed'], a: 2, x: 'Step 1 removes states unreachable from the start. From q₀ you can reach q₀ and q₁ only; nothing leads into q₂.' },
    { id: 'p2-12', g: 'pg-d4', t: 2, s: 'Minimization', q: 'When minimized, how many states does the DFA have?',
      c: N5, a: 1, x: 'After removing q₂, q₀ (non-accepting) and q₁ (accepting) are distinguishable: 2 states. The DFA accepts strings ending in 0.' },
    { id: 'p2-13', t: 2, s: 'Minimization', q: 'In the partition-refinement method, two states in the same group are split apart when',
      c: ['one of them has more outgoing transitions.', 'for some symbol, their transitions lead to different groups.', 'they are both accepting states.', 'one of them has a self-loop.', 'None of the above'], a: 1,
      x: 'States stay together only while every symbol sends them into the same group. Self-loops and accept status within a group do not by themselves split anything.' },
    { id: 'p2-14', t: 2, s: 'Minimization', q: 'Which statement about the minimum-state DFA of a regular language is true?',
      c: ['It is unique up to renaming the states.', 'It is never unique.', 'It always has exactly 2 states.', 'It is produced directly by the subset construction.', 'None of the above'], a: 0,
      x: 'Every regular language has a unique minimal DFA up to isomorphism. The subset construction does not minimize (see the practice test, where minimization is a separate step).' },

    /* ===================== Topic 3, practice-test style ===================== */
    { id: 'p3-01', g: 'pg-n1', t: 3, s: 'Subset construction', q: 'When applying the subset construction, suppose the DFA is currently in the state {q₀, q₁}. What DFA state is reached on input 0?',
      c: ['{q₀, q₂}', '{q₀}', '{q₂}', '{q₀, q₁, q₂}', '∅'], a: 0, x: 'δ(q₀, 0) = {q₀} and δ(q₁, 0) = {q₂}; the union is {q₀, q₂}.' },
    { id: 'p3-02', g: 'pg-n1', t: 3, s: 'Subset construction', q: 'From the DFA state {q₀, q₁}, what DFA state is reached on input 1?',
      c: ['{q₀, q₁}', '{q₁, q₂}', '{q₀, q₂}', '{q₀, q₁, q₂}', '∅'], a: 3, x: 'δ(q₀, 1) = {q₀, q₁} and δ(q₁, 1) = {q₂}; the union is {q₀, q₁, q₂}.' },
    { id: 'p3-03', g: 'pg-n1', t: 3, s: 'Subset construction', q: 'How many DFA states does the subset construction reach from the start state?',
      c: ['2', '3', '4', '6', '8'], a: 2, x: 'Reachable: {q₀}, {q₀,q₁}, {q₀,q₂}, {q₀,q₁,q₂}. q₀ is in every one (it loops on everything), so subsets without q₀ never appear. 4 of the 2³ = 8 possible subsets.' },
    { id: 'p3-04', g: 'pg-n1', t: 3, s: 'Reading NFAs', q: 'Which language does N recognize?',
      c: ['Strings whose second-to-last symbol is 1', 'Strings ending in 1', 'Strings containing 11', 'Strings with at least two 1s', 'None of the above'], a: 0,
      x: 'N loops in q₀, guesses a 1 to jump to q₁, then must read exactly one more symbol to reach q₂, where it dies on further input. So the guessed 1 is second from the end.' },
    { id: 'p3-05', g: 'pg-n2', t: 3, s: 'ε-closure', q: 'What is the start state of the DFA produced by the subset construction?',
      c: ['{q₀}', '{q₀, q₁}', '{q₀, q₁, q₂}', '{q₁}', '∅'], a: 1, x: 'The start state is E({q₀}), the ε-closure: q₀ plus everything reachable by ε-arrows, which adds q₁.' },
    { id: 'p3-06', g: 'pg-n2', t: 3, s: 'Subset construction', q: 'From the DFA state {q₀, q₁}, what DFA state is reached on input b?',
      c: ['{q₁}', '{q₂}', '{q₁, q₂}', '{q₀, q₁, q₂}', '∅'], a: 2, x: 'δ(q₀, b) = ∅ and δ(q₁, b) = {q₁, q₂}. Taking the ε-closure adds nothing (no ε-arrows leave q₁ or q₂): {q₁, q₂}.' },
    { id: 'p3-07', g: 'pg-n2', t: 3, s: 'Subset construction', q: 'From the DFA state {q₂}, input b leads to ∅. Which statement about ∅ is correct?',
      c: ['∅ is not a valid DFA state.', '∅ is an accepting state.', '∅ is a dead state that loops to itself on every symbol.', 'Reaching ∅ means the input is accepted.', 'None of the above'], a: 2,
      x: '∅ is a legitimate subset, so it is a DFA state. It contains no accepting state and every move from it is ∅ again: a dead (trap) state.' },
    { id: 'p3-08', g: 'pg-n2', t: 3, s: 'Subset construction', q: 'Which DFA states are accepting after the subset construction?',
      c: ['{q₁, q₂} and {q₂}', 'Only {q₂}', '{q₀, q₁} and {q₁, q₂}', 'Every reachable state', 'None of the above'], a: 0,
      x: 'The reachable states are {q₀,q₁}, {q₁,q₂}, {q₂} and ∅. Those containing q₂ accept: {q₁,q₂} and {q₂}.' },
    { id: 'p3-09', g: 'pg-n3', t: 3, s: 'Subset construction', q: 'How many DFA states does the subset construction reach from the start state?',
      c: ['2', '3', '4', '5', '8'], a: 2, x: 'Reachable: {q₀}, {q₀,q₁}, {q₀,q₁,q₂}, {q₀,q₂}. Four states.' },
    { id: 'p3-10', g: 'pg-n3', t: 3, s: 'Subset + minimization', q: 'When minimized, how many states does the DFA have?',
      c: N5, a: 2,
      x: '{q₀,q₁,q₂} and {q₀,q₂} both accept, and every move from either stays in one of them, so they merge. {q₀} and {q₀,q₁} split (on 1, one goes to a non-accepting state, the other to an accepting one). 3 states. N accepts strings containing 11. Compare practice-test question 6, where nothing merged.' },
    { id: 'p3-11', g: 'pg-n3', t: 3, s: 'Subset + minimization', q: 'Which pair of DFA states (from the subset construction) is equivalent?',
      c: ['{q₀} and {q₀, q₁}', '{q₀, q₂} and {q₀, q₁, q₂}', '{q₀} and {q₀, q₂}', '{q₀, q₁} and {q₀, q₁, q₂}', 'None of the above'], a: 1,
      x: 'Once q₂ is in the set it stays forever (q₂ loops on 0 and 1), so both of these accept every continuation. (c) and (d) mix accepting and non-accepting states.' },
    { id: 'p3-12', t: 3, s: 'Subset construction', q: 'An NFA has 5 states. The DFA produced by the subset construction has at most how many states?',
      c: ['5', '10', '25', '32', '120'], a: 3, x: 'DFA states are subsets of the NFA’s states: at most 2⁵ = 32.' },
    { id: 'p3-13', t: 3, s: 'NFAs', q: 'Which feature is allowed in an NFA but NOT in a DFA?',
      c: ['More than one accepting state', 'ε-transitions', 'Self-loops', 'A start state that is also accepting', 'None of the above'], a: 1, x: 'DFAs may have several accepting states, self-loops and an accepting start state. Only NFAs may move on ε (or have zero or several moves on a symbol).' },
    { id: 'p3-14', t: 3, s: 'Reading regexes', q: 'Over Σ = {0, 1}, which language does the regular expression Σ*001Σ* describe?',
      c: ['{w | w contains the string 001 as a substring}', '{w | w has at least one 1}', '{w | w has exactly a single 1}', '{w | 3 divides |w|}', 'None of the above'], a: 0,
      x: 'Anything, then 001, then anything. This is Example 1.27 from the lecture: 0*10* is “exactly a single 1”, Σ*1Σ* is “at least one 1”, and (ΣΣΣ)* is “3 divides |w|”.' },
    { id: 'p3-15', t: 3, s: 'Writing regexes', q: 'Which regular expression describes all strings of even length over Σ = {0, 1}?',
      c: ['(ΣΣ)*', 'Σ*Σ*', '(0 ∪ 1)*0', '(00 ∪ 11)*', 'None of the above'], a: 0, x: '(ΣΣ)* adds two symbols at a time. Σ*Σ* = Σ*; (00 ∪ 11)* misses even-length strings such as 01.' },
    { id: 'p3-16', t: 3, s: 'Reading regexes', q: 'Which string is in the language of a*b(a ∪ b)*?',
      c: ['ε', 'aaa', 'aaba', 'a', 'None of the above'], a: 2, x: 'The expression requires at least one b: aa · b · a. The other strings contain no b.' },
    { id: 'p3-17', t: 3, s: 'Regex identities', q: 'Which of the following describes the same language as ∅*?',
      c: ['∅', 'Σ*', '(∅ ∪ ε)∅', '∅∅', 'None of the above'], a: 4, x: 'Star always contains the empty string, so ∅* = {ε}. (a), (c) and (d) all describe ∅ (concatenating with ∅ gives ∅), and Σ* is every string. So none of them matches; ε would have.' },
    { id: 'p3-18', t: 3, s: 'Regex identities', q: 'Which regular expression does NOT describe the same language as (0 ∪ 1)*?',
      c: ['(0*1*)*', '(1*0*)*', 'Σ*', '0*1*', '(0 ∪ 1)*(0 ∪ 1 ∪ ε)'], a: 3, x: '0*1* only allows all 0s before all 1s, so 10 is missing. Starring (0*1*) lets the blocks repeat, which gives every string.' },

    /* ===================== Topic 4, practice-test style ===================== */
    { id: 'p4-01', t: 4, s: 'Ambiguity', q: 'Grammar: E → E + E | a. Consider the following parse trees for the string “a + a + a”.' +
        trees(ptree(['E', ['E', ['E', 'a'], '+', ['E', 'a']], '+', ['E', 'a']], 'Parse tree grouping (a + a) + a'),
              ptree(['E', ['E', 'a'], '+', ['E', ['E', 'a'], '+', ['E', 'a']]], 'Parse tree grouping a + (a + a)')) +
        'We can conclude that the grammar',
      c: ['is unambiguous because both trees have the same yield.', 'is ambiguous because the same string has two distinct parse trees.', 'is ambiguous only because + is not commutative.', 'is unambiguous because it has only one variable.', 'None of these'], a: 1,
      x: 'Two distinct parse trees for one string is the definition of ambiguity. It does not matter that + happens to be associative; the grammar still allows two groupings.' },
    { id: 'p4-02', g: 'pg-t2', t: 4, s: 'Parse trees', q: 'What is the yield of this parse tree?',
      c: ['a + a × a', 'a × a + a', 'E + T', 'a + a', 'None of the above'], a: 0, x: 'The yield is the leaves read left to right: a, +, a, ×, a.' },
    { id: 'p4-03', g: 'pg-t2', t: 4, s: 'Parse trees', q: 'Which rule is applied at the root of this parse tree?',
      c: ['E → E + T', 'E → T', 'T → T × F', 'F → a', 'None of the above'], a: 0, x: 'The root E has children E, +, T, so the rule used is E → E + T.' },
    { id: 'p4-04', g: 'pg-t2', t: 4, s: 'Parse trees', q: 'In this tree, × sits deeper than +. What grouping does the tree represent?',
      c: ['a + (a × a)', '(a + a) × a', 'Both groupings at once', 'Neither, since the string is not in the language', 'None of the above'], a: 0,
      x: 'The deeper operator is grouped first. In the E, T, F grammar × is always generated below +, which is why this grammar is unambiguous and gives × higher precedence.' },
    { id: 'p4-05', g: 'pg-t2', t: 4, s: 'Parse trees', q: 'How many nodes in this parse tree are labelled F?',
      c: N5, a: 2, x: 'Every a is produced by F → a, and there are three a’s, so there are 3 F nodes.' },
    { id: 'p4-06', t: 4, s: 'Derivations', q: 'Grammar: E → E + E | E × E | a. Which of the following is a leftmost derivation of a + a × a?',
      c: ['E ⇒ E + E ⇒ a + E ⇒ a + E × E ⇒ a + a × E ⇒ a + a × a', 'E ⇒ E + E ⇒ E + E × E ⇒ E + E × a ⇒ E + a × a ⇒ a + a × a', 'E ⇒ E × E ⇒ E × a ⇒ E + E × a ⇒ a + E × a ⇒ a + a × a', 'E ⇒ a + a × a', 'None of the above'], a: 0,
      x: 'A leftmost derivation always replaces the leftmost variable. (b) is a rightmost derivation; (c) switches between ends; (d) uses no rule of the grammar.' },
    { id: 'p4-07', t: 4, s: 'Ambiguity', q: 'A context-free grammar is ambiguous if',
      c: ['some string has two different derivations.', 'some string has two different leftmost derivations.', 'it has more than one variable.', 'it generates infinitely many strings.', 'None of the above'], a: 1,
      x: 'Two different derivations may still give the same parse tree (just in a different order). Two leftmost derivations, or two parse trees, mean ambiguity.' },
    { id: 'p4-08', t: 4, s: 'CFG languages', q: 'Which string is generated by the grammar S → aSb | ab?',
      c: ['ε', 'aab', 'aabb', 'abab', 'None of the above'], a: 2, x: 'S ⇒ aSb ⇒ aabb. The grammar generates aⁿbⁿ for n ≥ 1, so ε, aab and abab are not generated.' },
    { id: 'p4-09', t: 4, s: 'CFG languages', q: 'Which string is NOT generated by the grammar S → SS | (S) | ε?',
      c: ['ε', '()()', '(())', '(()())', 'None of the above'], a: 4, x: 'The grammar generates exactly the balanced strings of parentheses, and all four options are balanced: ε by S → ε, ()() by S → SS, (()) and (()()) by S → (S). So none of them is the answer. A string like ())( would not be generated.' },
    { id: 'p4-15', t: 4, s: 'CFG languages', q: 'Which string is NOT generated by the grammar S → SS | (S) | ε?',
      c: ['ε', '()()', '(())', '())(', 'None of the above'], a: 3, x: 'The grammar generates balanced parentheses. ())( closes a parenthesis that was never opened.' },
    { id: 'p4-10', t: 4, s: 'CFG definition', q: 'For the grammar G = (V, T, P, S) with rules E → E + E | (E) | a and start symbol E, what is V?',
      c: ['{E}', '{E, a}', '{+, (, ), a}', '{E, +, (, ), a}', 'None of the above'], a: 0, x: 'V is the set of variables (non-terminals): only E appears on a left-hand side. {+, (, ), a} is T.' },
    { id: 'p4-11', t: 4, s: 'Pumping lemma', q: 'To show L = {0ⁿ1ⁿ | n ≥ 0} is not regular with the pumping lemma (pumping length p), which string s is the standard choice?',
      c: ['0ᵖ1ᵖ', '0ᵖ', '(01)ᵖ', '01', 'None of the above'], a: 0,
      x: 's must be in L and have length at least p. 0ᵖ and (01)ᵖ are not in L, and 01 may be shorter than p. With 0ᵖ1ᵖ, |xy| ≤ p forces y to be all 0s.' },
    { id: 'p4-12', t: 4, s: 'Pumping lemma', q: 'If A is regular with pumping length p, every s ∈ A with |s| ≥ p can be written s = xyz where',
      c: ['|y| > 0, |xy| ≤ p, and xyⁱz ∈ A for all i ≥ 0', '|y| > 0, |xy| > p, and xyⁱz ∈ A for all i > 0', '|y| ≥ 0, |xy| ≤ p, and xyⁱz ∈ A for all i ≥ 0', '|x| > 0, |z| > 0, and xyz ∈ A', 'None of the above'], a: 0,
      x: 'y must be nonempty, xy lies in the first p symbols, and pumping works for every i including 0. Option (b) repeats the typos on one class slide.' },
    { id: 'p4-13', t: 4, s: 'Nonregular languages', q: 'Which of the following languages over {0, 1} is regular?',
      c: ['{0ⁿ1ⁿ | n ≥ 0}', '{ww | w ∈ {0,1}*}', '{w | w has equal numbers of 01 and 10 substrings}', 'Palindromes', 'None of the above'], a: 2,
      x: 'From the lecture: the 01/10 language looks like counting but is regular (the counts are equal exactly when w is empty or starts and ends with the same symbol). The others need unbounded memory.' },
    { id: 'p4-14', t: 4, s: 'Pumping lemma', q: 'The pumping lemma for regular languages can be used to prove that a language',
      c: ['is regular.', 'is not regular.', 'is context-free.', 'is finite.', 'None of the above'], a: 1,
      x: 'Every regular language satisfies the lemma, so a language that fails it is not regular. Satisfying it proves nothing.' }
  ];

  P.forEach(function (q) { q.fmt = 'prof'; q.keep = true; if (q.pt) q.src = 'practice'; });
  window.QB = window.QB.concat(P);
  window.PRACTICE_TEST = P.filter(function (q) { return q.pt; }).map(function (q) { return q.id; });
})();
