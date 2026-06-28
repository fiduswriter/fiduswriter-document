import {CSL} from "citeproc-plus/dist/index.js"
import JSZip from "jszip"

import {JATSExporter} from "../../dist/exporter/jats/index.js"
import {HTMLExporter} from "../../dist/exporter/html/index.js"
import {LatexExporter} from "../../dist/exporter/latex/index.js"
import {PandocExporter} from "../../dist/exporter/pandoc/index.js"
import {EpubExporter} from "../../dist/exporter/epub/index.js"

import apaStyle from "../../test/fixtures/csl/apa.json"
import chicagoStyle from "../../test/fixtures/csl/chicago-author-date.json"
import ieeeStyle from "../../test/fixtures/csl/ieee.json"

import sampleDoc from "../sample-doc.json"

const STYLE_MAP: Record<string, any> = {
    apa: apaStyle,
    "chicago-author-date": chicagoStyle,
    ieee: ieeeStyle
}

const docJsonEl = document.getElementById("doc-json") as HTMLTextAreaElement
const styleSelect = document.getElementById("style-select") as HTMLSelectElement
docJsonEl.value = JSON.stringify(sampleDoc, null, 2)

const logEl = document.getElementById("log")!

function getDoc() {
    return JSON.parse(docJsonEl.value)
}

function log(msg: string) {
    logEl.textContent = msg
}

function createCSL(): CSL {
    const csl = new CSL()
    // Register the demo CSL styles by name so the exporters can resolve them.
    Object.assign(csl.styles, STYLE_MAP)
    csl.getStyle = (name: string) => Promise.resolve(csl.styles[name] || null)
    return csl
}

const sampleBibDB = {
    db: {
        1: {
            bib_type: "article-journal",
            entry_key: "doe2024",
            fields: {
                title: [{type: "text", text: "An example article"}],
                journaltitle: [
                    {type: "text", text: "Journal of Examples"}
                ],
                author: [
                    {
                        family: [{type: "text", text: "Doe"}],
                        given: [{type: "text", text: "John"}]
                    }
                ],
                date: "2024",
                volume: "7",
                issue: "3",
                pages: [["1", "10"]]
            }
        }
    }
}

const emptyImageDB = {db: {}}

document.getElementById("export-jats")!.addEventListener("click", () => {
    const doc = getDoc()
    doc.settings.citationstyle = styleSelect.value
    const exporter = new JATSExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        createCSL(),
        new Date(),
        "article"
    )
    exporter.init().then(() => log("JATS export downloaded."))
})

document.getElementById("export-html")!.addEventListener("click", () => {
    const doc = getDoc()
    doc.settings.citationstyle = styleSelect.value
    const exporter = new HTMLExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        createCSL(),
        new Date(),
        []
    )
    exporter.init().then(() => log("HTML export downloaded."))
})

document.getElementById("export-latex")!.addEventListener("click", () => {
    const doc = getDoc()
    const exporter = new LatexExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        new Date()
    )
    exporter.init().then(() => log("LaTeX export downloaded."))
})

document.getElementById("export-pandoc")!.addEventListener("click", () => {
    const doc = getDoc()
    doc.settings.citationstyle = styleSelect.value
    const exporter = new PandocExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        createCSL(),
        new Date()
    )
    exporter.init().then(() => log("Pandoc JSON export downloaded."))
})

document.getElementById("export-epub")!.addEventListener("click", () => {
    const doc = getDoc()
    doc.settings.citationstyle = styleSelect.value
    const exporter = new EpubExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        createCSL(),
        new Date(),
        []
    )
    exporter.init().then(() => log("EPUB export downloaded."))
})

document.getElementById("export-native")!.addEventListener("click", () => {
    const doc = getDoc()
    const zip = new JSZip()
    zip.file("document.json", JSON.stringify(doc))
    zip.file("bibliography.json", JSON.stringify(sampleBibDB.db))
    zip.file("images.json", "{}")
    zip.generateAsync({type: "blob"}).then(blob => {
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = "document.fidus"
        a.click()
        log("Native Fidus export downloaded.")
    })
})
