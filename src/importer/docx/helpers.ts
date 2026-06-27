export const normalizeText = (text: string | undefined | null): string => {
    if (!text) {
        return ""
    }
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim()
}
