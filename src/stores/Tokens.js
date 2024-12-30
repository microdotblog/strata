import { types, flow, applySnapshot, destroy } from 'mobx-state-tree';
import Token from './models/Token'
import App from './App';
import SFInfo from 'react-native-sensitive-info'

export default Tokens = types.model('Tokens', {
  tokens: types.optional(types.array(Token), []),
  temp_secret_token: types.maybeNull(types.string)
})
  .actions(self => ({

    hydrate: flow(function*(return_data = false) {
      console.log("Tokens:hydrate")
      const data = yield SFInfo.getItem('Tokens', {})
      if (data) {
        applySnapshot(self, JSON.parse(data))
        self.temp_secret_token = null
        console.log("Tokens:hydrate:with_data")
      }
      if (return_data) {
        return data ? JSON.parse(data) : null
      }
    }),

    destroy_all_token_data: flow(function*() {
      console.log("Tokens:destroy_all_token_data")
      yield SFInfo.deleteItem("Tokens", {})
    }),

    add_new_token: flow(function*(username, token) {
      console.log("Tokens:add_new_token", username)
      const existing_token = self.tokens.find(t => t.username === username && t.type === "user")
      if (existing_token != null) {
        // There might be an existing token for a given user, but the token changed.
        // Destroying it so we can create a new one as the identifier is tied to the token.
        destroy(existing_token)
      }
      const new_token = Token.create({ token: token, username: username })
      self.tokens.push(new_token)
      return new_token
    }),

    destroy_token: flow(function*(username) {
      console.log("Tokens:destroy_token", username)
      const tokens_to_destroy = self.tokens.filter(t => t.username === username)
      tokens_to_destroy.forEach(token => destroy(token))
      self.temp_secret_token = null
    }),

    destroy_secret_token: flow(function*(username) {
      console.log("Tokens:destroy_secret_token", username);
      const tokens_to_destroy = self.tokens.filter(t => t.username === username && t.type === "secret");
      tokens_to_destroy.forEach(token => destroy(token));
      self.temp_secret_token = null;
    }),

    set_temp_secret_token: flow(function*(token = null) {
      self.temp_secret_token = token
    }),

    set_temp_secret_token_from_url: flow(function*(url) {
      console.log("Tokens:set_temp_secret_token_from_url")
      const token = url.split('/qrcode/')[1]
      if (token) {
        self.temp_secret_token = token
      }
    }),

    add_new_secret_token: flow(function*(username, secret_token = null) {
      if (secret_token == null && self.temp_secret_token == null) {
        return false
      }
      else if (secret_token == null && self.temp_secret_token != null) {
        secret_token = self.temp_secret_token
        // Let's also check if it includes mkey — we only use it as a sanity check
        if (secret_token.includes("mkey")) {
          secret_token = secret_token.replace("mkey", "")
        }
      }
      console.log("Tokens:add_new_secret_token", username)
      const existing_token = self.secret_token_for_username(username)
      if (existing_token != null) {
        // There might be an existing secret token for a given user, but the token changed.
        // Destroying it so we can create a new one as the identifier is tied to the token.
        destroy(existing_token)
      }
      const new_token = Token.create({ token: secret_token, username: username, type: "secret" })
      self.tokens.push(new_token)
      App.close_sheet("secret-key-prompt-sheet")
      return new_token
    }),

  }))
  .views(self => ({

    token_for_username(username, type = "user") {
      return self.tokens.find(t => t.username === username && t.type === type)
    },

    secret_token_for_username(username, type = "secret") {
      return self.tokens.find(t => t.username === username && t.type === type)
    },
    
    token_for_service_id(service_id){
      return self.tokens.find(t => t.service_id === service_id)
    }

  }))
  .create();
