import { types, flow } from 'mobx-state-tree';
import Note from './Note';
import Tokens from './../Tokens';
import MicroBlogApi, { API_ERROR } from '../../api/MicroBlogApi';

export default Notebook = types.model('Notebook', {
  id: types.identifierNumber,
  username: types.maybeNull(types.string),
  title: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  date_published: types.maybeNull(types.string),
  notes: types.optional(types.array(Note), [])
})
  .actions(self => ({

    hydrate: flow(function*() {
      console.log("Notebook:hydrate", self.id)
      yield self.fetch_notes()
    }),

    afterCreate: flow(function*() {
      if (!self.notes) {
        yield self.hydrate()
      }
    }),

    fetch_notes: flow(function*() {
      console.log("Notebook:fetch_notes", self.id)
      const data = yield MicroBlogApi.fetch_notes(self.id, self.token())
      console.log("Notebook:fetch_notes", data)
      if (data !== API_ERROR && data.items) {
        self.notes = data.items
      }
    })

  }))
  .views(self => ({

    token() {
      return Tokens.token_for_username(self.username, "user")?.token
    },

  }))
