import { marked } from 'marked'
import { epub } from './epub.js'
// import { scanBookFolder } from './book.js'
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

/**
 * Converts an item with markdown content to HTML.
 *
 * @param {Object} item - The item to convert.
 * @returns {Object} The converted content.
 */
export function markdownToHtml(item) {
	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">',
		'<head>',
		'<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />',
		`<title>${item.title}</title>`,
		'</head>',
		'<body>',
		`${marked(item.content)}`,
		'</body>',
		'</html>'
	]
	return body.join('\n')
}
const TO_HTML_REGISTRY = createRegistry()
TO_HTML_REGISTRY.register('md', markdownToHtml)
TO_HTML_REGISTRY.register('markdown', ({ content }) => marked(content))
TO_HTML_REGISTRY.register('Rmd', ({ content }) => content) // Placeholder
TO_HTML_REGISTRY.register('ipynb', ({ content }) => content) // Placeholder

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
		content: converter(item),
		file: item.file.replace(new RegExp(`\\.${item.type}$`), '.html')
	}
}

/**
 * Generates a book from a folder
 * @param {string} source               - Source folder to read from.
 * @param {string} target               - Target folder to write to.
 */
export async function compile(book, source, target) {
	// const book = await scanBookFolder(source)

	book.content = book.content.map((item) => convertToHtml(item))
	// console.log(book)
	const epubBook = epub(book, source)
	const result = await epubBook.write(target)
	return result
}
