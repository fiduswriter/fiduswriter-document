import { get } from "fwtoolkit";
import { descendantNodes } from "../tools/doc_content.js";
import { svg2png } from "../tools/svg.js";
export class ODTExporterImages {
    docContent;
    xml;
    imageDB;
    images;
    manifestXml;
    constructor(docContent, xml, imageDB) {
        this.docContent = docContent;
        this.xml = xml;
        this.imageDB = imageDB;
        this.images = {};
        this.manifestXml = null;
    }
    init() {
        return this.xml.getXml("META-INF/manifest.xml").then(manifestXml => {
            this.manifestXml = manifestXml;
            return this.exportImages();
        });
    }
    // add an image to the list of files
    addImage(imgFileName, image) {
        imgFileName = this.addFileToManifest(imgFileName);
        this.xml.addExtraFile(`Pictures/${imgFileName}`, image);
        return imgFileName;
    }
    // add a an image file to the manifest
    addFileToManifest(imgFileName) {
        const fileNameParts = imgFileName.split(".");
        const fileNameEnding = fileNameParts.pop() || "";
        const fileNameStart = fileNameParts.join(".");
        const manifestEl = this.manifestXml.query("manifest:manifest");
        let imgManifest = manifestEl?.query("manifest:file-entry", {
            "manifest:full-path": `Pictures/${imgFileName}`
        });
        let counter = 0;
        while (imgManifest) {
            // Name exists already, we change the name until we get a file name not yet included in manifest.
            imgFileName = `${fileNameStart}_${counter++}.${fileNameEnding}`;
            imgManifest = manifestEl?.query("manifest:file-entry", {
                "manifest:full-path": `Pictures/${imgFileName}`
            });
        }
        const string = `  <manifest:file-entry manifest:full-path="Pictures/${imgFileName}" manifest:media-type="image/${fileNameEnding}"/>`;
        manifestEl?.appendXML(string);
        return imgFileName;
    }
    // Find all images used in file and add these to the export zip.
    // TODO: This will likely fail on image types odt doesn't support such as
    // SVG. Try out and fix.
    exportImages() {
        const usedImgs = [];
        descendantNodes(this.docContent).forEach(node => {
            if (node.type === "image" && node.attrs?.image !== false) {
                const imageId = node.attrs?.image;
                if (imageId !== undefined && !usedImgs.includes(imageId)) {
                    usedImgs.push(imageId);
                }
            }
        });
        return new Promise(resolveExportImages => {
            const p = [];
            usedImgs.forEach(image => {
                const imgDBEntry = this.imageDB.db[String(image)];
                if (!imgDBEntry || !imgDBEntry.image) {
                    return;
                }
                p.push(get(imgDBEntry.image)
                    .then(response => response.blob())
                    .then(async (blob) => {
                    const wImgId = this.addImage(imgDBEntry.image.split("/").pop(), blob);
                    if (blob.type === "image/svg+xml") {
                        // Add PNG version in addition to SVG
                        const { blob: pngBlob, width, height } = await svg2png(blob);
                        const pngWImgId = this.addImage(imgDBEntry.image
                            .split("/")
                            .pop()
                            .replace(/.svg$/g, ".png"), pngBlob);
                        this.images[String(image)] = {
                            id: pngWImgId,
                            width,
                            height,
                            title: imgDBEntry.title,
                            type: blob.type,
                            svg: wImgId
                        };
                    }
                    else {
                        this.images[String(image)] = {
                            id: wImgId,
                            width: imgDBEntry.width,
                            height: imgDBEntry.height,
                            title: imgDBEntry.title,
                            type: blob.type,
                            svg: null
                        };
                    }
                }));
            });
            Promise.all(p).then(() => resolveExportImages());
        });
    }
}
//# sourceMappingURL=images.js.map