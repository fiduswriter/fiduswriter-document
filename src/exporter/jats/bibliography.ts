import {escapeText} from "fwtoolkit"

import type {BibDBEntry, FidusNode} from "../../types.js"
import {convertTexts} from "./text.js"

// This list is based on values listed at https://jats.nlm.nih.gov/archiving/tag-library/1.2/attribute/publication-type.html
// And the advice given here: https://jats4r.org/citations/#recommendation
const PUBLICATION_TYPES: Record<string, string> = {
    article: "journal",
    "article-journal": "journal",
    "article-magazine": "journal",
    "article-newspaper": "journal",
    book: "book",
    bookinbook: "book",
    booklet: "book",
    chapter: "book",
    collection: "standard",
    dataset: "dataset",
    "entry-dictionary": "standard",
    "entry-encyclopedia": "standard",
    inbook: "book",
    incollection: "book",
    inproceedings: "standard",
    inreference: "standard",
    manual: "book",
    misc: "standard",
    mvbook: "book",
    mvcollection: "standard",
    mvproceedings: "book",
    mvreference: "standard",
    online: "standard",
    patent: "patent",
    periodical: "book",
    post: "standards",
    "post-weblog": "standard",
    proceedings: "book",
    reference: "standard",
    report: "report",
    review: "review",
    suppbook: "book",
    suppcollection: "book",
    suppperiodical: "journal",
    thesis: "standard",
    unpublished: "standard"
}

interface NameLike {
    literal?: string | FidusNode[]
    family?: string | FidusNode[]
    given?: string | FidusNode[]
    prefix?: string | FidusNode[]
    suffix?: string | FidusNode[]
}

/**
 * Serialize a bibliographic field value. CSL fields may be plain strings
 * or rich-text node arrays, so we handle both.
 */
function serializeField(value: unknown): string {
    if (Array.isArray(value)) {
        // Array of Fidus nodes (rich text)
        return convertTexts(value as FidusNode[])
    }
    if (typeof value === "string") {
        return escapeText(value)
    }
    return escapeText(String(value || ""))
}

export function jatsBib(bib: BibDBEntry, id: number): string {
    let start = "",
        end = ""
    start += `<ref id="ref-${id}">`
    end = "</ref>" + end
    // Type
    const publicationType = PUBLICATION_TYPES[bib.bib_type || ""] ?? "standard"
    start += `<element-citation publication-type="${publicationType}">`
    end = "</element-citation>" + end

    const fields = (bib.fields || {}) as Record<string, unknown>

    // authors
    if (fields.author && Array.isArray(fields.author) && fields.author.length) {
        start += `<person-group person-group-type="author">${fields.author
            .map((author: unknown) => {
                const a = author as NameLike
                if (a.literal) {
                    return `<collab>${serializeField(a.literal)}</collab>`
                }
                let nameStart = `<name><surname>${serializeField(
                    a.family || ""
                )}</surname> <given-names>${serializeField(
                    a.given || ""
                )}</given-names>`
                if (a.prefix && a.prefix.length) {
                    nameStart += ` <prefix>${serializeField(a.prefix)}</prefix>`
                }
                if (a.suffix && a.suffix.length) {
                    nameStart += ` <suffix>${serializeField(a.suffix)}</suffix>`
                }
                const nameEnd = "</name>"
                return nameStart + nameEnd
            })
            .join(", ")}</person-group>`
    }

    // title && container title
    if (fields.title) {
        if (
            fields.shortjournal ||
            fields.booktitle ||
            fields.journaltitle
        ) {
            start += `<source>${serializeField(
                fields.shortjournal || fields.booktitle || fields.journaltitle
            )}</source>`
            start += `<article-title>${serializeField(fields.title)}</article-title>`
        } else {
            start += `<source>${serializeField(fields.title)}</source>`
        }
    }

    // editors
    if (fields.editor && Array.isArray(fields.editor) && fields.editor.length) {
        start += `<person-group person-group-type="editor">${fields.editor
            .map((editor: unknown) => {
                const e = editor as NameLike
                if (e.literal) {
                    return `<collab>${serializeField(e.literal)}</collab>`
                }
                let nameStart = `<name><surname>${serializeField(
                    e.family || ""
                )}</surname> <given-names>${serializeField(
                    e.given || ""
                )}</given-names>`
                const nameEnd = "</name>"
                if (e.prefix && e.prefix.length) {
                    nameStart += ` <prefix>${serializeField(e.prefix)}</prefix>`
                }
                if (e.suffix && e.suffix.length) {
                    nameStart += ` <suffix>${serializeField(e.suffix)}</suffix>`
                }
                return nameStart + nameEnd
            })
            .join(", ")}</person-group>`
    }

    // publisher
    if (
        fields.publisher &&
        Array.isArray(fields.publisher) &&
        fields.publisher.length
    ) {
        start += fields.publisher
            .map(
                publisher =>
                    `<publisher-name>${serializeField(publisher)}</publisher-name>`
            )
            .join("")
    }

    // location
    if (
        fields.location &&
        Array.isArray(fields.location) &&
        fields.location.length
    ) {
        start += fields.location
            .map(
                location =>
                    `<publisher-loc>${serializeField(location)}</publisher-loc>`
            )
            .join("")
    }

    // date
    if (fields.date && String(fields.date).length) {
        const date = String(fields.date)
        const dateParts = date.split("-")
        start += `<date iso-8601-date="${date}" date-type="published">${
            dateParts.length > 2 ? `<day>${dateParts[2]}</day>` : ""
        }${
            dateParts.length > 1 ? `<month>${dateParts[1]}</month>` : ""
        }<year>${dateParts[0]}</year></date>`
    }

    // volume
    if (fields.volume && String(fields.volume).length) {
        start += `<volume>${serializeField(fields.volume)}</volume>`
    }

    // issue
    if (fields.issue && String(fields.issue).length) {
        start += `<issue>${serializeField(fields.issue)}</issue>`
    }

    // pages
    if (fields.pages && Array.isArray(fields.pages) && fields.pages.length) {
        const pages = fields.pages as Array<string[]>
        start += `<fpage>${serializeField(pages[0][0])}</fpage>`
        const lastPageGroup = pages.slice(-1)[0]
        start += `<lpage>${serializeField(
            lastPageGroup.slice(-1)[0]
        )}</lpage>`
        if (pages.length > 1) {
            start += `<page-range>${pages
                .map(pageGroup =>
                    pageGroup.map(page => serializeField(page)).join("-")
                )
                .join(", ")}</page-range>`
        }
    }

    // doi
    if (fields.doi && String(fields.doi).length) {
        start += `<pub-id pub-id-type="doi">${escapeText(String(fields.doi))}</pub-id>`
    }

    // url
    if (fields.url && String(fields.url).length) {
        start += `<ext-link ext-link-type="web" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${escapeText(String(fields.url))}"/>`
    }

    // url date
    if (fields.urldate && String(fields.urldate).length) {
        const date = String(fields.urldate)
        const dateParts = date.split("-")
        start += `<date-in-citation content-type="access-date" iso-8601-date="${date}">${
            dateParts.length > 2 ? `<day>${dateParts[2]}</day>` : ""
        }${
            dateParts.length > 1 ? `<month>${dateParts[1]}</month>` : ""
        }<year>${dateParts[0]}</year></date-in-citation>`
    }

    return start + end
}
