import { v4 as uuid } from '@lukeed/uuid/secure'
import { getOPF } from './opf.js'
import JSZip from 'jszip'
import fs from 'fs'
import path from 'path'
import { EPUB_FILES } from './constants.js'

/**
 * Generates a Table of Contents (TOC) document as XHTML.
 *
 * @param {Array<Object>} contents - An array of content objects with `file` and `title` properties.
 * @returns {string} - XHTML formatted TOC.
 */
export function getTableOfContents(contents) {
	const header = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<!DOCTYPE html>',
		'<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">',
		'<head><title>Table of Contents</title></head><body>',
		'<nav epub:type="toc" id="toc">',
		'<h1>Table of Contents</h1>',
		'<ol>'
	].join('\n')

	const footer = `</ol></nav></body></html>`

	const items = contents
		.map((item) => {
			return `<li><a href="${item.file}">${item.title}</a></li>`
		})
		.join('\n')

	return `${header}\n${items}\n${footer}`
}

/**
 * Writes an EPUB file to disk.
 *
 * @param {import('./types').Book} book - The book object.
 * @param {string} source               - The source directory.
 * @param {string} target               - The target directory.
 */
export async function writeEpub(book, source, target) {
	const zip = new JSZip()
	// if (!fs.existsSync(target)) {
	fs.mkdirSync(target, { recursive: true })
	// }
	EPUB_FILES.forEach((item) => {
		zip.file(item.name, item.content)
	})

	zip.file('content.opf', book.opf)
	zip.file('toc.xhtml', book.toc)

	book.contents.forEach(({ file, content }) => {
		if (!content) content = fs.readFileSync(path.join(source, file))
		zip.file(file, content)
	})
	book.assets.forEach((asset) => {
		if (asset.content) {
			zip.file(asset.file, asset.content)
		} else {
			zip.file(asset.file, fs.readFileSync(path.join(source, asset.file)))
		}
	})

	const filename = path.join(target, `${book.name}.epub`)
	const content = await zip.generateAsync({ type: 'nodebuffer' })

	fs.writeFileSync(filename, content)

	return filename
}

/**
 * Generates an EPUB file.
 *
 * @param {import('./types').Book} book - The book object.
 * @returns {import('./types').EpubResult} - The EPUB object
 */
export function epub(book, source) {
	book.id = uuid()
	book.metadata.language = book.metadata.language ?? 'en'
	book.assets = book.assets ?? []

	const data = {
		toc: getTableOfContents(book.contents),
		opf: getOPF(book),
		name: book.metadata.title,
		contents: book.contents,
		// files: book.contents.map(({ file }) => file),
		assets: book.assets
	}

	return {
		write: (target) => writeEpub(data, source, target),
		book: data
	}
}
