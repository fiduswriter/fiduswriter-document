# @fiduswriter/document

This package contains the Fidus Writer document schema, importers and exporters.

## Usage

```javascript
import {docSchema, FW_DOCUMENT_VERSION} from "@fiduswriter/document/schema"
import {DocxConvert} from "@fiduswriter/document/importer/docx/convert.js"
import {DOCXExporter} from "@fiduswriter/document/exporter/docx/index.js"
```

## TypeScript

The package is being migrated to TypeScript. New source files are written in
`.ts`, compiled to `dist/` on build, and published with matching `.d.ts`
declarations. The public import paths remain unchanged.

## Development

```bash
npm install
npm run build      # compile TypeScript to dist/
npm run typecheck  # run tsc --noEmit
npm test           # run the Jest test suite
```

## Dependencies

- `fwtoolkit` — shared utilities (text helpers, network helpers, etc.)

## Schema JSON

A JSON serialization of the schema is exported as `schema.json` and regenerated
by the `prepare` / `prepublishOnly` scripts.

## Tests

The test suite includes round-trip tests that import real DOCX files, run them
through the exporters, and validate that the generated output files contain the
required ZIP entries and well-formed XML.
