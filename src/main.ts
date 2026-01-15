import { App, Modal, Notice, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	MyPluginSettings,
	SampleSettingTab,
} from "./settings";
import { HardcoverClient } from "./api";

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	hardcoverClient: HardcoverClient | null = null;
	private progressUpdateTimeouts: Map<number, NodeJS.Timeout> = new Map();

	private debounceProgressUpdate(
		readingSessionId: number,
		fn: () => Promise<void>,
		delayMs = 1000
	): void {
		const existingTimeout =
			this.progressUpdateTimeouts.get(readingSessionId);
		if (existingTimeout) {
			clearTimeout(existingTimeout);
		}

		const timeout = setTimeout(() => {
			fn().catch((error) => {
				console.error("Failed to update progress:", error);
				new Notice("Failed to update reading progress");
			});
			this.progressUpdateTimeouts.delete(readingSessionId);
		}, delayMs);

		this.progressUpdateTimeouts.set(readingSessionId, timeout);
	}

	onunload(): void {
		// Clear all pending timeouts
		this.progressUpdateTimeouts.forEach((timeout) => {
			clearTimeout(timeout);
		});
		this.progressUpdateTimeouts.clear();
	}

	async onload() {
		await this.loadSettings();

		if (this.settings.hardcoverApiToken) {
			this.hardcoverClient = new HardcoverClient(
				this.settings.hardcoverApiToken
			);
		}

		this.registerMarkdownCodeBlockProcessor(
			"hardcover",
			async (source, el) => {
				if (!this.hardcoverClient) {
					new Notice("Hardcover API token not configured");
					return;
				}

				try {
					const result =
						await this.hardcoverClient.getUserCurrentBooks();
					const userBooks = result.me?.[0]?.user_books ?? [];

					el.empty();

					const container = el.createDiv({ cls: "hardcover-books" });
					container.style.display = "grid";
					container.style.gridTemplateColumns =
						"repeat(auto-fill, minmax(150px, 1fr))";
					container.style.gap = "16px";
					container.style.padding = "16px 0";

					if (userBooks.length === 0) {
						container.setText("No books currently reading");
						return;
					}

					userBooks.forEach((userBook) => {
						const bookEl = container.createDiv({
							cls: "hardcover-book",
						});
						bookEl.style.textAlign = "center";

						const coverUrl =
							userBook.edition?.image?.url ??
							userBook.book.image?.url;
						if (coverUrl) {
							const img = bookEl.createEl("img");
							img.src = coverUrl;
							img.style.width = "100%";
							img.style.borderRadius = "4px";
							img.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
							img.style.aspectRatio = "2/3";
							img.style.objectFit = "cover";
							img.style.marginBottom = "8px";
						}

						const titleEl = bookEl.createEl("div");
						titleEl.style.fontSize = "0.85em";
						titleEl.style.fontWeight = "500";
						titleEl.style.overflow = "hidden";
						titleEl.style.textOverflow = "ellipsis";
						titleEl.style.whiteSpace = "nowrap";
						titleEl.setText(userBook.book.title ?? "Unknown");

						const latestRead = userBook.user_book_reads?.[0];
						if (latestRead && latestRead.progress_pages !== null) {
							const progressContainer = bookEl.createDiv();
							progressContainer.style.marginTop = "8px";
							progressContainer.style.display = "flex";
							progressContainer.style.alignItems = "center";
							progressContainer.style.justifyContent = "center";
							progressContainer.style.gap = "4px";

							const minusBtn =
								progressContainer.createEl("button");
							minusBtn.setText("−");
							minusBtn.style.width = "24px";
							minusBtn.style.height = "24px";
							minusBtn.style.padding = "0";
							minusBtn.style.fontSize = "0.9em";
							minusBtn.style.cursor = "pointer";
							minusBtn.style.borderRadius = "3px";
							minusBtn.style.border =
								"1px solid var(--divider-color)";
							minusBtn.style.backgroundColor =
								"var(--background-secondary)";

							const progressEl =
								progressContainer.createEl("div");
							progressEl.style.fontSize = "0.75em";
							progressEl.style.color = "var(--text-muted)";
							progressEl.style.minWidth = "50px";

							const updateProgressDisplay = () => {
								if (
									latestRead.progress_pages &&
									latestRead.progress
								) {
									progressEl.setText(
										`${
											latestRead.progress_pages
										} (${Math.round(latestRead.progress)}%)`
									);
								}
							};

							updateProgressDisplay();

							// Plus button
							const plusBtn =
								progressContainer.createEl("button");
							plusBtn.setText("+");
							plusBtn.style.width = "24px";
							plusBtn.style.height = "24px";
							plusBtn.style.padding = "0";
							plusBtn.style.fontSize = "0.9em";
							plusBtn.style.cursor = "pointer";
							plusBtn.style.borderRadius = "3px";
							plusBtn.style.border =
								"1px solid var(--divider-color)";
							plusBtn.style.backgroundColor =
								"var(--background-secondary)";

							minusBtn.addEventListener("click", async () => {
								if (!latestRead.progress) return;
								latestRead.progress = Math.max(
									0,
									latestRead.progress - 1
								);
								updateProgressDisplay();
								this.debounceProgressUpdate(
									latestRead.id,
									async () => {
										if (!this.hardcoverClient) return;
										await this.hardcoverClient.updateReadingProgressByPercentage(
											latestRead.id,
											userBook.edition?.id ??
												userBook.book.id,
											latestRead.progress!
										);
									}
								);
							});

							plusBtn.addEventListener("click", async () => {
								if (!latestRead.progress_pages) return;
								latestRead.progress_pages += 1;
								updateProgressDisplay();
								this.debounceProgressUpdate(
									latestRead.id,
									async () => {
										if (!this.hardcoverClient) return;
										await this.hardcoverClient.updateReadingProgress(
											latestRead.id,
											latestRead.progress_pages!
										);
									}
								);
							});
						}
					});
				} catch (error) {
					const message =
						error instanceof Error
							? error.message
							: "Unknown error";
					el.setText(`❌ Error loading books: ${message}`);
				}
			}
		);

		this.addRibbonIcon("book", "Hardcover", (evt: MouseEvent) => {
			if (!this.hardcoverClient) {
				new Notice("Hardcover API token not configured");
				return;
			}
			this.testHardcoverConnection();
		});

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Hardcover");

		this.addCommand({
			id: "hardcover-test-connection",
			name: "Test Hardcover connection",
			callback: () => this.testHardcoverConnection(),
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	private async testHardcoverConnection(): Promise<void> {
		if (!this.hardcoverClient) {
			new Notice("⚠️ Hardcover API token not configured");
			return;
		}

		try {
			const result = await this.hardcoverClient.getUserCurrentBooks();
			const userBooks = result.me?.[0]?.user_books;
			const bookCount = userBooks?.length ?? 0;
			new Notice(`✅ Connected to Hardcover! Found ${bookCount} books.`);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown error";
			new Notice(`❌ Connection failed: ${message}`);
			console.error("Hardcover connection error:", error);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<MyPluginSettings>
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Reinitialize client with new token if it changed
		if (this.settings.hardcoverApiToken) {
			this.hardcoverClient = new HardcoverClient(
				this.settings.hardcoverApiToken
			);
		} else {
			this.hardcoverClient = null;
		}
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText("Woah!");
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
