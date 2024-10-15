#!/usr/bin/env node
/* eslint-disable no-console */

import sade from 'sade'
import path from 'path'
import fs from 'fs'
import process from 'process'
import { initialize } from './init.js'
import { compile } from './converter.js'
import { readBook } from './book.js'
const prog = sade('bookdown')

prog
	.command('init')
	.option('-f, --folder', 'The folder to initialize the project in', '.')
	.describe('Initialize a new book project')
	.action(async (opts) => {
		const fullPath = path.resolve(opts.folder)
		await initialize(fullPath)
		console.log(`Initialized new book project at ${fullPath}`)
	})

prog
	.command('compile')
	.option('-f, --format', 'The format to generate', 'epub')
	.option('-i, --input', 'The input folder', '.')
	.describe('Compile the book')
	.action(async (opts) => {
		console.log(`Compiling book to ${opts.format}`)
		const book = await readBook(opts.input)

		const target = path.resolve(path.join(opts.input, 'build'))
		fs.mkdirSync(target, { recursive: true })
		await compile(book, opts.input, target)
	})

prog.parse(process.argv)
