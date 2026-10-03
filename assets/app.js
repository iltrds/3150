/* Shared helpers for the CIS*3150 midterm site */
(function () {
  var EXAM_DATE = new Date(2026, 9, 8); // Thu Oct 8 2026 (local time)
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('cis3150:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('cis3150:' + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem('cis3150:' + k); } catch (e) {} }
  };

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') e.className = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    if (html != null) e.innerHTML = html;
    return e;
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function daysUntilExam() {
    var now = new Date(); var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((EXAM_DATE - today) / 86400000);
  }

  function countdownText() {
    var d = daysUntilExam();
    if (d > 1) return '<strong>' + d + ' days</strong> to go';
    if (d === 1) return '<strong>Tomorrow</strong>';
    if (d === 0) return '<strong>Today</strong> — good luck';
    return 'Midterm 1 has passed';
  }

  /* ---------- theme ---------- */
  function applyTheme(t) {
    if (t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
  }
  applyTheme(store.get('theme', null));
  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /* ---------- header / footer ---------- */
  var PAGES = [['index.html', 'Home'], ['guide.html', 'Study guide'], ['cards.html', 'Flashcards'], ['quiz.html', 'Quizzes'], ['exam.html', 'Practice exam']];
  function buildChrome() {
    var here = (location.pathname.split('/').pop() || 'index.html');
    var head = document.getElementById('site-head');
    if (head) {
      head.className = 'site-head';
      var nav = PAGES.map(function (p) {
        return '<a href="' + p[0] + '"' + (p[0] === here ? ' aria-current="page"' : '') + '>' + p[1] + '</a>';
      }).join('');
      head.innerHTML = '<div class="wrap"><a class="brand" href="index.html"><b>CIS*3150</b><span>Midterm 1 prep</span></a>' +
        '<button class="nav-toggle" aria-expanded="false" aria-controls="main-nav">Menu</button>' +
        '<nav class="nav" id="main-nav" aria-label="Main">' + nav + '</nav>' +
        '<button class="theme-btn" type="button" aria-label="Switch between light and dark theme" title="Light / dark"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg></button></div>';
      head.querySelector('.theme-btn').addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next); store.set('theme', next);
      });
      var tog = head.querySelector('.nav-toggle'), navEl = head.querySelector('.nav');
      tog.addEventListener('click', function () {
        var open = navEl.classList.toggle('open'); tog.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    var foot = document.getElementById('site-foot');
    if (foot) {
      foot.className = 'site-foot';
      foot.innerHTML = '<div class="wrap">Unofficial study site for CIS*3150 Midterm 1 (Thu Oct 8, 2026). Based on Sipser, <i>Introduction to the Theory of Computation</i>, and the course lecture slides. Progress is saved in this browser only.</div>';
    }
  }

  /* ---------- toast ---------- */
  var toastEl, toastTimer;
  function toast(msg, kind, ms) {
    if (!toastEl) { toastEl = el('div', { class: 'toast', role: 'status', 'aria-live': 'assertive' }); document.body.appendChild(toastEl); }
    toastEl.className = 'toast ' + (kind || '');
    toastEl.textContent = msg;
    requestAnimationFrame(function () { toastEl.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 3200);
  }

  /* ---------- questions ---------- */
  // Prepare a question instance with a (possibly shuffled) choice order.
  function instance(q) {
    var order = q.c.map(function (_, i) { return i; });
    if (!q.keep) order = shuffle(order);
    return { id: q.id, order: order };
  }
  function byId(id) { for (var i = 0; i < QB.length; i++) if (QB[i].id === id) return QB[i]; return null; }

  /* Render a question card.
     opts: { inst, number, total, selected (display index or null), reveal (bool), onSelect(displayIndex), showMeta } */
  function renderQuestion(opts) {
    var q = byId(opts.inst.id), order = opts.inst.order;
    var card = el('article', { class: 'qcard', 'aria-labelledby': 'qtext-' + q.id });
    var meta = '<span>Question ' + opts.number + (opts.total ? ' of ' + opts.total : '') + '</span>';
    if (opts.showMeta !== false) {
      meta += '<span class="tag">' + TOPICS[q.t].short + '</span><span class="tag">' + q.s + '</span>';
      if (q.src === 'lecture') meta += '<span class="tag lecture">From lecture</span>';
    }
    card.appendChild(el('div', { class: 'qmeta' }, meta));
    card.appendChild(el('div', { class: 'qtext', id: 'qtext-' + q.id }, q.q));
    var list = el('ul', { class: 'choices', role: 'list' });
    order.forEach(function (orig, di) {
      var cls = 'choice';
      if (opts.selected === di) cls += ' is-filled';
      if (opts.reveal) {
        if (orig === q.a) cls += ' is-correct';
        else if (opts.selected === di) cls += ' is-wrong';
      }
      var b = el('button', { class: cls, type: 'button', 'aria-pressed': opts.selected === di ? 'true' : 'false', disabled: opts.reveal ? true : false },
        '<span class="bubble" aria-hidden="true">' + LETTERS[di] + '</span><span><span class="sr-only">' + LETTERS[di] + '. </span>' + q.c[orig] + '</span>');
      if (!opts.reveal && opts.onSelect) b.addEventListener('click', function () { opts.onSelect(di); });
      var li = el('li'); li.appendChild(b); list.appendChild(li);
    });
    card.appendChild(list);
    if (opts.reveal) {
      var ok = opts.selected != null && order[opts.selected] === q.a;
      var correctLetter = LETTERS[order.indexOf(q.a)];
      var head = opts.selected == null ? 'Not answered — the answer is ' + correctLetter + '.' : ok ? 'Correct.' : 'Not quite — the answer is ' + correctLetter + '.';
      card.appendChild(el('div', { class: 'feedback ' + (ok ? 'ok' : 'no'), role: 'status' }, '<b>' + head + '</b>' + q.x));
    }
    return card;
  }

  function isCorrect(inst, selected) { var q = byId(inst.id); return selected != null && inst.order[selected] === q.a; }

  // Keyboard: A-D / 1-4 to choose.
  function choiceKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return -1;
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return -1;
    var k = e.key.toLowerCase();
    var i = 'abcd'.indexOf(k); if (i >= 0 && k.length === 1) return i;
    i = '1234'.indexOf(k); if (i >= 0 && k.length === 1) return i;
    return -1;
  }

  window.App = {
    store: store, el: el, shuffle: shuffle, fmtTime: fmtTime, toast: toast,
    daysUntilExam: daysUntilExam, countdownText: countdownText, EXAM_DATE: EXAM_DATE,
    instance: instance, byId: byId, renderQuestion: renderQuestion, isCorrect: isCorrect,
    choiceKey: choiceKey, LETTERS: LETTERS
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildChrome); else buildChrome();
})();
