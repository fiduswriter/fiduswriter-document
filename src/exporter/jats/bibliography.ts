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
    literal?: string
    family?: string
    given?: string
    prefix?: string
    suffix?: string
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
                    return `<collab>${convertTexts((a.literal) as unknown as FidusNode[])}</collab>`
                }
                let nameStart = `<name><surname>${convertTexts((a.family || "") as unknown as FidusNode[])}</surname> <given-names>${convertTexts((a.given || "") as unknown as FidusNode[])}</given-names>`
                if (a.prefix && a.prefix.length) {
                    nameStart += ` <prefix>${convertTexts((a.prefix) as unknown as FidusNode[])}</prefix>`
                }
                if (a.suffix && a.suffix.length) {
                    nameStart += ` <suffix>${convertTexts((a.suffix) as unknown as FidusNode[])}</suffix>`
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
            start += `<source>${convertTexts((String(fields.shortjournal || fields.booktitle || fields.journaltitle) as unknown as FidusNode[]))}</source>`
            start += `<article-title>${convertTexts((String(fields.title) as unknown as FidusNode[]))}</article-title>`
        } else {
            start += `<source>${convertTexts((String(fields.title) as unknown as FidusNode[]))}</source>`
        }
    }

    // editors
    if (fields.editor && Array.isArray(fields.editor) && fields.editor.length) {
        start += `<person-group person-group-type="editor">${fields.editor
            .map((editor: unknown) => {
                const e = editor as NameLike
                if (e.literal) {
                    return `<collab>${convertTexts((e.literal) as unknown as FidusNode[])}</collab>`
                }
                let nameStart = `<name><surname>${convertTexts((e.family || "") as unknown as FidusNode[])}</surname> <given-names>${convertTexts((e.given || "") as unknown as FidusNode[])}</given-names>`
                const nameEnd = "</name>"
                if (e.prefix && e.prefix.length) {
                    nameStart += ` <prefix>${convertTexts((e.prefix) as unknown as FidusNode[])}</prefix>`
                }
                if (e.suffix && e.suffix.length) {
                    nameStart += ` <suffix>${convertTexts((e.suffix) as unknown as FidusNode[])}</suffix>`
                }
                return nameStart + nameEnd
            })
            .join(", ")}</person-group>`
    }

    // publisher
    if (fields.publisher && Array.isArray(fields.publisher) && fields.publisher.length) {
        start += fields.publisher
            .map(
                publisher =>
                    `<publisher-name>${convertTexts((String(publisher) as unknown as FidusNode[]))}</publisher-name>`
            )
            .join("")
    }

    // location
    if (fields.location && Array.isArray(fields.location) && fields.location.length) {
        start += fields.location
            .map(
                location =>
                    `<publisher-loc>${convertTexts((String(location) as unknown as FidusNode[]))}</publisher-loc>`
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
        start += `<volume>${convertTexts((String(fields.volume) as unknown as FidusNode[]))}</volume>`
    }

    // issue
    if (fields.issue && String(fields.issue).length) {
        start += `<issue>${convertTexts((String(fields.issue) as unknown as FidusNode[]))}</issue>`
    }

    // pages
    if (fields.pages && Array.isArray(fields.pages) && fields.pages.length) {
        const pages = fields.pages as Array<string[]>
        start += `<fpage>${convertTexts((pages[0][0]) as unknown as FidusNode[])}</fpage>`
        const lastPageGroup = pages.slice(-1)[0]
        start += `<lpage>${convertTexts((lastPageGroup.slice(-1)[0]) as unknown as FidusNode[])}</lpage>`
        if (pages.length > 1) {
            start += `<page-range>${pages
                .map(pageGroup => pageGroup.map(page => convertTexts((page) as unknown as FidusNode[])).join("-"))
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
