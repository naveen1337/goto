/**
 * Resolves a final URL from parsed query tokens and the mappings data.
 *
 * Resolution rules:
 * - No commands + query  → null (caller falls back to Google)
 * - `>cmd`               → mappings[cmd].base
 * - `>cmd` + query       → mappings[cmd].base + mappings[cmd].search (with {query})
 * - `>cmd >sub`          → mappings[cmd].base + resources[sub].url
 * - `>cmd >sub` + query  → mappings[cmd].base + resources[sub].search (with {query})
 * - Unknown command      → null (caller falls back to Google)
 *
 * @param {{ commands: string[], query: string }} parsed
 * @param {object} mappings
 * @returns {string | null}
 */
export function resolveUrl(parsed, mappings) {
  const { commands, query } = parsed

  if (commands.length === 0) return null

  const [mainCmd, subCmd] = commands
  const site = mappings[mainCmd]

  if (!site) return null

  const fill = (template, q) =>
    template.replace('{query}', encodeURIComponent(q))

  if (!subCmd) {
    if (query && site.search) return site.base + fill(site.search, query)
    return site.base
  }

  const resource = site.resources?.[subCmd]

  if (!resource) {
    // Unknown sub-command: treat query as search on main site
    if (query && site.search) return site.base + fill(site.search, query)
    return site.base
  }

  if (query && resource.search) return site.base + fill(resource.search, query)
  return site.base + resource.url
}
