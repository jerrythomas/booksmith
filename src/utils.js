import fs from 'fs/promises'
import path, { dirname } from 'path'

import { EXCLUDED_FILE_TYPES, EXCLUDED_FILES, MAX_FILES } from './constants.js'
/**
 * Creates a folder if it doesn't exist.
 * @param {string} folderPath - The path of the folder to create.
 * @returns {Promise<void>}
 */
export async function createFolder(folderPath) {
	try {
		await fs.mkdir(folderPath, { recursive: true })
	} catch (error) {
		return `Error creating folder ${folderPath}: ${error.message}`
	}
	return null
}

/**
 * Creates a file with the given content if it doesn't exist.
 * @param {string} filePath - The path of the file to create.
 * @param {string} content - The content to write to the file.
 * @returns {Promise<void>}
 */
export async function createFile(filePath, content) {
	let result = await createFolder(dirname(filePath))
	try {
		if (!result) await fs.writeFile(filePath, content, { flag: 'wx' })
	} catch (error) {
		result = `Error creating file ${filePath}: ${error.message}`
	}
	return result
}

/**
 * Converts a date to the ISO 8601 format 'CCYY-MM-DDThh:mm:ssZ' without milliseconds.
 *
 * @param {Date|string|number} date - The date to convert. Can be a Date object, a date string, or a timestamp.
 * @returns {string} - The date in ISO 8601 format without milliseconds.
 */
export function toEpubDateFormat(date) {
	try {
		const dateObj = new Date(date)
		const isoString = dateObj.toISOString()
		return `${isoString.slice(0, 19)}Z`
	} catch (error) {
		throw `Error converting date to EPUB format: ${error.message}`
	}
}

/**
 * Sorts the content according to order or file name.
 *
 * @param {Array<Object>} content - The content to sort.
 * @returns {Array<Object>} The sorted content.
 */
export function itemSorter(a, b) {
	const order = (a.order ?? MAX_FILES) - (b.order ?? MAX_FILES)
	if (order === 0) {
		return a.file.localeCompare(b.file)
	}
	return order
}

/**
 * Function that identifies if a file should be excluded from the book.
 * @param {FileItem} item - An object representing a file.
 * @returns {boolean} - True if the file should be excluded, false otherwise.
 */
export function excludeFile(item) {
	if (EXCLUDED_FILE_TYPES.includes(item.type)) return true
	const parts = item.file.split(path.sep)

	return EXCLUDED_FILES.some((pattern) => parts.some((part) => pattern.test(part)))
}

/**
 * Function to cast an item as an array if it is not already.
 * @param {any} item - The item to cast as an array.
 * @returns {Array<any>} - The item as an array.
 */
export function asArray(item) {
	if (item === null || item === undefined) return []
	return Array.isArray(item) ? item : [item]
}
