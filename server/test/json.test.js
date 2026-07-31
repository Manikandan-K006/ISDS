const { test } = require('node:test');
const assert = require('node:assert');
const { parseJson } = require('../utils/json');

test('parseJson returns value unchanged for non-strings', () => {
  assert.strictEqual(parseJson(42), 42);
  assert.deepStrictEqual(parseJson({ a: 1 }), { a: 1 });
  assert.deepStrictEqual(parseJson(['x']), ['x']);
});

test('parseJson parses valid JSON strings', () => {
  assert.deepStrictEqual(parseJson('{"a":1}'), { a: 1 });
  assert.deepStrictEqual(parseJson('[1,2,3]'), [1, 2, 3]);
});

test('parseJson returns fallback for invalid JSON', () => {
  assert.strictEqual(parseJson('not-json', []).length, 0);
  assert.strictEqual(parseJson('{broken', 'fb'), 'fb');
});

test('parseJson returns fallback for null/undefined', () => {
  assert.strictEqual(parseJson(null, 'fb'), 'fb');
  assert.strictEqual(parseJson(undefined, 'fb'), 'fb');
  assert.strictEqual(parseJson(undefined), null);
});
