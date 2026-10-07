/* Practice exam: timer, pace, bubble sheet (A–E), shared setups, class practice test mode */
(function () {
  var N = 29, MIX = { 1: 7, 2: 8, 3: 8, 4: 6 }, VERSION = 2;
  var MODES = {
    practice: { label: 'Class practice test', min: 25 },
    real: { label: 'Real (80 min)', min: 80 },
    tight: { label: 'Tight (65 min)', min: 65 }
  };
  var params = new URLSearchParams(location.search);
  var mode = MODES[params.get('mode')] ? params.get('mode') : 'tight';
  var S = null, timer = null, lastTick = 0;
  var store = App.store;

  document.getElementById('mix-line').textContent = N + ' questions: ' + [1, 2, 3, 4].map(function (t) { return MIX[t] + ' on ' + TOPICS[t].short; }).join(', ') + '.';

  /* ---------- mode picker ---------- */
  var modeEls = document.querySelectorAll('#modes .mode');
  function pickMode(m) { mode = m; modeEls.forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.mode === m ? 'true' : 'false'); }); }
  modeEls.forEach(function (x) {
    x.addEventListener('click', function () { pickMode(x.dataset.mode); });
    x.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === x) { e.preventDefault(); pickMode(x.dataset.mode); } });
  });
  document.getElementById('custom-min').addEventListener('focus', function () { pickMode('custom'); });
  pickMode(mode);

  /* ---------- draw questions ---------- */
  // Per topic: whole shared setups first (up to ~60% of the topic's slots), then single questions,
  // preferring unseen questions and leaning toward the practice-test style.
  function draw() {
    var seen = store.get('seen', {});
    var picked = [];
    [1, 2, 3, 4].forEach(function (t) {
      var m = MIX[t];
      var pool = QB.filter(function (q) { return q.t === t && !q.pt; });
      var groups = {};
      pool.forEach(function (q) { if (q.g) (groups[q.g] = groups[q.g] || []).push(q); });
      var gl = App.shuffle(Object.keys(groups).map(function (k) { return groups[k]; }));
      gl.sort(function (a, b) { return unseenShare(b, seen) - unseenShare(a, seen); });
      var chosenGroups = [], used = 0, cap = Math.ceil(m * 0.6);
      gl.forEach(function (g) { if (used + g.length <= cap) { chosenGroups.push(g); used += g.length; } });
      var singles = pool.filter(function (q) { return !q.g; }).map(function (q) {
        return { q: q, key: (seen[q.id] ? 10 : 0) + Math.random() - (q.fmt === 'prof' ? 0.35 : 0) };
      }).sort(function (a, b) { return a.key - b.key; }).slice(0, m - used).map(function (o) { return o.q; });
      picked = picked.concat(singles);
      chosenGroups.forEach(function (g) { picked = picked.concat(g); });
    });
    return picked.map(App.instance);
  }
  function unseenShare(g, seen) { return g.filter(function (q) { return !seen[q.id]; }).length / g.length + Math.random() * 0.01; }

  function minutesFor(m) {
    if (m === 'custom') { var v = parseInt(document.getElementById('custom-min').value, 10); return Math.min(240, Math.max(5, v || 50)); }
    return MODES[m].min;
  }

  function startExam() {
    var mins = minutesFor(mode);
    var items = mode === 'practice' ? PRACTICE_TEST.map(function (id) { return App.instance(App.byId(id)); }) : draw();
    S = {
      v: VERSION, mode: mode, label: mode === 'custom' ? 'Custom (' + mins + ' min)' : MODES[mode].label,
      limit: mins * 60, startedAt: Date.now(), items: items,
      answers: [], flags: [], times: [], current: 0, warned: {}
    };
    items.forEach(function () { S.answers.push(null); S.flags.push(false); S.times.push(0); });
    save(); enterRun();
  }
  function save() { if (S) store.set('exam-active', S); }
  function count() { return S.items.length; }

  // "Questions 4–6 use this setup"
  function groupLabel(i) {
    var g = App.byId(S.items[i].id).g; if (!g) return null;
    var first = i, last = i;
    while (first > 0 && App.byId(S.items[first - 1].id).g === g) first--;
    while (last < count() - 1 && App.byId(S.items[last + 1].id).g === g) last++;
    return first === last ? 'Setup for question ' + (i + 1) : 'For questions ' + (first + 1) + ' to ' + (last + 1);
  }

  /* ---------- running ---------- */
  function enterRun() {
    document.getElementById('setup').hidden = true;
    document.getElementById('results').hidden = true;
    document.getElementById('run').hidden = false;
    buildSheet(); render(); lastTick = Date.now();
    clearInterval(timer); timer = setInterval(tick, 250); tick();
    window.scrollTo(0, 0);
  }
  function elapsed() { return (Date.now() - S.startedAt) / 1000; }

  function tick() {
    if (!S) return;
    var now = Date.now();
    if (!document.hidden) S.times[S.current] += (now - lastTick) / 1000;
    lastTick = now;
    var n = count(), rem = S.limit - elapsed();
    var clock = document.getElementById('clock');
    clock.textContent = App.fmtTime(rem);
    clock.classList.toggle('low', rem <= 300);
    var answered = S.answers.filter(function (a) { return a != null; }).length;
    var target = S.limit / n;
    var expected = Math.min(n, Math.floor(elapsed() / target));
    document.getElementById('pace-done').style.width = (answered / n * 100) + '%';
    document.getElementById('pace-time').style.left = Math.min(100, elapsed() / S.limit * 100) + '%';
    var diff = answered - expected, st;
    if (diff >= 2) st = '<b class="ahead">Ahead by ' + diff + '</b>';
    else if (diff <= -2) st = '<b class="behind">Behind by ' + (-diff) + '</b>, skip and flag sooner';
    else st = '<b>On pace</b>';
    document.getElementById('pace-status').innerHTML = answered + ' of ' + n + ' answered. ' + st + '. Target ' + App.fmtTime(target) + ' per question.';
    [[20, 'warn'], [10, 'warn'], [5, 'danger'], [1, 'danger']].forEach(function (w) {
      var m = w[0];
      if (S.limit > m * 60 * 1.5 && rem <= m * 60 && !S.warned[m]) {
        S.warned[m] = true;
        var blanks = n - answered;
        var msg = m + (m === 1 ? ' minute' : ' minutes') + ' left.';
        if (m <= 5 && blanks) msg += ' Bubble a guess for your ' + blanks + ' blank' + (blanks > 1 ? 's' : '') + ' now.';
        else if (m >= 10) { var fl = S.flags.filter(Boolean).length; if (fl) msg += ' ' + fl + ' flagged to revisit.'; }
        App.toast(msg, w[1], 6000);
      }
    });
    if (rem <= 0) { App.toast('Time is up. Your exam has been handed in.', 'danger', 5000); finish(); return; }
    if (Math.floor(now / 3000) !== Math.floor((now - 250) / 3000)) save();
  }

  function render() {
    var area = document.getElementById('qarea'); area.innerHTML = '';
    var i = S.current;
    area.appendChild(App.renderQuestion({ inst: S.items[i], number: i + 1, total: count(), selected: S.answers[i], reveal: false, showMeta: false, groupLabel: groupLabel(i), onSelect: function (di) { setAnswer(i, di); } }));
    var fb = document.getElementById('flag');
    fb.setAttribute('aria-pressed', S.flags[i] ? 'true' : 'false');
    fb.textContent = S.flags[i] ? 'Flagged' : 'Flag for review';
    document.getElementById('prev').disabled = i === 0;
    document.getElementById('next').textContent = i === count() - 1 ? 'Review sheet' : 'Next';
    updateSheet();
  }

  function setAnswer(i, di) {
    if (di >= S.items[i].order.length) return;
    S.answers[i] = S.answers[i] === di ? null : di; // clicking a filled bubble erases it
    save();
    if (i === S.current) render(); else updateSheet();
    tick();
  }
  function go(i) {
    if (i < 0 || i >= count()) return;
    tick(); S.current = i; save(); render();
    document.getElementById('sheet').classList.remove('open');
    document.getElementById('sheet-toggle').setAttribute('aria-expanded', 'false');
    var bar = document.querySelector('.exam-bar');
    if (window.scrollY > bar.offsetTop + 10) window.scrollTo({ top: 0 });
  }
  function toggleFlag() { S.flags[S.current] = !S.flags[S.current]; save(); render(); }

  function buildSheet() {
    var ol = document.getElementById('sheet-list'); ol.innerHTML = '';
    S.items.forEach(function (it, i) {
      var li = App.el('li');
      var num = App.el('button', { class: 'num', type: 'button', 'aria-label': 'Go to question ' + (i + 1) }, String(i + 1));
      num.addEventListener('click', function () { go(i); });
      li.appendChild(num);
      for (var d = 0; d < 5; d++) {
        (function (d) {
          var b = App.el('button', { class: 'bubble', type: 'button', 'aria-label': 'Question ' + (i + 1) + ', answer ' + App.LETTERS[d], disabled: d >= it.order.length }, App.LETTERS[d]);
          b.addEventListener('click', function () { setAnswer(i, d); });
          li.appendChild(b);
        })(d);
      }
      ol.appendChild(li);
    });
  }
  function updateSheet() {
    document.querySelectorAll('#sheet-list li').forEach(function (li, i) {
      li.classList.toggle('current', i === S.current);
      li.classList.toggle('flagged', !!S.flags[i]);
      li.querySelectorAll('.bubble').forEach(function (b, d) {
        var f = S.answers[i] === d;
        b.classList.toggle('is-filled', f);
        b.setAttribute('aria-pressed', f ? 'true' : 'false');
      });
    });
  }

  document.getElementById('prev').addEventListener('click', function () { go(S.current - 1); });
  document.getElementById('next').addEventListener('click', function () {
    if (S.current < count() - 1) go(S.current + 1);
    else { var sh = document.getElementById('sheet'); sh.classList.add('open'); document.getElementById('sheet-toggle').setAttribute('aria-expanded', 'true'); sh.scrollIntoView({ block: 'nearest' }); }
  });
  document.getElementById('flag').addEventListener('click', toggleFlag);
  document.getElementById('sheet-toggle').addEventListener('click', function () {
    var open = document.getElementById('sheet').classList.toggle('open');
    this.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('keydown', function (e) {
    if (!S || document.getElementById('run').hidden || document.getElementById('confirm').open) return;
    var k = App.choiceKey(e);
    if (k >= 0) { e.preventDefault(); setAnswer(S.current, k); return; }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(S.current + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(S.current - 1); }
    else if (e.key === 'f' || e.key === 'F') { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); toggleFlag(); } }
  });

  /* ---------- hand in ---------- */
  var dlg = document.getElementById('confirm');
  document.getElementById('submit').addEventListener('click', function () {
    var blanks = S.answers.filter(function (a) { return a == null; }).length, fl = S.flags.filter(Boolean).length;
    var parts = [];
    if (blanks) parts.push('<strong>' + blanks + ' unanswered</strong> (they will be marked wrong)');
    if (fl) parts.push(fl + ' flagged');
    document.getElementById('confirm-text').innerHTML = (parts.length ? 'You have ' + parts.join(' and ') + '. ' : 'Every question has an answer. ') + App.fmtTime(S.limit - elapsed()) + ' remaining.';
    if (dlg.showModal) dlg.showModal(); else if (confirm('Hand in your exam?')) finish();
  });
  document.getElementById('confirm-no').addEventListener('click', function () { dlg.close(); });
  document.getElementById('confirm-yes').addEventListener('click', function () { dlg.close(); finish(); });

  function finish() {
    clearInterval(timer);
    if (!S) return;
    var n = count(), used = Math.min(S.limit, elapsed());
    var score = S.items.reduce(function (s, it, i) { return s + (App.isCorrect(it, S.answers[i]) ? 1 : 0); }, 0);
    var seen = store.get('seen', {}), missed = store.get('missed', {});
    S.items.forEach(function (it, i) { seen[it.id] = true; if (App.isCorrect(it, S.answers[i])) delete missed[it.id]; else missed[it.id] = true; });
    store.set('seen', seen); store.set('missed', missed);
    var hist = store.get('history', []);
    hist.push({ at: Date.now(), mode: S.label, score: score, total: n, used: Math.round(used) });
    store.set('history', hist.slice(-30));
    store.del('exam-active');
    var done = S; S = null;
    showResults(done, score, used);
  }

  /* ---------- results ---------- */
  function showResults(R, score, used) {
    var n = R.items.length;
    document.getElementById('run').hidden = true;
    var sec = document.getElementById('results'); sec.hidden = false;
    var blanks = R.answers.filter(function (a) { return a == null; }).length;
    var pct = Math.round(score / n * 100);
    var byTopic = {};
    R.items.forEach(function (it, i) { var t = App.byId(it.id).t; byTopic[t] = byTopic[t] || [0, 0]; byTopic[t][1]++; if (App.isCorrect(it, R.answers[i])) byTopic[t][0]++; });
    var target = R.limit / n;
    var slowIdx = R.times.map(function (t, i) { return [t, i]; }).sort(function (a, b) { return b[0] - a[0]; }).slice(0, Math.min(5, n)).map(function (p) { return p[1]; });
    var verdict = pct >= 80 ? 'Strong result.' : pct >= 65 ? 'Solid, with gaps to close.' : 'Worth another round on the weak topics below.';
    var isPT = R.mode === 'practice';

    var h = '<h1 style="font-size:clamp(30px,4vw,44px)">' + (isPT ? 'Practice test results' : 'Exam results') + '</h1>' +
      '<div class="result-score">' + score + '/' + n + '</div><p class="lede">' + pct + '%. ' + verdict + '</p>' +
      '<div class="stat-row"><div><b>' + App.fmtTime(used) + '</b>time used of ' + App.fmtTime(R.limit) + '</div>' +
      '<div><b>' + App.fmtTime(used / n) + '</b>average per question</div>' +
      '<div><b>' + blanks + '</b>left blank</div><div><b>' + R.flags.filter(Boolean).length + '</b>flagged</div></div>';
    h += '<div class="grid-2" style="margin-top:28px"><div class="panel"><h3>By topic</h3><div class="topic-bars">';
    [1, 2, 3, 4].forEach(function (t) {
      var v = byTopic[t]; if (!v) return;
      var p = v[0] / v[1] * 100;
      h += '<div class="tb"><span>' + TOPICS[t].short + '</span><div class="progress"><i style="width:' + p + '%;' + (p < 60 ? 'background:var(--red)' : '') + '"></i></div><span>' + v[0] + '/' + v[1] + '</span></div>';
    });
    var wk = weakest(byTopic);
    h += '</div><p class="small muted" style="margin-top:14px">Weakest topic? <a href="quiz.html?topic=' + wk + '">Quiz it</a> or <a href="guide.html#t' + wk + '">reread it</a>.</p></div>';
    h += '<div class="panel"><h3>Where your time went</h3><p class="small muted">Target was ' + App.fmtTime(target) + ' per question. Your slowest:</p><ul class="history-list">';
    slowIdx.forEach(function (i) {
      var q = App.byId(R.items[i].id), ok = App.isCorrect(R.items[i], R.answers[i]);
      h += '<li><span>Q' + (i + 1) + ' <span class="muted">' + TOPICS[q.t].short + ', ' + q.s + '</span></span><span><span class="time-pill' + (R.times[i] > target * 1.5 ? ' slow' : '') + '">' + App.fmtTime(R.times[i]) + '</span> ' + (ok ? '<b style="color:var(--form)">right</b>' : '<b style="color:var(--red)">wrong</b>') + '</span></li>';
    });
    h += '</ul></div></div>';
    h += '<div class="btn-row" style="margin:28px 0 0"><button class="btn" id="again" type="button">' + (isPT ? 'Take a full 29-question exam' : 'New practice exam') + '</button><a class="btn secondary" href="quiz.html?style=prof">Quiz in the test style</a></div>';
    h += '<div class="filters"><div class="seg" id="filter" role="group" aria-label="Filter review"><button type="button" data-f="all" aria-pressed="true">All</button><button type="button" data-f="wrong" aria-pressed="false">Wrong or blank</button><button type="button" data-f="flag" aria-pressed="false">Flagged</button></div></div>';
    h += '<ul class="review-list" id="review"></ul>';
    sec.innerHTML = h;

    function drawReview(f) {
      var ul = document.getElementById('review'); ul.innerHTML = '';
      var lastG = null;
      R.items.forEach(function (it, i) {
        var ok = App.isCorrect(it, R.answers[i]);
        if (f === 'wrong' && ok) return;
        if (f === 'flag' && !R.flags[i]) return;
        var q = App.byId(it.id), a = R.answers[i];
        var cls = a == null ? 'blank' : ok ? 'right' : 'wrong';
        var li = App.el('li', { class: 'review-item ' + cls });
        var mine = a == null ? '<b class="w">Left blank.</b>' : ok ? '<b class="r">Correct:</b> (' + App.LETTERS[a].toLowerCase() + ') ' + q.c[it.order[a]] : '<b class="w">You chose:</b> (' + App.LETTERS[a].toLowerCase() + ') ' + q.c[it.order[a]];
        var correct = ok ? '' : '<br><b class="r">Answer:</b> (' + App.LETTERS[it.order.indexOf(q.a)].toLowerCase() + ') ' + q.c[q.a];
        var stem = (q.g && q.g !== lastG && window.GROUPS && GROUPS[q.g]) ? '<div class="stem"><p class="stem-label">Shared setup</p>' + GROUPS[q.g] + '</div>' : '';
        lastG = q.g || null;
        li.innerHTML = '<div class="qmeta" style="margin-bottom:6px"><span>Question ' + (i + 1) + '</span><span class="tag">' + TOPICS[q.t].short + '</span>' + (q.src === 'lecture' ? '<span class="tag lecture">From lecture</span>' : '') + (R.flags[i] ? '<span class="tag" style="background:var(--hi-2)">Flagged</span>' : '') + '<span class="time-pill' + (R.times[i] > target * 1.5 ? ' slow' : '') + '">' + App.fmtTime(R.times[i]) + '</span></div>' +
          stem + '<div class="q">' + q.q + '</div><div class="ans">' + mine + correct + '</div><details' + (ok ? '' : ' open') + '><summary>Why</summary><p>' + q.x + '</p></details>';
        ul.appendChild(li);
      });
      if (!ul.children.length) ul.innerHTML = '<li class="muted">Nothing here.</li>';
    }
    drawReview('all');
    document.querySelectorAll('#filter button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('#filter button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true'); drawReview(b.dataset.f);
      });
    });
    document.getElementById('again').addEventListener('click', function () {
      sec.hidden = true; document.getElementById('setup').hidden = false;
      if (isPT) pickMode('tight');
      checkResume(); window.scrollTo(0, 0);
    });
    window.scrollTo(0, 0);
  }
  function weakest(bt) { var w = 1, wp = 2; [1, 2, 3, 4].forEach(function (t) { var v = bt[t]; if (v && v[0] / v[1] < wp) { wp = v[0] / v[1]; w = t; } }); return w; }

  /* ---------- resume ---------- */
  function checkResume() {
    var a = store.get('exam-active', null), box = document.getElementById('resume');
    if (!a || a.v !== VERSION || !a.items || !a.items.length || !a.items.every(function (it) { return App.byId(it.id); })) { if (a) store.del('exam-active'); box.hidden = true; return; }
    var rem = a.limit - (Date.now() - a.startedAt) / 1000;
    var answered = a.answers.filter(function (x) { return x != null; }).length;
    if (rem <= 0) { S = a; App.toast('Your earlier exam ran out of time and has been handed in.', 'warn', 5000); finish(); return; }
    box.hidden = false;
    document.getElementById('resume-text').textContent = a.label + ', ' + answered + ' of ' + a.items.length + ' answered, ' + App.fmtTime(rem) + ' left. The clock kept running while you were away.';
  }
  document.getElementById('resume-btn').addEventListener('click', function () { S = store.get('exam-active', null); if (S) enterRun(); });
  document.getElementById('discard-btn').addEventListener('click', function () { store.del('exam-active'); document.getElementById('resume').hidden = true; });
  document.getElementById('start').addEventListener('click', function () {
    if (store.get('exam-active', null) && !confirm('Starting a new exam discards the one in progress. Continue?')) return;
    startExam();
  });
  window.addEventListener('beforeunload', function () { save(); });

  checkResume();
})();
