import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import process from 'process'
import { initialize } from '../src/init.js'

const testDir = path.join(process.cwd(), 'spec/init-test')

describe('init', () => {
	beforeEach(async () => {
		await fs.rm(testDir, { recursive: true, force: true })
	})

	afterEach(async () => {
		await fs.rm(testDir, { recursive: true, force: true })
	})

	it('should create the necessary folders and files', async () => {
		await initialize(testDir)

		const folders = ['content', 'content/03-chapters']

		const files = [
			'metadata.json',
			'config.json',
			'content/01-preface.md',
			'content/02-introduction.md',
			'content/03-chapters/01-chapter1.md',
			'content/03-chapters/02-chapter2.md',
			'content/03-chapters/03-chapter3.md'
		]

		for (const folder of folders) {
			const folderPath = path.join(testDir, folder)
			const folderExists = await fs
				.stat(folderPath)
				.then(() => true)
				.catch(() => false)

			expect(folderExists).toBe(true)
		}

		for (const file of files) {
			const filePath = path.join(testDir, file)
			const fileExists = await fs
				.stat(filePath)
				.then(() => true)
				.catch(() => false)
			expect(fileExists).toBe(true)
		}
	})
})
