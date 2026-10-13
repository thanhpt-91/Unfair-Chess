# Unfair Chess

Play a top chess engine with a one-sided superpower: Sniper Bishops, Amazon Queen,
Nightrider Knights, Leaping Rooks, Berserker Pawns, Game of Life Pawns or Trojan Horse.

Live: https://thanhpt-91.github.io/unfair-chess/

Each power has its own link. Refreshing the page starts a new game with that power:

| Power | Link |
|---|---|
| Sniper Bishops | https://thanhpt-91.github.io/unfair-chess/#sniper |
| Amazon Queen | https://thanhpt-91.github.io/unfair-chess/#amazon |
| Nightrider Knights | https://thanhpt-91.github.io/unfair-chess/#nightrider |
| Leaping Rooks | https://thanhpt-91.github.io/unfair-chess/#leaping |
| Berserker Pawns | https://thanhpt-91.github.io/unfair-chess/#berserker |
| Game of Life Pawns | https://thanhpt-91.github.io/unfair-chess/#life |
| Trojan Horse | https://thanhpt-91.github.io/unfair-chess/#trojan |

It's a static site, so there's no build step and no server code.

## Files

- `index.html`: the whole game (rules, UI, piece art)
- `stockfish-19-lite-single.js` and `.wasm`: Stockfish 19 with the small net (~1.8 MB). Loads first, so you can play immediately.
- `stockfish-19-single.js` and `.wasm`: Stockfish 19 with the full net (~99 MB). Downloads in the background, then takes over between moves. The browser caches it after the first visit.

These are single-threaded builds, so they run on GitHub Pages without special server headers.

- `engines/`: Stockfish 11 (`sf11/`), Fairy-Stockfish (`fairy/`) and Lozza (`lozza.js`).
- `sw.js`: a service worker. It keeps the engines in the browser's Cache Storage, so the 99 MB net downloads only once (the normal HTTP cache drops files that large). It also opens the page from cache straight away and checks GitHub in the background. When a newer version has been deployed, a "new version is ready" notice appears with a Reload button. It also adds the cross-origin isolation headers Fairy-Stockfish needs, which GitHub Pages can't set.

## Trojan Horse and Stockfish

Double-tap one of your knights to fill its 3×3 block with your pawns, so you can end up with up to 16 pawns. Stockfish 19 and Fairy-Stockfish refuse any position where a side has more than 8 pawns, so they are shown only your 8 most advanced pawns. The rest are hidden from it, the same way it can't see your power. It can still only play moves that are legal on the real board.

## Engines

Pick your opponent under **Opponent engine**. All four play at full strength, with 1.2 seconds per move. The opponent's Elo is shown next to its name:

| Engine | Elo | What it is |
|---|---|---|
| Stockfish 19 | 3629 | Neural-network evaluation. The strongest. |
| Stockfish 11 | 3494 | The last Stockfish before neural networks (2020), with a hand-tuned evaluation. |
| Fairy-Stockfish | ~3450 (estimate) | A Stockfish fork built for chess variants. It uses several threads, which needs cross-origin isolation. The service worker adds those headers, and on your first visit the page reloads itself once (keeping any game in progress) so they take effect. |
| Lozza 11 | ~3170 | An independent engine written in JavaScript by a different author. |

Elo values are CCRL single-CPU ratings: Stockfish 19 and 11 from the 40/15 list, Lozza from version 9.0 on the 40/40 list (version 11 isn't rated yet). Fairy-Stockfish isn't on CCRL; this build has no network file, so it uses the classical evaluation, and its number is an estimate. In the browser they run on one thread with 1.2 seconds per move, so they play somewhat below these numbers.

None of them know your power. Each lists its top few moves, and the game checks them: a move that hands you material through your power (a piece left on a sniper's line, for example) is passed over for the next-best safe one. Lozza can't be told which moves are legal under your power, so it lists its top 8 and the best legal one is played.

An eval bar beside the board shows the engine's evaluation; switch it off under Display.

## Run locally

Browsers block Web Workers on `file://`, so serve the folder:

    python3 -m http.server 8000

Then open http://localhost:8000.

## Credits

- Stockfish 11 (GPLv3) via stockfish.js; Fairy-Stockfish (GPLv3, see `engines/fairy/Copying.txt`); Lozza 11 by Colin Jenkins (MIT, see `engines/LICENSE-lozza.txt`)
- Stockfish 19 (GPLv3, see `LICENSE-stockfish.txt`), WebAssembly builds from stockfish.js by Nathan Rugg
- Pieces: cburnett set (GPLv2+), via lichess chessground
