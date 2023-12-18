import { types, flow } from 'mobx-state-tree';
import App from '../App';
import Posting from '../Posting';
import CryptoUtils from '../../utils/crypto';
// import MicroBlogApi, { API_ERROR, DELETE_ERROR, LOGIN_TOKEN_INVALID } from '../../api/MicroBlogApi';

const Microblog = types.model('_microblog', {
  is_encrypted: types.boolean,
  is_shared: types.boolean,
  shared_url: types.maybeNull(types.string)
})

export default Note = types.model('Note', {
  id: types.identifierNumber,
  username: types.maybeNull(types.string),
  title: types.maybeNull(types.string),
  content_text: types.maybeNull(types.string),
  content_html: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  date_published: types.maybeNull(types.string),
  _microblog: types.maybeNull(Microblog)
})
  .actions(self => ({

    prep_and_open_posting: flow(function*() {
      console.log("Note:prep_and_open_posting", self.id)
      yield Posting.hydrate(self.decrypted_text(), self.id)
      App.navigate_to_screen("EditNote")
    }),

  }))
  .views(self => ({

    is_locked() {
      return !this.secret_token()
    },

    decrypted_text() {
      //return self.content_text
      if (this.secret_token()) {
        try {
          const decryptedText = CryptoUtils.decrypt(self.content_text, this.secret_token());
          return decryptedText;
        } catch (error) {
          console.log("Decryption failed:", error);
          return self.content_text;
        }
      } else {
        return self.content_text;
      }
    },

    encrypted_text() {
      if (self.content_text && this.secret_token()) {
        try {
          const encryptedText = CryptoUtils.encrypt(this.decrypted_text(), this.secret_token())
          return encryptedText
        } catch (error) {
          console.error("Encryption failed:", error)
          return null
        }
      } else {
        return null
      }
    },

    secret_token() {
      return Tokens.secret_token_for_username(self.username, "secret")?.token
    }

  }))
