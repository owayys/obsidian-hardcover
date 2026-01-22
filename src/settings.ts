import { App, PluginSettingTab, SecretComponent, Setting } from "obsidian"
import HardcoverPlugin from "@/main"

export type PluginSettings = {
  TOKEN_SECRET_KEY: string
}

export const DEFAULT_SETTINGS: PluginSettings = {
  TOKEN_SECRET_KEY: "",
}

export class HardcoverSettingTab extends PluginSettingTab {
  plugin: HardcoverPlugin

  constructor(app: App, plugin: HardcoverPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()

    new Setting(containerEl).setHeading().setName("Hardcover API settings")

    new Setting(containerEl)
      .setName("API token")
      .setDesc(
        "Get your API token from your Hardcover account settings. Visit docs.hardcover.app/api/getting-started/ to learn how.",
      )
      .addComponent((el) =>
        new SecretComponent(this.app, el)
          .setValue(this.plugin.settings.TOKEN_SECRET_KEY)
          .onChange((value) => {
            this.plugin.settings.TOKEN_SECRET_KEY = value
            this.plugin.saveSettings()
          }),
      )
  }
}
