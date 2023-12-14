import { types, flow } from 'mobx-state-tree';
import Note from './Note';
// import MicroBlogApi, { API_ERROR, DELETE_ERROR, LOGIN_TOKEN_INVALID } from '../../api/MicroBlogApi';

export default Notebook = types.model('Notebook', {
  id: types.identifier,
  title: types.maybeNull(types.string),
  url: types.maybeNull(types.string),
  date_published: types.maybeNull(types.string),
  notes: types.optional(types.array(Note), [])
})
  .actions(self => ({

  }))
  .views(self => ({
  }))
