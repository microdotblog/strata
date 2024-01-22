import { types, flow, destroy } from 'mobx-state-tree';
import Tokens from './../Tokens';
import Notebook from './Notebook';
import App from './../App';
import MicroBlogApi, { API_ERROR, DELETE_ERROR, POST_ERROR } from '../../api/MicroBlogApi';
import { Alert, NativeModules, Platform } from 'react-native';
const { MBNotesCloudModule } = NativeModules;

export default User = types.model('User', {
  username: types.identifier,
  avatar: types.maybeNull(types.string),
  has_site: types.optional(types.boolean, false),
  default_site: types.maybeNull(types.string),
  is_premium: types.maybeNull(types.boolean),
  notebooks: types.optional(types.array(Notebook), []),
  selected_notebook: types.maybeNull(types.reference(Notebook)),
  is_saving_new_notebook: types.optional(types.boolean, false),
})
  .actions(self => ({

    hydrate: flow(function*() {
      console.log("User:hydrate", self.username)
      self.is_saving_new_notebook = false
      if (self.token()) {
        yield self.fetch_notebooks()
      }
    }),

    check_for_exisence_of_secret_token: flow(function*() {
      console.log("User:check_for_exisence_of_secret_token", !!self.secret_token())
      // Let's check we can first use the feature
      if (!self.can_use_notes()) {
        // We already launch this sheet anyway, so we don't need to do it again.
        return
      }
      if (!self.secret_token()) {
        if (Platform.OS === "ios") {
          const cloud_key = yield MBNotesCloudModule.getNotesKey()
          if (!cloud_key) {
            App.open_sheet("secret-key-prompt-sheet")
          }
        }
        else {
          App.open_sheet("secret-key-prompt-sheet")
        }

      }
    }),

    fetch_notebooks: flow(function*() {
      console.log("User:fetch_notebooks")
      const data = yield MicroBlogApi.fetch_notebooks()
      console.log("User:fetch_notebooks:data", data)
      if (data !== API_ERROR && data.items != null) {
        console.log("User:fetch_notebooks:items", data.items.length)
        data.items.forEach((notebook) => {
          const existing_notebook = self.notebooks.find(n => n.id === notebook.id)
          if (existing_notebook) {
            existing_notebook.hydrate()
            if (existing_notebook.title !== notebook.title) {
              existing_notebook.update_title(notebook.title)
            }
          }
          else {
            self.notebooks.push({ username: self.username, ...notebook })
          }
        })

        // We also need to check if there are notebooks that no longer exist
        const notebooks_to_delete = self.notebooks.filter(notebook =>
          !data.items.some(item => item.id === notebook.id)
        )

        if (notebooks_to_delete.some(notebook => notebook.id === self.selected_notebook.id)) {
          const new_selected = self.notebooks.find(notebook =>
            !notebooks_to_delete.includes(notebook)
          )
          self.selected_notebook = new_selected || null
        }

        self.notebooks = self.notebooks.filter(notebook =>
          !notebooks_to_delete.includes(notebook)
        )

        self.set_selected_notebook()
      }
    }),

    set_selected_notebook: flow(function*(notebook = null, should_fetch = false) {
      if (self.selected_notebook == null && self.notebooks.length > 0) {
        self.selected_notebook = self.notebooks[0]
      }
      else if (notebook) {
        self.selected_notebook = notebook
      }
      if (should_fetch) {
        notebook.hydrate()
      }
    }),

    trigger_notebook_delete: flow(function*(notebook = null) {
      if (notebook) {
        Alert.alert(
          "Delete notebook?",
          "Are you sure you want to delete this notebook? All your notes in this notebook will be deleted.",
          [
            {
              text: "Cancel",
              style: 'cancel',
            },
            {
              text: "Delete",
              onPress: () => self.delete_notebook(notebook),
              style: 'destructive'
            },
          ],
          { cancelable: false },
        )
      }
    }),

    delete_notebook: flow(function*(notebook = null) {
      console.log("User:delete_notebook", notebook)
      if (notebook) {
        // Before deleting the notebook, let's set a new default one
        if (self.notebooks.length > 1) {
          const notebooks_without_notebook_deleting = self.notebooks.filter(n => n !== notebook)
          if (notebooks_without_notebook_deleting) {
            self.set_selected_notebook(notebooks_without_notebook_deleting[0])
          }
        }
        else {
          self.selected_notebook = null
        }
        // OK, now let's go and delete that notebook
        const data = yield MicroBlogApi.delete_notebook(notebook.id)
        if (data !== DELETE_ERROR) {
          destroy(notebook)
          self.fetch_notebooks()
        }
        else {
          Alert.alert("Couldn't delete your notebook...", "Please try again.")
        }
      }
    }),

    create_notebook: flow(function*(name) {
      console.log("User:create_notebook", name)
      self.is_saving_new_notebook = true
      const data = yield MicroBlogApi.create_or_rename_notebook(name)
      if (data != POST_ERROR) {
        const notebook_object = {
          id: data.id,
          title: data.name,
          username: self.username
        }
        const notebook = Notebook.create(notebook_object)
        if (notebook) {
          App.set_is_creating_notebook(false)
          self.notebooks.push(notebook)
          self.set_selected_notebook(notebook, true)
        }
      }
      else {
        Alert.alert("Couldn't create your notebook...", "Please try again.")
      }
      self.is_saving_new_notebook = false
    }),

    reset_notebook_state: flow(function*(notebook) {
      const found_notebook = self.notebooks.find(n => n === notebook)
      if (found_notebook) {
        found_notebook.set_is_renaming_notebook(false)
      }
    }),

  }))
  .views(self => ({

    token() {
      return Tokens.token_for_username(self.username, "user")?.token
    },

    secret_token() {
      return Tokens.secret_token_for_username(self.username, "secret")?.token
    },

    can_create_notebook() {
      return self.is_premium// self.is_premium || self.notebooks?.length == 0
    },

    can_use_notes() {
      return self.is_premium// self.is_premium || self.notebooks?.length == 0
    }

  }))
