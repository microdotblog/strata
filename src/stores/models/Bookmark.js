import { types, flow, getParent } from 'mobx-state-tree';
import App from '../App';
import Auth from '../Auth';
import MicroBlogApi, { DELETE_ERROR } from '../../api/MicroBlogApi';

const MicroblogLink = types.model('MicroblogLink', {
  id: types.number,
  url: types.string,
  archived_url: types.string
});

const MicroblogInfo = types.model('MicroblogInfo', {
  username: types.string
});

const Author = types.model('Author', {
  name: types.string,
  url: types.string,
  avatar: types.string,
  _microblog: types.maybeNull(MicroblogInfo)
});

const MicroblogMeta = types.model('MicroblogMeta', {
  date_relative: types.string,
  date_favorited: types.string,
  date_timestamp: types.number,
  links: types.array(MicroblogLink),
  is_bookmark: types.boolean,
  is_favorite: types.boolean,
  is_deletable: types.boolean,
  is_conversation: types.boolean
});

export const Bookmark = types.model('Bookmark', {
  id: types.identifier,
  content_html: types.string,
  summary: types.optional(types.string, ''),
  url: types.string,
  date_published: types.string,
  tags: types.optional(types.string, ''),
  author: Author,
  _microblog: MicroblogMeta,
  temp_tag_filter_query: types.maybeNull(types.string),
  temporary_tags_for_bookmark: types.optional(types.array(types.string), []),// We'll use this to set the temporary bookmarks for a given bookmark.
  is_updating_tags: types.optional(types.boolean, false)
})
.actions(self => ({
  
  setFavorite(status) {
    self._microblog.is_favorite = status;
  },
  
  open(id = null){
    if(id == null){
      App.open_url(self.url)
    }
    else if(id){
      App.open_url(`https://micro.blog/hybrid/signin?token=${Auth.selected_user.token()}&redirect_to=https://micro.blog/hybrid/bookmarks/${id}`)
    }
  },
  
  delete: flow(function*() {
    console.log("Bookmark::delete", self.id)
    const data = yield MicroBlogApi.delete_bookmark(self.id)
    if(data !== DELETE_ERROR){
      console.log("Bookmark::deleted")
      const parentNode = getParent(self, 2)
      parentNode?.destroy_bookmark(self)
      parentNode?.fetch_bookmarks()
    }
    else{
      alert("Something went wrong. Please try again.")
    }
  }),
  
  set_temp_tags: flow(function*() {
    console.log("Bookmark::set_temp_tags", self.id)
    self.temporary_tags_for_bookmark = self.tags?.length > 0 ? self.tags.split(',') : []
  }),
  
  set_selected_temp_tag: flow(function* (tag) {
    console.log("Bookmark:set_selected_temp_tag", self.id, tag)
    const existing_tag = self.temporary_tags_for_bookmark.find(t => t === tag)
    if(existing_tag == null){
      self.temporary_tags_for_bookmark.push(tag)
    }
  }),
  
  delete_selected_temp_tag: flow(function* (tag) {
    console.log("Bookmark:delete_selected_temp_tag", self.id, tag)
    const existing_tag_index = self.temporary_tags_for_bookmark.findIndex(t => t === tag)
    if(existing_tag_index > -1){
      self.temporary_tags_for_bookmark.splice(existing_tag_index, 1)
    }
  }),
  
  set_selected_temp_tag_from_input: flow(function* () {
    console.log("Bookmark:set_selected_temp_tag_from_input", self.temp_tag_filter_query)
    const existing_tag = self.temporary_tags_for_bookmark.find(t => t === self.temp_tag_filter_query)
    if(existing_tag == null){
      self.temporary_tags_for_bookmark.push(self.temp_tag_filter_query)
      self.temp_tag_filter_query = null
    }
  }),
  
  set_temp_tag_filter_query: flow(function* (text) {
    console.log("Bookmark:set_temp_tag_filter_query", self.id, text)
    self.temp_tag_filter_query = text == "" ? null : text
  }),
  
  clear_temporary_tags_for_bookmark: flow(function* () {
    self.temporary_tags_for_bookmark = []
    self.temporary_bookmark_id = null
  }),
  
}))
.views(self => ({
  get isFavorite() {
    return self._microblog.is_favorite;
  },
  get publishedDate() {
    return new Date(self.date_published);
  },
  get relativeDate() {
    return self._microblog.date_relative;
  }
}));
