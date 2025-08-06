/**
 * Minimal Test - Just to check if Jest works
 */

describe('Minimal Test', () => {
  test('basic math should work', () => {
    expect(1 + 1).toBe(2);
  });

  test('string operations should work', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });
});