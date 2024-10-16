// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		coverage: {
			reporter: ['text', 'lcov', 'html'],
			all: true,
			include: ['src'],
			exclude: ['spec', 'src/types.js']
		}
	}
})
