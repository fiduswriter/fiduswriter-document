import {convertDataURIToBlob as convertDataURIToBlobFn, get} from "fwtoolkit"

export interface ZipTextFile {
    filename: string
    contents: string
}

export interface ZipBinaryFile {
    url: string
    filename: string
    blob?: Blob
}

export interface ZipIncludeFile {
    url: string
    directory: string
    blob?: Blob
}

/** Creates a zip file.
 * @function zipFileCreator
 * @param textFiles A list of files in plain text format.
 * @param binaryFiles A list fo files that have to be downloaded from the internet before being included.
 * @param includeZips A list of zip files to be merged into the output zip file.
 * @param mimeType The mimetype of the file that is to be created.
 */

export class ZipFileCreator {
    textFiles: ZipTextFile[]
    binaryFiles: ZipBinaryFile[]
    zipFiles: ZipIncludeFile[]
    mimeType: string
    date: Date
    zipFs: any

    constructor(
        textFiles: ZipTextFile[] = [],
        binaryFiles: ZipBinaryFile[] = [],
        zipFiles: ZipIncludeFile[] = [],
        mimeType = "application/zip",
        date = new Date()
    ) {
        this.textFiles = textFiles
        this.binaryFiles = binaryFiles
        this.zipFiles = zipFiles
        this.mimeType = mimeType
        this.date = date
    }

    init() {
        return import("jszip").then(({default: JSZip}) => {
            ;(JSZip as any).defaults.date = this.date
            this.zipFs = new JSZip()
            if (this.mimeType !== "application/zip") {
                this.zipFs.file("mimetype", this.mimeType, {
                    compression: "STORE"
                })
            }

            return this.includeZips()
        })
    }

    includeZips() {
        const getZipBlobs = this.zipFiles.map(zipFile => {
            return get(zipFile.url)
                .then(response => response.blob())
                .then(blob => (zipFile.blob = blob))
        })
        return Promise.all(getZipBlobs)
            .then(() => {
                return this.zipFiles.map(zipFile => {
                    const zipDir =
                        zipFile.directory === ""
                            ? this.zipFs
                            : this.zipFs.folder(zipFile.directory)
                    return zipDir.loadAsync(zipFile.blob)
                })
            })
            .then(() => this.createZip())
    }

    createZip() {
        this.textFiles.forEach(textFile => {
            this.zipFs.file(textFile.filename, textFile.contents, {
                compression: "DEFLATE"
            })
        })
        const blobPromises = this.binaryFiles.map(binaryFile =>
            get(binaryFile.url)
                .then(response => response.blob())
                .then(blob =>
                    Promise.resolve({blob, filename: binaryFile.filename})
                )
        )
        return Promise.all(blobPromises).then(promises => {
            promises.forEach(promise =>
                this.zipFs.file(promise.filename, promise.blob, {
                    binary: true,
                    compression: "DEFLATE"
                })
            )
            return this.zipFs.generateAsync({
                type: "blob",
                mimeType: this.mimeType
            })
        })
    }

    // Legacy - remove in 3.12. Can be sued directly from function in common/blob.js
    convertDataURIToBlob(dataURI: string): Blob {
        return convertDataURIToBlobFn(dataURI)
    }
}
