import JSEncrypt from "jsencrypt";

// RSA加密
export const rsaEncrypt = (password: string, publicKey: string) => {
	var encrypt = new JSEncrypt();
	encrypt.setPublicKey(publicKey);	//	 publicKey为公钥
	const pass = encrypt.encrypt(password);
	return pass;
}

// RSA解密
export const rsaDecrypt = (ciphertext: string, privateKey: string) => {
  let decrypt = new JSEncrypt();
  decrypt.setPrivateKey(privateKey);
  let uncrypted = decrypt.decrypt(ciphertext);
  return uncrypted;
};
