(() => {
  if (window.__chessCompagnonBridge) return;
  window.__chessCompagnonBridge = true;
  // Runs in the page world only to read the board's public position API.
  // Never calls move methods or accesses account/session information.
  setInterval(() => {
    if (!document.getElementById('chess-compagnon') || document.hidden) return;
    for (const board of document.querySelectorAll('wc-chess-board,chess-board')) {
      try {
        const fen = board.game?.getFEN?.() || board.getAttribute('fen');
        if (typeof fen === 'string' && fen.length < 150 && fen.trim().split(/\s+/).length === 6) {
          if (board.getAttribute('data-compagnon-fen') !== fen) board.setAttribute('data-compagnon-fen',fen);
        } else board.removeAttribute('data-compagnon-fen');
      } catch { board.removeAttribute('data-compagnon-fen'); }
    }
  }, 300);
})();
