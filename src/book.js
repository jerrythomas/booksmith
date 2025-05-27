import frontMatter from 'front-matter'
import fs from 'fs/promises'
import path from 'path'
import { mergeDeepRight } from 'ramda'

import { CONFIG_FILE, DEFAULTS } from './constants.js'
import { itemSorter, excludeFile } from './utils.js'

/**
 * Reads a JSON file and returns its content as an object.
 *
 * @param {string} filePath - The path of the file.
 * @param {Object} defaultValue - The default value to return if the file does not exist or is empty.
 * @returns {Promise<Object>} A promise that resolves to the content of the file as an object.
 */
export async function readJsonFileWithDefaults(filePath, defaultValue = {}) {
	try {
		const content = await fs.readFile(filePath, 'utf-8')
		const result = JSON.parse(content)
		return mergeDeepRight(defaultValue, result)
	} catch (error) {
		// File does not exist, return the default value
		if (error.code === 'ENOENT') return defaultValue
		// Re-throw the error if it is not about the non-existence of the file
		throw error
	}
}

/**
 * Extracts order, title, and file type from a given file name.
 *
 * @param {string} name - The name of the file.
 * @returns {Object} An object containing the order (null if not present), title, and file type.
 */
export function getInfoFromName(name) {
	const pattern = new RegExp(/^((\d+)-)?(.*)\.(\w+)$/)
	const match = name.match(pattern)

	if (!match) return { order: null, title: name }
	const order = match[2] ? Number(match[2]) : null
	const title = match[3]
	const type = match[4]
	return { order, title, type }
}

/**
 * Reads a markdown file and extracts the content and metadata.
 *
 * @param {string} filePath - The path of the file.
 * @returns {Promise<Object>} A promise that resolves to an object containing the metadata and content.
 */
export async function readMarkdownFile(filePath) {
	const content = await fs.readFile(filePath, 'utf-8')
	const { attributes, body } = frontMatter(content)

	return {
		metadata: attributes,
		content: body
	}
}

/**
 * Scans a book folder and returns its content and assets.
 *
 * @param {string} source - The path of the folder to scan.
 * @returns {Promise<Object>} A promise that resolves to an object containing the content and assets of the book.
 */
export async function scanBookFolder(source) {
	const book = await readJsonFileWithDefaults(path.join(source, CONFIG_FILE), DEFAULTS)
	let files = await fs.readdir(source, { withFileTypes: true, recursive: true })

	files = files
		.filter((file) => file.name !== CONFIG_FILE && !file.isDirectory())
		.map((file) => ({
			file: path.join(path.relative(source, file.parentPath), file.name),
			...getInfoFromName(file.name)
		}))
		.filter((item) => !excludeFile(item))

	book.content = []
	book.assets = []

	for (const item of files) {
		const filePath = path.join(source, item.file)

		if (item.type === 'md') {
			const { metadata, content } = await readMarkdownFile(filePath)
			book.content.push({ ...item, ...metadata, content })
		} else {
			book.assets.push(item)
		}
	}

	book.content = book.content
		.sort((a, b) => itemSorter(a, b))
		.map((item, index) => ({ ...item, order: index + 1 }))

	return book
}
