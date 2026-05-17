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

# Mappings Editor (`/mappings`)
- Full keyboard-driven editor for viewing and editing all mappings
- Accessible from the "Edit mappings" button on the home page
- Changes are **saved manually** via a **Save button** in the header (disabled when nothing has changed)
- An **"Unsaved changes"** badge appears in the header when there are pending edits
- Mappings are loaded from `localStorage` on every page load; first visit seeds it from `mappings.json`
- A **Download JSON** button exports the current state as `mappings.json`, with a `_exportedAt` ISO timestamp at the top of the file
- **Left panel**: scrollable list of all site commands — navigate with `↑↓`, `n` to add, `Del` to delete, `Enter` to focus editor, `f` to focus search
- **Search**: filter bar at the top of the left panel — searches by command key, site name, and description; `Esc` clears, `↓` moves into the list
- **Right panel**: editable fields for command key, name, description, base URL, search path, and a resources table
- **Description field**: optional free-text field per site for keywords/topics; shown as a subtitle in the list and searched when filtering
- **Validation**: renaming a command or resource key to one that already exists shows an inline error and blocks the rename