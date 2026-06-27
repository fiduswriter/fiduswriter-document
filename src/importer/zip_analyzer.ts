import type JSZip from "jszip"

interface ZipAnalysis {
    hasConvertible: boolean
    format: string | null
    convertibleFile: {
        path: string
        entry: JSZip.JSZipObject
        fileName: string
        format: string
    } | null
    imageFiles: Array<{path: string; entry: JSZip.JSZipObject}>
    bibFile: JSZip.JSZipObject | null
}

interface ZipContents {
    images: Record<string, Blob>
    bibliography: string | null
    mainContent: File | null
}

export class ZipAnalyzer {
    zip: JSZip
    formats: string[]
    analysis: ZipAnalysis | null

    constructor(zip: JSZip, formats: string[] = []) {
        this.zip = zip
        this.formats = formats
        this.analysis = null
    }

    analyze(): ZipAnalysis {
        if (this.analysis) {
            return this.analysis
        }

        let convertibleFile: ZipAnalysis["convertibleFile"] = null
        const imageFiles: ZipAnalysis["imageFiles"] = []
        let bibFile: JSZip.JSZipObject | null = null

        // Analyze all files in the ZIP
        this.zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                const fileName = relativePath.split("/").pop() || ""
                const extension = fileName.split(".").pop()?.toLowerCase() || ""

                if (extension === "bib") {
                    bibFile = zipEntry
                } else if (
                    [
                        "avif",
                        "avifs",
                        "png",
                        "jpg",
                        "jpeg",
                        "gif",
                        "svg",
                        "webp"
                    ].includes(extension)
                ) {
                    imageFiles.push({path: relativePath, entry: zipEntry})
                } else if (this.formats.includes(extension)) {
                    // Store the first convertible file found
                    if (!convertibleFile) {
                        convertibleFile = {
                            path: relativePath,
                            entry: zipEntry,
                            fileName,
                            format: extension
                        }
                    }
                }
            }
        })

        this.analysis = {
            hasConvertible: Boolean(convertibleFile),
            format: convertibleFile
                ? (convertibleFile as Exclude<ZipAnalysis["convertibleFile"], null>).format
                : null,
            convertibleFile,
            imageFiles,
            bibFile
        }

        return this.analysis
    }

    async getContents(): Promise<ZipContents> {
        if (!this.analysis) {
            this.analyze()
        }

        const contents: ZipContents = {
            images: {},
            bibliography: null,
            mainContent: null
        }

        // Load main content file
        if (this.analysis!.hasConvertible && this.analysis!.convertibleFile) {
            const mainBlob =
                await this.analysis!.convertibleFile.entry.async("blob")
            contents.mainContent = new File(
                [mainBlob],
                this.analysis!.convertibleFile.fileName
            )
        }

        // Load images
        const imagePromises = this.analysis!.imageFiles.map(
            async ({path, entry}) => {
                const blob = await entry.async("blob")
                contents.images[path] = blob
                return {filename: path, blob}
            }
        )
        await Promise.all(imagePromises)

        // Load bibliography if present
        if (this.analysis!.bibFile) {
            contents.bibliography = await this.analysis!.bibFile.async("text")
        }

        return contents
    }
}
