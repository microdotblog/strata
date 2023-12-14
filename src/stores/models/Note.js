import { types, flow } from 'mobx-state-tree';
// import MicroBlogApi, { API_ERROR, DELETE_ERROR, LOGIN_TOKEN_INVALID } from '../../api/MicroBlogApi';

export default Note = types.model('Note', {
  id: types.identifier,
})
  .actions(self => ({

  }))
  .views(self => ({
  }))
