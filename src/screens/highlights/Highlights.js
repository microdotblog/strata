import * as React from 'react';
import { RefreshControl, FlatList } from 'react-native';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import Highlight from '../../components/cells/highlight';

@observer
export default class HighlightsScreen extends React.Component{
  
  _key_extractor = (item) => item.id;
  
  render_highlight_item = ({ item, index}) => {
    return(
      <Highlight key={`${item.id}-${index}`} highlight={item} />
    )
  }
  
  _return_highlights_list = () => {
    const { highlights } = Auth.selected_user
    return(
      <FlatList
        estimatedItemSize={150}
        initialNumToRender={15}
        data={highlights}
        extraData={highlights?.length && !App.is_loading_highlights}
        keyExtractor={this._key_extractor}
        renderItem={this.render_highlight_item}
        contentContainerStyle={{
          paddingTop: 0,
          paddingHorizontal: 12,
          paddingBottom: 45
        }}
        refreshControl={
          <RefreshControl
            tintColor={App.theme_accent_color()}
            refreshing={App.is_loading_highlights}
            onRefresh={() => Auth.selected_user.fetch_highlights()}
          />
        }
      />
    )
  }

  render() {
    return (
      Auth.is_logged_in() && !Auth.is_selecting_user ?
        this._return_highlights_list()
      :
      null
    )
  }

}
