import JSZip from "jszip"
import {initSettings} from "fwtoolkit"

// Configure staticUrl so that asset paths like "css/document.css" are resolved
// relative to the demo root rather than the converter/ subdirectory.
initSettings({staticUrl: (path: string) => `../${path}`})

import {createCSL} from "../../dist/citations/create_csl.js"

import {JATSExporter} from "../../dist/exporter/jats/index.js"
import {HTMLExporter} from "../../dist/exporter/html/index.js"
import {LatexExporter} from "../../dist/exporter/latex/index.js"
import {PandocExporter} from "../../dist/exporter/pandoc/index.js"
import {EpubExporter} from "../../dist/exporter/epub/index.js"

import apaStyle from "../../test/fixtures/csl/apa.json"
import chicagoStyle from "../../test/fixtures/csl/chicago-author-date.json"
import ieeeStyle from "../../test/fixtures/csl/ieee.json"

import sampleDoc from "../sample-doc.json"

const STYLE_MAP = {
    apa: apaStyle,
    "chicago-author-date": chicagoStyle,
    ieee: ieeeStyle
}

const docJsonEl = document.getElementById("doc-json") as HTMLTextAreaElement
const styleSelect = document.getElementById("style-select") as HTMLSelectElement
docJsonEl.value = JSON.stringify(sampleDoc, null, 2)

const logEl = document.getElementById("log")!

// Create one CSL instance up front (styles are pre-loaded objects, so the
// returned promise resolves immediately in a browser context).
const cslPromise = createCSL(STYLE_MAP)

function getExportDoc() {
    const fidusDoc = JSON.parse(docJsonEl.value)
    return {
        id: "demo",
        title: "Demo Document",
        content: fidusDoc,
        settings: Object.assign({}, fidusDoc.attrs || {})
    }
}

function log(msg: string) {
    logEl.textContent = msg
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
                volume: [{type: "text", text: "7"}],
                issue: [{type: "text", text: "3"}],
                pages: [
                    [
                        [{type: "text", text: "1"}],
                        [{type: "text", text: "10"}]
                    ]
                ]
            }
        }
    }
}

const emptyImageDB = {db: {}}

document.getElementById("export-jats")!.addEventListener("click", async () => {
    const doc = getExportDoc()
    doc.settings.citationstyle = styleSelect.value
    const exporter = new JATSExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        await cslPromise,
        new Date(),
        "article"
    )
    exporter.init().then(() => log("JATS export downloaded."))
})

document.getElementById("export-html")!.addEventListener("click", async () => {
    const doc = getExportDoc()
    doc.settings.citationstyle = styleSelect.value
    const exporter = new HTMLExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        await cslPromise,
        new Date(),
        []
    )
    exporter.init().then(() => log("HTML export downloaded."))
})

document.getElementById("export-latex")!.addEventListener("click", async () => {
    const doc = getExportDoc()
    const exporter = new LatexExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        new Date()
    )
    exporter.init().then(() => log("LaTeX export downloaded."))
})

document.getElementById("export-pandoc")!.addEventListener("click", async () => {
    const doc = getExportDoc()
    doc.settings.citationstyle = styleSelect.value
    const exporter = new PandocExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        await cslPromise,
        new Date()
    )
    exporter.init().then(() => log("Pandoc JSON export downloaded."))
})

document.getElementById("export-epub")!.addEventListener("click", async () => {
    const doc = getExportDoc()
    doc.settings.citationstyle = styleSelect.value
    const exporter = new EpubExporter(
        doc,
        sampleBibDB,
        emptyImageDB,
        await cslPromise,
        new Date(),
        []
    )
    exporter.init().then(() => log("EPUB export downloaded."))
})

document.getElementById("export-native")!.addEventListener("click", () => {
    const doc = getExportDoc()
    const zip = new JSZip()
    zip.file("document.json", JSON.stringify(doc.content))
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
