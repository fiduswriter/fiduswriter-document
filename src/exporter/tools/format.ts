import prettier from "prettier"
import * as xmlPluginModule from "@prettier/plugin-xml"

const xmlPlugin = (xmlPluginModule as any).default ?? xmlPluginModule

const baseOptions = {
    tabWidth: 4,
    printWidth: 80
}

export async function formatHtml(html: string): Promise<string> {
    return prettier.format(html, {
        parser: "html",
        ...baseOptions
    })
}

export async function formatCss(css: string): Promise<string> {
    return prettier.format(css, {
        parser: "css",
        ...baseOptions
    })
}

export async function formatXml(xml: string): Promise<string> {
    return prettier.format(xml, {
        parser: "xml",
        plugins: [xmlPlugin],
        xmlWhitespaceSensitivity: "ignore",
        ...baseOptions
    })
}
