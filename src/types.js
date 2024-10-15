/**
 * @typedef {'chapter'|'preface'|'abstract'|'introduction'|'section'|'afterword'} SectionType
 */

/**
 * @typedef {Object} Cover
 * @property {string} url     - The cover image of the book.
 * @property {string} caption - The caption of the cover image.
 * @property {string} alt     - The alt text of the cover image.
 * @property {string} title   - The title of the cover image.
 */

/**
 * @typedef {Object} Metadata
 * @property {string} title           - The title of the book.
 * @property {string|string[]} author - The author of the book.
 * @property {string} description     - A short description of the book.
 * @property {string} audience        - The target audience of the book.
 * @property {string[]} [genres]      - Genres associated with the section.
 * @property {string[]} [tags]        - Tags associated with the section.
 * @property {string[]} [keywords]      Keywords associated with the section.
 * @property {string} [publishedOn]   - The date the book was published.
 * @property {string} [publisher]     - The publisher of the book.
 * @property {string} [ISBN]          - The International Standard Book Number.
 * @property {string} [DOI]           - The Digital Object Identifier.
 * @property {string} [ASIN]          - Amazon Standard Identification Number.
 * @property {string} [license]       - The license of the book.
 * @property {string} [language]      - The language of the book.
 * @property {Cover}  [cover]         - The cover image of the book.
 * @property {string} [series]        - The series the book belongs to.
 * @property {string} [seriesNumber]  - The number of the book in the series.
 * @property {string} [seriesCount]   - The total number of books in the series.
 */

/**
 * @typedef {Object} Config
 * @property {boolean} chapterNumbers=false - Whether to show chapter numbers.
 * @property {boolean} toc=false            - Whether to include a table of contents.
 * @property {number} tocDepth=1            - Number of levels for the table of contents.
 * @property {boolean} appendix=false       - Whether to include an appendix.
 * @property {boolean} glossary=false       - Whether to include a glossary.
 * @property {string} theme=none            - The theme of the book.
 */

/**
 * @typedef {Object} BookSection
 * @property {string} id             - The id of the section.
 * @property {number} order          - The order of the section.
 * @property {string} title          - The title of the section.
 * @property {string} file           - The file path of the section.
 * @property {SectionType} [type]      - The type of the section.
 * @property {string} fileType       - File type for the section.
 * @property {string} [content]       - Content of the file when populated
 * @property {string} [notes]        - Notes associated with the section.
 * @property {string} [audience]     - The target audience of the section.
 * @property {string} [author]       - The author of the section.
 * @property {string} [date]         - The date of the section.
 * @property {string[]} [genre]      - Genres associated with the section.
 * @property {string[]} [tags]       - Tags associated with the section.
 */

/**
 * @typedef {Object} SectionIndex
 * @property {string} id               - The id of the section.
 * @property {number} order            - The order of the section.
 * @property {number} title            - The title of the section.
 * @property {SectionIndex[]} sections - Subsections of the section.
 */

/**
 * @typedef {Object} Asset
 * @property {string} file - The file path of the asset.
 * @property {string} type - The type of the asset.
 */
/**
 * @typedef {Object} Book
 * @property {Metadata} metadata      - The metadata of the book.
 * @property {Config} config          - The configuration of the book.
 * @property {BookSection[]} sections - The sections of the book.
 * @property {Asset[]} assets         - The assets of the book.
 * @property {SectionIndex[]} [toc]   - The table of contents of the book.
 */

/**
 * @typedef {function(string): Promise<string>} AsyncWriter
 */

/**
 * @typedef {Object} EpubResult
 * @property {AsyncWriter} write - Async function to write the EPUB file.
 * @property {Book}        book  - The book data used to generate the EPUB.
 */

export {}
