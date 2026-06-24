import {describe, expect, it} from "@jest/globals"
import {readFileSync} from "node:fs"
import {dirname, join} from "node:path"
import {fileURLToPath} from "node:url"

import {SchemaExport} from "../src/schema/export.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

const schemaJsonPath = join(__dirname, "..", "schema.json")

describe("schema export", () => {
    it("generates a JSON schema with nodes and marks", () => {
        const exporter = new SchemaExport()
        const json = JSON.parse(exporter.init())
        expect(Object.keys(json.nodes).length).toBeGreaterThan(0)
        expect(Object.keys(json.marks).length).toBeGreaterThan(0)
    })

    it("has a committed/published schema.json file", () => {
        const contents = readFileSync(schemaJsonPath, "utf-8")
        const json = JSON.parse(contents)
        expect(json.nodes.doc).toBeDefined()
        expect(json.marks.em).toBeDefined()
    })
})
