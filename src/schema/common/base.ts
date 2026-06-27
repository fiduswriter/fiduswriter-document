import type {MarkSpec, NodeSpec} from "prosemirror-model"

import {parseTracks} from "./track.js"

// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
export const paragraph = {
    group: "block",
    content: "inline*",
    attrs: {
        track: {
            default: []
        }
    },
    parseDOM: [
        {
            tag: "p",
            getAttrs(dom: HTMLElement) {
                return {
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs =
            node.attrs.track && node.attrs.track.length
                ? {"data-track": JSON.stringify(node.attrs.track)}
                : {}
        return ["p", attrs, 0]
    }
} satisfies NodeSpec

// :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
export const blockquote = {
    content: "block+",
    group: "block",
    attrs: {
        track: {
            default: []
        }
    },
    marks: "annotation",
    defining: true,
    parseDOM: [
        {
            tag: "blockquote",
            getAttrs(dom: HTMLElement) {
                return {
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs =
            node.attrs.track && node.attrs.track.length
                ? {"data-track": JSON.stringify(node.attrs.track)}
                : {}
        return ["blockquote", attrs, 0]
    }
} satisfies NodeSpec

// :: NodeSpec A horizontal rule (`<hr>`).
export const horizontal_rule = {
    group: "block",
    attrs: {
        track: {
            default: []
        }
    },
    parseDOM: [
        {
            tag: "hr",
            getAttrs(dom: HTMLElement) {
                return {
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs =
            node.attrs.track && node.attrs.track.length
                ? {"data-track": JSON.stringify(node.attrs.track)}
                : {}
        return ["hr", attrs]
    }
} satisfies NodeSpec

export const underline = {
    parseDOM: [{tag: "span.underline"}],
    toDOM() {
        return ["span", {class: "underline"}, 0]
    }
} satisfies MarkSpec

export const sup = {
    parseDOM: [{tag: "sup"}],
    toDOM() {
        return ["sup", 0]
    },
    excludes: "sub"
} satisfies MarkSpec

export const sub = {
    parseDOM: [{tag: "sub"}],
    toDOM() {
        return ["sub", 0]
    },
    excludes: "sup"
} satisfies MarkSpec

export const code = {
    parseDOM: [{tag: "code"}],
    toDOM() {
        return ["code", 0]
    },
    excludes: "strong em underline link sup sub"
} satisfies MarkSpec
