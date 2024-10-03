# Booksmith

Objective:

- Use markdown or variants like Rmarkdown, Jupyter notebooks, to write documentation.
- Use a single source to generate multiple outputs like HTML, PDF, EPUB, Gitbook etc.
- Users should be able to focus on content and not worry about the output format or styling.

## Anatomy

A book consists of the following:

- content: A folder containing the actual content of the book. This includes chapters preface, introduction, afterword etc.
- assets: A folder containing images, stylesheet
- metadata: A file containing metadata about the book like title, author, description etc.
- configuration: An optional configuration that can be used to customize the output of the book.

## Approach

- Write content in markdown, Rmarkdown, or jupyter notebooks
- Each segment of the book is a separate file in the content folder. Sub folders can be used to further organize the content.
- Folders should include an index file that contains metadata about the folder.
- Users should prefix each file with a number to indicate the order of the segments.
- Users can add metadata to each segment using frontmatter. Frontmatter can be used to override the order of the segments and can be used to rename the segment file.

## Guidelines

Using adapters would enable us to build a flexible system that can support multiple input and output formats.

- Use adapters for different output formats like HTML, PDF, EPUB, Gitbook etc.
- Use adapters to handle conversion of markdown, rmarkdown, jupyter notebooks to the desired output format.

## Structure

Given a folder of files and a metadata file, we can build a book object with the structure below. Additional properties can be added to each file. This metadata can eb further used by adapters to generate the desired output.

### Folder structure

```
book-project/
├── content/
│   ├── 01-preface.md
│   ├── 02-introduction.md
│   └── 03-chapters/
│       ├── 01-chapter1.md
│       ├── 02-chapter2.md
│       └── 03-chapter3.md
├── assets/
│   ├── images/
│   └── styles/
├── metadata.json
├── config.json
└── .build/
```

### Metadata

```js
{
  metadata: {
    title: "Book Title",
    author: "Author Name",
    description: "A short description of the book",
    cover: "path/to/cover/image",
    tags: ["tag1", "tag2"],
    categories: ["category1", "category2"],
  },
  content: [
    {
      file: "path/to/01-preface.md",
      order: 1,
      type: "preface",
      title: "Preface",
    },
    {
      file: "path/to/02-introduction.md",
      order: 2,
      type: "introduction",
      title: "Introduction",
    },
    {
      file: "path/to/03-chapters/01-chapter1.md",
      order: 3,
      type: "chapter",
      title: "Chapter 1",
    },
    {
      file: "path/to/03-chapters/02-chapter2.md",
      order: 4,
      type: "chapter",
      title: "Chapter 2",
    },
    {
      file: "path/to/03-chapters/03-chapter3.md",
      order: 5,
      type: "chapter",
      title: "Chapter 3",
    },
    {
      file: "path/to/04-afterword.md",
      order: 6,
      type: "afterword",
      title: "Afterword",
    },
  ]
}
```

Different books can have different metadata and content structure. Adapters can be used to handle the conversion of the content to the desired output format.
