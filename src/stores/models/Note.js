import { types, flow } from 'mobx-state-tree';
// import MicroBlogApi, { API_ERROR, DELETE_ERROR, LOGIN_TOKEN_INVALID } from '../../api/MicroBlogApi';

const Microblog = types.model('_microblog', {
  is_encrypted: types.boolean,
  is_shared: types.boolean,
  shared_url: types.maybeNull(types.string)
})

export default Note = types.model('Note', {
  id: types.identifierNumber,
  username: types.maybeNull(types.string),
  title: types.maybeNull(types.string),
  content_text: types.maybeNull(types.string),
  content_html: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  date_published: types.maybeNull(types.string),
  _microblog: types.maybeNull(Microblog)
})
  .actions(self => ({

  }))
  .views(self => ({

    decrypted_text() {
      return self.content_text
      // if (this.secret_token()) {
      //   return self.content_text
      // }
      // else {
      //   return false
      // }
    },

    secret_token() {
      return Tokens.secret_token_for_username(self.username, "secret")?.token
    }

  }))
