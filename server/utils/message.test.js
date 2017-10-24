const expect = require('expect');
const { generateMessage, generateLocationMessage } = require('./message');

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

describe('generateLocationMessage', () => {
  it('should generate correct location object', () => {
    const from = 'Deb';
    const latitude = 15;
    const longitude = 19;
    // URL expected to get back
    const url = 'https://www.google.com/maps?q=15,19';
    const message = generateLocationMessage(from, latitude, longitude);
    expect(typeof message.createdAt).toBe('number');
    expect(message).toMatchObject({ from, url });
  });
});
