import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class LockedNoteItem extends React.Component {

  render() {
    return (
      <TouchableOpacity
        onPress={() => App.open_sheet("secret-key-prompt-sheet")}
        style={{
          padding: 12,
          backgroundColor: App.theme_note_background_color(),
          borderRadius: 12,
          opacity: .5,
          marginTop: 15
        }}
      >
        <View
          style={{
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          {
            Platform.OS === 'ios' ?
              <SFSymbol
                name={'lock'}
                color={App.theme_text_color()}
                style={{ height: 20, width: 20 }}
                multicolor={true}
              />
              :
              <SvgXml
                style={{
                  height: 20,
                  width: 20
                }}
                color={App.theme_text_color()}
                xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>'
              />
          }
          <Text style={{ color: App.theme_text_color(), fontWeight: "600", marginTop: 8 }}>Note locked</Text>
        </View>
      </TouchableOpacity>
    )
  }

}