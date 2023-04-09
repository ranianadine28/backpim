import crypto from "crypto"

const BASE_64_KEY='WqzeoE3I9KjdpF+asZ7H8DMi1n4KlUm2bQYyf5Ghvcw=';
const secretKey = Buffer.from(BASE_64_KEY, 'base64'); // clé secrète pour chiffrer/déchiffrer
const algorithm = 'aes-256-cbc'; // algorithme de chiffrement

export function encrypt(text) {
  const iv = crypto.randomBytes(16); // vecteur d'initialisation aléatoire
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  console.log(decrypted.toString());
  return decrypted.toString();
}