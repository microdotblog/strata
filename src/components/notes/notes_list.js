import * as React from 'react';
import { observer } from 'mobx-react';
import { RefreshControl, View, TouchableOpacity, Text, TextInput, Keyboard } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import Auth from './../../stores/Auth';
import App from '../../stores/App';
import NoteItem from './note_item';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

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
          paddingHorizontal: 12,
          paddingVertical: 10,
          width: '100%',
          height: 50,
          backgroundColor: App.theme_input_contrast_background_color(),
        }}>
        {
          !App.search_open ?
            <>
              <TouchableOpacity style={{ backgroundColor: App.theme_alt_border_color(), paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderColor: App.theme_border_color(), borderWidth: 1 }} onPress={() => App.open_sheet("notebooks-list")}>
                <Text style={{ color: App.theme_text_color(), fontWeight: "500", fontSize: 15, padding: 2 }}>
                  {selected_notebook?.title}
                </Text>
              </TouchableOpacity>
              {
                Auth.selected_user.secret_token() ?
                  <TouchableOpacity
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      borderColor: App.theme_border_color(),
                      borderWidth: 1,
                      padding: 4,
                      paddingHorizontal: 6,
                      borderRadius: 5,
                      marginLeft: 5,
                      marginRight: 4,
                      backgroundColor: App.theme_alt_border_color()        
                    }}
                    onPress={App.toggle_search_is_open}
                  >
                    {
                      Platform.OS === "ios" ?
                        <SFSymbol
                          name={"magnifyingglass"}
                          color={App.theme_button_text_color()}
                          style={{ height: 18, width: 18 }}
                        />
                        :
                        <SvgXml
                          style={{
                            height: 18,
                            width: 18
                          }}
                          color={App.theme_text_color()}
                          xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>'
                        />
                    }
                  </TouchableOpacity>
                  : null
              }
            </>
            :
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  borderColor: App.theme_border_color(),
                  borderWidth: 1,
                  padding: 4,
                  borderRadius: 50,
                  marginLeft: 2,
                  marginRight: 8,
                  width: 28,
                  height: 28,
                  backgroundColor: App.theme_alt_border_color()
                }}
                onPress={App.toggle_search_is_open}
              >
                {
                  Platform.OS === "ios" ?
                    <SFSymbol
                      name={"xmark"}
                      color={App.theme_button_text_color()}
                      style={{ height: 12, width: 12 }}
                    />
                    :
                    <SvgXml
                      style={{
                        height: 12,
                        width: 12
                      }}
                      stroke={App.theme_button_text_color()}
                      strokeWidth={2}
                      xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>'
                    />
                }
              </TouchableOpacity>
              <TextInput
                placeholderTextColor="lightgrey"
                placeholder={"Search notes"}
                returnKeyType={'search'}
                blurOnSubmit={true}
                autoFocus={true}
                autoCorrect={true}
                autoCapitalize="none"
                clearButtonMode={'while-editing'}
                enablesReturnKeyAutomatically={true}
                underlineColorAndroid={'transparent'}
                style={{
                  backgroundColor: App.theme_button_background_color(),
                  fontSize: 16,
                  borderColor: App.theme_border_color(),
                  borderWidth: 1,
                  borderRadius: 15,
                  paddingHorizontal: 12,
                  paddingVertical: 3,
                  minWidth: "89%",
                  color: App.theme_text_color()
                }}
                onSubmitEditing={() => { Keyboard.dismiss() }}
                onChangeText={(text) => App.set_search_query(text)}
                value={App.search_query}
              />
            </View>
        }

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
    const { selected_user } = Auth

    if (selected_user != null && selected_user.selected_notebook != null) {
      return (
        <>
          {this._return_header()}
          <FlashList
            estimatedItemSize={150}
            initialNumToRender={15}
            data={selected_user.selected_notebook.ordered_notes_with_query()}
            extraData={selected_user.selected_notebook.ordered_notes_with_query()?.length}
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
                onRefresh={selected_user.selected_notebook.fetch_notes}
                tintColor={App.theme_accent_color()}
              />
            }
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", marginTop: 25 }}>
                <Text style={{ color: App.theme_text_color() }}>
                  {App.search_open ? "Couldn't find any notes with your search query..." : "You don't have any notes yet..."}
                </Text>
              </View>
            }
          />
        </>
      )
    }
    return null
  }

}