import crypto from 'react-native-quick-crypto'
import { NativeModules } from 'react-native';
const { MBNotesCryptoModule } = NativeModules;

class CryptoUtils {

  static decryptWithKey(encryptedText, key, iv) {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    const encryptedData = Buffer.from(encryptedText, 'base64')
    let decrypted = decipher.update(encryptedData)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.slice(0, -16).toString()
  }

  static decrypt(text, secretToken) {
    const keyHex = secretToken.startsWith('mkey') ? secretToken.substring(4) : secretToken

    if (keyHex.length !== 64) {
      throw new Error('Invalid key length. Key must be a 64 character hex string after removing prefix.')
    }

    const keyBuffer = Buffer.from(this.hexStringToArrayBuffer(keyHex))
    const dataBuffer = Buffer.from(text, 'base64')
    const iv = dataBuffer.slice(0, 12)
    const encryptedText = dataBuffer.slice(12)

    return this.decryptWithKey(encryptedText, keyBuffer, iv)
  }

  static async encryptWithKey(text, key) {
    if (Platform.OS === "ios") {
      let result = await MBNotesCryptoModule.encryptText(text, key)
      return result;
    }
    else {
      const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
      let encrypted = cipher.update(text, 'utf8')
      encrypted = Buffer.concat([encrypted, cipher.final()])
      // const authTag = cipher.getAuthTag() // AUTH TAG doesn't seem to be available...
      // return Buffer.concat([iv, encrypted, authTag]).toString('base64')
      // TODO: crypto.randomBytes(16) is a temporary measure
      return Buffer.concat([iv, encrypted, crypto.randomBytes(16)]).toString('base64')
    }    
  }

  static encrypt(text, secretToken) {
    const keyHex = secretToken.startsWith('mkey') ? secretToken.substring(4) : secretToken

    if (keyHex.length !== 64) {
      throw new Error('Invalid key length. Key must be a 64 character hex string after removing prefix.')
    }

    return this.encryptWithKey(text, keyHex);

    // const keyBuffer = Buffer.from(this.hexStringToArrayBuffer(keyHex))
    // const iv = crypto.randomBytes(12)
    // return this.encryptWithKey(text, keyBuffer, iv)
  }

  static arrayBufferToHexString(buffer) {
    const byteArray = new Uint8Array(buffer)
    return Array.from(byteArray, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  static arrayBufferToBase64(buffer) {
    const uint8Array = new Uint8Array(buffer);
  
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  static hexStringToArrayBuffer(hexString) {
    const length = hexString.length / 2
    const arrayBuffer = new ArrayBuffer(length)
    const uint8Array = new Uint8Array(arrayBuffer)
    for (let i = 0; i < length; i++) {
      const byte = parseInt(hexString.substr(i * 2, 2), 16)
      uint8Array[i] = byte
    }
    return arrayBuffer
  }

}

export default CryptoUtils
