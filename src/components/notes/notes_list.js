import * as React from 'react';
import { observer } from 'mobx-react';
import { RefreshControl } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import Auth from './../../stores/Auth';
import App from '../../stores/App';
import NoteItem from './note_item';

@observer
export default class NotesList extends React.Component {

  _key_extractor = (item) => item.id

  render_note = ({ item }) => {
    return (
      <NoteItem note={item} key={item.id} />
    )
  }

  render() {
    if (Auth.selected_user != null && Auth.selected_user.selected_notebook != null) {
      return (
        <FlashList
          estimatedItemSize={150}
          initialNumToRender={15}
          data={Auth.selected_user.selected_notebook.ordered_notes()}
          extraData={Auth.selected_user.selected_notebook.ordered_notes()?.length}
          keyExtractor={this._key_extractor}
          renderItem={this.render_note}
          contentContainerStyle={{
            paddingTop: 8,
            paddingHorizontal: 12
          }}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={Auth.selected_user.selected_notebook.fetch_notes}
              tintColor={App.theme_accent_color()}
            />
          }
        />
      )
    }
    return null
  }

}