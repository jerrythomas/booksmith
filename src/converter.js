import { marked } from 'marked'

/**
 * Creates a registry for converters.
 * @returns {Object} An object with register and get methods.
 */
export function createRegistry() {
	const registry = {}

	return {
		register: function (name, converter) {
			registry[name] = converter
		},
		get: function (name) {
			return registry[name]
		}
	}
}

const TO_HTML_REGISTRY = createRegistry()
TO_HTML_REGISTRY.register('md', marked)
TO_HTML_REGISTRY.register('markdown', marked)
TO_HTML_REGISTRY.register('Rmd', (content) => content) // Placeholder
TO_HTML_REGISTRY.register('ipynb', (content) => content) // Placeholder

/**
 * Converts a content item to HTML.
 * @param {Object} item - The content item to convert.
 * @returns {Object} The converted content item.
 * @throws {Error} If no converter is found for the item's type.
 */
export function convertToHtml(item, registry = TO_HTML_REGISTRY) {
	const converter = registry.get(item.type)

	if (!converter) {
		throw new Error(`No converter found for file type: ${item.type}`)
	}

	return {
		...item,
		type: 'html',
		content: converter(item.content),
		file: item.file.replace(new RegExp(`\\.${item.type}$`), '.html')
	}
}
