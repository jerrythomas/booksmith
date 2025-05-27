import xml2js from 'xml2js'

// normalizeTags: true, this option converts the keys to lower case, so snake case conversion does not work.

const parser = new xml2js.Parser({
	attrkey: '@',
	explicitArray: false,
	ignoreAttrs: false,
	explicitRoot: false,
	strict: true,
	trim: true,
	mergeAttrs: true,
	// explicitChildren: true,
	preserveChildrenOrder: true,
	childkey: '$'
})

/**
 * Convert a string from camelCase or PascalCase to snake_case
 * @param {string} str - Input string
 * @returns {string} - Converted string in snake_case
 */
export function toSnakeCase(str) {
	const snakeCaseValue = str
		.replace(/([A-Z]+)/g, '_$1') // Insert underscore before capital letters
		.toLowerCase() // Convert to lowercase
		.replace(/^_/, '') // Remove leading underscore
	return snakeCaseValue === '' ? '_value' : snakeCaseValue
}

/**
 * Recursively convert object keys to lowercase snake case
 * @param {object} obj - Input object
 * @returns {object} - New object with keys converted
 */
export function convertKeysToSnakeCase(obj) {
	if (Array.isArray(obj)) {
		return obj.map((item) => convertKeysToSnakeCase(item))
	} else if (obj !== null && typeof obj === 'object') {
		return Object.keys(obj).reduce((acc, key) => {
			const newKey = toSnakeCase(key)
			acc[newKey] = convertKeysToSnakeCase(obj[key])
			return acc
		}, {})
	}
	return obj
}

/**
 * Convert XML to JSON
 * @param {*} data
 * @returns
 */
export function convertXmlToJson(data) {
	let result = null
	// let parsed = false

	parser.parseString(data, (_, json) => {
		result = json
		// parsed = true
	})
	// while (!parsed) {
	// 	// intentionally left empty to synchronize async call.
	// }
	return convertKeysToSnakeCase(result)
}
