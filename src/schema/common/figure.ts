import type {NodeSpec} from "prosemirror-model"

import {parseTracks} from "./track.js"

export function randomFigureId(): string {
    return "F" + Math.round(Math.random() * 10000000) + 1
}

let imageDBBroken = false

interface ImageDBEntry {
    file_type?: string
    image?: string
    original_file_type?: string
}

interface ImageDB {
    db: Record<number, ImageDBEntry>
    getDB?: () => Promise<unknown>
}

interface DecryptImage {
    (imageEntry: ImageDBEntry, dom: HTMLImageElement): Promise<string>
}

interface SchemaCached {
    imageDB?: ImageDB
    decryptImage?: DecryptImage
}

export const figure = {
    inline: false,
    allowGapCursor: false,
    selectable: true,
    group: "block",
    attrs: {
        category: {default: "none"},
        caption: {default: false},
        id: {default: false},
        track: {default: []},
        aligned: {default: "center"},
        width: {default: "100"}
    },
    content:
        "figure_caption image|figure_caption figure_equation|image figure_caption|figure_equation figure_caption",
    parseDOM: [
        {
            tag: "figure",
            getAttrs(dom: HTMLElement) {
                return {
                    category: dom.dataset.category,
                    caption: !!dom.dataset.captionHidden,
                    id: dom.id || false,
                    track: parseTracks(dom.dataset.track),
                    aligned: dom.dataset.aligned,
                    width: dom.dataset.width,
                    diff: dom.dataset.diff
                }
            }
        }
    ],
    toDOM(node) {
        const attrs: Record<string, unknown> = {
            id: node.attrs.id,
            class: `aligned-${node.attrs.aligned} image-width-${node.attrs.width}`,
            "data-aligned": node.attrs.aligned,
            "data-width": node.attrs.width,
            "data-category": node.attrs.category
        }
        if (!node.attrs.caption) {
            attrs["data-caption-hidden"] = true
        }
        if (node.attrs.track?.length) {
            attrs["data-track"] = JSON.stringify(node.attrs.track)
        }
        return ["figure", attrs, 0]
    }
} satisfies NodeSpec

function errorImageUrl(): string {
    return typeof staticUrl !== "undefined" ? staticUrl("img/error.avif") : "/static/img/error.avif"
}

export const image = {
    selectable: false,
    draggable: false,
    attrs: {
        image: {default: false}
    },
    parseDOM: [
        {
            tag: "img",
            getAttrs(dom: HTMLElement) {
                const image = Number.parseInt(dom.dataset.image || "")
                return {
                    image: isNaN(image) ? false : image
                }
            }
        }
    ],
    toDOM(node) {
        const dom = document.createElement("img")
        if (node.attrs.image !== false) {
            dom.dataset.image = String(node.attrs.image)
            const imageDB = (node.type.schema.cached as SchemaCached).imageDB
            if (imageDB) {
                const imageEntry = imageDB.db[node.attrs.image]
                if (imageEntry?.image) {
                    const isEncrypted =
                        imageEntry.file_type === "application/octet-stream"
                    if (isEncrypted) {
                        const decryptImage = (node.type.schema.cached as SchemaCached).decryptImage
                        if (decryptImage) {
                            decryptImage(imageEntry, dom)
                                .then(url => {
                                    dom.setAttribute("src", url)
                                    dom.dataset.imageSrc = url
                                })
                                .catch(() => {
                                    dom.setAttribute("src", errorImageUrl())
                                })
                        } else {
                            dom.setAttribute("src", errorImageUrl())
                        }
                    } else {
                        const imgSrc = imageEntry.image
                        dom.setAttribute("src", imgSrc)
                        dom.dataset.imageSrc = imgSrc
                    }
                } else {
                    /* The image was not present in the imageDB -- possibly because a collaborator just added it.
                    Try to reload the imageDB, but only once. If the image cannot be found in the updated
                    imageDB, do not attempt at reloading the imageDB if an image cannot be
                    found. */
                    if (imageDBBroken) {
                        dom.setAttribute("src", errorImageUrl())
                    } else {
                        imageDB.getDB?.().then(() => {
                            const refreshedEntry = imageDB.db[node.attrs.image]
                            if (refreshedEntry?.image) {
                                dom.setAttribute("src", refreshedEntry.image)
                                dom.dataset.imageSrc = refreshedEntry.image
                            } else {
                                imageDBBroken = true
                            }
                        })
                    }
                }
            }
        }
        return dom
    }
} satisfies NodeSpec

export const figure_equation = {
    selectable: false,
    draggable: false,
    attrs: {
        equation: {
            default: false
        }
    },
    parseDOM: [
        {
            tag: "div.figure-equation[data-equation]",
            getAttrs(dom: HTMLElement) {
                return {
                    equation: dom.dataset.equation
                }
            }
        }
    ],
    toDOM(node) {
        const dom = document.createElement("div")
        dom.dataset.equation = node.attrs.equation
        dom.classList.add("figure-equation")
        if (node.attrs.equation !== false) {
            import("mathlive").then(MathLive => {
                dom.innerHTML = MathLive.convertLatexToMarkup(
                    node.attrs.equation,
                    {
                        mathstyle: "displaystyle"
                    } as unknown as Record<string, unknown>
                )
            })
        }
        return dom
    }
} satisfies NodeSpec

export const figure_caption = {
    isolating: true,
    defining: true,
    content: "inline*",
    parseDOM: [{tag: "figcaption span.text"}],
    toDOM() {
        return [
            "figcaption",
            ["span", {class: "label"}],
            ["span", {class: "text"}, 0]
        ]
    }
} satisfies NodeSpec
