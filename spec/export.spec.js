import { describe, it, expect } from 'vitest'
import { book, readEpubZip, readBook, readToc, exportBook } from '../src/export.js'
import { DEFAULTS } from '../src/constants.js'
import { omit } from 'ramda'

describe('export', () => {
	describe('book', () => {
		it('should create a book object', () => {
			const b = book()
			expect(b).toBeDefined()
			expect(b).toEqual({
				from: expect.any(Function),
				export: expect.any(Function),
				get: expect.any(Function)
			})
			expect(b.get()).toEqual(DEFAULTS)
		})
		it('should create a book object from data', () => {
			const b = book(omit(['metadata'], DEFAULTS))
			expect(b).toBeDefined()
			expect(b).toEqual({
				from: expect.any(Function),
				export: expect.any(Function),
				get: expect.any(Function)
			})
			expect(b.get()).toEqual(omit(['metadata'], DEFAULTS))
		})
	})
	describe('from', () => {
		it('should create book from file', () => {
			const b = book().from('spec/fixtures/extract/minimal.epub')
			const data = b.get()
			expect(data.config).toEqual(DEFAULTS.config)
			expect(data.source).toEqual('spec/fixtures/extract/minimal.epub')
			expect(data.type).toEqual('epub')
			expect(data.contents.length).toEqual(7)
			expect(data.assets.length).toEqual(0)
			expect(data.metadata.length).toEqual(1)
		})
		it('should create book from folder', () => {
			const b = book().from('spec/fixtures/extract')
			const data = b.get()
			expect(data).toEqual({
				...DEFAULTS,
				source: 'spec/fixtures/extract',
				type: 'folder'
			})
		})
		it('should throw error when file/folder does not exist', () => {
			expect(() => book().from('spec/fixtures/extract/missing.epub')).toThrow(
				'File/Folder not found: spec/fixtures/extract/missing.epub'
			)
		})
	})

	describe('readEpubZip', () => {
		it('should read contents of an EPUB file', () => {
			const filepath = 'spec/fixtures/extract/minimal.epub'
			const files = readEpubZip(filepath)
			expect(files).toBeDefined()
			expect(files.length).toBeGreaterThan(0)
			files.forEach((file) => {
				expect(file).toHaveProperty('file')
				expect(file).toHaveProperty('size')
				expect(file).toHaveProperty('type')
				expect(file).toHaveProperty('contentType')
				expect(file).toHaveProperty('content')
			})
		})
	})

	describe('readBook', () => {
		it('should read a book file and return the data', () => {
			const filepath = 'spec/fixtures/extract/minimal.epub'
			const data = readBook(filepath)
			expect(data).toBeDefined()
			expect(data.source).toEqual(filepath)
			expect(data.type).toEqual('epub')
			expect(data.contents.length).toBeGreaterThan(0)
			expect(data.assets.length).toBeGreaterThanOrEqual(0)
			expect(data.metadata.length).toBeGreaterThanOrEqual(0)
		})
		it('should throw error when file/folder does not exist', () => {
			const filepath = 'spec/fixtures/extract/missing.epub'
			expect(() => readBook(filepath)).toThrow(`File/Folder not found: ${filepath}`)
		})
	})

	describe('readToc', () => {
		it('should read the table of contents', async () => {
			const content = [
				'<package>',
				' <manifest>',
				'  <item id="item1" href="chapter1.html" mediaType="application/xhtml+xml"/>',
				' </manifest>',
				' <spine>',
				'  <itemref idref="item1"/>',
				' </spine>',
				'</package>'
			].join('\n')

			const toc = await readToc(content)
			expect(toc).toBeDefined()
			expect(toc.table.length).toEqual(1)
			expect(toc.table[0]).toEqual({
				id: 'item1',
				href: 'chapter1.html',
				mediaType: 'application/xhtml+xml',
				order: 1
			})
		})
	})
	describe('exportBook', () => {
		it('should export a book to a file', () => {
			const data = {
				...DEFAULTS,
				source: 'spec/fixtures/extract/minimal.epub',
				metadata: {
					title: 'Test Book'
				}
			}
			const location = exportBook(data)
			expect(location).toEqual('spec/fixtures/extract/Test-Book')
		})
	})
})
