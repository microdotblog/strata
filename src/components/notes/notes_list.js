import * as React from 'react';
import { observer } from 'mobx-react';
import { RefreshControl, View, TouchableOpacity, Text } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import Auth from './../../stores/Auth';
import App from '../../stores/App';
import NoteItem from './note_item';

@observer
export default class NotesList extends React.Component {

  _return_header = () => {
    const { selected_notebook } = Auth.selected_user
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 15,
          paddingVertical: 10,
          width: '100%',
          backgroundColor: App.theme_input_contrast_background_color(),
        }}>
        <TouchableOpacity style={{ backgroundColor: App.theme_alt_border_color(), paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }} onPress={() => App.open_sheet("notebooks-list")}>
          <Text style={{ color: App.theme_text_color(), fontWeight: "500", fontSize: 15 }}>
            {selected_notebook?.title}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  _key_extractor = (item) => item.id

  render_note = ({ item }) => {
    return (
      <NoteItem note={item} key={item.id} />
    )
  }

  render() {
    if (Auth.selected_user != null && Auth.selected_user.selected_notebook != null) {
      return (
        <>
          {this._return_header()}
          <FlashList
            estimatedItemSize={150}
            initialNumToRender={15}
            data={Auth.selected_user.selected_notebook.ordered_notes()}
            extraData={Auth.selected_user.selected_notebook.ordered_notes()?.length}
            keyExtractor={this._key_extractor}
            renderItem={this.render_note}
            contentContainerStyle={{
              paddingTop: 0,
              paddingHorizontal: 12,
              paddingBottom: 45
            }}
            refreshControl={
              <RefreshControl
                refreshing={false}
                onRefresh={Auth.selected_user.selected_notebook.fetch_notes}
                tintColor={App.theme_accent_color()}
              />
            }
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", marginTop: 25 }}>
                <Text style={{ color: App.theme_text_color() }}>You don't have any notes yet...</Text>
              </View>
            }
          />
        </>
      )
    }
    return null
  }

}