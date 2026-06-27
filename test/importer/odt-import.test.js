import {readFileSync} from "node:fs"
import {dirname, join} from "node:path"
import {fileURLToPath} from "node:url"
import {beforeAll, describe, expect, it} from "@jest/globals"
import JSZip from "jszip"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const FIXTURE_PATH = join(
    __dirname,
    "fixtures",
    "comprehensive-test.odt"
)

const {OdtConvert} = await import("../../src/importer/odt/convert.js")

const MINIMAL_TEMPLATE = {
    content: {
        type: "doc",
        content: [
            {type: "title", content: [{type: "text", text: "Title"}]},
            {
                type: "richtext_part",
                attrs: {metadata: "abstract", title: "Abstract"}
            },
            {
                type: "contributors_part",
                attrs: {metadata: "authors", title: "Authors"}
            },
            {
                type: "tags_part",
                attrs: {metadata: "keywords", title: "Keywords"}
            },
            {type: "richtext_part", attrs: {title: "Body"}}
        ]
    }
}

describe("ODT importer integration with real fixture", () => {
    let imported

    beforeAll(async () => {
        const inputBuffer = readFileSync(FIXTURE_PATH)
        const inputZip = await JSZip.loadAsync(inputBuffer)

        const contentXml = await inputZip.file("content.xml")?.async("string")
        const stylesXml = await inputZip.file("styles.xml")?.async("string")
        const metaXml = await inputZip.file("meta.xml")?.async("string")
        const manifestXml = await inputZip.file(
            "META-INF/manifest.xml"
        )?.async("string")

        const importer = new OdtConvert(
            contentXml || "",
            stylesXml || "",
            metaXml || "",
            manifestXml || "",
            "odt-integration-test",
            MINIMAL_TEMPLATE,
            {},
            {}
        )
        imported = importer.init()
    })

    it("imports a real ODT file and returns a doc node", () => {
        expect(imported.content.type).toBe("doc")
        expect(imported.content.content.length).toBeGreaterThan(0)
    })

    it("extracts a title from the ODT file", () => {
        const title = imported.content.content.find(
            node => node.type === "title"
        )
        expect(title).toBeDefined()
        expect(title.content?.[0]?.text?.length).toBeGreaterThan(0)
    })

    it("imports paragraph nodes", () => {
        const descendants = flatten(imported.content)
        const paragraphs = descendants.filter(node => node.type === "paragraph")
        expect(paragraphs.length).toBeGreaterThanOrEqual(1)
    })

    it("imports heading nodes", () => {
        const descendants = flatten(imported.content)
        const headings = descendants.filter(node =>
            node.type?.startsWith("heading")
        )
        expect(headings.length).toBeGreaterThanOrEqual(1)
    })

    it("imports ordered lists", () => {
        const descendants = flatten(imported.content)
        const ordered = descendants.filter(node => node.type === "ordered_list")
        expect(ordered.length).toBeGreaterThanOrEqual(1)
    })

    it("imports table nodes", () => {
        const descendants = flatten(imported.content)
        const tables = descendants.filter(node => node.type === "table")
        expect(tables.length).toBeGreaterThanOrEqual(1)
    })

    it("imports footnote references", () => {
        const descendants = flatten(imported.content)
        const footnotes = descendants.filter(node => node.type === "footnote")
        expect(footnotes.length).toBeGreaterThanOrEqual(1)
    })

    it("imports formatting marks", () => {
        const descendants = flatten(imported.content)
        const marks = new Set()
        descendants.forEach(node => {
            if (node.marks) {
                node.marks.forEach(mark => marks.add(mark.type))
            }
        })
        expect(marks.has("strong")).toBe(true)
        expect(marks.has("em")).toBe(true)
        expect(marks.has("code")).toBe(true)
    })

    it("imports link marks", () => {
        const descendants = flatten(imported.content)
        const links = descendants.filter(
            node =>
                node.marks &&
                node.marks.some(mark => mark.type === "link")
        )
        expect(links.length).toBeGreaterThanOrEqual(1)
    })

    it("returns settings with import_id and language", () => {
        expect(imported.settings.import_id).toBe("odt-integration-test")
        expect(typeof imported.settings.language).toBe("string")
    })
})

function flatten(node) {
    const result = [node]
    if (node.content) {
        node.content.forEach(child => result.push(...flatten(child)))
    }
    return result
}
