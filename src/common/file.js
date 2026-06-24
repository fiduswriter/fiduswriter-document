import {escapeText} from "./text.js"

export const shortFileTitle = (title, path) => {
    if (!path.length || path.endsWith("/")) {
        return escapeText(title || gettext("Untitled"))
    }
    return escapeText(path.split("/").pop())
}

export const longFilePath = (title, path, prefix = "") => {
    if (!path.length) {
        path = "/"
    }
    if (path.endsWith("/")) {
        path += title.replace(/\//g, "") || gettext("Untitled")
    }
    if (prefix.length) {
        const pathParts = path.split("/")
        const fileName = pathParts.pop()
        pathParts.push(prefix + fileName)
        path = pathParts.join("/")
    }

    return path
}
