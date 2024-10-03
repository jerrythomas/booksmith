import { describe, it, expect } from 'vitest'
import { getMetaTag, getMetadata, getManifest, getSpine, getOPF } from '../src/opf.js'

describe('opf', () => {
	describe('getMetaTag', () => {
		it('should convert a single metadata attribute to a dc: tag', () => {
			const metadata = { title: 'Test Book' }
			const mapping = { key: 'title', tag: 'dc:title' }
			const result = getMetaTag(metadata, mapping)
			expect(result).toEqual(['<dc:title>Test Book</dc:title>'])
		})

		it('should convert a single metadata attribute to a meta tag', () => {
			const metadata = { audience: 'General' }
			const mapping = { key: 'audience', tag: 'meta', property: 'audience' }
			const result = getMetaTag(metadata, mapping)
			expect(result).toEqual(['<meta name="audience" content="General"/>'])
		})

		it('should convert multiple metadata attributes to dc: tags', () => {
			const metadata = { author: ['Author One', 'Author Two'] }
			const mapping = { key: 'author', tag: 'dc:creator', multiple: true }
			const result = getMetaTag(metadata, mapping)
			expect(result).toEqual([
				'<dc:creator id="author1">Author One</dc:creator>',
				'<dc:creator id="author2">Author Two</dc:creator>'
			])
		})

		it('should convert multiple metadata attributes to meta tags', () => {
			const metadata = { genres: ['Fiction', 'Adventure'] }
			const mapping = { key: 'genres', tag: 'meta', property: 'genre' }
			const result = getMetaTag(metadata, mapping)
			expect(result).toEqual([
				'<meta name="genre" content="Fiction"/>',
				'<meta name="genre" content="Adventure"/>'
			])
		})

		it('should convert multiple metadata attributes to single meta tag', () => {
			const metadata = { genres: ['Fiction', 'Adventure'] }
			const mapping = { key: 'genres', tag: 'meta', property: 'genre', join: true }
			const result = getMetaTag(metadata, mapping)
			expect(result).toEqual(['<meta name="genre" content="Fiction, Adventure" count="2"/>'])
		})

		it('should handle metadata attributes with schemes', () => {
			const metadata = { ISBN: '123-456-789' }
			const mapping = { key: 'ISBN', tag: 'dc:identifier', scheme: 'ISBN' }
			const result = getMetaTag(metadata, mapping)
			expect(result).toEqual(['<dc:identifier id="isbn">urn:isbn:123-456-789</dc:identifier>'])
		})

		it('should return an empty array if the metadata attribute is not present', () => {
			const metadata = {}
			const mapping = { key: 'title', tag: 'dc:title' }
			const result = getMetaTag(metadata, mapping)
			expect(result).toEqual([])
		})
	})
	describe('getMetadata', () => {
		it('should generate the metadata section of the OPF file', () => {
			const metadata = {
				title: 'Test Book',
				author: 'Test Author',
				description: 'Test Description',
				language: 'en',
				cover: 'cover.jpg'
			}
			const uuid = '12345'
			const result = getMetadata(metadata, uuid)
			expect(result).toContain('<dc:title>Test Book</dc:title>')
			expect(result).toContain('<dc:creator>Test Author</dc:creator>')
			expect(result).toContain('<dc:description>Test Description</dc:description>')
			expect(result).toContain('<dc:language>en</dc:language>')
			expect(result).toContain(`urn:uuid:${uuid}`)
		})

		it('should handle multiple authors, genres, and keywords', () => {
			const metadata = {
				title: 'Test Book',
				author: ['Author One', 'Author Two'],
				description: 'Test Description',
				language: 'en',
				genres: ['Fiction', 'Adventure'],
				keywords: ['keyword1', 'keyword2'],
				cover: 'cover.jpg'
			}
			const uuid = '12345'
			const result = getMetadata(metadata, uuid)
			expect(result).toContain('<dc:creator id="author1">Author One</dc:creator>')
			expect(result).toContain('<dc:creator id="author2">Author Two</dc:creator>')
			expect(result).toContain('<meta name="author-count" content="2"/>')
			expect(result).toContain('<meta name="genre" content="Fiction"/>')
			expect(result).toContain('<meta name="genre" content="Adventure"/>')
			expect(result).toContain('<meta name="keywords" content="keyword1, keyword2" count="2"/>')
		})

		it('should handle different schemes for dc:identifier tags', () => {
			const metadata = {
				title: 'Test Book',
				author: 'Test Author',
				description: 'Test Description',
				language: 'en',
				ISBN: '9781234567890',
				ASIN: 'B00X123ABC',
				DOI: '10.1000/182'
			}
			const uuid = '12345'
			const result = getMetadata(metadata, uuid)
			expect(result).toContain('<dc:identifier id="book-id">urn:uuid:12345</dc:identifier>')
			expect(result).toContain('<dc:identifier id="isbn">urn:isbn:9781234567890</dc:identifier>')
			expect(result).toContain('<dc:identifier id="asin">urn:asin:B00X123ABC</dc:identifier>')
			expect(result).toContain('<dc:identifier id="doi">urn:doi:10.1000/182</dc:identifier>')
		})
	})

	describe('getManifest', () => {
		it('should generate the manifest section of the OPF file', () => {
			const content = [
				{ file: 'chapter1.xhtml', order: 1 },
				{ file: 'chapter2.xhtml', order: 2 }
			]
			const assets = [{ file: 'cover.jpg', id: 'cover-image', type: 'image/jpeg' }]

			const result = getManifest(content, assets)
			expect(result).toContain('<item id="cover-image" href="cover.jpg" media-type="image/jpeg"/>')
			expect(result).toContain(
				'<item id="item-1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>'
			)
			expect(result).toContain(
				'<item id="item-2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>'
			)
		})
	})

	describe('getSpine', () => {
		it('should generate the spine section of the OPF file', () => {
			const content = [{ order: 1 }, { order: 2 }]
			const result = getSpine(content)
			expect(result).toContain('<itemref idref="item-1"/>')
			expect(result).toContain('<itemref idref="item-2"/>')
		})
	})

	describe('getOPF', () => {
		it('should generate the complete OPF file', () => {
			const book = {
				metadata: {
					title: 'Test Book',
					author: 'Test Author',
					description: 'Test Description',
					language: 'en',
					cover: 'cover.jpg'
				},
				assets: [{ file: 'cover.jpg', id: 'cover-image', type: 'image/jpeg' }],
				content: [
					{ file: 'chapter1.xhtml', order: 1, title: 'Chapter 1' },
					{ file: 'chapter2.xhtml', order: 2, title: 'Chapter 2' }
				],
				id: '12345'
			}

			const result = getOPF(book)
			expect(result).toContain('<dc:title>Test Book</dc:title>')
			expect(result).toContain('<dc:creator>Test Author</dc:creator>')
			expect(result).toContain('<dc:description>Test Description</dc:description>')
			expect(result).toContain('<dc:language>en</dc:language>')
			expect(result).toContain(`urn:uuid:${book.id}`)
			expect(result).toContain('<item id="cover-image" href="cover.jpg" media-type="image/jpeg"/>')
			expect(result).toContain(
				'<item id="item-1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>'
			)
			expect(result).toContain(
				'<item id="item-2" href="chapter2.xhtml" media-type="application/xhtml+xml"/>'
			)
			expect(result).toContain(
				'<item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>'
			)
			expect(result).toContain('<itemref idref="item-1"/>')
			expect(result).toContain('<itemref idref="item-2"/>')
		})
	})
})
