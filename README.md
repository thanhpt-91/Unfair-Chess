# Unfair Chess

Play Stockfish with a one-sided superpower: Sniper Bishops, Amazon Queen,
Nightrider Knights, Leaping Rooks or Berserker Pawns.

It's a static site, so there's no build step and no server code.

## Files

- `index.html`: the whole game (rules, UI, piece art)
- `stockfish.js`: Stockfish 10 (asm.js), which runs in a Web Worker

Keep both files in the same folder.

## Run locally

Browsers block Web Workers on `file://`, so serve the folder:

    npx serve .
    # or
    python3 -m http.server 8000

Then open http://localhost:8000.

## Deploy

Any static host works:

- **GitHub Pages:** push both files to a repo, then go to Settings → Pages and deploy from the main branch's root.
- **Netlify:** drag the folder onto app.netlify.com/drop.
- **Vercel:** run `npx vercel` in this folder.
- **Cloudflare Pages:** upload the folder as a direct upload project.

If `stockfish.js` can't load, the page tries a CDN copy first. If that fails too, it falls back to a simple built-in bot.

## Credits

- Stockfish 10 (GPLv3), via the `stockfish.js` package by nmrugg
- Pieces: cburnett set (GPLv2+), via lichess chessground
