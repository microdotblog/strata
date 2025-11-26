import * as React from 'react';
import { observer } from 'mobx-react';
import { reaction } from 'mobx';
import { RefreshControl, View, TouchableOpacity, Text, TextInput, Keyboard, Platform, ActivityIndicator } from 'react-native';
import { FlashList } from "@shopify/flash-list";
import Auth from './../../stores/Auth';
import App from '../../stores/App';
import NoteItem from './note_item';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';

@observer
export default class NotesList extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      recent_date_modified: null,
      search_text: App.search_query
    };
  }

  componentDidMount() {
    // create a reaction that tracks the date_modified field of the first note in the ordered list
    this.reaction_disposer = reaction(
      () => {
        const notes = Auth.selected_user.selected_notebook.ordered_notes_with_query();
        return notes.length > 0 ? notes[0].date_modified : null;
      },
      (note_date) => {
        this.setState({ recent_date_modified: note_date });
      }
    );
  }

  componentWillUnmount() {
    if (this.reaction_disposer) {
      this.reaction_disposer();
    }
  }
  
  handle_search_submit = async () => {
    const notebook = Auth.selected_user?.selected_notebook
    if (!notebook || notebook.is_loading_search) {
      return
    }
    if (this.state.search_text === "") {
      App.set_search_query("")
      Keyboard.dismiss()
      return
    }
    try {
      await notebook.fetch_all_notes()
    }
    finally {
      App.set_search_query(this.state.search_text)
      Keyboard.dismiss()
    }
  }

  handle_cancel_search = () => {
    this.setState({ search_text: "" })
    App.set_search_query("")
    App.toggle_search_is_open()
  }

  _return_header = () => {
    const { selected_notebook } = Auth.selected_user
    const is_loading_search = selected_notebook?.is_loading_search
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
              <TouchableOpacity
                style={{
                  backgroundColor: App.theme_alt_border_color(),
                  paddingHorizontal: 8,
                  paddingTop: Platform.OS === "ios" ? 3 : 1,
                  paddingBottom: Platform.OS === "ios" ? 3 : 3,
                  borderRadius: 8,
                  borderColor: App.theme_border_color(),
                  borderWidth: 1
                }}
                onPress={() => App.open_sheet("notebooks-list")}
              >
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
                  flex: 1,
      						backgroundColor: App.theme_button_background_color(), 
      						fontSize: 16,
      						borderColor: App.theme_border_color(), 
      						borderWidth: 1,
                  borderRadius: 15,
      						paddingHorizontal: 11,
      						paddingVertical: 4,
      						color: App.theme_text_color()
                }}
                onSubmitEditing={this.handle_search_submit}
                onChangeText={(text) => {
                  this.setState({ search_text: text })
                  App.set_search_query(text)
                }}
                value={this.state.search_text}
              />
              {is_loading_search ? (
                <ActivityIndicator
                  style={{ marginLeft: 8 }}
                  size="small"
                  color={App.theme_text_color()}
                />
              ) : null}
              <TouchableOpacity
       					style={{
        						justifyContent: "center",
        						alignItems: "center",
        						padding: 4,
        						marginLeft: 8,
        						marginRight: 8,
       					}}
       					onPress={this.handle_cancel_search}
      				>
       					<Text
          				style={{
       							color: App.theme_button_text_color()
          				}}
       					>
        						Cancel
       					</Text>
      				</TouchableOpacity>
            </View>
        }

      </View>
    )
  }

  _key_extractor = (item) => {
    return item.id;
  }

  render_note = ({ item }) => {
    return (
      <NoteItem note={item} key={item.id} recent_state={this.state.recent_date_modified} />
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
            extraData={this.state.recent_date_modified}
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
                onRefresh={() => {
                  selected_user.selected_notebook.fetch_notes();
                }}
              />
            }
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: "center", marginTop: 25 }}>
                <Text style={{ color: App.theme_text_color() }}>
                  {!App.search_open ? "You don't have any notes yet..." : ""}
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
