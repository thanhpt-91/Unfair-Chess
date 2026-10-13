# Unfair Chess

Play Stockfish 19 with a one-sided superpower: Sniper Bishops, Amazon Queen,
Nightrider Knights, Leaping Rooks, Berserker Pawns or Game of Life Pawns.

Live: https://thanhpt-91.github.io/Unfair-Chess/

It's a static site, so there's no build step and no server code.

## Files

- `index.html`: the whole game (rules, UI, piece art)
- `stockfish-19-lite-single.js` and `.wasm`: Stockfish 19 with the small net (~1.8 MB). Loads first, so you can play immediately.
- `stockfish-19-single.js` and `.wasm`: Stockfish 19 with the full net (~99 MB). Downloads in the background, then takes over between moves. The browser caches it after the first visit.

These are single-threaded builds, so they run on GitHub Pages without special server headers.

## Strength

You can pick 1400, 1800, 2200, 2600, 3000 or Max (default). An eval bar beside the board shows Stockfish's evaluation; switch it off under Display.

The numbered levels use Stockfish's own `UCI_Elo` limiter. Max plays at full strength: modern Stockfish is rated around 3600 on CCRL. A single browser thread with a 2.5 s think time plays below that, but still far above any human.

## Run locally

Browsers block Web Workers on `file://`, so serve the folder:

    python3 -m http.server 8000

Then open http://localhost:8000.

## Credits

- Stockfish 19 (GPLv3, see `LICENSE-stockfish.txt`), WebAssembly builds from stockfish.js by Nathan Rugg
- Pieces: cburnett set (GPLv2+), via lichess chessground
