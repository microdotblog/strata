import { types, flow } from 'mobx-state-tree';
import Tokens from './../Tokens';
import Notebook from './Notebook';
import MicroBlogApi, { API_ERROR } from '../../api/MicroBlogApi';
import { SheetManager } from "react-native-actions-sheet";

export default User = types.model('User', {
  username: types.identifier,
  avatar: types.maybeNull(types.string),
  has_site: types.optional(types.boolean, false),
  default_site: types.maybeNull(types.string),
  is_premium: types.maybeNull(types.boolean),
  notebooks: types.optional(types.array(Notebook), []),
  selected_notebook: types.maybeNull(types.reference(Notebook))
})
  .actions(self => ({

    hydrate: flow(function*() {
      console.log("User:hydrate", self.username)
      if (self.token()) {
        yield self.fetch_notebooks()
      }
    }),

    afterCreate: flow(function*() {
      yield self.hydrate()
    }),

    check_for_exisence_of_secret_token: flow(function*() {
      console.log("User:check_for_exisence_of_secret_token", !!self.secret_token())
      if (!self.secret_token()) {
        SheetManager.show("secret-key-prompt-sheet")
      }
    }),

    fetch_notebooks: flow(function*() {
      console.log("User:fetch_notebooks")
      const data = yield MicroBlogApi.fetch_notebooks()
      console.log("User:fetch_notebooks:data", data)
      if (data !== API_ERROR && data.items != null) {
        console.log("User:fetch_notebooks:items", data.items)
        data.items.forEach((notebook) => {
          const existing_notebook = self.notebooks.find(n => n.id === notebook.id)
          if (existing_notebook) {
            existing_notebook.hydrate()
          }
          else {
            self.notebooks.push(notebook)
          }
        })
        self.set_selected_notebook()
      }
    }),

    set_selected_notebook: flow(function*(notebook = null) {
      if (!self.selected_notebook && self.notebooks.length > 0 && !notebook) {
        self.selected_notebook = self.notebooks[0]
      }
      else if (notebook) {
        self.selected_notebook = notebook
      }
    })

  }))
  .views(self => ({

    token() {
      return Tokens.token_for_username(self.username, "user")?.token
    },

    secret_token() {
      return Tokens.secret_token_for_username(self.username, "secret")?.token
    }

  }))
