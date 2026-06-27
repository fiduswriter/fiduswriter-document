import {DOMParser, DOMSerializer, Node} from "prosemirror-model"

import {fnSchema} from "./footnotes.js"

// Convert the footnote HTML stored with the marker to a PM node representation of the footnote.
export const htmlToFnNode = (content: string): unknown[] => {
    const footnoteDOM = document.createElement("div")
    footnoteDOM.classList.add("footnote-container")
    footnoteDOM.innerHTML = content
    const node = DOMParser.fromSchema(fnSchema).parse(footnoteDOM, {
        preserveWhitespace: true,
        topNode: false as unknown as Node
    })
    const firstChild = node.firstChild
    if (!firstChild) {
        return []
    }
    return firstChild.toJSON().content
}

export const fnNodeToPmNode = (fnContents: unknown[]): Node => {
    const footnote = {
        type: "footnotecontainer",
        content: fnContents
    }
    return Node.fromJSON(fnSchema, footnote)
}

export const fnNodeToHtml = (jsonString: unknown[]): string => {
    const pmNode = fnNodeToPmNode(jsonString),
        serializer = DOMSerializer.fromSchema(fnSchema)
    const dom = serializer.serializeNode(pmNode)
    return dom instanceof HTMLElement ? dom.innerHTML : ""
}
