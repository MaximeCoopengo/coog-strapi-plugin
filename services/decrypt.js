// const jose = require('jose');
// const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const decodeToken = async (token, onlyValidate = false) => {
  // if (token === null || token === undefined || typeof token !== 'string') {
  //   return false;
  // }

  // try {
  //   const plainToken = Buffer.from(token, 'base64').toString('ascii');

  //   if (!plainToken) {
  //     return false;
  //   }

  //   const dataToken = plainToken.split(',');

  //   if (dataToken.length !== 6) {
  //     return false;
  //   }

  //   return onlyValidate ? true : dataToken;
  // } catch (e) {
  //   console.log(e.stack);
  //   return false;
  // }

  // const passphrase = 'bonsoir monsieur et toi ca va';

  // const b64Passphrase = crypto
  //   .createHash('sha256')
  //   .update(passphrase)
  //   .digest('base64url');

  // console.log(b64Passphrase);

  // // const privateKey = await jose.importJWK(
  // //   {
  // //     kty: 'oct',
  // //     k: b64Passphrase,
  // //   },
  // //   'sha256'
  // // );

  // const privateKey = await jose.calculateJwkThumbprint({
  //   kty: 'oct',
  //   k: b64Passphrase,
  // });
  // // const privateKey = jose.JWK.asKey(/* private key here as PEM */);

  // console.log(privateKey);
  // // 50n8Ay0lJ2lHsIE8UmX2zPjbkStFu0aB1AAbSc0IrYo
  // // const secret = Buffer.from(privateKey, 'hex');
  // const secret = jose.base64url.decode(
  //   // 'zH4NRP1HMALxxCFnRZABFA7GOJtzU_gIj02alfL1lvI'
  //   privateKey
  // );

  // // const jwe =
  // //   'eyJhbGciOiJIUzI1NiJ9.eyJ0b3RvIjoxMn0.XFJmrJJML2ewvWrE2YTURxEvYs5V-BMe8Cx3oJkljPA';
  // const jwe =
  //   'eyJhbGciOiJQQkVTMi1IUzI1NitBMTI4S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwicDJjIjo4MTkyLCJwMnMiOiJkTGpNZmIyaE5idzVRVjFPOXZoN1hRIn0.Amdapqzk0EVoEoL9yXSmU03qi9EHIqQPL7JRsyaR1u2LDFnt7kMFqRj5nA06NqpRRHVZg7b9MTLXRMJIssFrTGmnYivQhwaX.Mz-_WD59t7RJ28yC5kw5Xg.Grs2J4BfZxxNyO8YPYi9RbrwhZlXjxixLN4umSAP6zCAB1mErqpNVvd2zHDB7Ml3r_6p9f-YdwF33fBtjQlwAvLeqdM3TzbaISrkSX87sqjnBUH1ZVU2HnB7vL279Iq4.TkHy6eN4-MMG9FDjBZwWD9zW_sidwGet0DbUsPKSFVg';
  // // const jwe =
  // //   'eyJhbGciOiJQQkVTMi1IUzI1NitBMTI4S1ciLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwicDJjIjo4MTkyLCJwMnMiOiJrOVpGMGw3RjhxV0lHYUF6VTZscW9nIn0.IB4xgoxo6_PoprZX59GnknrsU5XqdiOGL3kpOmrfikmieN4tpMWyORWteVIT2ASfvoIT_ewlzExBw6lrgUehjkqhMn86VoAx.BAHSi0XO-tj1T_vXBBC7Aw.UgXfvAtPe88Xj6YaROOqAxEUswnhARiymQ-DWv__-5cbmeOnmjHjVnTm85-ZyE135KndvFjYjGUroPYXUZX7YWnAGRL0pM1yJPEIdCm9fjo0zOoKJSIvsCH6ewmycW7-.YNzniOXElnnmrJZsVFoXimhVm6NP7zMjWiS-9dVKqMg';

  // const { payload, protectedHeader } = await jose.jwtDecrypt(
  //   jwe,
  //   secret /* , {
  //   contentEncryptionAlgorithms: ['A256CBC-HS512'],
  // } */
  // );
  // // const { plaintext: payload, protectedHeader } = await jose.compactDecrypt(
  // //   jwe,
  // //   secret
  // // );

  // // let cipher = crypto.createCipheriv(
  // //   'aes128-wrap',
  // //   crypto.randomBytes(16),
  // //   crypto.randomBytes(8)
  // // );
  // // let encrypted = cipher.update('My beautiful data', 'utf8', 'hex');
  // // encrypted += cipher.final('hex');
  // // console.log('encrypted');
  // // console.log(encrypted);

  // // let decipher = crypto.createDecipheriv(
  // //   'aes128-wrap',
  // //   crypto.randomBytes(16),
  // //   crypto.randomBytes(8)
  // // );
  // // let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  // // decrypted += decipher.final('utf8');
  // // console.log('decrypted');
  // // console.log(decrypted);

  // console.log(protectedHeader);
  // console.log(new TextDecoder().decode(payload));

  // const payloadStr = Buffer.from(
  //   new TextDecoder().decode(payload).toString().split('.')[1],
  //   'base64'
  // );
  // const data = JSON.parse(payloadStr);

  // console.log(data);

  const passphrase = "'bonjour je développe coog chez coopengo'";
  const t =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b3RvIjoxMn0.tIVB02PjkwMUBYzJF4BMJ7LL_zXzTkGhHFQT4lTLe34';

  const data = jwt.verify(t, passphrase, ['HS256']);

  console.log(data);
};

module.exports = { decodeToken };
