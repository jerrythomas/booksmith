const config = {
	chapterNumbers: false,
	tocLevels: 1,
	toc: false,
	appendix: false,
	glossary: false,
	theme: 'default'
}

const metadata = {
	title: 'Untitled Book',
	author: 'Unknown Author',
	description: '',
	audience: '',
	genres: []
}

export const starter = {
	'metadata.json': JSON.stringify(metadata, null, 2),
	'config.json': JSON.stringify(config, null, 2),
	'content/01-preface.md': '# Preface\n\nWrite your preface here.',
	'content/02-introduction.md': '# Introduction\n\nWrite your introduction here.',
	'content/03-chapters/01-chapter1.md': '# Write your first chapter here.\n\n',
	'content/03-chapters/02-chapter2.md': '# Write your second chapter here.\n\n',
	'content/03-chapters/03-chapter3.md': '# Write your third chapter here.\n\n'
}

export const DEFAULTS = {
	config,
	metadata
}

export const CONFIG_FILE = 'book.json'

export const metadataMapping = [
	{ key: 'id', tag: 'dc:identifier', scheme: 'uuid', name: 'book-id' },
	{ key: 'title', tag: 'dc:title' },
	{ key: 'author', tag: 'dc:creator', count: true },
	{ key: 'description', tag: 'dc:description' },
	{ key: 'audience', tag: 'meta', property: 'audience' },
	{ key: 'genres', tag: 'meta', property: 'genre' },
	{ key: 'tags', tag: 'meta', property: 'tag' },
	{ key: 'keywords', tag: 'meta', property: 'keywords', join: true },
	{ key: 'categories', tag: 'meta', property: 'categories', join: true },
	{ key: 'publishedOn', tag: 'dc:date' },
	{ key: 'publisher', tag: 'dc:publisher' },
	{ key: 'ISBN', tag: 'dc:identifier', scheme: 'ISBN' },
	{ key: 'DOI', tag: 'dc:identifier', scheme: 'DOI' },
	{ key: 'ASIN', tag: 'dc:identifier', scheme: 'ASIN' },
	{ key: 'license', tag: 'dc:rights' },
	{ key: 'language', tag: 'dc:language' },
	{ key: 'series', tag: 'meta', property: 'series' },
	{ key: 'seriesNumber', tag: 'meta', property: 'seriesNumber' },
	{ key: 'seriesCount', tag: 'meta', property: 'seriesCount' },
	{ key: 'cover', tag: 'meta', property: 'cover', type: 'asset', ref: 'id' }
]

export const EPUB_FILES = [
	{ name: 'mimetype', content: 'application/epub+zip' },
	{
		name: 'META-INF/container.xml',
		content: [
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">',
			' <rootfiles>',
			'  <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>',
			' </rootfiles>',
			'</container>'
		].join('\n')
	}
]

export const EXCLUDED_FILE_TYPES = ['epub']
export const EXCLUDED_FILES = [RegExp(/^\..+/), RegExp(/^Thumbs\.db$/, 'i'), RegExp(/^_build/, 'i')]
export const MAX_FILES = 10000
export const contentTypes = {
	html: 'text/html',
	htm: 'text/html',
	xhtml: 'text/html',
	css: 'text/css',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	opf: 'application/oebps-package+xml',
	ncx: 'application/x-dtbncx+xml'
}
