import { types, getParent, flow } from 'mobx-state-tree';
import { URL } from 'react-native-url-polyfill';
import MicroBlogApi, { DELETE_ERROR } from '../../api/MicroBlogApi';

export default Highlight = types.model('Highlight', {
  id: types.identifierNumber,
  title: types.maybe(types.string),
  content_text: types.maybe(types.string),
  url: types.maybe(types.string),
  date_published: types.maybe(types.string),
})
.actions(self => ({
  
  delete: flow(function*() {
    const data = yield MicroBlogApi.delete_highlight(self.id)
    if(data !== DELETE_ERROR){
      const parentNode = getParent(self, 2)
      parentNode?.destroy_highlight(self)
      parentNode?.fetch_highlights()
    }
    else{
      alert("Something went wrong. Please try again.")
    }
  })
  
}))
.views(self => ({
  nice_local_published_date(){
    const date = new Date(self.date_published);
    return date.toLocaleDateString('en-CA') + ' ' + 
               date.toLocaleTimeString('en-US', { 
                 hour: 'numeric', 
                 minute: '2-digit', 
                 hour12: true 
               }).toLowerCase();
  },
  hostname(){
    return new URL(self.url).host
  },
  url_with_text_fragment(){
    return `${self.url}#:~:text=${self.content_text}`
  },
  markdown(){
    return `[${self.title}](${self.url})\n\n> ${self.content_text}`
  }
}))
