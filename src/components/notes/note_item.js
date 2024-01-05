import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class NoteItem extends React.Component {

  render() {
    const { note } = this.props
    return (
      <TouchableOpacity
        onPress={() => note.is_locked() ? App.open_sheet("secret-key-prompt-sheet") : note.prep_and_open_posting()}
        style={{
          padding: 12,
          backgroundColor: App.theme_note_background_color(),
          marginTop: 15,
          borderRadius: 12,
          opacity: note.is_locked() ? .5 : 1
        }}
      >
        {
          note.is_locked() ?
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
            :
            <>
              {
                note.title && <Text style={{ color: App.theme_text_color(), marginBottom: 4, fontWeight: "600" }}>{note.title}</Text>
              }
              <Text style={{ color: App.theme_text_color() }}>{note.truncated_text()}</Text>
            </>
        }
      </TouchableOpacity>
    )
  }

}