/**
 * Ambient type declarations for dependencies that do not ship their own types.
 */

declare module "downloadjs" {
    /**
     * Trigger a browser download of the given data.
     * @param data - File content (Blob or string).
     * @param filename - Suggested filename for the download.
     * @param mimeType - MIME type of the data.
     */
    function download(
        data: Blob | string,
        filename?: string,
        mimeType?: string
    ): void
    export default download
}

declare module "pretty" {
    /**
     * Pretty-print HTML/XML markup.
     * @param input - Markup string to format.
     * @param options - Formatting options.
     */
    function pretty(input: string, options?: {ocd?: boolean}): string
    export default pretty
}

declare module "@vivliostyle/print" {
    /**
     * Render the given HTML with Vivliostyle for printing.
     * @param html - HTML content to print.
     * @param config - Optional print configuration.
     */
    export function printHTML(
        html: string,
        config?: Record<string, unknown>
    ): Promise<unknown>
}
