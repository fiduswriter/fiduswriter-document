/**
 * Shared citation utilities for DOCX and ODT importers.
 */

import type {BibDB, FidusNode} from "../types.js"

interface CitationEntry {
    entry_key: string
    fields: Record<string, unknown>
    bib_type?: string
    [key: string]: unknown
}

interface CitationMetadata {
    entry_key: string
    prefix?: string
    suffix?: string
    locator?: string
    authorOnly?: boolean
    authorYear?: boolean
    suppressAuthor?: boolean
    [key: string]: unknown
}

interface CitationResult {
    isCitation: boolean
    entries: Record<string, CitationEntry>
    metadata?: CitationMetadata[]
}

function mergeBibEntries(
    entries: Record<string, CitationEntry>,
    bibliography: Record<string, CitationEntry>,
    bibDB: BibDB | false
): Record<string, string> {
    const keyMap: Record<string, string> = {}

    for (const entry of Object.values(entries)) {
        if (!entry || !entry.entry_key) {
            continue
        }
        const entryKey = entry.entry_key

        // Check whether this entry_key is already in the bibliography.
        const existing = Object.entries(bibliography).find(
            ([, bibEntry]) => bibEntry && bibEntry.entry_key === entryKey
        )

        if (existing) {
            keyMap[entryKey] = existing[0]
        } else {
            if (bibDB && Object.keys(entry.fields).length === 0) {
                // Jabref citations don't contain any fields. Look up values in bibDB instead
                const bibEntry = (Object.values(bibDB.db) as Array<Record<string, any>>).find(
                    bibEntry => bibEntry && bibEntry.entry_key === entryKey
                )
                if (bibEntry) {
                    entry.fields = JSON.parse(JSON.stringify(bibEntry.fields))
                    entry.bib_type = bibEntry.bib_type as string
                }
            }
            // TODO: add for jabref citations - according to entry_key import from user
            // library if useExternalDB is true
            const bibKey = String(Object.keys(bibliography).length + 1)
            bibliography[bibKey] = entry
            keyMap[entryKey] = bibKey
        }
    }

    return keyMap
}

export function citationResultToNode(
    result: CitationResult,
    bibliography: Record<string, any>,
    bibDB: BibDB | false = false
): FidusNode | null {
    if (!result || !result.isCitation || !result.entries) {
        return null
    }
    const entries = result.entries
    const metadata = result.metadata || []

    if (Object.keys(entries).length === 0) {
        return null
    }
    const keyMap = mergeBibEntries(entries, bibliography, bibDB)

    const references = Object.entries(entries).map(([, entry]) => {
        const entryKey = entry.entry_key
        const entryMetadata = metadata.find(meta => meta.entry_key === entryKey)
        return {
            id: keyMap[entryKey],
            prefix: entryMetadata?.prefix || "",
            locator: entryMetadata?.locator || entryMetadata?.suffix || ""
        }
    })

    if (references.length === 0) {
        return null
    }

    const format =
        metadata.length === 1 &&
        (metadata[0].authorOnly || metadata[0].authorYear)
            ? "textcite"
            : "autocite"

    return {
        type: "citation",
        attrs: {
            format,
            references
        }
    }
}
