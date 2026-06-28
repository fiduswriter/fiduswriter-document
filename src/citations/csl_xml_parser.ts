import {XMLParser} from "fast-xml-parser"

function convertNode(node: unknown): unknown {
    if (typeof node === "string") {
        return node
    }
    if (Array.isArray(node)) {
        return node.flatMap(convertNode)
    }
    if (typeof node !== "object" || node === null) {
        return undefined
    }
    const record = node as Record<string, unknown>
    const entries = Object.entries(record)
    // Text node
    if (entries.length === 1 && entries[0][0] === "#text") {
        return entries[0][1]
    }
    const attrs = (record[":@"] as Record<string, string>) || {}
    const children: unknown[] = []
    for (const [key, value] of entries) {
        if (key === ":@" || key === "#text" || key.startsWith("?")) {
            continue
        }
        const child = convertNode(value)
        if (child === undefined) {
            continue
        }
        children.push({name: key, attrs, children: child})
    }
    if (children.length === 0) {
        return []
    }
    if (children.length === 1) {
        return children[0]
    }
    return children
}

/**
 * Parse a CSL style XML string into the compact JSON object shape used by
 * citeproc-plus / citeproc-js.
 */
export function parseCSL(xml: string): Record<string, unknown> {
    const parser = new XMLParser({
        preserveOrder: true,
        ignoreAttributes: false,
        attributeNamePrefix: "",
        attributesGroupName: false,
        textNodeName: "#text"
    })
    const parsed = parser.parse(xml)
    const converted = convertNode(parsed)
    // The XML declaration is skipped, so the top level is the style node.
    return Array.isArray(converted) ? (converted[0] as Record<string, unknown>) : (converted as Record<string, unknown>)
}
