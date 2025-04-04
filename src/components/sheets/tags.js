import * as React from 'react';
import { observer } from 'mobx-react';
import { ScrollView, TouchableOpacity, Text, Platform, TextInput, Keyboard, View } from 'react-native';
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import App from '../../stores/App'
import { SvgXml } from 'react-native-svg';
import { SFSymbol } from "react-native-sfsymbols";
import Auth from '../../stores/Auth';

@observer
export default class TagsMenu extends React.Component{
  
  _render_tags = () => {
    return Auth.selected_user?.filtered_tags().map((tag) => {
      return(
        <TouchableOpacity
          key={`tag-${tag}`}
          onPress={() => {
            Auth.selected_user?.set_selected_tag(tag)
            SheetManager.hide(this.props.sheetId);
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 15,
            borderColor: App.theme_border_color()
          }}
        >
          {
            Platform.OS === "ios" ?
            <SFSymbol
              name={"tag"}
              color={App.theme_button_text_color()}
              style={{ height: 16, width: 16, marginRight: 4 }}
            />
            :
            <SvgXml
              style={{
                marginRight: 4
              }}
              xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="12px" height="12px"><path stroke="currentColor" d="M 28.625 2 C 28.285156 2.003906 27.941406 2.019531 27.59375 2.0625 C 26.902344 2.152344 26.144531 2.386719 25.5625 2.96875 L 2.84375 25.6875 C 1.722656 26.808594 1.722656 28.660156 2.84375 29.78125 L 20.21875 47.15625 C 21.339844 48.277344 23.191406 48.277344 24.3125 47.15625 L 47.03125 24.4375 C 47.609375 23.859375 47.847656 23.09375 47.9375 22.40625 C 48.027344 21.71875 48 21.039063 48 20.375 L 48 5.5 C 48 3.578125 46.421875 2 44.5 2 L 29.625 2 C 29.300781 2 28.964844 1.996094 28.625 2 Z M 28.65625 4 C 28.949219 3.992188 29.285156 4 29.625 4 L 44.5 4 C 45.339844 4 46 4.660156 46 5.5 L 46 20.375 C 46 21.070313 45.996094 21.699219 45.9375 22.15625 C 45.878906 22.613281 45.785156 22.839844 45.625 23 L 22.90625 45.75 C 22.550781 46.105469 21.980469 46.105469 21.625 45.75 L 21.5 45.59375 L 4.25 28.375 C 3.894531 28.019531 3.894531 27.449219 4.25 27.09375 L 27 4.375 C 27.15625 4.21875 27.414063 4.121094 27.875 4.0625 C 28.105469 4.03125 28.363281 4.007813 28.65625 4 Z M 39 7 C 36.800781 7 35 8.800781 35 11 C 35 13.199219 36.800781 15 39 15 C 41.199219 15 43 13.199219 43 11 C 43 8.800781 41.199219 7 39 7 Z M 39 9 C 40.117188 9 41 9.882813 41 11 C 41 12.117188 40.117188 13 39 13 C 37.882813 13 37 12.117188 37 11 C 37 9.882813 37.882813 9 39 9 Z"></path></svg>'
            />
          }
          <Text style={{ color: App.theme_button_text_color() }}>
            {tag}
          </Text>
        </TouchableOpacity>
      )
    })
  }
  
  render() {
    return(
      <ActionSheet
        id={this.props.sheetId}
        snapPoints={[40,95]}
        initialSnapIndex={[1]}
        overdrawEnabled={true}
        useBottomSafeAreaPadding={true}
        gestureEnabled={true}
        containerStyle={{
          backgroundColor: App.theme_background_color_secondary()
        }}
      >
      <View
        style={{
          padding: 15,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          paddingBottom: 5
        }}
      >
        <Text style={{ fontWeight: '800', marginBottom: 15, color: App.theme_text_color() }}>Tags</Text>
        <TextInput
          placeholderTextColor="lightgrey"
          placeholder={"Search tags..."}
          returnKeyType={'search'}
          blurOnSubmit={true}
          autoCorrect={true}
          autoCapitalize="none"
          clearButtonMode={'always'}
          enablesReturnKeyAutomatically={true}
          underlineColorAndroid={'transparent'}
          style={{ 
            backgroundColor: App.theme_button_background_color(), 
            fontSize: 16,
            borderColor: App.theme_border_color(), 
            borderWidth: 1,
            borderRadius: 15,
            paddingHorizontal: 15,
            paddingVertical: 4,
            minWidth: "100%",
            color: App.theme_text_color()
          }}
          onSubmitEditing={Keyboard.dismiss}
          onChangeText={(text) => App.set_bookmark_tag_filter_query(text)}
          value={App.tag_filter_query}
        />
      </View>
        <ScrollView keyboardShouldPersistTaps={'always'} style={{maxHeight: 700, marginBottom: 25, paddingHorizontal: 25}} {...this.scrollHandlers}>
          {this._render_tags()}
        </ScrollView>
      </ActionSheet>
    )
  }
  
}
