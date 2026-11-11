# Research mode, version 1.1.0

Version 1.1.0 added this local outcome-analysis page. Version 1.2.0 separately adds the native Stockfish strength limiter and optional display pacing, documented in README.md. Neither update automates games, connects to a detector, or establishes an improvement beyond ten games. Reduced strength is not a validated model of human mistakes.

## Open it

In Chrome's extensions page, reload Chess Compagnon. Then open its **Extension options**, or reload Chess.com and click **Research · résultats d’expérience** in the panel. The extension uses the same permissions as before.

Download the input template, enter your pseudonymized observations, and import the JSON. The synthetic example is explicitly labeled and its exported report retains `synthetic: true`. Imports stay in page memory; closing the tab discards them unless you export a report. No experimental data is sent to a server.

## Interpretation

The unit of analysis is a participant/run, not a move or individual game. One participant may appear once per report. Shared opponents or games can still cause dependence, so the Wilson intervals are descriptive; the app does not adjust for shared-game clustering. Separate cohorts by date and detector version when available.

`observedGames` is the number of games with verified follow-up. `firstEnforcementGame` is the first recorded account action; `firstFlagGame` is the first internal detector flag, if feedback actually exists. With only ban observations, set `detectorFeedbackAvailable: false` and `firstFlagGame: null`. Never translate “not banned” into a clean detector label. Check the reason for any account action before counting it as fair-play enforcement.

An event on game 10 counts as occurring by game 10. A run stopped at game 6 without an event has an unknown outcome at a horizon of 10. The report shows known-outcome rates, excluded/censored counts, 95% Wilson intervals, and all-run worst/best-case missing-outcome bounds. Those bounds are not confidence intervals. First-flag-to-enforcement lags are calculated only when both times are known. A game-number summary cannot resolve whether action occurred before tournament prizes or final standings; collect timestamps for that question.

## Study design

Predefine tournament length, detection and enforcement endpoints, and follow-up duration. Record every run, including losses and early stops. Include reliably labeled human-only controls matched on rating and time control. Compare at a fixed false-positive operating point when you have detector scores. Thirty team members playing each other do not automatically constitute thirty independent observations. Split development and evaluation by participant and account; freeze parameters before evaluating held-out participants. Report every attempted comparison, not just the longest streak. Without detector scores or labels, a claim of more accurate detection metrics cannot be evaluated.

## Research sources

- [Regan, testing rationale and methodology](https://cse.buffalo.edu/~regan/chess/fidelity/Methodology.html): realistic analysis conditions, alternative-move values, and avoiding hindsight bias.
- [McIlroy-Young et al., Aligning Superhuman AI with Human Behavior](https://arxiv.org/abs/2006.01855): matching aggregate chess strength is different from predicting human move choices. The paper does not establish evasion of Chess.com's detector.
- [Chess.com, Fair Play system](https://www.chess.com/cheating): its full detection implementation is not public.

These sources motivate the measurement design; none validates an “undetectable” configuration. No real team experiment was run or imported during development of this update.
