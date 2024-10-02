/* eslint-disable no-console */
import sade from 'sade'
import path from 'path'
import process from 'process'
import { initialize } from './init.js'

const prog = sade('bookdown')

prog
	.command('init')
	.option('-f, --folder', 'The folder to initialize the project in', '.')
	.describe('Initialize a new book project')
	.action(async (opts) => {
		const fullPath = path.resolve(opts.folder)
		console.log(opts)
		await initialize(fullPath)
		console.log(`Initialized new book project at ${fullPath}`)
	})

prog.parse(process.argv)
