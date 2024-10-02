import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import process from 'process'
import { createFolder, createFile } from '../src/utils.js'

const testDir = path.join(process.cwd(), 'test-utils')

describe('utils', () => {
	beforeEach(async () => {
		await fs.rm(testDir, { recursive: true, force: true })
	})

	afterEach(async () => {
		await fs.rm(testDir, { recursive: true, force: true })
	})

	describe('createFolder', () => {
		it('should create a folder if it does not exist', async () => {
			const folderPath = path.join(testDir, 'new-folder')
			await createFolder(folderPath)
			const folderExists = await fs
				.stat(folderPath)
				.then(() => true)
				.catch(() => false)
			expect(folderExists).toBe(true)
		})

		it('should return error if unable to create folder', async () => {
			const folderPath = path.join(testDir, 'new-folder')
			await createFile(folderPath, 'Empty')
			const error = await createFolder(folderPath)
			expect(error).toEqual(
				`Error creating folder ${folderPath}: EEXIST: file already exists, mkdir '${folderPath}'`
			)
			const folderExists = await fs
				.stat(folderPath)
				.then(() => true)
				.catch(() => false)
			expect(folderExists).toBe(true)
		})
	})

	describe('createFile', () => {
		it('should create a file with the given content if it does not exist', async () => {
			const filePath = path.join(testDir, 'new-file.txt')
			const content = 'Hello, world!'
			await createFile(filePath, content)
			const fileExists = await fs
				.stat(filePath)
				.then(() => true)
				.catch(() => false)
			expect(fileExists).toBe(true)
			const fileContent = await fs.readFile(filePath, 'utf8')
			expect(fileContent).toBe(content)
		})

		it('should not overwrite an existing file', async () => {
			const filePath = path.join(testDir, 'existing-file.txt')
			const content = 'Hello, world!'
			let error = await createFile(filePath, content)
			expect(error).toBe(null)
			error = await createFile(filePath, 'New content')
			expect(error).not.toEqual(`Error creating file ${filePath}: File already exists`)
			const fileContent = await fs.readFile(filePath, 'utf8')
			expect(fileContent).toBe(content)
		})
	})
})
