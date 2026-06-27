import type {NodeSpec} from "prosemirror-model"

import {addTracks, parseTracks} from "./track.js"

// :: NodeSpec
// An ordered list [node spec](#model.NodeSpec). Has a single
// attribute, `order`, which determines the number at which the list
// starts counting, and defaults to 1. Represented as an `<ol>`
// element.
export const ordered_list = {
    group: "block",
    content: "list_item+",
    attrs: {
        id: {default: false},
        order: {default: 1},
        track: {default: []}
    },
    parseDOM: [
        {
            tag: "ol",
            getAttrs(dom: HTMLElement) {
                return {
                    id: dom.id || false,
                    order: dom.hasAttribute("start")
                        ? Number.parseInt(dom.getAttribute("start") || "1")
                        : 1,
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs: Record<string, unknown> = {id: node.attrs.id}
        if (node.attrs.order !== 1) {
            attrs.start = node.attrs.order
        }
        addTracks(node, attrs)
        return ["ol", attrs, 0]
    }
} satisfies NodeSpec

export function randomListId(): string {
    return "L" + Math.round(Math.random() * 10000000) + 1
}

// :: NodeSpec
// A bullet list node spec, represented in the DOM as `<ul>`.
export const bullet_list = {
    group: "block",
    content: "list_item+",
    attrs: {
        id: {default: false},
        track: {default: []}
    },
    parseDOM: [
        {
            tag: "ul",
            getAttrs(dom: HTMLElement) {
                return {
                    id: dom.id || false,
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs: Record<string, unknown> = {id: node.attrs.id}
        addTracks(node, attrs)
        return ["ul", attrs, 0]
    }
} satisfies NodeSpec

// :: NodeSpec
// A list item (`<li>`) spec.
export const list_item = {
    content: "block+",
    marks: "annotation",
    attrs: {
        track: {default: []}
    },
    parseDOM: [
        {
            tag: "li",
            getAttrs(dom: HTMLElement) {
                return {
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs: Record<string, unknown> = {}
        addTracks(node, attrs)
        return ["li", attrs, 0]
    },
    defining: true
} satisfies NodeSpec
