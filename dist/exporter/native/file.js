import download from "downloadjs";
import { shortFileTitle } from "fwtoolkit";
import { ShrinkFidus } from "./shrink.js";
import { createSlug } from "../tools/file.js";
import { ZipFidus } from "./zip.js";
export class ExportFidusFile {
    doc;
    bibDB;
    imageDB;
    includeTemplate;
    token;
    getTemplateFiles;
    constructor(doc, bibDB, imageDB, includeTemplate = true, token = false, getTemplateFiles) {
        this.doc = doc;
        this.bibDB = bibDB;
        this.imageDB = imageDB;
        this.includeTemplate = includeTemplate;
        this.token = token;
        this.getTemplateFiles = getTemplateFiles;
        return this.init();
    }
    init() {
        const shrinker = new ShrinkFidus(this.doc, this.imageDB, this.bibDB);
        return shrinker
            .init()
            .then(({ doc, shrunkImageDB, shrunkBibDB, httpIncludes }) => {
            const zipper = new ZipFidus(this.doc.id, doc, shrunkImageDB, shrunkBibDB, httpIncludes, this.includeTemplate, this.token, this.getTemplateFiles);
            return zipper.init();
        })
            .then(blob => {
            const title = shortFileTitle(this.doc.title, this.doc.path || "") || "untitled";
            const filename = `${createSlug(title)}.fidus`;
            download(blob, filename, "application/fidus+zip");
            return blob;
        });
    }
}
//# sourceMappingURL=file.js.map