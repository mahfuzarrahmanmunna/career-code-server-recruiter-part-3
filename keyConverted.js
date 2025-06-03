const fs = require('fs');

// Read the service account key file as UTF-8 string
const key = fs.readFileSync('./firebase-admin-service-key.json', 'utf8');

// Encode the JSON string to Base64
const base64 = Buffer.from(key).toString('base64');

// Print the Base64 encoded string
console.log(base64);