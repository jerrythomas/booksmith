import path from 'path'
import { createFile } from './utils.js'
import { starter } from './constants.js'

/**
 * Initializes a new book project.
 *
 * @param {string} projectPath - The path of the project to initialize.
 * @returns {Promise<void>}
 */
export async function initialize(projectPath) {
	for (const [file, content] of Object.entries(starter)) {
		await createFile(path.join(projectPath, file), content)
	}
}
