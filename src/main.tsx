import { MarkdownRenderChild, Notice, Plugin } from "obsidian"
import "react"
import { initializeHardcoverClient } from "@hooks/client"
import { BookList } from "@ui/BookList"
import { HardcoverQueryProvider } from "@ui/QueryProvider"
import { createRoot, Root } from "react-dom/client"
import { HardcoverClient } from "@/client"
import {
  DEFAULT_SETTINGS,
  HardcoverSettingTab,
  PluginSettings,
} from "@/settings"
import { TOKEN_KEY } from "./constants"
import { BookStatusKey } from "./types"

export interface HardcoverParams {
  limit: number
  status: BookStatusKey
}

const DEFAULT_PARAMS: HardcoverParams = {
  limit: 10,
  status: "READING",
}

export default class HardcoverPlugin extends Plugin {
  settings: PluginSettings
  hardcoverClient: HardcoverClient | null = null
  private roots: Map<HTMLElement, Root> = new Map()

  onunload(): void {
    this.roots.forEach((root) => {
      root.unmount()
    })
    this.roots.clear()
  }

  async onload() {
    await this.loadSettings()

    const apiToken = this.app.secretStorage.getSecret(TOKEN_KEY)
    if (apiToken) {
      this.hardcoverClient = new HardcoverClient(apiToken)
      initializeHardcoverClient(apiToken)
    }

    this.registerMarkdownCodeBlockProcessor(
      "hardcover",
      async (src, el, ctx) => {
        let userParams: Partial<HardcoverParams> = {}
        try {
          userParams = JSON.parse(src)
        } catch (error) {
          console.error("Invalid JSON in code block", error)
        }
        const params: HardcoverParams = { ...DEFAULT_PARAMS, ...userParams }

        if (!this.hardcoverClient) {
          new Notice("Hardcover API token not configured")
          return
        }

        const existingRoot = this.roots.get(el)
        if (existingRoot) {
          existingRoot.unmount()
          this.roots.delete(el)
        }

        el.empty()

        const container = el.createDiv({ cls: "hardcover-books" })

        const root = createRoot(container)
        root.render(
          <HardcoverQueryProvider>
            <BookList params={params} />
          </HardcoverQueryProvider>,
        )

        this.roots.set(el, root)

        ctx.addChild({
          containerEl: el,
          load: () => {},
          onload: () => {},
          onunload: () => {},
          unload: () => {
            const root = this.roots.get(el)
            if (root) {
              root.unmount()
              this.roots.delete(el)
            }
          },
          addChild: (child) => child,
          removeChild: (child) => child,
          register: (event) => event,
          registerEvent: (event) => event,
          registerDomEvent: () => {},
          registerInterval: (interval) => interval,
        } satisfies MarkdownRenderChild)
      },
    )

    this.addSettingTab(new HardcoverSettingTab(this.app, this))
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<PluginSettings>,
    )
  }

  async saveSettings() {
    await this.saveData(this.settings)
    const apiToken = this.app.secretStorage.getSecret(TOKEN_KEY)
    if (apiToken) {
      this.hardcoverClient = new HardcoverClient(apiToken)
      initializeHardcoverClient(apiToken)
    } else {
      this.hardcoverClient = null
    }
  }
}
