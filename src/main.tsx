import { Notice, Plugin } from "obsidian"
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
      async (_source, el, ctx) => {
        if (!this.hardcoverClient) {
          new Notice("Hardcover API token not configured")
          return
        }

        el.empty()

        const container = el.createDiv({ cls: "hardcover-books" })

        const root = createRoot(container)
        root.render(
          <HardcoverQueryProvider>
            <BookList />
          </HardcoverQueryProvider>,
        )

        this.roots.set(el, root)

        ctx.addChild({
          containerEl: el,
          load: () => {},
          unload: () => {
            const root = this.roots.get(el)
            if (root) {
              root.unmount()
              this.roots.delete(el)
            }
          },
          addChild: (child: any) => child,
          removeChild: (child: any) => child,
          register: (event: any) => event,
          registerEvent: (event: any) => event,
          registerInterval: (interval: any) => interval,
          unregister: (event: any) => event,
          unregisterAll: () => {},
        } as any)
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
