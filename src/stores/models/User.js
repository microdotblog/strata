import { types, flow } from 'mobx-state-tree';
import Tokens from './../Tokens';
import Notebook from './Notebook';
import MicroBlogApi, { API_ERROR } from '../../api/MicroBlogApi';

export default User = types.model('User', {
  username: types.identifier,
  avatar: types.maybeNull(types.string),
  has_site: types.maybeNull(types.boolean, false),
  default_site: types.maybeNull(types.string),
  is_premium: types.maybeNull(types.boolean),
  notebooks: types.optional(types.array(Notebook), [])
})
  .actions(self => ({

    hydrate: flow(function*() {
      console.log("User:hydrate", self.username)
      if (self.token() != null) {
        yield self.fetch_notebooks()
      }
    }),

    afterCreate: flow(function*() {
      self.hydrate()
    }),

    fetch_notebooks: flow(function*() {
      console.log("User:fetch_notebooks")
      const data = yield MicroBlogApi.fetch_notebooks()
      console.log("User:fetch_notebooks:data", data)
      if (data !== API_ERROR) {

      }
    })

  }))
  .views(self => ({

    token() {
      return Tokens.token_for_username(self.username, "user")?.token
    }

  }))
