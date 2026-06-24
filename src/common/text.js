export const escapeText = text => {
    if (typeof text !== "string") {
        return String(text)
    }
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(
            /[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g,
            ""
        ) // invalid in XML chars
}

export const unescapeText = text =>
    text
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")

/**
 * Turn string literals into single line, removing spaces at start of line
 */
export const noSpaceTmp = (strings, ...values) => {
    const tmpStrings = Array.from(strings)

    let combined = ""
    while (tmpStrings.length > 0 || values.length > 0) {
        if (tmpStrings.length > 0) {
            combined += tmpStrings.shift()
        }
        if (values.length > 0) {
            combined += values.shift()
        }
    }

    let out = ""
    combined.split("\n").forEach(line => {
        out += line.replace(/^\s*/g, "")
    })
    return out
}
