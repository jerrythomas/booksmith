import { describe, it, expect } from 'vitest'
import { book } from '../src/export.js'
import fs from 'fs/promises'
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
			console.log(data.metadata[0])
			// expect(data.content.length).toEqual(1)
			// expect(data.assets.length).toEqual(1)
			// expect(data.metadata.length).toEqual(1)
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
})
