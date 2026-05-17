# goto

A keyboard-driven browser shortcut launcher inspired by DuckDuckGo Bangs. Type a `/command` to jump straight to a website or resource, or add a search query to search within it.

## How it works

Tokens starting with `/` are **commands** — everything else is a **search query**.

| Input | Result |
|---|---|
| `/gh` | Opens GitHub |
| `/gh react hooks` | Searches GitHub for "react hooks" |
| `/ain /orders` | Opens Amazon India → Order History |
| `/ain /orders motorola` | Searches Amazon India orders for "motorola" |
| `asus laptop` | Falls back to a Google search |

When you type `/a`, a dropdown shows matching commands. Press `Tab` to auto-fill the first suggestion, `↑↓` to navigate, `Enter` to select.

## Getting started

```bash
pnpm install
pnpm dev
```

Then set `http://localhost:5173` (or your deployed URL) as your browser's default search engine / homepage.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Focus the search input from anywhere on the page |
| `Tab` | Auto-fill the first command suggestion |
| `↑` / `↓` | Navigate suggestions |
| `Enter` | Run the search |

## Mappings

All shortcuts are stored in `public/mappings.json`. On first load the file is seeded into `localStorage`; all subsequent reads and edits use `localStorage`.

Each entry looks like:

```json
{
  "gh": {
    "name": "GitHub",
    "description": "Code hosting, issues, pull requests",
    "base": "https://github.com",
    "search": "/search?q={query}",
    "resources": {
      "issues": { "label": "Issues", "url": "/issues", "search": "/search?type=issues&q={query}" },
      "prs":    { "label": "Pull Requests", "url": "/pulls" }
    }
  }
}
```

## Mappings Editor (`/mappings`)

Click **Edit mappings** on the home page to open the visual editor.

- **Left panel** — searchable list of all commands (`f` to search, `↑↓` to navigate, `n` to add, `Del` to delete)
- **Right panel** — edit command key, name, description, base URL, search path, and sub-resources inline
- **Save** — changes are held in memory until you press **Save**; an "Unsaved changes" badge reminds you
- **Download JSON** — exports the current mappings as `mappings-<timestamp>.json` with an `_exportedAt` field
- **Validation** — duplicate command or resource keys are caught with an inline error

## Stack

- [React 19](https://react.dev) + [Vite](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [React Router v7](https://reactrouter.com)
