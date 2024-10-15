import { describe, expect, it } from 'vitest'
import {
	getInfoFromName,
	readMarkdownFile,
	readJsonFileWithDefaults,
	scanBookFolder
} from '../src/book'
import path from 'path'

describe('book', () => {
	describe('readJsonFile', () => {
		it('should return the content of the file as an object', async () => {
			const filePath = path.join('spec/fixtures', 'sample.json')
			const content = await readJsonFileWithDefaults(filePath, { key: 'default' })
			expect(content).toEqual({ key: 'value' })
		})
		it('should return the default value if the file does not exist', async () => {
			const filePath = path.join('spec/fixtures', 'nonexistent.json')
			const defaultValue = { key: 'default' }
			const content = await readJsonFileWithDefaults(filePath, defaultValue)
			expect(content).toEqual(defaultValue)
		})
		it('should throw parsing error for invalid file', () => {
			const filePath = path.join('spec/fixtures', 'invalid.json.txt')
			const defaultValue = { key: 'default' }

			expect(readJsonFileWithDefaults(filePath, defaultValue)).rejects.toThrow(SyntaxError)
		})
	})

	describe('getInfoFromName', () => {
		it('should return the title from the file name', () => {
			const fileName = '01-Chapter.md'
			const info = getInfoFromName(fileName)
			expect(info).toEqual({ order: 1, title: 'Chapter', type: 'md' })
		})

		it('should return the title when the numeric prefix does not exist', () => {
			const fileName = 'Chapter.md'
			const info = getInfoFromName(fileName)
			expect(info).toEqual({ order: null, title: 'Chapter', type: 'md' })
		})

		it('should return the title when file does not match the pattern', () => {
			const fileName = 'Chapter'
			const info = getInfoFromName(fileName)
			expect(info).toEqual({ order: null, title: 'Chapter' })
		})
	})

	describe('readMarkdownFile', () => {
		it('should extract metadata and content from markdown', async () => {
			const filePath = path.join('spec/fixtures', 'sample.md')
			const { metadata, content } = await readMarkdownFile(filePath)
			expect(metadata).toEqual({ title: 'Sample', category: 'chapter' })
			expect(content).toEqual('This is a sample markdown file.\n')
		})
	})

	describe('scanBookFolder', () => {
		it('should scan a book folder', async () => {
			const folderPath = path.join('spec/fixtures', 'minimal')
			const book = await scanBookFolder(folderPath)
			expect(book.metadata).toEqual({
				title: 'A Minimal Book',
				author: 'John Doe',
				audience: '',
				description: '',
				genres: []
			})
			expect(book.config).toEqual({
				appendix: false,
				chapterNumbers: false,
				glossary: false,
				theme: 'default',
				toc: false,
				tocLevels: 1
			})
			expect(book.content).toHaveLength(6)
			expect(book.assets).toHaveLength(1)
		})
	})
})
