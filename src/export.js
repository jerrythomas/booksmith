import { DEFAULTS, contentTypes } from './constants'
import { clone, pick } from 'ramda'
import path from 'path'
import fs from 'fs'
import AdmZip from 'adm-zip'
import xml2js from 'xml2js'

function parseXML(extension, content) {
	const extensions = ['opf', 'ncx']
	let output = { content }
	if (extensions.includes(extension)) {
		xml2js.parseString(content, (error, result) => {
			output = { error, content: error ? content : result }
		})
	}
	return output
}

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

function organizeFiles(files) {
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
	// console.log(contents.length, assets.length, metadata.length)
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

export function readToc(content) {
	let data = {}
	xml2js.parseString(content, (error, result) => {
		if (!error) {
			data = result.package
		}
	})

	const items = data.manifest.reduce(
		(acc, cur) => ({
			...acc,
			[cur.$.id]: {
				id: cur.$.id,
				href: cur.$.href,
				mediaType: cur.$.mediaType
			}
		}),
		{}
	)
	data.spline.forEach((item, index) => {
		items[item.$.idref].order = index + 1
	})

	return { table: Object.values(items), metadata }
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
