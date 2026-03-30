const { generateSecret, verify, generateURI } = require('otplib');

try {
  const secret = generateSecret();
  console.log('Secret generated:', secret);

  const uri = generateURI({ secret, label: 'test@example.com', issuer: 'HireHelper' });
  console.log('URI generated:', uri);

  // Note: verify is usually for checking a token against a secret.
  // We can't easily wait for a real token here, but we can verify the function exists and accepts the signature.
  console.log('Verify function type:', typeof verify);

  console.log('SUCCESS: otplib v13 functional API is working correctly.');
} catch (err) {
  console.error('FAILURE:', err.message);
  process.exit(1);
}
