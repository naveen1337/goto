# Go to page

This app inspired from Dukckduckgo Bangs feature. 

# Flows
1. There is a file named `mappings.json`. will contains the shortcuts
2. The words starts with `/` is not words. these are the commands. 
3. The order of the commands follows like the. `/ain` `/orders` The first commands is the main resource and followed by the next resource. in this example. it will map to `https://www.amazon.in/gp/css/order-history` page
4. if the words did not have a `/` symbol it means. this is the query paramers. In example `/ain asus laptop`. will map to `https://www.amazon.in/s?k=asus laptop`
5. Also `/ain /orders motorolo` map to `https://www.amazon.in/your-orders/search/?search=motorolo`
6. Thease all mapping should be in the JSON file. to easy to add/modify/delete in future
7. when I type `/ain` the dropdown will show the the available resource like `/orders` `/account` `/addresses` to easy type

# UI / UX
- The search input is auto-focused on page load
- Pressing `/` anywhere on the page focuses the search input
- Pressing `Tab` auto-fills the first suggestion in the dropdown
- The main content is positioned towards the top of the page (not centered)

## Theme
- **Futuristic terminal style** with a **black + yellow (#FFCC00)** color palette
- Background: near-black (`#080601`) with a subtle yellow radial glow at the top
- Subtle CSS scanline overlay across the full viewport
- IBM Plex Sans font throughout; monospace font for commands/labels

## Home Page Layout (top → bottom)
1. **Header** — left: pulsing `●` online status dot + `SYS:ONLINE | CMD_NAVIGATOR` in monospace; right: `Edit mappings` button (yellow outline, tertiary style)
2. **Logo** — large `goto` wordmark; `got` in warm white with soft yellow glow, `o` in `#FFCC00` with neon glow; `COMMAND NAVIGATOR` subtitle in small monospace
3. **Terminal prompt label** — `› ENTER COMMAND OR SEARCH QUERY` with a blinking yellow block cursor
4. **Search bar** — dark background, yellow border on focus with glow ring, yellow caret; animated **typewriter placeholder** cycles through example commands (`/gh react hooks`, `/mdn Array.prototype.map`, etc.)
5. **goto Search button** — yellow outline (`#FFCC00`), fills yellow on hover, `↵` enter symbol; positioned directly above the hints grid
6. **Sample mappings grid** — shows first 6 entries from loaded mappings (pinned items first) as clickable tiles; clicking pre-fills the search bar with `/<cmd> `; hidden when the search bar has input
7. **Footer** — `TAB: autocomplete · ENTER: execute · /cmd: route` keyboard hints in dim monospace; hidden on mobile

## Command Dropdown
- Dark background (`#0a0900`) with yellow-tinted border
- Active item highlighted with yellow left border
- Command text in `#FFCC00`, label text in muted yellow-brown

## Responsiveness
- **Mobile**: Mappings Editor shows one panel at a time (list or editor); back button `← Sites` appears in the editor on small screens
- Form fields in the editor stack to a single column on mobile
- Resources table scrolls horizontally on mobile (`overflow-x-auto`)
- Footer keyboard hints hidden on mobile

# Mappings Editor (`/mappings`)
- Full keyboard-driven editor for viewing and editing all mappings
- Accessible from the "Edit mappings" button on the home page
- Changes are **saved manually** via a **Save button** in the header (disabled when nothing has changed)
- An **"Unsaved changes"** badge appears in the header when there are pending edits
- Mappings are loaded from `localStorage` on every page load; first visit seeds it from `mappings.json`
- A **Download JSON** button exports the current state as `mappings.json`, with a `_exportedAt` ISO timestamp at the top of the file
- An **Upload JSON** button opens a file picker accepting `.json` files; the uploaded file replaces the entire in-memory mappings state, strips the `_exportedAt` metadata key if present, and marks the editor as dirty so the user can review before saving
- **Left panel**: scrollable list of all site commands — navigate with `↑↓`, `n` to add, `Del` to delete, `Enter` to focus editor, `f` to focus search
- **Search**: filter bar at the top of the left panel — searches by command key, site name, and description; `Esc` clears, `↓` moves into the list
- **Right panel**: editable fields for command key, name, description, base URL, search path, and a resources table
- **Description field**: optional free-text field per site for keywords/topics; shown as a subtitle in the list and searched when filtering
- **Validation**: renaming a command or resource key to one that already exists shows an inline error and blocks the *rename*
- **Pin feature**: each list item has a `★ / ☆` button; pinned items float to the top of the list; pin state stored as `_pinned: true` on the mapping entry and persists through Save, Download JSON, and Upload JSON

# Default Mappings (`public/mappings.json`)

The bundled default mappings (seeded into localStorage on first visit):

| Command | Site |
|---|---|
| `/ain` | Amazon India |
| `/gh` | GitHub |
| `/yt` | YouTube |
| `/wiki` | Wikipedia |
| `/gm` | Gmail |
| `/maps` | Google Maps |
| `/gpt` | ChatGPT |
| `/pp` | Perplexity |
| `/claude` | Claude |
| `/gemini` | Gemini |
| `/hn` | Hacker News |
| `/rd` | Reddit |
| `/gimg` | Google Images |
| `/dribbble` | Dribbble |
| `/tw` | Twitter / X |
| `/imdb` | IMDb |
| `/li` | LinkedIn |
| `/hindu` | The Hindu |
| `/mint` | Mint (Live Mint) |