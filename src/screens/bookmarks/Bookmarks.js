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
    const { bookmarks, last_bookmark_fetch, selected_tag } = Auth.selected_user
    return(
      <FlatList
        estimatedItemSize={150}
        initialNumToRender={15}
        data={bookmarks}
        extraData={[
          bookmarks?.length,
          App.is_loading_bookmarks,
          last_bookmark_fetch,
          selected_tag
        ]}
        keyExtractor={this._key_extractor}
        renderItem={this.render_item}
        onEndReached={selected_tag == null || selected_tag == "" ? Auth.selected_user.fetch_more_bookmarks : null}
        contentContainerStyle={{
          paddingTop: 0,
          paddingHorizontal: 12,
          paddingBottom: 45
        }}
        refreshControl={
          <RefreshControl
            refreshing={App.is_loading_bookmarks}
            onRefresh={() => {
              if (selected_tag == null || selected_tag == "") {
                Auth.selected_user.fetch_bookmarks()
              } else {
                Auth.selected_user.fetch_bookmarks_with_selected_tag()
              }
            }}
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
