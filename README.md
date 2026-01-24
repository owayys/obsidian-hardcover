# Hardcover.app Tracker [![Obsidian](https://img.shields.io/badge/Obsidian-6d28d9)](https://obsidian.md) [![GitHub release](https://img.shields.io/github/release/owayys/obsidian-hardcover.svg?label=Version)](https://github.com/owayys/obsidian-hardcover/releases) ![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/owayys/obsidian-hardcover/total?label=Downloads&color=27C840)

A simple [Hardcover](https://hardcover.app/) reading tracker for [Obsidian](https://obsidian.md/) that brings your reading progress and book library directly into your notes.

![Hardcover Plugin Demo](screenshots/plugin-demo.png)

## Features

- **Live Progress Tracking** - Update your reading progress in real-time with interactive controls
- **Multiple Reading States** - Filter by TBR, Reading, Read, Paused, and DNF statuses
- **Flexible Configuration** - Customizable limits and sorting options
- **Progress Sync** - Progress updates automatically sync to your Hardcover account

## Quick Start

1. **Install the plugin** using [BRAT](https://obsidian.md/plugins?id=obsidian42-brat), `obsidian-hardcover` is currently not available in the community plugins.
2. **Get your API token** from the [Hardcover.app API access page](https://hardcover.app/account/api) (its the "authorization" header minus the `Bearer` prefix)
3. **Configure the plugin** in **Settings > Community plugins > Hardcover**
4. **Link the token** using obsidian keychain
5. **Insert book tracker** in any note:

````markdown
```hardcover
{
  "limit": 5,
  "status": "reading",
  "sort": "progress.desc"
}
```
````

That's it! Your books will appear with interactive progress controls.

## Configuration

### API Token Setup

Access via **Settings > Community plugins > Hardcover**:

1. Click "Set Token" 
2. Enter your Hardcover API token
3. Token is securely stored using Obsidian's secret storage with key "hardcover-token"

### Code Block Parameters

Customize your book display with these parameters:

````markdown
```hardcover
{
  "limit": 10,
  "status": "reading",
  "sort": "progress.desc"
}
```
````

## All Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 5 | Maximum number of books to display |
| `status` | string | "reading" | Filter by book status |
| `sort` | string | "progress.desc" | Sorting order for books |

### Status Options

- `"tbr"` - To Be Read books
- `"reading"` - Currently reading (default)
- `"read"` - Completed books  
- `"paused"` - Paused books
- `"dnf"` - Did Not Finish books

### Sort Options

Format: `"field.direction"` where direction is `.asc` or `.desc`

**Fields:**
- `"progress"` - Reading progress
- `"added"` - Date added to library
- `"updated"` - Last updated date

**Examples:**
- `"progress.desc"` - Highest progress first
- `"added.asc"` - Oldest additions first
- `"updated.desc"` - Recently updated first

### Smart Defaults

The plugin automatically chooses the best sorting for each status:

- **TBR**: `"added.desc"` (newest first)
- **Reading**: `"progress.desc"` (most progress first)
- **Read**: `"updated.desc"` (recently finished first)
- **Paused/DNF**: `"added.asc"` (oldest first)

## Usage Examples

### Currently Reading (Default)

Show your top 5 currently reading books:

````markdown
```hardcover
```
````

### TBR

Display 10 books from your to-be-read pile:

````markdown
```hardcover
{
  "limit": 10,
  "status": "tbr"
}
```
````

### Recently Finished

Show your 5 most recently completed books:

````markdown
```hardcover
{
  "limit": 5,
  "status": "read",
  "sort": "updated.desc"
}
```
````

### All Paused Books

See all paused books sorted by when you added them:

````markdown
```hardcover
{
  "status": "paused",
  "sort": "added.asc"
}
```
````

### Minimal Progress View

Just your current read with highest progress:

````markdown
```hardcover
{
  "limit": 1,
  "status": "reading",
  "sort": "progress.desc"
}
```
````

## Development

### Installation

```bash
git clone https://github.com/owayys/obsidian-hardcover
cd obsidian-hardcover
bun install
bun run dev
```

### Building

```bash
bun run build
```

### Code Generation

```bash
bun run codegen
```

## Requirements

- **Obsidian v0.15.0+** - Minimum app version
- **Hardcover.app account** - Required for API access
- **API Token** - Generated from Hardcover settings
- **Internet connection** - For API communication

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*This is an unofficial plugin, and not in any way associated with Hardcover.app.*
