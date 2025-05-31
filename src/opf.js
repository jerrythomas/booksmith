import { metadataMapping } from './constants.js'
import { toEpubDateFormat, asArray } from './utils.js'
import { convertXmlToJson } from './parser.js'
/**
 * Generates a single dc: tag.
 *
 * @param {string} tag - The dc: tag.
 * @param {string} value - The metadata value.
 * @param {string} [scheme] - The scheme for the identifier.
 * @returns {string} - The generated dc: tag.
 */
function generateSingleDcTag(tag, value, scheme, name = null) {
	if (scheme) {
		return `<${tag} id="${name ?? scheme.toLowerCase()}">urn:${scheme.toLowerCase()}:${value}</${tag}>`
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
	const { tag, key, count, scheme, name } = mapping

	if (Array.isArray(value)) {
		const tags = generateMultipleDcTags(tag, key, value)
		if (count) {
			tags.push(generateCountMetaTag(key, value.length))
		}
		return tags
	}

	return [generateSingleDcTag(tag, value, scheme, name)]
}

/**
 * Generates meta tags for a given metadata attribute.
 *
 * @param {Object} mapping - The mapping object for the metadata attribute.
 * @param {string|string[]} value - The metadata value.
 * @returns {string[]} - An array of strings representing the tags.
 */
export function generateMetaTags(mapping, value) {
	const { key, property, join } = mapping
	const prop = property || key

	if (join && Array.isArray(value)) {
		return [`<meta name="${prop}" content="${value.join(', ')}" count="${value.length}"/>`]
	}

	const items = Array.isArray(value) ? value : [value]
	return items.map((item) => `<meta name="${prop}" content="${item}"/>`)
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
		` <dc:identifier id="book-id">urn:uuid:${uuid}</dc:identifier>`
	]

	metadata.modified = metadata.modified || new Date()
	metadataArray.push(
		` <meta property="dcterms:modified">${toEpubDateFormat(metadata.modified)}</meta>`
	)

	metadataMapping.forEach((mapping) => {
		const tags = getMetaTag(metadata, mapping)
		metadataArray.push(...tags)
	})

	metadataArray.push('</metadata>')
	return metadataArray.join('\n')
}

/**
 * Generates the manifest section of the OPF file.
 *
 * @param {Array<Object>} contents - An array of content objects with `file` and `order` properties.
 * @param {string} coverPath - The path to the cover image.
 * @returns {string} - The manifest section as a string.
 */
export function getManifest(contents, assets) {
	const manifestArray = ['<manifest>']

	assets.forEach((asset) => {
		manifestArray.push(`<item id="${asset.id}" href="${asset.file}" media-type="${asset.type}"/>`)
	})

	contents.forEach((item) => {
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
 * @param {Array<Object>} contents - An array of content objects with `order` properties.
 * @returns {string} - The spine section as a string.
 */
export function getSpine(contents) {
	const spineArray = ['<spine>']

	contents.forEach((item) => {
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
	const manifestSection = getManifest(book.contents, book.assets)
	const spineSection = getSpine(book.contents)

	return `${metadataSection}\n${manifestSection}\n${spineSection}\n</package>`
}

/**
 * Identifies dc: tags in the metadata object and extracts them.
 *
 * @param {Object} metadataJson
 * @returns {Object}
 */
export function extractDCMetadata(metadataJson) {
	const metadata = {}
	metadataMapping
		.filter((m) => m.tag.startsWith('dc:') && m.tag !== 'dc:identifier')
		.forEach((mapping) => {
			const value = metadataJson[mapping.tag]
			if (value) {
				metadata[mapping.key] = Array.isArray(value) ? value.map((v) => v._value) : value
			}
		})
	return metadata
}

/**
 * Extract Identifier tags from the OPF metadata
 * @param {Object} metadataJson - The metadata object from the OPF file.
 * @returns {Object} - The extracted metadata.
 */
export function extractIdentifierTags(metadataJson) {
	const identifierTags = metadataJson['dc:identifier'] ?? []
	const metadata = {}
	const identifiers = Array.isArray(identifierTags) ? identifierTags : [identifierTags]
	identifiers.forEach((identifier) => {
		const mapping = metadataMapping.find((m) => m.name === identifier.id)
		if (mapping) {
			metadata[mapping.key] = identifier._value.replace(`urn:${mapping.scheme.toLowerCase()}:`, '')
		}
	})

	return metadata
}

/**
 *
 * @param {*} metaTag
 * @returns
 */
export function extractMetaTag(metaTag) {
	const result = {}

	// Find the corresponding mapping
	const mapping = metadataMapping.find((m) => m.property === metaTag.property)

	if (mapping) {
		const content = metaTag.content ?? metaTag._value
		result[mapping.key] = mapping.join ? content.split(',').map((item) => item.trim()) : content
	}

	return result
}
/**
 * Extracts metadata from the OPF file.
 *
 * @param {Object} metadataJson - The metadata object from the OPF file.
 * @returns {Object} - The extracted metadata.
 */
export function extractOPFMetadata(metadataJson) {
	let metadata = {}

	metadata = { ...extractIdentifierTags(metadataJson), ...extractDCMetadata(metadataJson) }

	const metaTags = metadataJson['meta'] ?? []
	const metas = Array.isArray(metaTags) ? metaTags : [metaTags]
	metas.forEach((meta) => {
		const result = extractMetaTag(meta)
		metadata = { ...metadata, ...result }
	})

	return metadata
}

/**
 * Converts OPF content from XML to the metadata structure.
 *
 * @param {string} opfContent - The OPF content as XML.
 * @returns {Promise<Object>} - The metadata structure.
 */
export async function convertOpfToMetadata(opfContent) {
	const opfJson = await convertXmlToJson(opfContent)

	const metadata = opfJson.package.metadata
	const manifest = asArray(opfJson.package.manifest.item)
	const spine = asArray(opfJson.package.spine.itemref)

	const content = manifest
		.filter((item) => item['media-type'] === 'application/xhtml+xml')
		.map((item) => ({
			...item,
			order: spine.findIndex((itemref) => itemref['idref'] === item['id']) + 1
		}))

	const assets = manifest.filter((item) => item['media-type'] !== 'application/xhtml+xml')

	return {
		metadata: metadata,
		content: content,
		assets: assets
	}
}
