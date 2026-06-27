// Generate a JSON serialization of the Fidus Writer document schema.
// This script is run by the package's prepare/prepublishOnly scripts.
import {writeFileSync} from "node:fs"
import {dirname, join} from "node:path"
import {fileURLToPath} from "node:url"

import {SchemaExport} from "../dist/schema/export.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, "..", "schema.json")

const exporter = new SchemaExport()
const json = exporter.init()

writeFileSync(outPath, json)
console.log(`Wrote schema.json (${json.length} bytes)`)
