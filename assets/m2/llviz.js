/* Step-through animations for LL(1) predictive parsing (Midterm 2 guide).
   LLViz.parser(el) : stack / input / table / parse tree, step by step, on preset or typed input.
   LLViz.builder(el): fills the parsing table one production at a time from FIRST and FOLLOW. */
(function () {
  var EPS = 'ε', END = '$';
  var GRAMMAR = [
    ['E', ['T', "E'"]], ["E'", ['+', 'T', "E'"]], ["E'", []],
    ['T', ['F', "T'"]], ["T'", ['*', 'F', "T'"]], ["T'", []],
    ['F', ['(', 'E', ')']], ['F', ['id']]
  ];
  var START = 'E', NTS = ['E', "E'", 'T', "T'", 'F'], TERMS = ['id', '+', '*', '(', ')', END];
  function isNT(s) { return NTS.indexOf(s) >= 0; }
  function pretty(s) { return s.replace(/'/g, '′'); }
  function rhsText(r) { return r.length ? r.map(pretty).join(' ') : EPS; }
  function prodText(p) { return pretty(p[0]) + ' → ' + rhsText(p[1]); }
  function setText(s) { return '{' + s.map(pretty).join(', ') + '}'; }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  /* ---------- FIRST, FOLLOW, table (computed, so the page cannot disagree with itself) ---------- */
  var FIRST = {}, FOLLOW = {};
  NTS.forEach(function (A) { FIRST[A] = []; FOLLOW[A] = []; });
  function add(set, x) { if (set.indexOf(x) < 0) { set.push(x); return true; } return false; }
  function firstOf(seq) {
    var out = [];
    for (var i = 0; i < seq.length; i++) {
      var s = seq[i];
      if (!isNT(s)) { add(out, s); return out; }
      FIRST[s].forEach(function (x) { if (x !== EPS) add(out, x); });
      if (FIRST[s].indexOf(EPS) < 0) return out;
    }
    add(out, EPS); return out;
  }
  var changed = true;
  while (changed) {
    changed = false;
    GRAMMAR.forEach(function (p) { firstOf(p[1]).forEach(function (x) { if (add(FIRST[p[0]], x)) changed = true; }); });
  }
  add(FOLLOW[START], END); changed = true;
  while (changed) {
    changed = false;
    GRAMMAR.forEach(function (p) {
      p[1].forEach(function (s, i) {
        if (!isNT(s)) return;
        var f = firstOf(p[1].slice(i + 1));
        f.forEach(function (x) { if (x !== EPS && add(FOLLOW[s], x)) changed = true; });
        if (f.indexOf(EPS) >= 0) FOLLOW[p[0]].forEach(function (x) { if (add(FOLLOW[s], x)) changed = true; });
      });
    });
  }
  var TABLE = {};
  GRAMMAR.forEach(function (p, pi) {
    var f = firstOf(p[1]);
    var cells = f.filter(function (x) { return x !== EPS; });
    if (f.indexOf(EPS) >= 0) FOLLOW[p[0]].forEach(function (b) { if (cells.indexOf(b) < 0) cells.push(b); });
    cells.forEach(function (a) { TABLE[p[0] + ' ' + a] = pi; });
  });
  var order = function (set) { return TERMS.concat([EPS]).filter(function (t) { return set.indexOf(t) >= 0; }); };
  NTS.forEach(function (A) { FIRST[A] = order(FIRST[A]); FOLLOW[A] = order(FOLLOW[A]); });

  /* ---------- tokenizer: identifiers and numbers become id, as in the lecture's a+b*c ---------- */
  function tokenize(src) {
    var toks = [], lex = [], i = 0;
    src = src.trim();
    while (i < src.length) {
      var c = src[i];
      if (/\s/.test(c)) { i++; continue; }
      if (src.slice(i, i + 2) === 'id' && !/[A-Za-z0-9_]/.test(src[i + 2] || '')) { toks.push('id'); lex.push('id'); i += 2; continue; }
      if (/[A-Za-z0-9_]/.test(c)) { var j = i; while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++; toks.push('id'); lex.push(src.slice(i, j)); i = j; continue; }
      if ('+*()'.indexOf(c) >= 0) { toks.push(c); lex.push(c); i++; continue; }
      return { error: 'The character “' + c + '” is not a token. Use names (or id), +, *, ( and ).' };
    }
    if (!toks.length) return { error: 'Type an expression first, for example a + b * c.' };
    toks.push(END); lex.push(END);
    return { toks: toks, lex: lex };
  }

  /* ---------- run the predictive parser, recording every step ---------- */
  function run(toks) {
    var nodes = [], steps = [], out = [];
    function node(sym, parent) { var n = { id: nodes.length, sym: sym, parent: parent, kids: null }; nodes.push(n); return n; }
    var root = node(START, null);
    var stack = [root, { sym: END, id: -1 }], pos = 0, guard = 0;
    function snap(extra) {
      var s = { stack: stack.map(function (n) { return n.sym; }), pos: pos, shown: nodes.length, out: out.slice() };
      for (var k in extra) s[k] = extra[k];
      steps.push(s);
    }
    while (guard++ < 500) {
      var top = stack[0], a = toks[pos];
      if (top.sym === END && a === END) { snap({ kind: 'accept' }); break; }
      if (isNT(top.sym)) {
        var pi = TABLE[top.sym + ' ' + a];
        if (pi == null) { snap({ kind: 'error', A: top.sym, a: a, focus: top.id }); break; }
        var p = GRAMMAR[pi];
        snap({ kind: 'expand', A: top.sym, a: a, prod: pi, focus: top.id });
        out.push(pi);
        top.kids = p[1].length ? p[1].map(function (s) { return node(s, top); }) : [node(EPS, top)];
        stack = (p[1].length ? top.kids : []).concat(stack.slice(1));
      } else if (top.sym === a) {
        snap({ kind: 'match', a: a, focus: top.id });
        top.matched = true; stack = stack.slice(1); pos++;
      } else {
        snap({ kind: 'mismatch', a: a, t: top.sym, focus: top.id }); break;
      }
    }
    return { steps: steps, nodes: nodes, root: root };
  }

  /* ---------- parse tree layout (final tree, revealed progressively so nothing jumps) ---------- */
  function layout(nodes, root) {
    var W = 46, LH = 50, leaf = 0, maxD = 0;
    (function walk(n, d) {
      n.d = d; maxD = Math.max(maxD, d);
      if (!n.kids) { n.x = leaf++ * W + W / 2; return; }
      n.kids.forEach(function (k) { walk(k, d + 1); });
      n.x = (n.kids[0].x + n.kids[n.kids.length - 1].x) / 2;
    })(root, 0);
    nodes.forEach(function (n) { n.y = n.d * LH + 22; });
    return { w: Math.max(leaf * W, 120), h: maxD * LH + 40 };
  }

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ---------- the parser animation ---------- */
  var PRESETS = [
    ['id + id * id', 'The lecture’s example'],
    ['( id + id ) * id', 'Parentheses'],
    ['a + * b', 'An error (the lecture’s a+*b)'],
    ['id id', 'Another error']
  ];

  function parser(host) {
    host.classList.add('llviz');
    host.innerHTML =
      '<div class="llv-controls">' +
        '<label class="llv-input"><span>Input</span><select class="llv-preset" aria-label="Example input">' +
          PRESETS.map(function (p, i) { return '<option value="' + i + '">' + esc(p[0]) + '  (' + esc(p[1]) + ')</option>'; }).join('') +
          '<option value="own">Type your own…</option></select></label>' +
        '<form class="llv-own" hidden><input type="text" class="llv-text" aria-label="Your expression" placeholder="e.g. (a + b) * c" autocomplete="off" spellcheck="false"><button class="btn small" type="submit">Parse</button></form>' +
      '</div>' +
      '<div class="llv-bar">' +
        '<button class="btn secondary small llv-reset" type="button">Start over</button>' +
        '<button class="btn secondary small llv-back" type="button" aria-label="Previous step">Back</button>' +
        '<button class="btn small llv-play" type="button">Play</button>' +
        '<button class="btn secondary small llv-next" type="button" aria-label="Next step">Step</button>' +
        '<label class="llv-speed"><span>Speed</span><select aria-label="Playback speed"><option value="1800">Slow</option><option value="1100" selected>Normal</option><option value="550">Fast</option></select></label>' +
        '<span class="llv-count" aria-live="off"></span>' +
      '</div>' +
      '<p class="llv-say" aria-live="polite"></p>' +
      '<div class="llv-grid">' +
        '<div class="llv-col"><h4>Stack <span>top first</span></h4><ol class="llv-stack"></ol></div>' +
        '<div class="llv-main">' +
          '<h4>Input <span>the highlighted symbol is the lookahead</span></h4><div class="llv-tape"></div>' +
          '<h4>Sentential form <span>matched input, then the stack</span></h4><p class="llv-form"></p>' +
          '<h4>Parse tree</h4><div class="llv-tree"></div>' +
        '</div>' +
      '</div>' +
      '<h4>Parsing table</h4><div class="table-scroll"><table class="mini ttable lltable llv-table"></table></div>' +
      '<h4>Productions used <span>a leftmost derivation, in order</span></h4><ol class="llv-out"></ol>';

    var q = function (s) { return host.querySelector(s); };
    var data = null, lex = null, step = 0, timer = null;

    // table skeleton
    var th = '<thead><tr><th></th>' + TERMS.map(function (t) { return '<th data-c="' + t + '">' + t + '</th>'; }).join('') + '</tr></thead><tbody>';
    NTS.forEach(function (A) {
      th += '<tr data-r="' + A + '"><th scope="row">' + pretty(A) + '</th>' + TERMS.map(function (t) {
        var pi = TABLE[A + ' ' + t];
        return '<td data-c="' + t + '">' + (pi == null ? '' : prodText(GRAMMAR[pi])) + '</td>';
      }).join('') + '</tr>';
    });
    q('.llv-table').innerHTML = th + '</tbody>';

    function load(src) {
      stop();
      var t = tokenize(src);
      if (t.error) { q('.llv-say').innerHTML = '<b>Can’t parse that.</b> ' + esc(t.error); return; }
      lex = t.lex; data = run(t.toks);
      data.box = layout(data.nodes, data.root);
      step = 0; draw();
    }

    function say(s) {
      var A = s.A && pretty(s.A);
      if (s.kind === 'expand') {
        var p = GRAMMAR[s.prod];
        if (!p[1].length) return 'Top is <b>' + A + '</b>, lookahead is <b>' + s.a + '</b>. M[' + A + ', ' + s.a + '] = <b>' + prodText(p) + '</b>: pop ' + A + ' and push nothing. ' + s.a + ' is in FOLLOW(' + A + '), so ' + A + ' can vanish here.';
        return 'Top is <b>' + A + '</b>, lookahead is <b>' + s.a + '</b>. M[' + A + ', ' + s.a + '] = <b>' + prodText(p) + '</b>: pop ' + A + ' and push ' + rhsText(p[1]) + ', with ' + pretty(p[1][0]) + ' on top.';
      }
      if (s.kind === 'match') return 'Top is the terminal <b>' + s.a + '</b>, and it matches the lookahead: pop it and advance the input.';
      if (s.kind === 'accept') return '<b>Accepted.</b> The stack and the input are both down to $. The productions used, in order, form a leftmost derivation of the input.';
      if (s.kind === 'error') return '<b>Error.</b> Top is <b>' + A + '</b>, lookahead is <b>' + s.a + '</b>, and M[' + A + ', ' + s.a + '] is blank: no string derived from ' + A + ' can start with ' + s.a + '. The input is rejected.';
      if (s.kind === 'mismatch') return '<b>Error.</b> Top is the terminal <b>' + s.t + '</b> but the lookahead is <b>' + s.a + '</b>. They don’t match, so the input is rejected.';
      return '';
    }

    function draw() {
      var s = data.steps[step], n = data.steps.length;
      q('.llv-count').textContent = 'Step ' + (step + 1) + ' of ' + n;
      q('.llv-back').disabled = step === 0;
      q('.llv-next').disabled = step === n - 1;
      q('.llv-say').innerHTML = say(s);
      host.dataset.state = s.kind;

      // stack
      q('.llv-stack').innerHTML = s.stack.map(function (sym, i) {
        var cls = 'llv-cell' + (i === 0 ? ' top' : '') + (sym === END ? ' end' : isNT(sym) ? ' nt' : ' term');
        return '<li class="' + cls + '">' + pretty(sym) + '</li>';
      }).join('');

      // input tape
      q('.llv-tape').innerHTML = lex.map(function (t, i) {
        var cls = 'llv-tok' + (i < s.pos ? ' done' : '') + (i === s.pos ? ' look' : '');
        var tok = t === END ? '$' : (/^[A-Za-z0-9_]+$/.test(t) && t !== 'id' ? 'id<sub>' + esc(t) + '</sub>' : esc(t));
        return '<span class="' + cls + '">' + tok + '</span>';
      }).join('');

      // sentential form = matched input + stack (without $)
      var matched = lex.slice(0, s.pos).map(function (t) { return /^[A-Za-z0-9_]+$/.test(t) ? 'id' : t; });
      var rest = s.stack.filter(function (x) { return x !== END; }).map(pretty);
      q('.llv-form').innerHTML = (matched.length ? '<span class="m">' + matched.join(' ') + '</span> ' : '') + (rest.join(' ') || (s.kind === 'accept' ? '' : EPS));

      // table highlight
      host.querySelectorAll('.llv-table .hl, .llv-table .hl-r, .llv-table .hl-c, .llv-table .bad').forEach(function (e) { e.classList.remove('hl', 'hl-r', 'hl-c', 'bad'); });
      if (s.kind === 'expand' || s.kind === 'error') {
        var row = host.querySelector('.llv-table tr[data-r="' + s.A + '"]');
        if (row) {
          row.classList.add('hl-r');
          var cell = row.querySelector('td[data-c="' + s.a + '"]');
          if (cell) cell.classList.add(s.kind === 'error' ? 'bad' : 'hl');
        }
        host.querySelectorAll('.llv-table [data-c="' + s.a + '"]').forEach(function (e) { e.classList.add('hl-c'); });
      }

      // output
      q('.llv-out').innerHTML = s.out.map(function (pi) { return '<li>' + prodText(GRAMMAR[pi]) + '</li>'; }).join('') +
        (s.kind === 'expand' ? '<li class="next">' + prodText(GRAMMAR[s.prod]) + '</li>' : '');

      // tree
      var b = data.box, svg = '<svg viewBox="0 0 ' + b.w + ' ' + b.h + '" width="' + b.w + '" height="' + b.h + '" role="img" aria-label="Parse tree so far">';
      data.nodes.forEach(function (nd) {
        if (nd.id >= s.shown || !nd.parent) return;
        svg += '<line x1="' + nd.parent.x + '" y1="' + (nd.parent.y + 7) + '" x2="' + nd.x + '" y2="' + (nd.y - 15) + '"/>';
      });
      // matched terminals: those whose match step is before the current one
      var matchedIds = {};
      data.steps.slice(0, step).forEach(function (st) { if (st.kind === 'match') matchedIds[st.focus] = true; });
      data.nodes.forEach(function (nd) {
        if (nd.id >= s.shown) return;
        var expanded = data.steps.slice(0, step).some(function (st) { return st.kind === 'expand' && st.focus === nd.id; });
        var cls = nd.sym === EPS ? 'eps' : isNT(nd.sym) ? (expanded ? 'nt' : 'nt open') : (matchedIds[nd.id] ? 'tm done' : 'tm');
        if (nd.id === s.focus && s.kind !== 'accept') cls += ' focus';
        var label = isNT(nd.sym) ? pretty(nd.sym) : nd.sym;
        svg += '<g class="' + cls + '"><circle cx="' + nd.x + '" cy="' + (nd.y - 4) + '" r="15"/><text x="' + nd.x + '" y="' + (nd.y + 1) + '" text-anchor="middle">' + esc(label) + '</text></g>';
      });
      q('.llv-tree').innerHTML = svg + '</svg>';
    }

    function stop() { clearInterval(timer); timer = null; q('.llv-play').textContent = 'Play'; }
    function play() {
      if (timer) { stop(); return; }
      if (step >= data.steps.length - 1) { step = 0; draw(); }
      q('.llv-play').textContent = 'Pause';
      timer = setInterval(function () {
        if (step >= data.steps.length - 1) { stop(); return; }
        step++; draw();
      }, +q('.llv-speed select').value);
    }
    q('.llv-play').addEventListener('click', play);
    q('.llv-next').addEventListener('click', function () { stop(); if (step < data.steps.length - 1) { step++; draw(); } });
    q('.llv-back').addEventListener('click', function () { stop(); if (step > 0) { step--; draw(); } });
    q('.llv-reset').addEventListener('click', function () { stop(); step = 0; draw(); });
    q('.llv-speed select').addEventListener('change', function () { if (timer) { stop(); play(); } });
    q('.llv-preset').addEventListener('change', function () {
      var v = this.value, own = q('.llv-own');
      if (v === 'own') { own.hidden = false; q('.llv-text').focus(); return; }
      own.hidden = true; load(PRESETS[+v][0]);
    });
    q('.llv-own').addEventListener('submit', function (e) { e.preventDefault(); load(q('.llv-text').value); });
    host.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.key === 'ArrowRight') { e.preventDefault(); q('.llv-next').click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); q('.llv-back').click(); }
    });
    load(PRESETS[0][0]);
  }

  /* ---------- the table builder ---------- */
  function builder(host) {
    host.classList.add('llviz', 'llb');
    var steps = [{ kind: 'start' }];
    GRAMMAR.forEach(function (p, pi) {
      var f = firstOf(p[1]), viaFirst = f.filter(function (x) { return x !== EPS; }), viaFollow = [];
      if (f.indexOf(EPS) >= 0) viaFollow = FOLLOW[p[0]].filter(function (b) { return viaFirst.indexOf(b) < 0; });
      steps.push({ kind: 'prod', pi: pi, first: f, viaFirst: viaFirst, viaFollow: viaFollow });
    });
    steps.push({ kind: 'done' });

    host.innerHTML =
      '<div class="llv-bar">' +
        '<button class="btn secondary small llv-reset" type="button">Start over</button>' +
        '<button class="btn secondary small llv-back" type="button" aria-label="Previous production">Back</button>' +
        '<button class="btn small llv-play" type="button">Play</button>' +
        '<button class="btn secondary small llv-next" type="button" aria-label="Next production">Step</button>' +
        '<span class="llv-count"></span>' +
      '</div>' +
      '<p class="llv-say" aria-live="polite"></p>' +
      '<div class="llb-grid">' +
        '<div><h4>Productions</h4><ol class="llb-prods">' + GRAMMAR.map(function (p) { return '<li>' + prodText(p) + '</li>'; }).join('') + '</ol></div>' +
        '<div><h4>FIRST and FOLLOW</h4><table class="mini ttable llb-sets"><thead><tr><th></th><th>FIRST</th><th>FOLLOW</th></tr></thead><tbody>' +
          NTS.map(function (A) { return '<tr data-r="' + A + '"><th scope="row">' + pretty(A) + '</th><td class="f">' + setText(FIRST[A]) + '</td><td class="fo">' + setText(FOLLOW[A]) + '</td></tr>'; }).join('') +
        '</tbody></table></div>' +
      '</div>' +
      '<h4>Parsing table</h4><div class="table-scroll"><table class="mini ttable lltable llv-table"></table></div>';

    var q = function (s) { return host.querySelector(s); }, step = 0, timer = null;
    function draw() {
      var s = steps[step];
      q('.llv-count').textContent = step === 0 ? 'Start' : step === steps.length - 1 ? 'Done' : 'Production ' + step + ' of ' + GRAMMAR.length;
      q('.llv-back').disabled = step === 0; q('.llv-next').disabled = step === steps.length - 1;
      host.querySelectorAll('.llb-prods li').forEach(function (li, i) { li.className = s.kind === 'prod' && i === s.pi ? 'cur' : (s.kind === 'done' || (s.kind === 'prod' && i < s.pi)) ? 'done' : ''; });
      host.querySelectorAll('.llb-sets .use').forEach(function (e) { e.classList.remove('use'); });
      var filled = {}, now = {};
      steps.slice(1, step + 1).forEach(function (st) {
        if (st.kind !== 'prod') return;
        st.viaFirst.concat(st.viaFollow).forEach(function (a) { filled[GRAMMAR[st.pi][0] + ' ' + a] = st.pi; });
      });
      if (s.kind === 'prod') s.viaFirst.concat(s.viaFollow).forEach(function (a) { now[GRAMMAR[s.pi][0] + ' ' + a] = true; });
      var t = '<thead><tr><th></th>' + TERMS.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr></thead><tbody>';
      NTS.forEach(function (A) {
        t += '<tr><th scope="row">' + pretty(A) + '</th>' + TERMS.map(function (x) {
          var k = A + ' ' + x;
          return '<td class="' + (now[k] ? 'hl' : '') + '">' + (filled[k] != null ? prodText(GRAMMAR[filled[k]]) : '') + '</td>';
        }).join('') + '</tr>';
      });
      q('.llv-table').innerHTML = t + '</tbody>';
      var msg;
      if (s.kind === 'start') msg = 'Each production A → α goes into row A, in the column of every terminal in <b>FIRST(α)</b>. If α can derive ε, it also goes in the column of every terminal in <b>FOLLOW(A)</b>. Press Step to place them one at a time.';
      else if (s.kind === 'done') msg = '<b>Done.</b> No cell got two productions, so the grammar is LL(1). Every blank cell is an error entry.';
      else {
        var p = GRAMMAR[s.pi], A = pretty(p[0]);
        var rowSets = host.querySelector('.llb-sets tr[data-r="' + p[0] + '"]');
        if (!p[1].length) {
          msg = '<b>' + prodText(p) + '</b>: FIRST(ε) = {ε}, so this rule goes under every terminal in FOLLOW(' + A + ') = ' + setText(FOLLOW[p[0]]) + '.';
          if (rowSets) rowSets.querySelector('.fo').classList.add('use');
        } else {
          msg = '<b>' + prodText(p) + '</b>: FIRST(' + rhsText(p[1]) + ') = ' + setText(s.first) + ', so it goes under ' + s.viaFirst.join(', ') + '.';
          if (isNT(p[1][0])) { var r2 = host.querySelector('.llb-sets tr[data-r="' + p[1][0] + '"]'); if (r2) r2.querySelector('.f').classList.add('use'); }
          if (s.viaFollow.length) msg += ' It can vanish, so also under FOLLOW(' + A + ').';
        }
      }
      q('.llv-say').innerHTML = msg;
    }
    function stop() { clearInterval(timer); timer = null; q('.llv-play').textContent = 'Play'; }
    q('.llv-play').addEventListener('click', function () {
      if (timer) { stop(); return; }
      if (step >= steps.length - 1) step = 0;
      q('.llv-play').textContent = 'Pause'; draw();
      timer = setInterval(function () { if (step >= steps.length - 1) { stop(); return; } step++; draw(); }, 1500);
    });
    q('.llv-next').addEventListener('click', function () { stop(); if (step < steps.length - 1) { step++; draw(); } });
    q('.llv-back').addEventListener('click', function () { stop(); if (step > 0) { step--; draw(); } });
    q('.llv-reset').addEventListener('click', function () { stop(); step = 0; draw(); });
    draw();
  }

  window.LLViz = { parser: parser, builder: builder, FIRST: FIRST, FOLLOW: FOLLOW, TABLE: TABLE, GRAMMAR: GRAMMAR, run: run, tokenize: tokenize };
})();
