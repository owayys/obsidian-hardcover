import { HardcoverClient } from "@api/client"
import BookList from "@ui/BookList.svelte"
import { parseParams } from "@utils/schema"
import { Notice, Plugin } from "obsidian"
import { DEFAULT_SETTINGS } from "@/constants"
import { HardcoverSettingTab, PluginSettings } from "@/settings"
import { initializeHardcoverClient } from "@/stores/factory"
import { BookStatusParam, SortParam } from "@/types"
import ConfigError from "@/ui/ConfigError.svelte"

export interface HardcoverParams {
  limit: number
  status: BookStatusParam
  sort?: SortParam
}

export default class HardcoverPlugin extends Plugin {
  settings: PluginSettings
  hardcoverClient: HardcoverClient | null = null

  onunload(): void {}

  async onload() {
    console.log(`[${this.manifest.name}] Loading plugin`)
    await this.loadSettings()

    const apiToken = this.app.secretStorage.getSecret(
      this.settings.TOKEN_SECRET_KEY,
    )
    if (apiToken) {
      this.hardcoverClient = new HardcoverClient(apiToken)
      initializeHardcoverClient(apiToken)
    }

    this.registerMarkdownCodeBlockProcessor(
      "hardcover",
      async (src, el, _ctx) => {
        let userParams: HardcoverParams | Record<string, never> = {}
        try {
          userParams = JSON.parse(src)
        } catch (error) {
          console.error("Invalid JSON in code block", error)
        }

        const params = parseParams(userParams)

        if (!this.hardcoverClient) {
          new Notice("Hardcover API token not configured")
          new ConfigError({
            target: el,
            props: {
              error: new Error("Hardcover API token not configured"),
            },
          })
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
          new ConfigError({
            target: el,
            props: {
              error,
            },
          })
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
    const apiToken = this.app.secretStorage.getSecret(
      this.settings.TOKEN_SECRET_KEY,
    )
    if (apiToken) {
      this.hardcoverClient = new HardcoverClient(apiToken)
      initializeHardcoverClient(apiToken)
    } else {
      this.hardcoverClient = null
    }
  }
}
