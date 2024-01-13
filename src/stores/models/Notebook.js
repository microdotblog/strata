import { types, flow, destroy } from 'mobx-state-tree';
import Note from './Note';
import Tokens from './../Tokens';
import MicroBlogApi, { API_ERROR, POST_ERROR } from '../../api/MicroBlogApi';
import { Alert } from 'react-native';

export default Notebook = types.model('Notebook', {
  id: types.identifierNumber,
  username: types.maybeNull(types.string),
  title: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  date_published: types.maybeNull(types.string),
  notes: types.optional(types.array(Note), []),
  temp_notebook_name: types.maybeNull(types.string),
  is_renaming_notebook: types.optional(types.boolean, false),
  is_setting_notebook_name: types.optional(types.boolean, false),
})
  .actions(self => ({

    hydrate: flow(function*() {
      console.log("Notebook:hydrate", self.id)
      self.temp_notebook_name = null
      self.is_renaming_notebook = false
      self.is_setting_notebook_name = false
      yield self.fetch_notes()
    }),

    afterCreate: flow(function*() {
      if (!self.notes) {
        yield self.hydrate()
      }
    }),

    update_title: flow(function*(title = null) {
      if (title) {
        self.title = title
      }
    }),

    fetch_notes: flow(function*() {
      console.log("Notebook:fetch_notes", self.id)
      const data = yield MicroBlogApi.fetch_notes(self.id, self.token())
      console.log("Notebook:fetch_notes", data?.items?.length)
      if (data !== API_ERROR && Array.isArray(data.items)) {
        self.notes = data.items.map(note => ({
          username: self.username,
          ...note
        }))
      }
    }),

    rename_notebook: flow(function*() {
      console.log("User:rename_notebook", self.temp_notebook_name, self.id)
      self.is_setting_notebook_name = true
      if (self.can_save_rename()) {
        const data = yield MicroBlogApi.create_or_rename_notebook(self.temp_notebook_name, self.id)
        if (data != POST_ERROR && data.name) {
          self.title = data.name
        }
        else {
          Alert.alert("Couldn't rename your notebook...", "Please try again.")
        }
      }
      else {
        Alert.alert("Couldn't rename your notebook...", "Please add a name.")
      }
      self.is_renaming_notebook = false
      self.temp_notebook_name = null
      self.is_setting_notebook_name = false
    }),

    set_is_renaming_notebook: flow(function*(is_renaming = !self.is_renaming_notebook) {
      console.log("Notebook:set_is_renaming_notebook", is_renaming)
      self.is_renaming_notebook = is_renaming
      if (!is_renaming) {
        self.temp_notebook_name = null
        self.is_setting_notebook_name = false
      }
      else {
        self.temp_notebook_name = self.title
      }
    }),

    set_temp_notebook_name: flow(function*(text) {
      console.log("Notebook:set_temp_notebook_name", text)
      self.temp_notebook_name = text
    }),

    remove_note: flow(function*(note) {
      console.log("Notebook:remove_note", note)
      destroy(note)
      self.fetch_notes()
    }),

  }))
  .views(self => ({

    token() {
      return Tokens.token_for_username(self.username, "user")?.token
    },

    ordered_notes() {
      return [...self.notes].sort((a, b) => {
        const dateA = new Date(a.date_published).getTime()
        const dateB = new Date(b.date_published).getTime()
        return dateB - dateA
      })
    },

    can_save_rename() {
      return self.temp_notebook_name != null && self.temp_notebook_name != "" && self.temp_notebook_name !== self.title
    }

  }))
