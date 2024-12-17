import { types } from 'mobx-state-tree';
import App from '../App';
import Auth from '../Auth';

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
  _microblog: MicroblogMeta
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
  }
  
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
