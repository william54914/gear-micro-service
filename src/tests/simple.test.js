describe('Simple Tests', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });

  test('string concatenation works', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World');
  });

  test('boolean checks work', () => {
    expect(true).toBe(true);
    expect(false).not.toBe(true);
  });
}); 