import { ShrinkFidus } from "./shrink.js";
import { ZipFidus } from "./zip.js";
export class SaveRevision {
    doc;
    imageDB;
    bibDB;
    note;
    uploadRevision;
    token;
    getTemplateFiles;
    onError;
    constructor(doc, imageDB, bibDB, note, uploadRevision, options = {}) {
        this.doc = doc;
        this.imageDB = imageDB;
        this.bibDB = bibDB;
        this.note = note;
        this.uploadRevision = uploadRevision;
        this.token = options.token ?? false;
        this.getTemplateFiles = options.getTemplateFiles;
        this.onError = options.onError;
    }
    init() {
        const shrinker = new ShrinkFidus(this.doc, this.imageDB, this.bibDB);
        return shrinker
            .init()
            .then(({ doc, shrunkImageDB, shrunkBibDB, httpIncludes }) => {
            const zipper = new ZipFidus(this.doc.id, doc, shrunkImageDB, shrunkBibDB, httpIncludes, true, this.token, this.getTemplateFiles);
            return zipper.init();
        })
            .then(blob => this.uploadRevision(blob, this.doc))
            .catch(error => {
            if (this.onError) {
                this.onError(error);
            }
            throw error;
        });
    }
}
//# sourceMappingURL=revision.js.map