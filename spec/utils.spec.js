import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import process from 'process'
import { createFolder, createFile, toEpubDateFormat } from '../src/utils.js'

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

	describe('toEpubDateFormat', () => {
		it('should convert a Date object to ISO 8601 format without milliseconds', () => {
			const date = new Date('2023-10-05T12:34:56Z')
			const result = toEpubDateFormat(date)
			expect(result).toBe('2023-10-05T12:34:56Z')
		})

		it('should convert a date string to ISO 8601 format without milliseconds', () => {
			const dateString = '2023-10-05T12:34:56Z'
			const result = toEpubDateFormat(dateString)
			expect(result).toBe('2023-10-05T12:34:56Z')
		})

		it('should convert a timestamp to ISO 8601 format without milliseconds', () => {
			const timestamp = Date.parse('2023-10-05T12:34:56Z')
			const result = toEpubDateFormat(timestamp)
			expect(result).toBe('2023-10-05T12:34:56Z')
		})

		it('should handle invalid dates gracefully', () => {
			const invalidDate = 'invalid-date'
			expect(() => toEpubDateFormat(invalidDate)).toThrow(
				'Error converting date to EPUB format: Invalid time value'
			)
		})
	})
})
