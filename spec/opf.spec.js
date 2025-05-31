import { describe, it, expect } from 'vitest'
import {
	getMetaTag,
	getMetadata,
	getManifest,
	getSpine,
	getOPF,
	convertOpfToMetadata,
	extractMetaTag,
	extractOPFMetadata,
	extractDCMetadata,
	extractIdentifierTags,
	generateMetaTags
} from '../src/opf.js'

describe('opf', () => {
	describe('generateMetaTags', () => {
		it('should generate joined tags', () => {
			const result = generateMetaTags({ key: 'keywords', join: true }, ['tag1', 'tag2'])
			expect(result).toEqual(['<meta name="keywords" content="tag1, tag2" count="2"/>'])
		})
		it('should generate multiple meta tags', () => {
			const result = generateMetaTags({ key: 'keywords' }, ['tag1', 'tag2'])
			expect(result).toEqual([
				'<meta name="keywords" content="tag1"/>',
				'<meta name="keywords" content="tag2"/>'
			])
		})
	})
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
				cover: 'cover-image'
			}
			const uuid = '12345'
			const result = getMetadata(metadata, uuid)
			expect(result).toContain('<dc:title>Test Book</dc:title>')
			expect(result).toContain('<dc:creator>Test Author</dc:creator>')
			expect(result).toContain('<dc:description>Test Description</dc:description>')
			expect(result).toContain('<dc:language>en</dc:language>')
			expect(result).toContain('<meta name="cover" content="cover-image"/>')
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
			const contents = [
				{ file: 'chapter1.xhtml', order: 1 },
				{ file: 'chapter2.xhtml', order: 2 }
			]
			const assets = [{ file: 'cover.jpg', id: 'cover-image', type: 'image/jpeg' }]

			const result = getManifest(contents, assets)
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
			const contents = [{ order: 1 }, { order: 2 }]
			const result = getSpine(contents)
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
				contents: [
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
	describe('convertOpfToMetadata', () => {
		it('should convert OPF content from XML to the metadata structure', async () => {
			const opfContent = `
			     <xml>
            <package>
                <metadata>
                    <dc:title>Test Book</dc:title>
                    <dc:creator>Test Author</dc:creator>
                </metadata>
                <manifest>
                    <item id="item1" href="chapter1.html" media-type="application/xhtml+xml"/>
                    <item id="item2" href="chapter2.html" media-type="application/xhtml+xml"/>
                    <item id="cover" href="cover.jpg" media-type="image/jpeg"/>
                </manifest>
                <spine>
                    <itemref idref="item1"/>
                    <itemref idref="item2"/>
                </spine>
            </package>
          </xml>
        `

			const expected = {
				metadata: {
					'dc:title': 'Test Book',
					'dc:creator': 'Test Author'
				},
				content: [
					{ href: 'chapter1.html', order: 1, id: 'item1', 'media-type': 'application/xhtml+xml' },
					{ href: 'chapter2.html', order: 2, id: 'item2', 'media-type': 'application/xhtml+xml' }
				],
				assets: [{ id: 'cover', href: 'cover.jpg', 'media-type': 'image/jpeg' }]
			}

			const result = await convertOpfToMetadata(opfContent)
			expect(result).toEqual(expected)
		})
	})

	describe('extractOPFMetadata', () => {
		const metadataJson = {
			'dc:identifier': { id: 'book-id', _value: 'urn:uuid:8f89a7e9-5f9d-46a6-8587-d01134e7034f' },
			'dc:title': 'Book Title',
			'dc:creator': 'Author Name',
			'dc:language': 'en',
			'dc:description': 'A short description of the book',
			meta: [
				{ property: 'dcterms:modified', _value: '2024-10-02T00:00:00Z' },
				{ name: 'cover', content: 'cover-image' },
				{ property: 'keywords', content: 'tag1, tag2' },
				{ property: 'categories', content: 'category1, category2' }
			]
		}
		describe('extractDCMetadata', () => {
			it('should extract the dc:tags', () => {
				const result = extractDCMetadata(metadataJson)
				expect(result).toEqual({
					author: 'Author Name',
					description: 'A short description of the book',
					language: 'en',
					title: 'Book Title'
				})
			})
		})
		describe('extractIdentifiers', () => {
			it('should extract the identifiers', () => {
				const result = extractIdentifierTags(metadataJson)
				expect(result).toEqual({
					id: '8f89a7e9-5f9d-46a6-8587-d01134e7034f'
				})
			})
		})

		it('should correctly extract metadata from OPF JSON', () => {
			const metadataJson = {
				'dc:identifier': { id: 'book-id', _value: 'urn:uuid:8f89a7e9-5f9d-46a6-8587-d01134e7034f' },
				'dc:title': 'Book Title',
				'dc:creator': 'Author Name',
				'dc:language': 'en',
				'dc:description': 'A short description of the book',
				meta: [
					{ property: 'dcterms:modified', _value: '2024-10-02T00:00:00Z' },
					{ property: 'cover', content: 'cover-image' },
					{ property: 'keywords', content: 'tag1, tag2' },
					{ property: 'categories', content: 'category1, category2' }
				]
			}

			const expectedMetadata = {
				id: '8f89a7e9-5f9d-46a6-8587-d01134e7034f',
				title: 'Book Title',
				author: 'Author Name',
				language: 'en',
				description: 'A short description of the book',
				modified: '2024-10-02T00:00:00Z',
				cover: 'cover-image',
				keywords: ['tag1', 'tag2'],
				categories: ['category1', 'category2']
			}

			expect(extractOPFMetadata(metadataJson)).toEqual(expectedMetadata)
		})

		it('should correctly handle multiple authors', () => {
			const metadataJson = {
				'dc:creator': [
					{ id: 'author 1', _value: 'Author Name 1' },
					{ id: 'author 2', _value: 'Author Name 2' }
				]
			}

			const expectedMetadata = {
				author: ['Author Name 1', 'Author Name 2']
			}

			expect(extractOPFMetadata(metadataJson)).toEqual(expectedMetadata)
		})
		it('should correctly handle single metadata', () => {
			const metadataJson = {
				meta: { property: 'keywords', content: 'tag1, tag2' }
			}

			const expectedMetadata = {
				keywords: ['tag1', 'tag2']
			}

			expect(extractOPFMetadata(metadataJson)).toEqual(expectedMetadata)
		})
	})
	describe('extractMetaTag', () => {
		it('should correctly extract keywords tag', () => {
			const metaTag = {
				property: 'keywords',
				content: 'tag1, tag2'
			}

			const expected = {
				keywords: ['tag1', 'tag2']
			}

			expect(extractMetaTag(metaTag)).toEqual(expected)
		})
		it('should correctly extract catgeories tag', () => {
			const metaTag = {
				property: 'categories',
				content: 'ctg1, ctg2'
			}

			const expected = {
				categories: ['ctg1', 'ctg2']
			}

			expect(extractMetaTag(metaTag)).toEqual(expected)
		})
		it('should correctly extractmodified on', () => {
			const metaTag = {
				property: 'dcterms:modified',
				_value: '2024-10-02T00:00:00Z'
			}

			const expected = {
				modified: '2024-10-02T00:00:00Z'
			}

			expect(extractMetaTag(metaTag)).toEqual(expected)
		})
	})
})
