import { describe, it, expect } from 'vitest'
import { getTableOfContents, epub } from '../src/epub.js'

describe('generate', () => {
	describe('generate_toc', () => {
		it('should generate a valid XHTML TOC', () => {
			const contents = [
				{ file: '01-preface.xhtml', title: 'Preface' },
				{ file: '02-introduction.xhtml', title: 'Introduction' },
				{ file: '03-chapters/01-chapter1.xhtml', title: 'Chapter 1' }
			]

			const result = getTableOfContents(contents)

			expect(result).toContain('<li><a href="01-preface.xhtml">Preface</a></li>')
			expect(result).toContain('<li><a href="02-introduction.xhtml">Introduction</a></li>')
			expect(result).toContain('<li><a href="03-chapters/01-chapter1.xhtml">Chapter 1</a></li>')
			expect(result).toContain('</nav></body></html>')
		})

		it('should return a valid TOC even for an empty content array', () => {
			const result = getTableOfContents([])
			expect(result).toContain('<ol>\n\n</ol>')
		})
	})

	describe('write_epub', () => {
		it('should write an EPUB file to disk', async () => {
			const book = {
				id: '123456',
				metadata: {
					title: 'Test Book',
					author: 'John Doe',
					language: 'en'
				},
				assets: [{ file: 'cover.jpeg', id: 'cover-image', type: 'image/jpeg', content: Buffer.from('dummy image data') }],
				contents: [
					{ order: 1, file: 'contents/01-preface.xhtml', title: 'Preface', content: '<html><body>Preface content</body></html>' },
					{ order: 2, file: 'contents/02-introduction.xhtml', title: 'Introduction', content: '<html><body>Introduction content</body></html>' },
					{ order: 3, file: 'contents/03-chapters/01-chapter-1.xhtml', title: 'Chapter 1', content: '<html><body>Chapter 1 content</body></html>' },
					{ order: 4, file: 'contents/03-chapters/02-chapter-2.xhtml', title: 'Chapter 2', content: '<html><body>Chapter 2 content</body></html>' },
					{ order: 5, file: 'contents/03-chapters/03-chapter-3.xhtml', title: 'Chapter 3', content: '<html><body>Chapter 3 content</body></html>' },
					{ order: 6, file: 'contents/04-afterword.xhtml', title: 'Conclusion', content: '<html><body>Afterword content</body></html>' }
				]
			}

			const epubResult = epub(book, 'spec/fixtures/')
			const result = await epubResult.write('spec/fixtures')
			expect(result).toEqual('spec/fixtures/Test Book.epub')
		})

		it('should create a valid epub object', () => {
			const book = {
				metadata: {
					title: 'Test Book',
					author: 'John Doe'
				},
				assets: [{ file: 'cover.jpeg', id: 'cover-image', type: 'image/jpeg', content: Buffer.from('dummy image data') }],
				contents: [
					{ order: 1, file: 'contents/01-preface.xhtml', title: 'Preface', content: '<html><body>Preface content</body></html>' },
					{ order: 2, file: 'contents/02-introduction.xhtml', title: 'Introduction', content: '<html><body>Introduction content</body></html>' },
					{ order: 3, file: 'contents/03-chapters/01-chapter-1.xhtml', title: 'Chapter 1', content: '<html><body>Chapter 1 content</body></html>' },
					{ order: 4, file: 'contents/03-chapters/02-chapter-2.xhtml', title: 'Chapter 2', content: '<html><body>Chapter 2 content</body></html>' },
					{ order: 5, file: 'contents/03-chapters/03-chapter-3.xhtml', title: 'Chapter 3', content: '<html><body>Chapter 3 content</body></html>' },
					{ order: 6, file: 'contents/04-afterword.xhtml', title: 'Conclusion', content: '<html><body>Afterword content</body></html>' }
				]
			}

			const result = epub(book, 'spec/fixtures/')
			expect(result).toBeDefined()
		})
	})
})
