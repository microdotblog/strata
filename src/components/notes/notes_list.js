import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import Auth from './../../stores/Auth';

@observer
export default class NotesList extends React.Component {

  _key_extractor = (item) => item.id

  render_note = ({ item }) => {
    return (
      <View key={item.id}>
        <Text>{item.id}</Text>
      </View>
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
        />
      )
    }
    return null
  }

}