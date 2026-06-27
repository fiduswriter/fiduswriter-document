import {docSchema} from "./document/index.js"

export class SchemaExport {
    schema: typeof docSchema

    constructor() {
        this.schema = docSchema
    }

    init(): string {
        const spec: {nodes: Record<string, unknown>; marks: Record<string, unknown>} = {
            nodes: {},
            marks: {}
        }
        this.schema.spec.nodes.forEach(
            (key, value) => (spec.nodes[key] = value)
        )
        this.schema.spec.marks.forEach(
            (key, value) => (spec.marks[key] = value)
        )
        return JSON.stringify(spec)
    }
}
