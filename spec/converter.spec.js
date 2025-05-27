import { describe, it, expect, afterAll } from 'vitest'
import { createRegistry, convertToHtml, compile } from '../src/converter'
import { scanBookFolder } from '../src/book'
import { rimraf } from 'rimraf'

describe('HTML Converter', () => {
	describe('createRegistry', () => {
		it('should register and retrieve converters', () => {
			const registry = createRegistry()
			const converter = (content) => content
			registry.register('test', converter)
			expect(registry.get('test')).toBe(converter)
		})
	})

	describe('convertToHtml', () => {
		it('should convert markdown to HTML', () => {
			const item = {
				type: 'md',
				content: '## Test\nThis is a test.',
				file: 'test.md'
			}
			const result = convertToHtml(item)
			expect(result.type).toBe('html')
			expect(result.content).toContain('<h2>Test</h2>')
			expect(result.file).toBe('test.html')
		})

		it('should throw an error for unknown file types', () => {
			const item = { type: 'unknown', content: '', file: 'test.unknown' }
			expect(() => convertToHtml(item)).toThrow()
		})
	})

	describe('compile', () => {
		afterAll(() => {
			rimraf.sync('spec/fixtures/build')
		})
		it('should compile an md book to epub', async () => {
			const book = await scanBookFolder('spec/fixtures/minimal')
			const result = await compile(book, 'spec/fixtures/minimal', 'spec/fixtures/build')
			expect(result).toEqual('spec/fixtures/build/A Minimal Book.epub')
		})
	})
})
