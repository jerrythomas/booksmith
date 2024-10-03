import { metadataMapping } from './constants'
import { toEpubDateFormat } from './utils'

/**
 * Generates a single dc: tag.
 *
 * @param {string} tag - The dc: tag.
 * @param {string} value - The metadata value.
 * @param {string} [scheme] - The scheme for the identifier.
 * @returns {string} - The generated dc: tag.
 */
function generateSingleDcTag(tag, value, scheme) {
	if (scheme) {
		return `<${tag} id="${scheme.toLowerCase()}">urn:${scheme.toLowerCase()}:${value}</${tag}>`
	}
	return `<${tag}>${value}</${tag}>`
}
/**
 * Generates multiple dc: tags.
 *
 * @param {string} tag - The dc: tag.
 * @param {string} key - The metadata key.
 * @param {string[]} values - The metadata values.
 * @returns {string[]} - An array of generated dc: tags.
 */
function generateMultipleDcTags(tag, key, values) {
	return values.map((item, index) => `<${tag} id="${key}${index + 1}">${item}</${tag}>`)
}

/**
 * Generates a count meta tag.
 *
 * @param {string} key - The metadata key.
 * @param {number} count - The count of the values.
 * @returns {string} - The generated count meta tag.
 */
function generateCountMetaTag(key, count) {
	return `<meta name="${key}-count" content="${count}"/>`
}

/**
 * Generates dc: tags for a given metadata attribute.
 *
 * @param {Object} mapping - The mapping object for the metadata attribute.
 * @param {string|string[]} value - The metadata value.
 * @returns {string[]} - An array of strings representing the tags.
 */
function generateDcTags(mapping, value) {
	const { tag, key, count, scheme } = mapping

	if (Array.isArray(value)) {
		const tags = generateMultipleDcTags(tag, key, value)
		if (count) {
			tags.push(generateCountMetaTag(key, value.length))
		}
		return tags
	}

	return [generateSingleDcTag(tag, value, scheme)]
}

/**
 * Generates meta tags for a given metadata attribute.
 *
 * @param {Object} mapping - The mapping object for the metadata attribute.
 * @param {string|string[]} value - The metadata value.
 * @returns {string[]} - An array of strings representing the tags.
 */
function generateMetaTags(mapping, value) {
	const { property, join } = mapping

	if (join && Array.isArray(value)) {
		return [`<meta name="${property}" content="${value.join(', ')}" count="${value.length}"/>`]
	}

	const items = Array.isArray(value) ? value : [value]
	return items.map((item) => `<meta name="${property}" content="${item}"/>`)
}

/**
 * Converts a metadata attribute to the corresponding dc: or meta tag.
 *
 * @param {Object} metadata - Metadata for the book.
 * @param {Object} mapping - The mapping object for the metadata attribute.
 * @returns {string[]} - An array of strings representing the tags.
 */
export function getMetaTag(metadata, mapping) {
	const { key, tag } = mapping
	const value = metadata[key]

	if (!value) return []

	if (tag.startsWith('dc:')) {
		return generateDcTags(mapping, value)
	} else {
		return generateMetaTags(mapping, value)
	}
}
/**
 * Generates the metadata section of the OPF file.
 *
 * @param {Object} metadata - Metadata for the book.
 * @param {string} uuid - A unique identifier for the book.
 * @returns {string} - The metadata section as a string.
 */
export function getMetadata(metadata, uuid) {
	const metadataArray = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">',
		'<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">',
		` <dc:identifier id="book-id">urn:uuid:${uuid}</dc:identifier>`,
		` <meta property="dcterms:modified">${toEpubDateFormat(new Date())}</meta>`
	]

	metadataMapping.forEach((mapping) => {
		const tags = getMetaTag(metadata, mapping)
		metadataArray.push(...tags)
	})

	metadataArray.push(' <meta name="cover" content="cover-image"/>', '</metadata>')
	return metadataArray.join('\n')
}

/**
 * Generates the manifest section of the OPF file.
 *
 * @param {Array<Object>} content - An array of content objects with `file` and `order` properties.
 * @param {string} coverPath - The path to the cover image.
 * @returns {string} - The manifest section as a string.
 */
export function getManifest(content, assets) {
	const manifestArray = ['<manifest>']

	assets.forEach((asset) => {
		manifestArray.push(`<item id="${asset.id}" href="${asset.file}" media-type="${asset.type}"/>`)
	})

	content.forEach((item) => {
		manifestArray.push(
			`<item id="item-${item.order}" href="${item.file}" media-type="application/xhtml+xml"/>`
		)
	})

	manifestArray.push(
		'<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>'
	)

	manifestArray.push('</manifest>')
	return manifestArray.join('\n')
}

/**
 * Generates the spine section of the OPF file.
 *
 * @param {Array<Object>} content - An array of content objects with `order` properties.
 * @returns {string} - The spine section as a string.
 */
export function getSpine(content) {
	const spineArray = ['<spine>']

	content.forEach((item) => {
		spineArray.push(`<itemref idref="item-${item.order}"/>`)
	})

	spineArray.push('</spine>')
	return spineArray.join('\n')
}

/**
 * Generates an OPF file for the EPUB package.
 *
 * @param {import('./types').Book} metadata - Metadata for the book.
 * @returns {string} - The generated OPF file as a string.
 */
export function getOPF(book) {
	const metadataSection = getMetadata(book.metadata, book.id)
	const manifestSection = getManifest(book.content, book.assets)
	const spineSection = getSpine(book.content)

	return `${metadataSection}\n${manifestSection}\n${spineSection}\n</package>`
}
