import * as React from 'react';
import { RefreshControl } from 'react-native';
import { observer } from 'mobx-react';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import Highlight from '../../components/cells/highlight';
import { FlashList } from "@shopify/flash-list";

@observer
export default class HighlightsScreen extends React.Component{
  
  _key_extractor = (item) => item.id;
  
  render_highlight_item = ({ item }) => {
    return(
      <Highlight key={item.id} highlight={item} />
    )
  }
  
  _return_highlights_list = () => {
    const { highlights } = Auth.selected_user
    return(
      <FlashList
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
            refreshing={false}
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
