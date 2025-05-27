import { describe, it, expect } from 'vitest'
import {
	book,
	readEpubZip,
	readBook,
	readToc,
	exportBook,
	organizeFiles,
	parseXML
} from '../src/export.js'
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

		describe('export', () => {
			it('should export a book to a file', () => {
				const data = {
					...DEFAULTS,
					source: 'spec/fixtures/extract/minimal.epub',
					metadata: {
						title: 'Test Book'
					}
				}
				const location = book(data).export()
				expect(location).toEqual('spec/fixtures/extract/Test-Book')
			})
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
		it('should read single item in toc', async () => {
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
		it('should read the table of contents', async () => {
			const content = [
				'<package>',
				' <manifest>',
				'  <item id="item1" href="chapter1.html" mediaType="application/xhtml+xml"/>',
				'  <item id="item2" href="chapter2.html" mediaType="application/xhtml+xml"/>',
				' </manifest>',
				' <spine>',
				'  <itemref idref="item1"/>',
				'  <itemref idref="item2"/>',
				' </spine>',
				'</package>'
			].join('\n')

			const toc = await readToc(content)
			expect(toc).toBeDefined()
			expect(toc.table.length).toEqual(2)
			expect(toc.table[0]).toEqual(
				{
					id: 'item1',
					href: 'chapter1.html',
					mediaType: 'application/xhtml+xml',
					order: 1
				},
				{
					id: 'item2',
					href: 'chapter2.html',
					mediaType: 'application/xhtml+xml',
					order: 1
				}
			)
		})
	})

	describe('organizeFiles', () => {
		it('should organize empty array', () => {
			const result = organizeFiles([])
			expect(result).toEqual({
				contents: [],
				assets: [],
				metadata: []
			})
		})
		it('should organize a set of files', () => {
			const files = [
				{ file: 'META-INF/metadata.opf', type: 'opf' },
				{ file: 'assets/author.jpg', type: 'jpg' },
				{ file: 'chapter1.html', type: 'html' },
				{ file: 'mimetype', type: '' },
				{ file: 'META-INF/container.xml', type: 'xml' },
				{ file: 'chapter2.xhtml', type: 'xhtml' },
				{ file: 'cover.jpg', type: 'jpg' },
				{ file: 'toc.ncx', type: 'ncx' },
				{ file: 'chapter3.htm', type: 'htm' }
			]
			const result = organizeFiles(files)
			expect(result).toEqual({
				contents: [files[2], files[5], files[8]],
				assets: [files[1], files[6]],
				metadata: [files[0], files[7]]
			})
		})
	})

	describe('parseXML', () => {
		it('should parse valid xml', () => {
			const content = '<root><child>value</child></root>'
			const result = parseXML('opf', content)
			expect(result).toEqual({
				content: { child: 'value' }
			})
		})
		it('should handle errors', () => {
			const invalidContent = '<root><child>value</child' // Missing closing tag
			const result = parseXML('opf', invalidContent)
			expect(result.content).toBeUndefined()
		})
	})
})
