/**
 * Parses a raw query string into structured commands and a query string.
 *
 * Tokens starting with `>` are commands; everything else is the query.
 * Commands must appear before any query words — once a non-command word
 * is encountered, all remaining words are treated as query text.
 *
 * @param {string} input
 * @returns {{ commands: string[], query: string }}
 *
 * @example
 * parseQuery('>ain >orders motorola')
 * // → { commands: ['ain', 'orders'], query: 'motorola' }
 *
 * parseQuery('>ain asus laptop')
 * // → { commands: ['ain'], query: 'asus laptop' }
 */
export function parseQuery(input) {
  const tokens = input.trim().split(/\s+/).filter(Boolean)
  const commands = []
  const queryParts = []
  let seenNonCommand = false

  for (const token of tokens) {
    if (!seenNonCommand && token.startsWith('/')) {
      commands.push(token.slice(1).toLowerCase())
    } else {
      seenNonCommand = true
      queryParts.push(token)
    }
  }

  return { commands, query: queryParts.join(' ') }
}

/**
 * Returns autocomplete suggestions based on the current raw input.
 *
 * Suggestions are shown when:
 * - The last typed token starts with `>` (partial command being typed)
 * - The input ends with a space after a recognized top-level command
 *   (hint: "these sub-resources are available to type next")
 *
 * @param {string} input - Raw input string (may have trailing space)
 * @param {object} mappings - Parsed mappings.json contents
 * @returns {{ command: string, label: string }[]}
 */
export function getSuggestions(input, mappings) {
  if (!mappings || !input) return []

  const endsWithSpace = input.endsWith(' ')
  const tokens = input.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  const lastToken = tokens[tokens.length - 1]
  const commandTokens = tokens.filter(t => t.startsWith('/'))

  // Input ends with space: show sub-resource hints for a recognized main command
  if (endsWithSpace) {
    if (commandTokens.length === 1) {
      const mainKey = commandTokens[0].slice(1).toLowerCase()
      const site = mappings[mainKey]
      if (site?.resources) {
        return Object.entries(site.resources).map(([key, val]) => ({
          command: `/${key}`,
          label: val.label ?? key,
        }))
      }
    }
    return []
  }

  // Last token must start with / to get suggestions
  if (!lastToken.startsWith('/')) return []

  const partial = lastToken.slice(1).toLowerCase()
  const prevCommandTokens = tokens.slice(0, -1).filter(t => t.startsWith('/'))

  if (prevCommandTokens.length === 0) {
    // Suggest matching top-level commands
    return Object.entries(mappings)
      .filter(([key]) => key.startsWith(partial))
      .map(([key, val]) => ({ command: `/${key}`, label: val.name }))
  }

  // Suggest matching sub-resources of the first command
  const mainKey = prevCommandTokens[0].slice(1).toLowerCase()
  const site = mappings[mainKey]
  if (!site?.resources) return []

  return Object.entries(site.resources)
    .filter(([key]) => key.startsWith(partial))
    .map(([key, val]) => ({ command: `/${key}`, label: val.label ?? key }))
}
