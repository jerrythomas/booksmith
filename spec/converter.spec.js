import { describe, it, expect } from 'vitest'
import { createRegistry, convertToHtml, TO_HTML_REGISTRY } from '../src/converter'

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
})
