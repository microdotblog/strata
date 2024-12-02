import { types, flow } from 'mobx-state-tree'
import Auth from './Auth'
import { Appearance, AppState, Linking, Alert } from 'react-native'
import { SheetManager } from "react-native-actions-sheet";
import Login from './Login';
import Tokens from './Tokens';
import Posting from './Posting';

let NAVIGATION = null;

export default App = types.model('App', {
  is_hydrating: types.optional(types.boolean, false),
  theme: types.optional(types.string, "light"),
  is_creating_notebook: types.optional(types.boolean, false),
  temp_notebook_name: types.optional(types.string, ""),
  search_open: types.optional(types.boolean, false),
  search_query: types.optional(types.string, ""),
  has_unsaved_note: types.optional(types.boolean, false),
  is_loading_bookmarks: types.optional(types.boolean, false),
  is_loading_highlights: types.optional(types.boolean, false)
})
  .volatile(self => ({
    navigation_ref: null,
    current_tab_key: null,
    current_raw_tab_key: null,
    current_tab_index: null
  }))
  .actions(self => ({

    hydrate: flow(function*() {
      console.log("App:hydrate")
      yield App.set_current_initial_theme()
      self.is_hydrating = true
      Auth.hydrate().then(async () => {
        App.set_is_hydrating(false)
        App.set_up_url_listener()
        // Now we want to check if the user is premium
        App.check_current_user_can_use_notes()
      })
    }),
    
    set_navigation: flow(function* (navigation = null) {
      if (navigation) {
        self.navigation_ref = navigation
      }
    }),
    
    set_current_tab_key: flow(function* (tab_key) {
      console.log("App:set_current_tab_key", tab_key)
      self.current_raw_tab_key = tab_key
      if (tab_key.includes("Notes")) {
        self.current_tab_key = "Notes"
      }
      else if (tab_key.includes("Bookmarks")) {
        self.current_tab_key = "Bookmarks"
        if(Auth.is_logged_in() && Auth.selected_user != null){
          Auth.selected_user.fetch_bookmarks()
          // Auth.selected_user.fetch_tags()
          // Auth.selected_user.fetch_recent_tags()
        }
      }
      else if (tab_key.includes("Highlights")) {
        self.current_tab_key = "Highlights"
        if(Auth.is_logged_in() && Auth.selected_user != null){
          Auth.selected_user.fetch_highlights()
        }
      }
      else {
        self.current_tab_key = tab_key
      }
    }),
    
    set_current_tab_index: flow(function* (tab_index) {
      console.log("App:set_current_tab_index", tab_index)
      if(tab_index === self.current_tab_index){return}
      self.current_tab_index = tab_index
      // AsyncStorage.setItem("App:tab_index", JSON.stringify(self.current_tab_index))
    }),

    set_is_hydrating: flow(function*(is_hydrating) {
      self.is_hydrating = is_hydrating
    }),

    check_current_user_can_use_notes: flow(function*() {
      if (Auth.selected_user && !Auth.selected_user.can_use_notes()) {
        setTimeout(() => {
          App.open_sheet("menu-sheet")
        }, 800)
      }
    }),

    set_current_initial_theme: flow(function*() {
      console.log("App:set_current_theme", Appearance.getColorScheme())
      self.theme = Appearance.getColorScheme()
      App.set_up_appearance_listener()
    }),

    set_up_appearance_listener: flow(function*() {
      console.log("App:set_up_appearance_listener")
      AppState.addEventListener("change", nextAppState => {
        if (nextAppState === "active") {
          const colorScheme = Appearance.getColorScheme()
          if (self.theme !== colorScheme) {
            App.change_current_theme(colorScheme)
          }
        }
      })
      Appearance.addChangeListener(({ colorScheme }) => {
        if (AppState.currentState === "background" || AppState.currentState === "inactive") {
          return
        }
        console.log("App:set_up_appearance_listener:change", colorScheme)
        App.change_current_theme(colorScheme)
      })
    }),

    change_current_theme: flow(function*(color) {
      console.log("App:change_current_theme", color)
      self.theme = color
    }),

    set_up_url_listener: flow(function*() {
      console.log("App:set_up_url_listener")
      Linking.addEventListener('url', (event) => {
        console.log("App:set_up_url_listener:event", event)
        if (event?.url && event?.url.indexOf('/signin/') > -1) {
          Login.trigger_login_from_url(event.url)
        }
        else if (event?.url && event?.url.indexOf('/qrcode/') > -1) {
          if (!Auth.selected_user) {
            Alert.alert("Please sign in before adding a secret key")
          }
          else {
            Tokens.set_temp_secret_token_from_url(event.url)
            App.open_sheet("secret-key-prompt-sheet")
          }
        }
        else if (event?.url && event?.url.indexOf('/note?text=') > -1 && Auth.is_logged_in()) {
          App.prepare_and_open_new_note_from_url_action(event.url)
        }
      })
      Linking.getInitialURL().then((value) => {
        console.log("App:set_up_url_listener:getInitialURL", value)
        if (value?.indexOf('/signin/') > -1) {
          Login.trigger_login_from_url(value)
        }
        else if (value?.indexOf('/qrcode/') > -1) {
          if (!Auth.selected_user) {
            Alert.alert("Please sign in before adding a secret key")
          }
          else {
            Tokens.set_temp_secret_token_from_url(value)
            App.open_sheet("secret-key-prompt-sheet")
          }
        }
        else if (value?.includes('/note?text=') && Auth.is_logged_in()) {
          App.prepare_and_open_new_note_from_url_action(value)
        }
      })
    }),

    open_sheet: flow(function*(sheet_name = null) {
      console.log("App:open_sheet", sheet_name)
      if (sheet_name != null) {
        const sheet_is_open = SheetManager.get(sheet_name)?.current?.isOpen()
        if (!sheet_is_open) {
          SheetManager.show(sheet_name)
        }
      }
    }),

    close_sheet: flow(function*(sheet_name = null) {
      console.log("App:close_sheet", sheet_name)
      if (sheet_name != null) {
        SheetManager.hide(sheet_name)
      }
    }),

    set_navigation: flow(function*(navigation = null) {
      if (navigation) {
        console.log("App:set_navigation")
        NAVIGATION = navigation
      }
    }),

    navigate_to_screen: flow(function*(screen_name = null) {
      console.log("App:navigate_to_screen", screen_name)
      if (screen_name != null && NAVIGATION != null) {
        NAVIGATION.navigate(screen_name)
      }
    }),

    go_back: flow(function*() {
      console.log("App:go_back")
      if (NAVIGATION != null) {
        if (self.has_unsaved_note) {
          let buttons = [
            {
              text: "Don't Save",
              onPress: () => NAVIGATION.goBack()
            },
            {
              text: "Save",
              onPress: () => Posting.send_note()
            }
          ];
          Alert.alert("Unsaved Note", "Do you want to save before leaving this note?", buttons);
        }
        else {
          NAVIGATION.goBack()
        }
      }
    }),

    set_is_creating_notebook: flow(function*(is_creating = !self.is_creating_notebook) {
      console.log("App:set_is_creating_notebook", is_creating)
      self.is_creating_notebook = is_creating
      if (!is_creating) {
        self.temp_notebook_name = ""
      }
    }),

    set_temp_notebook_name: flow(function*(text) {
      console.log("App:set_temp_notebook_name", text)
      self.temp_notebook_name = text
    }),

    toggle_search_is_open: flow(function*() {
      console.log("App:toggle_search_is_open")
      self.search_open = !self.search_open
      if (!self.search_open) {
        self.search_query = ""
      }
    }),

    set_search_query: flow(function*(value) {
      self.search_query = value
    }),

    set_unsaved_note: flow(function*(value) {
      self.has_unsaved_note = value
    }),

    prepare_and_open_new_note_from_url_action: flow(function*(value) {
      console.log("App:prepare_and_open_new_note_from_action", value)
      const note_object = self.note_object_from_url(value)
      if (note_object && note_object?.text) {
        console.log("App:prepare_and_open_new_note_from_action:note_object", note_object)
        Posting.hydrate(note_object.text).then(() => {
          App.navigate_to_screen("NewNote")
          if (note_object.notebook) {
            Auth.selected_user.find_and_select_notebook(note_object.notebook)
          }
        })
      }
    }),
    
    set_is_loading_highlights: flow(function* (loading) {
      console.log("App:set_is_loading_highlights", loading)
      self.is_loading_highlights = loading
    }),
    
    set_is_loading_bookmarks: flow(function* (loading) {
      console.log("App:set_is_loading_bookmarks", loading)
      self.is_loading_bookmarks = loading
    }),

  }))
  .views(self => ({
    is_dark_mode() {
      return self.theme === "dark"
    },
    theme_accent_color() {
      return "#f80"
    },
    theme_border_color() {
      return self.theme === "dark" ? "#374151" : "#E5E7EB"
    },
    theme_background_color() {
      return self.theme === "dark" ? "#1d2530" : "#fff"
    },
    theme_background_color_secondary() {
      return self.theme === "dark" ? "#1F2937" : "#fff"
    },
    theme_navbar_background_color() {
      return self.theme === "dark" ? "#212936" : "#fff"
    },
    theme_navigation_icon_color() {
      return self.theme === "dark" ? "#9CA3AF" : "#000"
    },
    theme_input_contrast_background_color() {
      return self.theme === "dark" ? "#171c24" : "#f2f2f2"
    },
    theme_text_color() {
      return self.theme === "dark" ? "#fff" : "#000"
    },
    theme_placeholder_text_color() {
      return self.theme === "dark" ? "#374151" : "lightgray"
    },
    theme_default_font_size() {
      return 17
    },
    theme_navbar_background_color() {
      return self.theme === "dark" ? "#212936" : "#fff"
    },
    theme_button_background_color() {
      return self.theme === "dark" ? "#374151" : "#F9FAFB"
    },
    theme_button_text_color() {
      return self.theme === "dark" ? "#E5E7EB" : "#1F2937"
    },
    theme_input_background_color() {
      return self.theme === "dark" ? "#1d2530" : "#f2f2f2"
    },
    theme_alt_border_color() {
      return self.theme === "dark" ? "#374151" : "#F9FAFB"
    },
    theme_alt_background_div_color() {
      return self.theme === "dark" ? "#5a5a5a" : "#eff1f3"
    },
    theme_note_background_color() {
      return self.theme === "dark" ? "#1F2937" : "#FFF9D6"
    },
    theme_note_shadow_color() {
      return self.theme === "dark" ? "#707070" : "#333333"
    },
    theme_section_background_color() {
      return self.theme === "dark" ? "#374151" : "#E5E7EB"
    },
    theme_danger_color() {
      return self.theme === "dark" ? "#a94442" : "#a94442"
    },
    theme_confirm_color() {
      return self.theme_text_color()
      // return "#6EE7B7"
    },
    theme_tabbar_divider_color() {
      return self.theme === "dark" ? "#383f4a" : "#AAA"
    },
    now() {
      let now = new Date()
      now.setHours(0, 0, 0, 0)
      return now.getTime()
    },
    note_object_from_url(url) {
      const decoded_url = decodeURI(url)
      const params_string = decoded_url.replace("strata://note?", "")

      // Split the parameters into key-value pairs
      const params = params_string.split("&").reduce((acc, current) => {
        const [key, value] = current.split("=")
        acc[key] = value
        return acc
      }, {})

      return {
        text: params.text ? params.text.replace(/%3A/g, ":") : '',
        notebook: params.notebook || null
      }
    }
  }))
  .create();
