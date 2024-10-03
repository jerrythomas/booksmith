import fs from 'fs/promises'
import { dirname } from 'path'
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
