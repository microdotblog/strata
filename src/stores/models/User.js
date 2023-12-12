import { types, flow } from 'mobx-state-tree';
import Tokens from './../Tokens';
// import MicroBlogApi, { API_ERROR, DELETE_ERROR, LOGIN_TOKEN_INVALID } from '../../api/MicroBlogApi';

export default User = types.model('User', {
    username: types.identifier,
    avatar: types.maybeNull(types.string),
    has_site: types.maybeNull(types.boolean, false),
    default_site: types.maybeNull(types.string),
    is_premium: types.maybeNull(types.boolean)
  })
  .actions(self => ({

    hydrate: flow(function* () {
      console.log("HYDRATING USER", self.username)
    }),
    
    afterCreate: flow(function* () {
      self.hydrate()
    })
    
  }))
  .views(self => ({
    
    token(){
      return Tokens.token_for_username(self.username, "user")?.token
    }
    
  }))
