import { types, flow } from 'mobx-state-tree'
import Auth from './Auth'
import { Appearance, AppState } from 'react-native'
import { SheetManager } from "react-native-actions-sheet";

export default App = types.model('App', {
  is_hydrating: types.optional(types.boolean, false),
  theme: types.optional(types.string, "light")
})
  .actions(self => ({

    hydrate: flow(function*() {
      console.log("App:hydrate")
      yield App.set_current_initial_theme()
      self.is_hydrating = true
      Auth.hydrate().then(async () => {
        App.set_is_hydrating(false)
      })
    }),

    set_is_hydrating: flow(function*(is_hydrating) {
      self.is_hydrating = is_hydrating
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

    open_sheet: flow(function*(sheet_name = null) {
      console.log("App:open_sheet", sheet_name)
      if (sheet_name != null) {
        SheetManager.show(sheet_name)
      }
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
      return self.theme === "dark" ? "#1F2937" : "#f2f2f2"
    },
    theme_note_shadow_color() {
      return self.theme === "dark" ? "#707070" : "#333333"
    },
    now() {
      let now = new Date()
      now.setHours(0, 0, 0, 0)
      return now.getTime()
    }
  }))
  .create();
