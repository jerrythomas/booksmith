import { describe, expect, it } from 'vitest'
import {
	getInfoFromName,
	readMarkdownFile,
	readJsonFileWithDefaults,
	scanBookFolder,
	processSpecialAssets
} from '../src/book'
import path from 'path'
import fs from 'fs/promises'

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

		it('should properly include cover image from metadata', async () => {
			const folderPath = path.join('spec/fixtures', 'book_with_cover')
			const book = await scanBookFolder(folderPath)
			
			// Check basic book properties
			expect(book.metadata.title).toBe('Book With Cover')
			expect(book.metadata.cover).toBe('assets/cover.png')
			
			// Verify cover image was added to assets
			const coverAsset = book.assets.find(asset => asset.id === 'cover-image')
			expect(coverAsset).toBeDefined()
			expect(coverAsset.file).toBe('assets/cover.png')
			expect(coverAsset.type).toBe('image/png')
		})
	})

	describe('processSpecialAssets', () => {
		it('should add cover image to assets when specified in metadata', async () => {
			// Create a book object with cover in metadata
			const book = {
				metadata: {
					title: 'Test Book',
					cover: 'assets/cover.png'
				},
				assets: []
			}
			
			const source = path.join('spec/fixtures', 'book_with_cover')
			const result = await processSpecialAssets(book, source)
			
			// Verify the cover image was added to assets
			expect(result.assets).toHaveLength(1)
			expect(result.assets[0]).toEqual({
				file: 'assets/cover.png',
				id: 'cover-image',
				type: 'image/png'
			})
		})
		
		it('should handle different image formats correctly', async () => {
			// Let's test with different image extensions
			const formats = [
				{ ext: 'jpg', mime: 'image/jpeg' },
				{ ext: 'jpeg', mime: 'image/jpeg' },
				{ ext: 'png', mime: 'image/png' },
				{ ext: 'gif', mime: 'image/gif' },
				{ ext: 'svg', mime: 'image/svg+xml' },
				{ ext: 'webp', mime: 'image/webp' }
			];
			
			// Store original access function
			const originalAccess = fs.access;
			
			try {
				// Mock file access check to always succeed
				fs.access = async () => {};
				
				for (const format of formats) {
					const coverPath = `assets/cover.${format.ext}`;
					
					// Create a book object with this format
					const book = {
						metadata: {
							title: 'Test Book',
							cover: coverPath
						},
						assets: []
					};
					
					const source = path.join('spec/fixtures', 'book_with_cover');
					const result = await processSpecialAssets(book, source);
					
					// Verify the asset was added with correct mime type
					expect(result.assets).toHaveLength(1);
					expect(result.assets[0]).toEqual({
						file: coverPath,
						id: 'cover-image',
						type: format.mime
					});
				}
			} finally {
				// Restore original function
				fs.access = originalAccess;
			}
		})
		
		it('should not duplicate cover image if already in assets', async () => {
			// Create a book object with cover in metadata and assets
			const book = {
				metadata: {
					title: 'Test Book',
					cover: 'assets/cover.png'
				},
				assets: [
					{
						file: 'assets/cover.png',
						id: 'existing-id',
						type: 'image/png'
					}
				]
			}
			
			const source = path.join('spec/fixtures', 'book_with_cover')
			const result = await processSpecialAssets(book, source)
			
			// Verify no duplicate was added and ID was updated
			expect(result.assets).toHaveLength(1)
			expect(result.assets[0].id).toBe('cover-image')
		})
		
		it('should handle non-existent cover image gracefully', async () => {
			// Create a book object with non-existent cover path
			const book = {
				metadata: {
					title: 'Test Book',
					cover: 'assets/nonexistent.png'
				},
				assets: []
			}
			
			const source = path.join('spec/fixtures', 'book_with_cover')
			const result = await processSpecialAssets(book, source)
			
			// Verify no assets were added
			expect(result.assets).toHaveLength(0)
		})
	})
})
