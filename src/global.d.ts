/**
 * Global functions provided by Fidus Writer's runtime environment.
 * These are injected by the Django JavaScript catalog and other runtime scripts.
 */
declare function gettext(msgid: string): string

declare function interpolate(
    fmt: string,
    args: Array<string | number>,
    named?: boolean
): string

declare function staticUrl(path: string): string

/**
 * citeproc-plus ships no TypeScript declarations. Declare the shape we rely on
 * so that src/citations/create_csl.ts can import CSL without ts7016 errors.
 */
declare module "citeproc-plus/dist/index.js" {
    export class CSL {
        styles: Record<string, unknown>
        locales: Record<string, unknown>
        getStyle(name: string): Promise<unknown>
        getLocale(style: unknown, lang: string, forceLocale?: string): Promise<unknown>
        getEngine(
            sys: unknown,
            styleId: string,
            lang: string,
            forceLocale?: string
        ): Promise<unknown>
        getEngineSync(
            sys: unknown,
            styleId: string,
            lang: string,
            forceLocale?: string
        ): unknown
    }
}
