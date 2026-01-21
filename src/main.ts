import { initializeHardcoverClient } from "@hooks/client"
import BookList from "@ui/BookList.svelte"
import { Notice, Plugin } from "obsidian"
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

  onunload(): void {}

  async onload() {
    await this.loadSettings()

    const apiToken = this.app.secretStorage.getSecret(TOKEN_KEY)
    if (apiToken) {
      this.hardcoverClient = new HardcoverClient(apiToken)
      initializeHardcoverClient(apiToken)
    }

    this.registerMarkdownCodeBlockProcessor(
      "hardcover",
      async (src, el, _ctx) => {
        let userParams: Partial<HardcoverParams> = {}
        try {
          userParams = JSON.parse(src)
        } catch (error) {
          console.error("Invalid JSON in code block", error)
        }
        const params: HardcoverParams = {
          ...DEFAULT_PARAMS,
          ...userParams,
        }

        if (!this.hardcoverClient) {
          new Notice("Hardcover API token not configured")
          return
        }

        try {
          new BookList({
            target: el,
            props: {
              params,
            },
          })
        } catch (error) {
          console.error("Failed to create BookList component:", error)
          new Notice("Failed to load book list component")
        }
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
