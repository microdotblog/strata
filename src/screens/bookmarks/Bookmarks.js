import * as React from 'react';
import { RefreshControl, FlatList } from 'react-native';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import Bookmark from '../../components/cells/bookmark';
import TagFilterHeader from '../../components/bookmarks/tag_filter_header';

@observer
export default class BookmarksScreen extends React.Component{
  
  _key_extractor = (item) => item.id;
  
  render_item = ({ item, index }) => {
    return(
      <Bookmark key={`${item.id}-${index}`} bookmark={item} />
    )
  }
  
  _return_list = () => {
    const { bookmarks, last_bookmark_fetch } = Auth.selected_user
    return(
      <FlatList
        estimatedItemSize={150}
        initialNumToRender={15}
        data={bookmarks}
        extraData={bookmarks?.length && !App.is_loading_bookmarks && last_bookmark_fetch}
        keyExtractor={this._key_extractor}
        renderItem={this.render_item}
        onEndReached={Auth.selected_user.fetch_more_bookmarks}
        contentContainerStyle={{
          paddingTop: 0,
          paddingHorizontal: 12,
          paddingBottom: 45
        }}
        refreshControl={
          <RefreshControl
            tintColor={App.theme_accent_color()}
            refreshing={App.is_loading_bookmarks}
            onRefresh={() => Auth.selected_user.fetch_highlights()}
          />
        }
      />
    )
  }

  render() {
    return (
      Auth.is_logged_in() && !Auth.is_selecting_user ?
        <>
          <TagFilterHeader />
          {this._return_list()}
        </>
      :
      null
    )
  }

}
