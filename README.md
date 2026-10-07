# CIS*3150 Midterm 1 prep

A static study site for CIS*3150 Theory of Computation, Midterm 1 (Thursday, October 8, 2026).

**Live site:** https://iltrds.github.io/3150/

- **Study guide** (`guide.html`): every topic on the announcement, plus lecture-only material (DFA minimization, lexical analysis, induction examples, leftmost/rightmost derivations).
- **Flashcards** (`cards.html`): 83 cards, filter by topic, lecture or practice test.
- **Topic quizzes** (`quiz.html`): 221 questions with explanations, 71 of them in the practice-test style; retry the ones you missed.
- **Practice exam** (`exam.html`): the Oct 6 class practice test (9 questions, 25 min), or 29 questions in the prof's format (five choices, shared setups) with an 80- or 65-minute timer, A–E bubble sheet, pace bar and results by topic.

No build step and no dependencies: plain HTML, CSS and JavaScript. Progress is stored in the browser's localStorage.

## Publish on GitHub Pages

1. Create a new repository on GitHub (for example `cis3150-midterm`).
2. Upload everything in this folder to the repository root (drag and drop on the repo page works), or:
   ```
   git init
   git add .
   git commit -m "CIS3150 midterm prep site"
   git branch -M main
   git remote add origin https://github.com/<your-username>/cis3150-midterm.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
4. After a minute the site is live at `https://<your-username>.github.io/cis3150-midterm/`.

## Editing questions

Questions live in `assets/questions.js` and `assets/questions-prof.js` (practice-test style: `fmt: 'prof'`, five fixed choices, optional shared setup `g` defined in `GROUPS`). Each entry:

```js
{ id: 't2-31', t: 2, s: 'Minimization', src: 'lecture',
  q: 'Question text (HTML allowed)',
  c: ['choice A', 'choice B', 'choice C', 'choice D'],
  a: 1,                 // index of the correct choice
  x: 'Explanation shown after answering',
  keep: true }          // optional: don't shuffle choices
```

`t` is the topic (1 Intro, 2 DFAs, 3 NFAs & regex, 4 Pumping lemma & CFGs). The practice exam draws 7 / 8 / 8 / 6 questions from topics 1–4, keeping shared setups together; change `MIX` in `assets/exam.js` to adjust. Older four-choice questions get “None of the above” added as option (e) automatically. Flashcards are in `assets/cards.js`.
