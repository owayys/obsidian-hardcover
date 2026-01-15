import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "./main";

export interface MyPluginSettings {
	hardcoverApiToken: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	hardcoverApiToken: "",
};

export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Hardcover API Settings" });

		new Setting(containerEl)
			.setName("API Token")
			.setDesc(
				"Get your API token from your Hardcover account settings. Visit docs.hardcover.app/api/getting-started/ to learn how."
			)
			.addText((text) =>
				text
					.setPlaceholder("Enter your Hardcover API token")
					.setValue(this.plugin.settings.hardcoverApiToken)
					.onChange(async (value) => {
						this.plugin.settings.hardcoverApiToken = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
