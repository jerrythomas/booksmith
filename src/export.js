import { DEFAULTS, contentTypes } from './constants'
import { clone, pick } from 'ramda'
import path from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'
import { convertXmlToJson } from './parser'

/**
 * Parses the XML content.
 *
 * @param {string} extension : The extension of the file
 * @param {string} content   : The content of the XML file
 * @returns {Object}         : The parsed XML content
 */
export function parseXML(extension, content) {
	const extensions = ['opf', 'ncx']
	const output = { content }
	if (extensions.includes(extension)) {
		output.content = convertXmlToJson(content)
	}
	return output
}

/**
 * Reads the contents of an EPUB file.
 *
 * @param {string} filepath - The file path.
 * @returns {Array<Object>} - An array of file objects.
 */
export function readEpubZip(filepath) {
	const zip = new AdmZip(filepath)
	const zipEntries = zip.getEntries()
	const files = []

	zipEntries
		.filter((entry) => !entry.isDirectory)
		.forEach((zipEntry) => {
			const fileName = zipEntry.entryName
			const extension = fileName.split('.').pop()
			const contentType = contentTypes[extension] || 'application/octet-stream'
			const size = zipEntry.header.size
			const content = zipEntry.getData().toString('utf8')

			files.push({
				file: fileName,
				size: size,
				type: extension,
				contentType: contentType,
				...parseXML(extension, content)
			})
		})
	return files
}

/**
 * Organizes the files into contents, assets, and metadata.
 *
 * @param {Array<Object>} files - An array of file objects.
 * @returns {Object} - An object with contents, assets, and metadata arrays.
 */
export function organizeFiles(files) {
	const contents = []
	const assets = []
	const metadata = []

	files.forEach((file) => {
		if (['opf', 'ncx'].includes(file.type)) {
			metadata.push(file)
		} else if (['html', 'htm', 'xhtml'].includes(file.type)) {
			contents.push(file)
		} else {
			if (!file.file.startsWith('META-INF') && !file.file.startsWith('mimetype')) {
				assets.push(file)
			}
		}
	})
	return { contents, assets, metadata }
}

/**
 * Reads a book file and returns the data.
 *
 * @param {string} filepath - The file path.
 * @returns {import('./types').Book} - The book object.
 */
export function readBook(filepath) {
	let stats = null
	try {
		stats = fs.statSync(filepath)
	} catch (e) {
		throw new Error(`File/Folder not found: ${filepath}, ${e.message}`)
	}

	const isFolder = stats.isDirectory()
	const data = {
		...clone(DEFAULTS),
		source: filepath,
		type: isFolder ? 'folder' : filepath.split('.').pop()
	}
	if (data.type === 'epub') {
		const files = readEpubZip(filepath)
		const { contents, assets, metadata } = organizeFiles(files)

		return { ...data, contents, assets, metadata }
	}
	return data
}

/**
 * Reads the table of contents.
 *
 * @param {string} content - The content of the toc file.
 * @returns {Promise<Object>} - The table of contents.
 */
export function readToc(content) {
	const data = convertXmlToJson(content)
	const manifestItems = Array.isArray(data.manifest.item)
		? data.manifest.item
		: [data.manifest.item]

	const items = manifestItems.reduce(
		(acc, cur) => ({
			...acc,
			[cur.id]: {
				id: cur.id,
				href: cur.href,
				mediaType: cur.media_type
			}
		}),
		{}
	)
	const itemrefs = Array.isArray(data.spine.itemref) ? data.spine.itemref : [data.spine.itemref]
	itemrefs.forEach((item, index) => {
		items[item.idref].order = index + 1
	})

	return { table: Object.values(items), metadata: data }
}

/**
 * Exports a book to a file.
 *
 * @param {import('./types').Book} data - The book object.
 * @returns {string} - The export location.
 */
export function exportBook(data) {
	const location = path.join(path.dirname(data.source), data.metadata.title.replace(/\s/g, '-'))
	return location
}

/**
 * Creates a new book object.
 *
 * @param {import('./types').Book} data - The book object.
 * @returns {import('./types').Book} - The book object.
 */
export function book(input = DEFAULTS) {
	const data = pick(['source', 'type', 'config', 'metadata', 'assets', 'contents'], clone(input))
	return {
		from: (path) => book(readBook(path)),
		export: () => exportBook(data),
		get: () => data
	}
}
