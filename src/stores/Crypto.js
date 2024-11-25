import { types, flow } from 'mobx-state-tree'
import CryptoUtils from '../utils/crypto';

export default Crypto = types.model('Crypto', {})
  .actions(self => ({

    decrypt: flow(function*() {
      console.log("Crypto:decrypt")
    }),

    encrypt: flow(function*() {
      console.log("Crypto:encrypt")
    }),

    return_encrypted_text: flow(function*(text, secret_token) {
      if (text && secret_token) {
        try {
          const encryptedText = CryptoUtils.encrypt(text, secret_token)
          return encryptedText
        } catch (error) {
          console.error("Encryption failed:", error)
          return null
        }
      } else {
        return null
      }
    }),

  }))
  .create();