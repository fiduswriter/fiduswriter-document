#!/usr/bin/env node
// Convert CSL XML files to the compact JSON shape used by citeproc-plus.
// Run `npm run build` first so the parser module is available in dist/.
import {parseCSL} from "../dist/citations/csl_xml_parser.js"
import {readdirSync, readFileSync, writeFileSync} from "node:fs"
import {dirname, join} from "node:path"
import {fileURLToPath} from "node:url"

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const CSL_DIR = process.argv[2] || join(ROOT, "test/fixtures/csl")

const files = readdirSync(CSL_DIR).filter(name => name.endsWith(".csl"))
for (const file of files) {
    const xml = readFileSync(join(CSL_DIR, file), "utf8")
    const json = parseCSL(xml)
    const outName = file.replace(/\.csl$/, ".json")
    writeFileSync(
        join(CSL_DIR, outName),
        JSON.stringify(json, null, 2),
        "utf8"
    )
    console.log(`Wrote ${outName}`)
}
