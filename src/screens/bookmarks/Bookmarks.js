import * as React from 'react';
import {RefreshControl, FlatList, View} from 'react-native';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import {tabListBottomPadding} from '../../utils/tab_bar_insets';
import Bookmark from '../../components/cells/bookmark';
import TagFilterHeader from '../../components/bookmarks/tag_filter_header';

@observer
export default class BookmarksScreen extends React.Component{

  componentDidMount() {
    const user = Auth.selected_user;
    if (user == null) {
      return;
    }
    if (user.selected_tag != null && user.selected_tag !== '') {
      user.fetch_bookmarks_with_selected_tag();
    } else {
      user.fetch_bookmarks();
    }
    user.fetch_tags();
  }

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
        style={{flex: 1}}
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
          paddingBottom: tabListBottomPadding()
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
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
    if (!Auth.is_logged_in()) {
      return null;
    }

    return (
      <View style={{flex: 1}}>
        <TagFilterHeader />
        {this._return_list()}
      </View>
    );
  }

}
