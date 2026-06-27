import type {FidusNode} from "../../types.js"

// Return a json that is the same as the existing json, but with all parts
// marked as hidden removed.

export const removeHidden = (
    node: FidusNode,
    // Whether to leave the outer part of the removed node.
    // True for tree-walking exporters, false for DOM-changing exporters.
    leaveStub = true,
    removeTableCaption = false,
    removeTableCaptionText = false,
    removeFigureCaption = false,
    removeFigureCaptionText = false
): FidusNode | false => {
    const returnNode: FidusNode = {type: node.type}

    Object.keys(node).forEach(key => {
        if (key !== "content") {
            ;(returnNode as unknown as Record<string, unknown>)[key] = (node as unknown as Record<string, unknown>)[key]
        }
    })
    if (node.attrs?.hidden) {
        return leaveStub ? returnNode : false
    } else if ("table_caption" === node.type) {
        if (removeTableCaption) {
            return leaveStub ? returnNode : false
        } else if (removeTableCaptionText) {
            return returnNode
        }
    } else if ("figure_caption" === node.type) {
        if (removeFigureCaption) {
            return leaveStub ? returnNode : false
        } else if (removeFigureCaptionText) {
            return returnNode
        }
    }
    if (node.attrs?.caption === false) {
        if (node.attrs.category === "none") {
            if (node.type === "figure") {
                removeFigureCaption = true
            } else {
                removeTableCaption = true
            }
        } else {
            if (node.type === "figure") {
                removeFigureCaptionText = true
            } else {
                removeTableCaptionText = true
            }
        }
    }
    if (node.content) {
        returnNode.content = []
        node.content.forEach(child => {
            const cleanedChild = removeHidden(
                child,
                leaveStub,
                removeTableCaption,
                removeTableCaptionText,
                removeFigureCaption,
                removeFigureCaptionText
            )
            if (cleanedChild) {
                returnNode.content!.push(cleanedChild)
            }
        })
    }
    return returnNode
}

export const descendantNodes = (node: FidusNode): FidusNode[] => {
    let returnValue: FidusNode[] = [node]
    if (node.content) {
        node.content.forEach(childNode => {
            returnValue = returnValue.concat(descendantNodes(childNode))
        })
    }
    return returnValue
}

export const textContent = (node: FidusNode): string =>
    descendantNodes(node).reduce((returnString, subNode) => {
        if (subNode.text) {
            returnString += subNode.text
        }
        return returnString
    }, "")

// PM/HTML don't have cells that have been covered, but in ODT/DOCX, these cells
// need to be present. So we add them.

interface TableCellAttrs {
    rowspan?: number
    colspan?: number
    [key: string]: unknown
}

const addCoveredTableCells = (node: FidusNode): void => {
    const rows = node.content!
    const columns = (rows[0].content || []).reduce(
        (cols, cell) => cols + ((cell.attrs?.colspan as number) || 1),
        0
    )
    // Add empty cells for col/rowspan
    const fixedTableMatrix: FidusNode[] = Array.from({length: rows.length}, () => ({
        type: "table_row",
        content: Array.from({length: columns}, () => ({} as FidusNode))
    }))
    let rowIndex = -1
    rows.forEach(row => {
        let columnIndex = 0
        rowIndex++
        if (!row.content) {
            return
        }
        row.content.forEach(cell => {
            while (fixedTableMatrix[rowIndex].content![columnIndex]) {
                columnIndex++
            }
            const rowspan = ((cell.attrs as TableCellAttrs)?.rowspan as number) || 1
            const colspan = ((cell.attrs as TableCellAttrs)?.colspan as number) || 1
            for (let i = 0; i < rowspan; i++) {
                for (let j = 0; j < colspan; j++) {
                    let fixedCell: FidusNode
                    if (i === 0 && j === 0) {
                        fixedCell = cell
                    } else {
                        fixedCell = {
                            type: "table_cell",
                            attrs: {
                                rowspan: rowspan > 1 ? 0 : 1,
                                colspan: colspan > 1 ? 0 : 1
                            } as TableCellAttrs
                        }
                    }
                    fixedTableMatrix[rowIndex + i].content![columnIndex + j] =
                        fixedCell
                }
            }
        })
    })
    node.content = fixedTableMatrix
}

export const fixTables = (node: FidusNode): FidusNode => {
    if (node.type === "table_body") {
        addCoveredTableCells(node)
    }
    if (node.content) {
        node.content.forEach(child => fixTables(child))
    }
    return node
}
