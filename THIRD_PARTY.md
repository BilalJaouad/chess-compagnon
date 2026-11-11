# Third-party components

Bundled files retain their upstream licences. The project licence does not replace these notices. SHA-256 digests and file sizes are recorded in [vendor-manifest.json](vendor-manifest.json); run `npm run verify:assets` to check them.

## Stockfish.js 17.1.0 / Stockfish 17.1 Lite

- Files: `extension/vendor/stockfish-17.1-lite-single-03e3232.js` and the matching `.wasm`.
- Licence: GPL v3; see `extension/vendor/LICENSE-stockfish.txt`.
- Release and corresponding source: https://github.com/nmrugg/stockfish.js/releases/tag/v17.1.0
- Source tree, build scripts and instructions: https://github.com/nmrugg/stockfish.js/tree/v17.1.0
- Source archive: https://github.com/nmrugg/stockfish.js/archive/refs/tags/v17.1.0.tar.gz

The bundled engine files are used without modification.

## Maia 3 web export

- Model: `extension/vendor/maia/maia3.onnx`, copied from `public/maia3/maia3_simplified.onnx`.
- Vocabulary: `extension/vendor/maia/all_moves_maia3.json`, copied from `src/lib/engine/data/all_moves_maia3.json`.
- Source repository: https://github.com/CSSLab/maia-platform-frontend
- Pinned revision: `727df602996e97d544ca30dd09aaa1cd7c418ee7`.
- Upstream repository licence: GPL v3; included as `extension/vendor/maia/LICENSE-maia-platform.txt`.
- Original model family and research: https://github.com/CSSLab/maia3

The model and move vocabulary are bundled unchanged. The encoding and legal-move probability processing in `maia.js` follow the official web implementation at the pinned revision. This integration uses the browser export, not the standalone Python/UCI package. It does not train or modify model weights.

## ONNX Runtime Web 1.23.0

- Files: `ort.wasm.min.js`, `ort-wasm-simd-threaded.mjs`, and `ort-wasm-simd-threaded.wasm` under `extension/vendor/maia/`.
- Source and build instructions: https://github.com/microsoft/onnxruntime/tree/v1.23.0
- The runtime files were obtained from `public/ort/` in the pinned Maia web repository above.
- Licence: MIT, included as `LICENSE-onnxruntime.txt`.
- Third-party notices: `ThirdPartyNotices-onnxruntime.txt`.

The runtime files are bundled unchanged.

## chess.js 1.4.0

- File: `extension/vendor/chess.js`.
- Source: https://github.com/jhlywa/chess.js/tree/v1.4.0
- Licence: BSD-2-Clause, included as `extension/vendor/LICENSE-chess.txt`.

## Development dependency

Playwright 1.61.1 is installed only for development and testing. It is not part of the browser extension.

- Source and licence: https://github.com/microsoft/playwright
- Licence: Apache 2.0.
