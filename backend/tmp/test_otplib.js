const otplib = require('otplib');
console.log('otplib type:', typeof otplib);
console.log('otplib keys:', Object.keys(otplib));
console.log('authenticator:', otplib.authenticator);
