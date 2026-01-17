import { Notice, Plugin } from "obsidian"
import "react"
import { initializeHardcoverClient } from "@hooks/progress"
import { BookList } from "@ui/BookList"
import { HardcoverQueryProvider } from "@ui/QueryProvider"
import { createRoot, Root } from "react-dom/client"
import { HardcoverClient } from "@/client"
import {
  DEFAULT_SETTINGS,
  HardcoverSettingTab,
  MyPluginSettings,
} from "@/settings"

export default class HardcoverPlugin extends Plugin {
  settings: MyPluginSettings
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

    if (this.settings.hardcoverApiToken) {
      this.hardcoverClient = new HardcoverClient(
        this.settings.hardcoverApiToken,
      )
      initializeHardcoverClient(this.settings.hardcoverApiToken)
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

    this.addRibbonIcon("book", "Hardcover", (_evt: MouseEvent) => {
      if (!this.hardcoverClient) {
        new Notice("Hardcover API token not configured")
        return
      }
      this.testHardcoverConnection()
    })

    const statusBarItemEl = this.addStatusBarItem()
    statusBarItemEl.setText("Hardcover")

    this.addCommand({
      id: "hardcover-test-connection",
      name: "Test Hardcover connection",
      callback: () => this.testHardcoverConnection(),
    })

    this.addSettingTab(new HardcoverSettingTab(this.app, this))
  }

  private async testHardcoverConnection(): Promise<void> {
    if (!this.hardcoverClient) {
      new Notice("⚠️ Hardcover API token not configured")
      return
    }

    try {
      const result = await this.hardcoverClient.getUserCurrentBooks()
      const userBooks = result.me?.[0]?.user_books
      const bookCount = userBooks?.length ?? 0
      new Notice(`✅ Connected to Hardcover! Found ${bookCount} books.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      new Notice(`❌ Connection failed: ${message}`)
      console.error("Hardcover connection error:", error)
    }
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<MyPluginSettings>,
    )
  }

  async saveSettings() {
    await this.saveData(this.settings)
    if (this.settings.hardcoverApiToken) {
      this.hardcoverClient = new HardcoverClient(
        this.settings.hardcoverApiToken,
      )
      initializeHardcoverClient(this.settings.hardcoverApiToken)
    } else {
      this.hardcoverClient = null
    }
  }
}
