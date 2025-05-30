/* eslint-disable no-console */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import path from 'path'
import process from 'process'
import { initialize } from '../src/init.js'
import { compile } from '../src/converter.js'
import { scanBookFolder } from '../src/book.js'

vi.mock('../src/init.js', () => ({
	initialize: vi.fn()
}))
vi.mock('../src/book.js', () => ({
	scanBookFolder: vi.fn().mockReturnValue(Promise.resolve({ title: 'A Book' }))
}))

vi.mock('../src/converter.js', () => ({
	compile: vi.fn()
}))

const originalArgv = process.argv
const originalConsoleLog = console.log
const originalConsoleError = console.error

describe('CLI', () => {
	beforeEach(() => {
		console.log = vi.fn()
		console.error = vi.fn()
	})

	afterEach(() => {
		console.log = originalConsoleLog
		console.error = originalConsoleError
		process.argv = [...originalArgv]
		vi.clearAllMocks()
		vi.resetModules() // Reset all modules imported by vitest
	})

	it('should initialize a new book project in the current folder by default', async () => {
		process.argv = ['node', 'index.js', 'init']
		await import('../src/index.js')

		expect(initialize).toHaveBeenCalledWith(path.resolve('.'))
		expect(console.log).toHaveBeenCalledWith(`Initialized new book project at ${path.resolve('.')}`)
	})

	it('should initialize a new book project in the specified folder', async () => {
		const testFolder = 'test-folder'
		process.argv = ['node', 'index.js', 'init', '--folder', testFolder]

		await import('../src/index.js')
		expect(initialize).toHaveBeenCalledWith(path.resolve(testFolder))

		expect(console.log).toHaveBeenCalledWith(
			`Initialized new book project at ${path.resolve(testFolder)}`
		)
	})

	it('should compile a new book ', async () => {
		const testFolder = 'test-folder'
		process.argv = ['node', 'index.js', 'compile', '--folder', testFolder]

		await import('../src/index.js')
		expect(console.log).toHaveBeenCalledWith(`Compiling book to epub`)
		expect(scanBookFolder).toHaveBeenCalledWith('.')
		expect(compile).toHaveBeenCalledWith({ title: 'A Book' }, '.', path.resolve('./build'))
	})
	// it('should handle errors during initialization', async () => {
	//   const testFolder = 'test-folder'
	//   const errorMessage = 'Initialization error'
	//   initialize.mockRejectedValueOnce(new Error(errorMessage))

	//   process.argv = ['node', 'index.js', 'init', '--folder', testFolder]
	//   await import('../src/index.js')

	//   expect(initialize).toHaveBeenCalledWith(path.resolve(testFolder))
	//   expect(console.error).toHaveBeenCalledWith(
	//     expect.stringContaining(errorMessage)
	//   )
	// })
})
