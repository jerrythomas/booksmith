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
	{ key: 'title', tag: 'dc:title' },
	{ key: 'author', tag: 'dc:creator', multiple: true, count: true },
	{ key: 'description', tag: 'dc:description' },
	{ key: 'audience', tag: 'meta', property: 'audience' },
	{ key: 'genres', tag: 'meta', property: 'genre', multiple: true },
	{ key: 'tags', tag: 'meta', property: 'tag', multiple: true },
	{ key: 'keywords', tag: 'meta', property: 'keywords', join: true },
	{ key: 'publishedOn', tag: 'dc:date' },
	{ key: 'publisher', tag: 'dc:publisher' },
	{ key: 'ISBN', tag: 'dc:identifier', scheme: 'ISBN' },
	{ key: 'DOI', tag: 'dc:identifier', scheme: 'DOI' },
	{ key: 'ASIN', tag: 'dc:identifier', scheme: 'ASIN' },
	{ key: 'license', tag: 'dc:rights' },
	{ key: 'language', tag: 'dc:language' },
	{ key: 'series', tag: 'meta', property: 'series' },
	{ key: 'seriesNumber', tag: 'meta', property: 'seriesNumber' },
	{ key: 'seriesCount', tag: 'meta', property: 'seriesCount' }
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
