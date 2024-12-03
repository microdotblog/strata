import { types } from 'mobx-state-tree';
import { URL } from 'react-native-url-polyfill';

export default Highlight = types.model('Highlight', {
  id: types.identifierNumber,
  title: types.maybe(types.string),
  content_text: types.maybe(types.string),
  url: types.maybe(types.string),
  date_published: types.maybe(types.string),
})
.views(self => ({
  nice_local_published_date(){
    const date = new Date(self.date_published);
    return date.toLocaleString();
  },
  hostname(){
    return new URL(self.url).host
  },
  url_with_text_fragment(){
    return `${self.url}#:~:text=${self.content_text}`
  }
}))
