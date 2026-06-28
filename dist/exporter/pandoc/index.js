import { BibLatexExporter } from "biblatex-csl-converter";
import download from "downloadjs";
import { shortFileTitle } from "fwtoolkit";
import { fixTables, removeHidden } from "../tools/doc_content.js";
import { createSlug } from "../tools/file.js";
import { ZipFileCreator } from "../tools/zip.js";
import { PandocExporterCitations } from "./citations.js";
import { PandocExporterConvert } from "./convert.js";
import { readMe } from "./readme.js";
/*
 Exporter to Pandoc JSON
*/
export class PandocExporter {
    doc;
    docTitle;
    bibDB;
    imageDB;
    csl;
    updated;
    docContent;
    zipFileName;
    textFiles;
    httpFiles;
    citations;
    constructor(doc, bibDB, imageDB, csl, updated) {
        this.doc = doc;
        this.docTitle = shortFileTitle(this.doc.title, this.doc.path || "");
        this.bibDB = bibDB;
        this.imageDB = imageDB;
        this.csl = csl;
        this.updated = updated;
        this.docContent = false;
        this.zipFileName = "";
        this.textFiles = [];
        this.httpFiles = [];
    }
    init() {
        //this.docContent = removeHidden(this.doc.content) //
        this.docContent = fixTables(removeHidden(this.doc.content));
        const citations = new PandocExporterCitations(this, this.bibDB, this.csl, this.docContent);
        this.citations = citations;
        const converter = new PandocExporterConvert(this, this.imageDB, this.bibDB, this.doc.settings);
        return citations.init().then(() => {
            this.conversion = converter.init(this.docContent);
            if (Object.keys(this.conversion.usedBibDB).length > 0) {
                const bibExport = new BibLatexExporter(this.conversion.usedBibDB);
                this.textFiles.push({
                    filename: "bibliography.bib",
                    contents: bibExport.parse()
                });
            }
            this.conversion.imageIds.forEach((id) => {
                const imageUrl = this.imageDB.db[id].image;
                this.httpFiles.push({
                    filename: imageUrl.split("/").pop(),
                    url: imageUrl
                });
            });
            return this.createExport();
        });
    }
    conversion;
    createExport() {
        // Override this function if adding a conversion-through-pandoc step.
        this.textFiles.push({
            filename: "document.json",
            contents: JSON.stringify(this.conversion.json, null, 4)
        });
        this.textFiles.push({ filename: "README.txt", contents: readMe });
        this.zipFileName = `${createSlug(this.docTitle)}.pandoc.json.zip`;
        return this.createDownload();
    }
    createDownload() {
        // This creates a ZIP file with JSON sources included and then returns a promise for the download of the file.
        const zipper = new ZipFileCreator(this.textFiles, this.httpFiles, undefined, undefined, this.updated);
        return zipper
            .init()
            .then(blob => download(blob, this.zipFileName, "application/zip"));
    }
}
//# sourceMappingURL=index.js.map