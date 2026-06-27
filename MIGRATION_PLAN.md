# @fiduswriter/document JS → TS Migration Plan

## Goal
Convert every remaining JavaScript source file under `src/` to TypeScript, delete
the original `.js` files once their replacements are green, and add at least one
new real-file round-trip test for an additional format.

Final validation must pass:
- `npm run typecheck`
- `npm run build`
- `npm run build-schema`
- `npm test`

## Work cadence
For each phase/group:
1. Rename files to `.ts` and add real types (keep `.js` extensions in imports).
2. Run `npm run typecheck`.
3. Run `npm test`.
4. Delete the old `.js` files only when the group is green.
5. Commit the group.

## Phase 0 — Shared types and ambient declarations
- Extend `src/types.ts` as needed for exporter/importer shapes.
- Keep/augment `src/global.d.ts` for runtime globals (`gettext`, `interpolate`, `staticUrl`).
- Add `src/modules.d.ts` for dependencies without bundled types:
  - `downloadjs`
  - `pretty`
  - `@vivliostyle/print`

## Phase 1 — Leaf/helper modules
Small files with few or no internal dependencies. Convert in batches:
- `bibliography/common.js`, `bibliography/csl_bib.js`
- `citations/citeproc_sys.js`, `citations/format.js`
- `mathlive/opf_includes.js`
- `exporter/native/shrink.js`
- `importer/native/get_images.js`
- `editor/e2ee/encryptor.js`
- Tiny exporter utilities:
  - `exporter/latex/escape_latex.js`, `exporter/latex/readme.js`
  - `exporter/pandoc/readme.js`, `exporter/pandoc/tools.js`
  - `exporter/html/tools.js`, `exporter/docx/tools.js`, `exporter/epub/tools.js`
  - `exporter/docx/math.js`, `exporter/odt/math.js`
  - `exporter/odt/track.js`, `exporter/jats/text.js`

## Phase 2 — Format-specific core converters/renderers
Convert each family together so internal imports are type-safe:
- **DOCX exporter:** `rels.js`, `metadata.js`, `comments.js`, `images.js`, `lists.js`, `tables.js`, `footnotes.js`, `richtext.js`, `render.js`
- **ODT exporter:** `metadata.js`, `images.js`, `footnotes.js`, `richtext.js`, `render.js`, `styles.js`
- **HTML exporter:** `templates.js`, `citations.js`, `convert.js`
- **JATS exporter:** `templates.js`, `bibliography.js`, `citations.js`, `convert.js`, `text.js`
- **LaTeX exporter:** `convert.js`
- **Pandoc exporter:** `convert.js`, `citations.js`
- **EPUB exporter:** `templates.js`, `tools.js`
- **Print exporter:** `index.js`

Add at least one new real-file round-trip test in this phase
(e.g., a second DOCX fixture or a Pandoc/Markdown fixture if exercisable).

## Phase 3 — Large importers
Biggest and most DOM-heavy modules; do after helpers are typed:
- `importer/docx/parse.js`, `importer/docx/omml2mathml.js`, `importer/docx/citations.js`, `importer/docx/convert.js`
- `importer/odt/convert.js`
- `importer/pandoc/convert.js`

For very large legacy conversion blocks, prefer real types but use targeted `any`
casts or narrow `// @ts-nocheck` scopes if strict retrofitting would dominate.

## Phase 4 — Public entry points and final cleanup
- Convert the top-level exporter orchestrators:
  - `exporter/docx/index.js`
  - `exporter/odt/index.js`
  - `exporter/html/index.js`
  - `exporter/jats/index.js`
  - `exporter/latex/index.js`
  - `exporter/pandoc/index.js`
  - `exporter/epub/index.js`
- Verify every subpath export in `package.json` resolves to a `.d.ts`.
- Delete every remaining `.js` file under `src/`.
- Run full validation and commit.

## Risks
- Third-party modules without types require ambient declarations.
- Browser/DOM globals are available via `lib: ["DOM"]`, but custom globals need
  `global.d.ts`.
- `editor/e2ee/encryptor.js` has no test coverage and uses Web Crypto.
- Large importers may expose shape mismatches in `FidusNode`/`ExportDoc`;
  expect to iterate on `src/types.ts`.

## Definition of done
- No `.js` source files remain in `src/`.
- `npm run typecheck`, `npm run build`, `npm run build-schema`, and `npm test` pass.
- At least one new real-file round-trip test is present and passing.
- All changes are committed in the `fiduswriter-document` repository.
