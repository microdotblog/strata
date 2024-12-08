import { types, flow, destroy } from 'mobx-state-tree';
import Tokens from './../Tokens';
import Notebook from './Notebook';
import App from './../App';
import MicroBlogApi, { API_ERROR, DELETE_ERROR, POST_ERROR, LOGIN_TOKEN_INVALID, LOGIN_ERROR } from '../../api/MicroBlogApi';
import { Alert, NativeModules, Platform } from 'react-native';
import { SheetManager } from 'react-native-actions-sheet';
import { Bookmark } from './Bookmark';
import Highlight from './Highlight';
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
  is_syncing_with_icloud: types.optional(types.boolean, false),
  plan: types.maybeNull(types.string),
  bookmarks: types.optional(types.array(Bookmark), []),
  last_bookmark_fetch: types.optional(types.Date, new Date),
  highlights: types.optional(types.array(Highlight), [])
})
  .actions(self => ({

    hydrate: flow(function*() {
      console.log("User:hydrate", self.username)
      self.is_saving_new_notebook = false
      self.is_syncing_with_icloud = false
      if (self.token()) {
        yield self.fetch_notebooks()
        // Let's also check if their account premium status changed.
        self.check_for_update_account_status()
        self.fetch_highlights()
        self.fetch_bookmarks()
      }

    }),

    check_for_update_account_status: flow(function*() {
      console.log("User:check_for_update_account_status", self.username)
      const status = yield MicroBlogApi.login_with_token(self.token())
      if (status !== LOGIN_ERROR && status !== LOGIN_TOKEN_INVALID) {
        self.is_premium = status.is_premium
        self.plan = status.plan
        if (!self.can_use_notes()) {
          App.check_current_user_can_use_notes()
        }
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
          self.is_syncing_with_icloud = true
          const cloud_key = yield MBNotesCloudModule.getNotesKey()
          if (!cloud_key) {
            setTimeout(() => {
              App.open_sheet("secret-key-prompt-sheet");
            }, 500)
            
            if (self.is_appletest()) {
              // special case for Apple, download centralized key
              MicroBlogApi.get_centralized_key(self.username).then(apple_key => {
                Tokens.set_temp_secret_token(apple_key).then(() => {
                  Tokens.add_new_secret_token(self.username)
                });
              });
            }
          }
          else {
            Tokens.set_temp_secret_token(cloud_key).then(() => {
              Tokens.add_new_secret_token(self.username)
            })
          }
          self.is_syncing_with_icloud = false
        }
        else {
          App.open_sheet("secret-key-prompt-sheet")
          if (self.is_appletest()) {
            // special case for Google review, download centralized key
            MicroBlogApi.get_centralized_key(self.username).then(apple_key => {
              Tokens.set_temp_secret_token(apple_key).then(() => {
                Tokens.add_new_secret_token(self.username)
              });
            });
          }
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
            if (notebook._microblog != null) {
              existing_notebook.update_microblog_data(notebook._microblog)
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

    prompt_delete_secret_key: flow(function*() {
      Alert.alert(
        "Delete this key?",
        "Make sure you have downloaded a copy of the key if you need to access these notes again.",
        [
          {
            text: "Cancel",
            style: 'cancel',
          },
          {
            text: "Delete",
            onPress: () => {
              SheetManager.hide("menu-sheet");
              Tokens.destroy_secret_token(self.username);
              self.check_for_exisence_of_secret_token();
            },
            style: 'destructive'
          },
        ],
        { cancelable: false },
      );
    }),

    find_and_select_notebook: flow(function*(notebook_name) {
      console.log("User:find_and_select_notebook", notebook_name)
      const found_notebook = self.notebooks.find(n => n.title.toLowerCase() === notebook_name.toLowerCase())
      if (found_notebook) {
        self.set_selected_notebook(found_notebook)
      }
    }),
    
    fetch_bookmarks: flow(function* () {
      console.log("User:fetch_bookmarks")
      App.set_is_loading_bookmarks(true)
      const bookmarks = yield MicroBlogApi.get_bookmarks()
      if(bookmarks !== API_ERROR && bookmarks.items){
        self.bookmarks = bookmarks.items
        self.last_bookmark_fetch = new Date
      }
      App.set_is_loading_bookmarks(false)
      console.log("User:fetch_bookmarks:count", self.bookmarks.length)
    }),
    
    fetch_more_bookmarks: flow(function* () {
      console.log("User:fetch_more_bookmarks", self.bookmarks.length > 0)
      
      if(self.bookmarks.length > 0){
        console.log("User:fetch_more_bookmarks:before_id", self.bookmarks[self.bookmarks.length - 1]?.id)
        const bookmarks = yield MicroBlogApi.get_bookmarks(self.bookmarks[self.bookmarks.length - 1].id)
        console.log("User:fetch_more_bookmarks:count", bookmarks?.items?.length)
        if(bookmarks !== API_ERROR && bookmarks.items){
          bookmarks.items.map(bookmark => {
            const existing_bookmark = self.bookmarks.find(b => b.id === bookmark.id)
            if(existing_bookmark != null) return
            self.bookmarks.push(bookmark)
          })
          self.last_bookmark_fetch = new Date
          console.log("User:fetch_more_bookmarks:total_count", self.bookmarks.length)
        }
      }
      
    }),
    
    fetch_highlights: flow(function* () {
      console.log("User:fetch_highlights")
      App.set_is_loading_highlights(true)
      const highlights = yield MicroBlogApi.get_highlights()
      if(highlights !== API_ERROR && highlights.items){
        self.highlights = highlights.items
      }
      App.set_is_loading_highlights(false)
      console.log("User:fetch_highlights:count", self.highlights.length)
    }),
    
    destroy_highlight: flow(function* (highlight) {
      console.log("User:destroy_highlight", highlight)
      destroy(highlight)
    })

  }))
  .views(self => ({

    token() {
      return Tokens.token_for_username(self.username, "user")?.token
    },

    secret_token() {
      return Tokens.secret_token_for_username(self.username, "secret")?.token
    },
    
    is_premium_user() {
      return self.is_premium || self.plan !== "free"
    },

    can_create_notebook() {
      return this.is_premium_user()
    },

    can_use_notes() {
      return this.is_premium_user()
    },

    is_appletest() {
      return (self.username == "appletest")
    }

  }))
