const { encryptText } = require('./crypto');

const key = request.environment.get('FERNET_KEY');

if (!key) {
  throw new Error('FERNET_KEY is missing');
}

const body = request.body;

const payload = typeof body === 'string' ? body : JSON.stringify(body);

const encrypted = encryptText(payload, key);

if (typeof encrypted !== 'string') {
  throw new Error('encryptText() did not return a string');
}

request.body = JSON.stringify({
  payload: encrypted,
});

client.log('BODY =>', request.body);
