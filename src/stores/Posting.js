import { types, flow } from 'mobx-state-tree';
import { Platform, Alert } from 'react-native'
import MicroBlogApi, { POST_ERROR } from '../api/MicroBlogApi'
import Auth from './Auth'
import App from './App';
import Clipboard from '@react-native-clipboard/clipboard'
import CryptoUtils from '../utils/crypto';

export default Posting = types.model('Posting', {
  note_text: types.optional(types.string, ""),
  is_sending_note: types.optional(types.boolean, false),
  is_shared: types.optional(types.boolean, false),
  note_id: types.maybeNull(types.number),
  text_selection: types.optional(
    types.model('Selection', {
      start: types.optional(types.number, 0),
      end: types.optional(types.number, 0),
    }), { start: 0, end: 0 }
  ),
  note_request_id: types.optional(types.number, new Date().getTime()),
  text_selection_flat: types.optional(types.string, "")
})
  .actions(self => ({

    hydrate: flow(function*(note_text = "", note_id = null, is_shared = false) {
      console.log("Posting:hydrate", note_id)
      self.note_request_id = new Date().getTime()
      if (note_id !== self.note_id || self.note_text === "" || self.is_shared != is_shared) {
        self.note_text = note_text
        self.note_id = note_id
        self.is_shared = is_shared
      }
      self.is_sending_note = false
      self.text_selection_flat = ""
    }),

    reset: flow(function*() {
      self.note_text = ""
      self.note_id = null
      self.is_sending_note = false
      self.text_selection_flat = ""
    }),

    set_note_text: flow(function*(value) {
      self.note_text = value;
    }),

    set_note_text_from_typing: flow(function*(value) {
      self.note_text = value;
    }),

    return_encrypted_note_text: flow(function*(text) {
      if (text && Auth.selected_user.secret_token()) {
        try {
          const encryptedText = yield CryptoUtils.encrypt(text, Auth.selected_user.secret_token())
          return encryptedText
        } catch (error) {
          console.error("Encryption failed:", error)
          return null
        }
      } else {
        return null
      }
    }),

    send_note: flow(function*() {
      console.log("Posting:send_note", self.note_text)
      App.set_unsaved_note(false);
      if (!self.is_sending_note && self.note_text !== " " && self.posting_enabled()) {
        var new_text = self.note_text;
        if (!self.is_shared) {
          new_text = yield self.return_encrypted_note_text(self.note_text)
        }
        if (new_text != null) {
          self.is_sending_note = true
          const data = yield MicroBlogApi.post_note(new_text, Auth.selected_user.token(), Auth.selected_user.selected_notebook?.id, self.note_id, !self.is_shared)
          console.log("Posting:send_note:data", data)
          if (data !== POST_ERROR) {
            Auth.selected_user.selected_notebook?.fetch_notes(self.note_id)
            self.note_text = ""
            self.note_id = null
            self.is_sending_note = false
            App.go_back()
          }
          else {
            const debug_notebook_id = Auth.selected_user.selected_notebook?.id;
            const debug_token_first = Auth.selected_user.token().substring(0, 2);
            Alert.alert("Error Saving Note", `Could not save note. Please try again. (Notebook: ${debug_notebook_id} / ${debug_token_first})`);
          }
          self.is_sending_note = false
        }
        else {
          Alert.alert("Error Saving Note", "Could not create note. Please try again.")
        }
      }
    }),

    handle_text_action: flow(function*(action) {
      console.log("Posting:handle_text_action", action)
      const is_link = action === "[]"
      if (is_link) {
        action = "[]()"
        let has_web_url = null
        let url = null
        if (Platform.OS === "ios") {
          has_web_url = yield Clipboard.hasWebURL()
        }
        else {
          url = yield Clipboard.getString()
          has_web_url = yield Linking.canOpenURL(url)
          // I'm using this as a fallback, as Android sometimes doesn't know that it can open a URL.
          if (!has_web_url) {
            has_web_url = url.startsWith("http://") || url.startsWith("https://")
          }
        }
        console.log("HAS WEB URL", url, has_web_url)
        if (has_web_url) {
          if (url === null) {
            url = yield Clipboard.getString()
          }
          action = `[](${url})`
          console.log("TEXT OPTION", action)
          self.note_text = self.note_text.InsertTextStyle(action, self.text_selection, true, url)
        }
        else {
          self.note_text = self.note_text.InsertTextStyle(action, self.text_selection, true)
        }
      }
      else {
        self.note_text = self.note_text.InsertTextStyle(action, self.text_selection, is_link)
      }

      var new_pos = self.text_selection.end;
      if (is_link) {
        new_pos += (action.length - 1);
      }
      else {
        new_pos += (action.length * 2);
      }
      self.text_selection = { start: new_pos, end: new_pos };
      self.text_selection_flat = `${new_pos} ${new_pos}`;
    }),

    set_text_selection: flow(function*(selection) {
      self.text_selection = selection
    }),

  }))
  .views(self => ({

    posting_enabled() {
      const { selected_user } = Auth
      return selected_user.token() != null && selected_user.secret_token() != null
    },

    posting_button_enabled() {
      return this.posting_enabled() && self.note_text.length > 0
    }

  }))
  .create({})
