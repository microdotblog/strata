import { types, flow } from 'mobx-state-tree';
import { Platform } from 'react-native'
//import MicroBlogApi, { API_ERROR, POST_ERROR } from '../api/MicroBlogApi'
import Auth from './Auth'
import Clipboard from '@react-native-clipboard/clipboard'

export default Reply = types.model('Reply', {
  note_text: types.optional(types.string, ""),
  is_sending_note: types.optional(types.boolean, false),
  note_id: types.maybeNull(types.number),
  text_selection: types.optional(
    types.model('Selection', {
      start: types.optional(types.number, 0),
      end: types.optional(types.number, 0),
    }), { start: 0, end: 0 }
  ),
  note_request_id: types.optional(types.number, new Date().getTime())
})
  .actions(self => ({

    hydrate: flow(function*(note_text = "", note_id = null) {
      console.log("Posting:hydrate", note_id)
      self.note_request_id = new Date().getTime()
      if (note_id !== self.note_id || self.note_text === "") {
        self.note_text = note_text
      }
      self.is_sending_note = false
      console.log("Posting:hydrate:note_id", self.note_id)
    }),

    set_note_text: flow(function*(value) {
      console.log("Posting:set_note_text", value)
      self.note_text = value
    }),

    send_note: flow(function*() {
      console.log("Posting:send_reply", self.reply_text)
      if (!self.is_sending_note && self.note_text !== " ") {
        self.is_sending_note = true
        // const data = yield MicroBlogApi.send_note(self.note_id, self.note_text)
        // console.log("Posting:send_reply:data", data)
        // if (data !== POST_ERROR) {
        //   self.note_text = ""
        //   self.is_sending_note = false
        //   return true
        // }
        // else {
        //   Alert.alert("Whoops", "Could not save note. Please try again.")
        // }
        self.is_sending_note = false
        return false
      }
      return false
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
    }),

    set_text_selection: flow(function*(selection) {
      self.text_selection = selection
    }),

  }))
  .views(self => ({

    posting_enabled() {
      const { selected_user } = Auth
      return selected_user.username != null && selected_user.token() != null
    },

  }))
  .create({})