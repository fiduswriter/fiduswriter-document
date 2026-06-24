export {escapeText, unescapeText, noSpaceTmp} from "./text.js"
export {convertDataURIToBlob} from "./blob.js"
export {shortFileTitle, longFilePath} from "./file.js"
export {get, post, postJson} from "./network.js"

export const addAlert = (type, message) => {
    if (typeof console !== "undefined") {
        console.log(`[@fiduswriter/document alert][${type}] ${message}`)
    }
}

export const deactivateWait = () => {}
