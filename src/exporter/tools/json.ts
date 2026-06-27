import type {NativeDomNode} from "../../types.js"

/** Same functionality as objToNode/nodeToObj in diffDOM.js, but also offers
 *  output in XHTML format (obj2Node) and without form support.
 */
export const obj2Node = (
    obj: NativeDomNode | undefined,
    docType?: "xhtml"
): Node | false => {
    let parser: Document
    if (obj === undefined) {
        return false
    }
    if (docType === "xhtml") {
        parser = new window.DOMParser().parseFromString("<xml/>", "text/xml")
    } else {
        parser = document
    }

    function inner(obj: NativeDomNode, insideSvg = false): Node {
        let node: Node
        if (Object.prototype.hasOwnProperty.call(obj, "t")) {
            node = parser.createTextNode(obj.t as string)
        } else if (Object.prototype.hasOwnProperty.call(obj, "co")) {
            node = parser.createComment(obj.co as string)
        } else {
            if (obj.nn === "svg" || insideSvg) {
                node = parser.createElementNS(
                    "http://www.w3.org/2000/svg",
                    obj.nn as string
                )
                insideSvg = true
            } else if (obj.nn === "script") {
                // Do not allow scripts
                return parser.createTextNode("")
            } else {
                node = parser.createElement((obj.nn as string).toLowerCase())
            }
            if (obj.a) {
                for (let i = 0; i < obj.a.length; i++) {
                    ;(node as Element).setAttribute(obj.a[i][0], obj.a[i][1])
                }
            }
            if (obj.c) {
                for (let i = 0; i < obj.c.length; i++) {
                    node.appendChild(inner(obj.c[i], insideSvg))
                }
            }
        }
        return node
    }
    return inner(obj)
}

export const node2Obj = (node: Node): NativeDomNode => {
    const obj: NativeDomNode = {}

    if (node.nodeType === 3) {
        obj.t = (node as Text).data
    } else if (node.nodeType === 8) {
        obj.co = (node as Comment).data
    } else {
        obj.nn = node.nodeName
        const element = node as Element
        if (element.attributes?.length > 0) {
            obj.a = []
            for (let i = 0; i < element.attributes.length; i++) {
                obj.a.push([
                    element.attributes[i].name,
                    element.attributes[i].value
                ])
            }
        }
        if (node.childNodes?.length > 0) {
            obj.c = []
            for (let i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i]) {
                    obj.c.push(node2Obj(node.childNodes[i]))
                }
            }
        }
    }
    return obj
}
