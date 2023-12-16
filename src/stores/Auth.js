import { types, flow, applySnapshot, destroy } from 'mobx-state-tree';
import { Keyboard, Platform } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import User from './models/User'
import Tokens from './Tokens'
import Toast from 'react-native-simple-toast';
import { SheetManager } from "react-native-actions-sheet";

export default Auth = types.model('Auth', {
  users: types.optional(types.array(User), []),
  selected_user: types.maybeNull(types.reference(User)),
  is_selecting_user: types.optional(types.boolean, true),
  did_load_one_or_more_webviews: types.optional(types.boolean, false)
})
  .actions(self => ({

    hydrate: flow(function*() {
      console.log("Auth:hydrate")
      yield Tokens.hydrate()
      const data = yield AsyncStorage.getItem('Auth')
      if (data && Tokens.tokens?.length > 0) {
        applySnapshot(self, JSON.parse(data))
        if (self.selected_user) {
          self.is_selecting_user = false
        }
        console.log("Auth:hydrate:with_data")
      }
      else {
        yield Auth.destroy_all_auth_data()
      }
      return self.is_logged_in()
    }),

    destroy_all_auth_data: flow(function*() {
      console.log("Auth:destroy_all_auth_data")
      // It looks like we might have no auth data,
      // so we should also try and clear any tokens we might have
      yield Tokens.destroy_all_token_data()
      // We most likely do not need the below as it should never hydrate
      // in the first place
      self.users = []
      self.selected_user = null
      self.is_selecting_user = true
    }),

    handle_new_login: flow(function*(data) {
      console.log("Auth:handle_new_login", data)
      if (data?.username != null && data?.token != null) {
        const token = yield Tokens.add_new_token(data.username, data.token)
        console.log("Auth:handle_new_login:token")
        if (token && token.username === data?.username) {
          yield self.create_and_select_new_user(data)
          Keyboard.dismiss()
          return true
        }
      }
      return false
    }),

    create_and_select_new_user: flow(function*(data) {
      console.log("Auth:create_and_select_new_user", data)
      const existing_user = self.users.find(u => u.username === data.username)
      if (existing_user != null) {
        // TODO: JUST UPDATE THE USER AND SELECT
        self.selected_user = existing_user
        self.is_selecting_user = false
        yield existing_user.hydrate()
      }
      else {
        const new_user = User.create(data)
        self.users.push(new_user)
        self.selected_user = new_user
        self.is_selecting_user = false
        yield new_user.hydrate()
      }
      console.log("Auth:create_and_select_new_user:users", self.users.length)
    }),

    select_user: flow(function*(user) {
      console.log("Auth:select_user", user)
      self.selected_user = user
      self.is_selecting_user = false
      setTimeout(() => {
        Toast.showWithGravity(`You're now logged in as @${user.username}`, Toast.SHORT, Toast.CENTER)
      }, Platform.OS === 'ios' ? 350 : 0)
      return
    }),

    logout_user: flow(function*(user = null) {
      console.log("Auth:logout_user", user)
      SheetManager.hide("menu-sheet")
      if (user == null) {
        user = self.selected_user
      }
      Tokens.destroy_token(user.username)
      self.selected_user = null
      destroy(user)
      if (self.users.length) {
        self.selected_user = self.users[0]
        self.is_selecting_user = false
      }
      else {
        Tokens.destroy_all_token_data()
      }
    }),

    logout_all_user: flow(function*() {
      console.log("Auth:logout_all_users")
      self.users.forEach((user) => {
        Tokens.destroy_token(user.username)
        self.selected_user = null
        destroy(user)
      })
    })

  }))
  .views(self => ({

    is_logged_in() {
      return self.users.length && self.selected_user != null && self.selected_user.token() != null
    },

    all_users_except_current() {
      return self.users.filter(u => u.username !== self.selected_user.username)
    },

    user_from_username(username) {
      return self.users.find(u => u.username === username)
    }

  }))
  .create();