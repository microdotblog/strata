import { types, flow, getParent } from 'mobx-state-tree';
import App from '../App';
import Posting from '../Posting';
import CryptoUtils from '../../utils/crypto';
import MicroBlogApi, { DELETE_ERROR, POST_ERROR } from '../../api/MicroBlogApi';
import { Alert } from 'react-native';
import { InAppBrowser } from 'react-native-inappbrowser-reborn'
import Crypto from '../Crypto';

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
  date_modified: types.maybeNull(types.string),
  _microblog: types.maybeNull(Microblog),
  is_updating: types.optional(types.boolean, false)
})
  .volatile(self => ({
    decrypted_text: "",
    unlocked: false
  }))
  .actions(self => ({

    afterCreate() {
      self.is_updating = false
    },

    prep_and_open_posting: flow(function* () {
      console.log("Note:prep_and_open_posting", self.id)
      if(!self.unlocked){
        return
      }
      yield Posting.hydrate(self.decrypted_text, self.id, self._microblog.is_shared)
      App.navigate_to_screen("EditNote")
    }),

    trigger_action: flow(function* (action_name) {
      console.log("Note:trigger_action", action_name)
      if (action_name === "delete_note") {
        self.prompt_and_trigger_delete()
      }
      else if (action_name === "share_note") {
        self.share_note()
      }
      else if (action_name === "unshare_note") {
        self.unshare_note()
      }
      else if (action_name === "open_in_browser") {
        self.open_in_browser()
      }
    }),

    prompt_and_trigger_delete: flow(function* () {
      console.log("Note:prompt_and_trigger_delete", self.id)
      Alert.alert(
        "Delete note?",
        "Are you sure you want to delete this note?",
        [
          {
            text: "Cancel",
            style: 'cancel',
          },
          {
            text: "Delete",
            onPress: () => self.delete_note(),
            style: 'destructive'
          },
        ],
        { cancelable: false },
      )
    }),

    delete_note: flow(function* () {
      console.log("Note:delete_note", self.id)
      self.is_updating = true
      const data = yield MicroBlogApi.delete_note(self.id)
      if (data !== DELETE_ERROR) {
        getParent(self, 2)?.remove_note(self)
      }
      else {
        Alert.alert("Couldn't delete your note...", "Please try again.")
        self.is_updating = false
      }
    }),

    share_note: flow(function* () {
      console.log("Note:share_note", self.id)
      self.is_updating = true
      const data = yield MicroBlogApi.post_note(self.decrypted_text, self.user_token(), getParent(self, 2)?.id, self.id, false, true, null)
      if (data !== POST_ERROR && data._microblog?.shared_url != null) {
        self.content_text = self.decrypted_text
        self._microblog.shared_url = data._microblog.shared_url
        self._microblog.is_shared = true
        self._microblog.is_encrypted = false
        self.is_updating = false
      }
      else {
        Alert.alert("Couldn't share your note...", "Please try again.")
        self.is_updating = false
      }
    }),

    unshare_note: flow(function* () {
      console.log("Note:unshare_note", self.id)
      self.is_updating = true
      const encrypted_text = yield Crypto.return_encrypted_text(self.decrypted_text, self.secret_token())
      if (encrypted_text) {
        const data = yield MicroBlogApi.post_note(encrypted_text, self.user_token(), getParent(self, 2)?.id, self.id, true, null, true)
        if (data !== POST_ERROR) {
          self.content_text = encrypted_text
          self._microblog.shared_url = null
          self._microblog.is_shared = false
          self._microblog.is_encrypted = true
          self.is_updating = false
        }
        else {
          Alert.alert("Couldn't unshare your note...", "Please try again.")
          self.is_updating = false
        }
      }
      else {
        Alert.alert("Couldn't unshare your note...", "Please try again.")
        self.is_updating = true
      }
      
    }),

    open_in_browser: flow(function* () {
      InAppBrowser.open(self._microblog.shared_url, {
        animated: true
      });
    }),
    
    unlock: flow(function* () {
      var decryptedText = false
      if (self.secret_token()) {
        try {
          
          if (!self._microblog.is_encrypted) {
            decryptedText = self.content_text;
          }
          else {
            decryptedText = yield CryptoUtils.decrypt(self.content_text, self.secret_token());
          }
        }
        catch (error) {
          // Let's not show anything here and silenty "not" handle this.
          console.log("Decryption failed:", error);
        }
      }
      
      if (decryptedText) {
        self.decrypted_text = decryptedText
        self.unlocked = true
      }
      
    })

  }))
  .views(self => ({

    is_locked() {
      return !this.secret_token()
    },

    truncated_text(num_chars = 100) {
      if(self.unlocked){
        var s = self.decrypted_text;
        if (s.length > num_chars) {
          s = s.substring(0, num_chars - 1);
          s = s + "...";
        }
        return s
      }
      return false
    },

    secret_token() {
      return Tokens.secret_token_for_username(self.username, "secret")?.token
    },

    user_token() {
      return Tokens.token_for_username(self.username)?.token
    },

    can_do_action() {
      return !this.is_locked() && !self.is_updating
    },

    background_color() {
      return getParent(self, 2)?.theme_note_background_color()
    }

  }))
