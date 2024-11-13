import { describe, it, expect } from 'vitest'
import { toSnakeCase, convertKeysToSnakeCase, convertXmlToJson } from '../src/parser.js'

describe('parser', () => {
	describe('toSnakeCase', () => {
		it('should convert a string from camelCase or PascalCase to snake_case', () => {
			const input = 'FooBar'
			const expected = 'foo_bar'
			const result = toSnakeCase(input)
			expect(result).toEqual(expected)
		})

		it('should should treat consecutive upper case characters as single word', () => {
			const input = 'FooID'
			const expected = 'foo_id'
			const result = toSnakeCase(input)
			expect(result).toEqual(expected)
		})
	})
	describe('convertKeysToSnakeCase', () => {
		it('should convert object keys to lowercase snake case', () => {
			const input = {
				FooBar: 'value',
				NestedObject: {
					BarBaz: 'another value'
				},
				ArrayItem: [{ SomeKey: 'item1' }, { AnotherKey: 'item2' }]
			}

			const expected = {
				foo_bar: 'value',
				nested_object: {
					bar_baz: 'another value'
				},
				array_item: [{ some_key: 'item1' }, { another_key: 'item2' }]
			}

			const result = convertKeysToSnakeCase(input)
			expect(result).toEqual(expected)
		})
	})

	describe('convertXmlToJson', () => {
		it('should convert a simple XML file to JSON', async () => {
			const xml = `
        <root>
          <item id="1">
            <name>Item 1</name>
            <price>10.00</price>
          </item>
          <item id="2">
            zeitgeist
          </item>
        </root>
      `

			const json = await convertXmlToJson(xml)

			expect(json).toEqual({
				item: [
					{
						id: '1',
						name: 'Item 1',
						price: '10.00'
					},
					{
						id: '2',
						_value: 'zeitgeist'
					}
				]
			})
		})

		it('should convert XML with attributes and namespaces to JSON', async () => {
			const xml = `
        <ns:root xmlns:ns="http://example.com">
          <ns:item id="1" attr="value">
            <ns:name>Item 1</ns:name>
            <ns:price>10.00</ns:price>
          </ns:item>
        </ns:root>
      `

			const json = await convertXmlToJson(xml)

			expect(json).toEqual({
				'ns:item': {
					id: '1',
					attr: 'value',
					'ns:name': 'Item 1',
					'ns:price': '10.00'
				},
				'xmlns:ns': 'http://example.com'
			})
		})
	})
})
