const expect = require('expect');
const { generateMessage } = require('./message');

describe('generateMessage', () => {
  it('should generate correct message object', () => {
    const from = 'Jen';
    const text = 'Some message';
    const message = generateMessage(from, text);
    expect(typeof message.createdAt).toBe('number');
    expect(message.from).toBe('Jen');
    expect(message.text).toBe('Some message');
  });
});
