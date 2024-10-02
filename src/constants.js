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
