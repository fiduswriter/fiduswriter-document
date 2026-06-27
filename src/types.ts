/**
 * Core types shared across the @fiduswriter/document package.
 *
 * These types describe the JSON-shaped document tree that Fidus Writer stores
 * and exchanges with its importers/exporters. They intentionally mirror the
 * ProseMirror schema while staying serialisable.
 */

/** A generic JSON value. */
export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | {[key: string]: JSONValue}

/** Attributes that every Fidus node may carry. */
export interface NodeAttrs {
    [key: string]: unknown
    id?: string
    track?: Track[]
    hidden?: boolean
}

/** A tracked change entry attached to a node or mark. */
export interface Track {
    type: "insertion" | "deletion" | "block_change"
    user: number
    username: string
    date: number
    approved?: boolean
    before?: FidusNode
}

/** A Fidus document mark (inline formatting or annotation). */
export interface FidusMark {
    type: string
    attrs?: NodeAttrs
}

/** A node in the Fidus document tree. */
export interface FidusNode {
    type: string
    attrs?: NodeAttrs
    content?: FidusNode[]
    marks?: FidusMark[]
    text?: string
}

/** Top-level document settings stored on the `doc` node. */
export interface DocSettings {
    documentstyle?: string
    tracked?: boolean
    citationstyle?: string
    citationstyles?: string[]
    language?: string
    languages?: string[]
    papersize?: string
    papersizes?: string[]
    footnote_marks?: string[]
    footnote_elements?: string[]
    bibliography_header?: FidusNode
    metadata?: Record<string, JSONValue>
    [key: string]: unknown
}

/** The root Fidus document node. */
export interface FidusDoc {
    type: "doc"
    attrs?: DocSettings
    content: FidusNode[]
}

/** A fully populated document object passed to exporters. */
export interface ExportDoc {
    title: string
    path?: string
    content: FidusNode[]
    settings: DocSettings
    comments?: Record<string, CommentData>
    version?: string
}

/** A single comment thread. */
export interface CommentData {
    id: number
    user: number
    username: string
    date: number
    resolved?: boolean
    comments: Array<{user: number; username: string; date: number; comment: string}>
}

/** A bibliographic database entry (format depends on the CSL engine). */
export interface BibDBEntry {
    [key: string]: JSONValue | undefined
}

export type BibDB = Record<string, BibDBEntry>

/** An entry in the image database. */
export interface ImageDBEntry {
    id: number
    title?: string
    file_type?: string
    image?: string | ArrayBuffer | Blob
    copyright?: Record<string, JSONValue>
    [key: string]: unknown
}

export type ImageDB = Record<string, ImageDBEntry>

/** A CSL/CSL-M stylesheet reference. */
export interface CSL {
    citationType?: string
    [key: string]: JSONValue | undefined
}

/** Common constructor options for exporters. */
export interface ExporterOptions {
    doc: ExportDoc
    templateUrl?: string
    bibDB?: BibDB
    imageDB?: ImageDB
    csl?: CSL
}

/** JSON representation of a DOM node used by the native exporter. */
export interface NativeDomNode {
    t?: string
    co?: string
    nn?: string
    a?: Array<[string, string]>
    c?: NativeDomNode[]
}
