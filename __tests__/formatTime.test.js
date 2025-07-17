const formatTime = require('../chrome/formatTime');

describe('formatTime', () => {
  test('formats 0 seconds', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  test('formats minutes and seconds', () => {
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(3599)).toBe('59:59');
  });
});
