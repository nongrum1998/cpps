const { decryptText } = require('./crypto');

const encrypted = response.body?.data;

if (!encrypted) {
  return;
}

const key = request.environment.get('FERNET_KEY');

if (!key) {
  throw new Error('FERNET_KEY is missing');
}

const decrypted = decryptText(encrypted, key);

const data = typeof decrypted === 'string' ? JSON.parse(decrypted) : decrypted;

console.log('ENC =>', encrypted);
client.log('DEC =>', JSON.stringify(data, null, 2));
