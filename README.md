# CIS*3150 study site

A static study site for CIS*3150 Theory of Computation (Fall 2026), organized by exam:

- `index.html`: course home listing each unit.
- `m1/`: **Midterm 1** (written Thursday, October 8, 2026), kept for final exam review.
- `m2/`: **Midterm 2**, built lecture by lecture (currently Lectures 6–7).

The old root URLs (`guide.html`, `quiz.html`, …) redirect to `m1/`.

**Live site:** https://iltrds.github.io/3150/

## Midterm 1

- **Study guide** (`m1/guide.html`): every topic on the announcement, plus lecture-only material (DFA minimization, lexical analysis, induction examples, leftmost/rightmost derivations).
- **Flashcards** (`m1/cards.html`): 89 cards, filter by topic or by source (lecture, practice test, midterm).
- **Topic quizzes** (`m1/quiz.html`): 243 questions with explanations, including questions 8–29 from the real midterm and 71 in the practice-test style; retry the ones you missed.
- **Practice exam** (`m1/exam.html`): the real Midterm 1 questions 8–29 (61 min), the Oct 6 class practice test (9 questions, 25 min), or 29 questions in the prof's format (five choices, shared setups) with an 80- or 65-minute timer, A–E bubble sheet, pace bar and results by topic.

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

Midterm 1 questions live in `assets/m1/questions.js`, `assets/m1/questions-prof.js` and `assets/m1/midterm.js` (the real exam) (practice-test style: `fmt: 'prof'`, five fixed choices, optional shared setup `g` defined in `GROUPS`). Each entry:

```js
{ id: 't2-31', t: 2, s: 'Minimization', src: 'lecture',
  q: 'Question text (HTML allowed)',
  c: ['choice A', 'choice B', 'choice C', 'choice D'],
  a: 1,                 // index of the correct choice
  x: 'Explanation shown after answering',
  keep: true }          // optional: don't shuffle choices
```

`t` is the topic (1 Intro, 2 DFAs, 3 NFAs & regex, 4 Pumping lemma & CFGs). The practice exam draws 7 / 8 / 8 / 6 questions from topics 1–4, keeping shared setups together; change `MIX` in `assets/exam.js` to adjust. Real-test questions (`pt`, `mt`) are kept out of random exams and have their own modes. Older four-choice questions get “None of the above” added as option (e) automatically. Flashcards are in `assets/m1/cards.js`.

Choices were balanced so the correct answer is not given away by length: it is the longest choice in about 19% of questions, below the 20–25% you would expect by chance.

## Midterm 2

- **Study guide** (`m2/guide.html`): CFG design and ambiguity (Sipser 2.3, G₁–G₄, dangling else), nullable variables, ε-rule removal and Chomsky normal form, pushdown automata (M₁ for 0ⁿ1ⁿ, instantaneous descriptions, DPDAs), and predictive parsing (left recursion, left factoring, FIRST/FOLLOW, the LL(1) table and a full parse trace).
- **Flashcards** (`m2/cards.html`): 46 cards.
- **Topic quizzes** (`m2/quiz.html`): 77 five-choice questions with shared setups; answers checked by computation (FIRST/FOLLOW and LL(1) tables, nullable sets, parse-tree counts, PDA runs). Correct answers are spread evenly over (a)–(e) and are uniquely the longest choice in only 15% of questions.
- **Practice exam** (`m2/exam.html`): 29 questions (8 / 6 / 7 / 8 across the four topics), in Midterm 1's format until the Midterm 2 announcement. Change `EXAM_CONFIG` in `assets/m2/questions.js` to adjust.

## Cache busting

Pages link assets with a version tag (`style.css?v=…`) so browsers fetch fresh copies after an update. When you change any file in `assets/`, bump the tag in every page (same value everywhere).

## Adding to Midterm 2

Midterm 2 data lives in `assets/m2/` (`questions.js` also sets `TOPICS`, `GROUPS` and `EXAM_CONFIG`; `cards.js`). Add new lectures' questions there and new sections to `m2/guide.html`. Midterm 2 progress is stored separately (`cis3150:m2:` prefix).
