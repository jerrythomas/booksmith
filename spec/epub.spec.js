import { describe, it, expect } from 'vitest'
import { getTableOfContents, epub } from '../src/epub.js'

describe('generate', () => {
	describe('generate_toc', () => {
		it('should generate a valid XHTML TOC', () => {
			const content = [
				{ file: '01-preface.xhtml', title: 'Preface' },
				{ file: '02-introduction.xhtml', title: 'Introduction' },
				{ file: '03-chapters/01-chapter1.xhtml', title: 'Chapter 1' }
			]

			const result = getTableOfContents(content)

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
				metadata: {
					title: 'Test Book',
					author: 'John Doe',
					language: 'en'
				},
				assets: [{ file: 'cover.jpeg', id: 'cover-image', type: 'image/jpeg' }],
				content: [
					{ order: 1, file: 'contents/01-preface.xhtml', title: 'Preface' },
					{ order: 2, file: 'contents/02-introduction.xhtml', title: 'Introduction' },
					{ order: 3, file: 'contents/03-chapters/01-chapter-1.xhtml', title: 'Chapter 1' },
					{ order: 4, file: 'contents/03-chapters/02-chapter-2.xhtml', title: 'Chapter 2' },
					{ order: 5, file: 'contents/03-chapters/03-chapter-3.xhtml', title: 'Chapter 3' },
					{ order: 6, file: 'contents/04-afterword.xhtml', title: 'Conclusion' }
				]
			}
			const epubBook = epub(book, 'spec/fixtures/html')
			const result = await epubBook.write('spec/fixtures')
			expect(result).toEqual('spec/fixtures/Test Book.epub')
		})

		it('should write an EPUB file to disk', async () => {
			const book = {
				metadata: {
					title: 'Test Book',
					author: 'John Doe'
				},
				content: [
					{ order: 1, file: 'contents/01-preface.xhtml', title: 'Preface' },
					{ order: 2, file: 'contents/02-introduction.xhtml', title: 'Introduction' },
					{ order: 3, file: 'contents/03-chapters/01-chapter-1.xhtml', title: 'Chapter 1' },
					{ order: 4, file: 'contents/03-chapters/02-chapter-2.xhtml', title: 'Chapter 2' },
					{ order: 5, file: 'contents/03-chapters/03-chapter-3.xhtml', title: 'Chapter 3' },
					{ order: 6, file: 'contents/04-afterword.xhtml', title: 'Conclusion' }
				]
			}
			const epubBook = epub(book, 'spec/fixtures/html')
			const result = await epubBook.write('spec/fixtures')
			expect(result).toEqual('spec/fixtures/Test Book.epub')
		})
	})
})
