import frontMatter from 'front-matter'
import fs from 'fs/promises'
import path from 'path'
import { mergeDeepRight } from 'ramda'

import { CONFIG_FILE, DEFAULTS, contentTypes } from './constants.js'
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
	const ext = match[4]
	
	// Determine correct MIME type based on extension
	let type;
	if (ext === 'jpg' || ext === 'jpeg') {
		type = 'image/jpeg';
	} else if (ext === 'png') {
		type = 'image/png';
	} else if (ext === 'gif') {
		type = 'image/gif';
	} else if (ext === 'svg') {
		type = 'image/svg+xml';
	} else if (ext === 'webp') {
		type = 'image/webp';
	} else if (contentTypes[ext]) {
		type = contentTypes[ext];
	} else {
		type = ext;
	}
	
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
 * Process special assets referenced in the metadata like cover images.
 * 
 * @param {Object} book - The book object with metadata.
 * @param {string} source - The base directory of the book.
 * @returns {Object} The updated book object with special assets included.
 */
export async function processSpecialAssets(book, source) {
	// Handle cover image if specified in metadata
	if (book.metadata.cover && typeof book.metadata.cover === 'string') {
		try {
			// Resolve the path to the cover image
			const coverPath = book.metadata.cover;
			const fullCoverPath = path.join(source, coverPath);
			
			// Check if file exists
			await fs.access(fullCoverPath);
			
			// Get file extension for mime type
			const ext = path.extname(coverPath).substring(1).toLowerCase();
			
			// Determine the MIME type based on file extension
			let mimeType;
			if (contentTypes[ext]) {
				// Use predefined content type if available
				mimeType = contentTypes[ext];
			} else if (ext.match(/^jpe?g$/i)) {
				// Handle jpg/jpeg variants
				mimeType = 'image/jpeg';
			} else if (ext === 'svg') {
				// Handle SVG format specifically
				mimeType = 'image/svg+xml';
			} else if (ext.match(/^(png|gif|webp)$/i)) {
				// Handle other common image formats
				mimeType = `image/${ext}`;
			} else {
				// Default to generic image type
				mimeType = 'image/png';
				console.warn(`Unknown image type: ${ext}. Defaulting to image/png`);
			}
			
			// Check if cover already exists in assets
			const coverExists = book.assets.some(asset => asset.file === coverPath);
			
			if (!coverExists) {
				// Add cover to assets with standard ID
				book.assets.push({
					file: coverPath,
					id: 'cover-image',
					type: mimeType
				});
			} else {
				// If cover exists, ensure it has the correct ID for OPF reference
				const existingCover = book.assets.find(asset => asset.file === coverPath);
				if (existingCover && existingCover.id !== 'cover-image') {
					console.log(`Setting ID 'cover-image' for existing cover asset: ${coverPath}`);
					existingCover.id = 'cover-image';
				}
			}
		} catch (error) {
			console.warn(`Cover image specified in metadata (${book.metadata.cover}) not found: ${error.message}`);
		}
	}
	
	return book;
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

	book.contents = []
	book.assets = []

	for (const item of files) {
		const filePath = path.join(source, item.file)

		if (item.type === 'md') {
			const { metadata, content } = await readMarkdownFile(filePath)
			book.contents.push({ ...item, ...metadata, content })
		} else {
			book.assets.push(item)
		}
	}

	book.contents = book.contents
		.sort((a, b) => itemSorter(a, b))
		.map((item, index) => ({ ...item, order: index + 1 }))

	// Process special assets like cover images
	await processSpecialAssets(book, source);

	return book
}
