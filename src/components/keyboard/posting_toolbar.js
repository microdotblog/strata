import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SFSymbol } from 'react-native-sfsymbols'
import App from '../../stores/App';
import Posting from '../../stores/Posting';

@observer
export default class PostingToolbar extends React.Component {

  render() {
    return (
      <View
        style={{
          width: '100%',
          backgroundColor: App.theme_section_background_color(),
          ...Platform.select({
            android: {
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
            }
          }),
          padding: 5,
          minHeight: 40,
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <TouchableOpacity style={{ minWidth: 30 }} onPress={() => Posting.handle_text_action("**")}>
          <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"b"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ minWidth: 30 }} onPress={() => Posting.handle_text_action("_")}>
          <Text style={{ fontSize: 18, fontWeight: '600', fontStyle: "italic", textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"i"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ minWidth: 30, marginLeft: 5 }} onPress={() => Posting.handle_text_action("[]")}>
          {
            Platform.OS === 'ios' ?
              <SFSymbol
                name={'link'}
                color={App.theme_text_color()}
                style={{ height: 20, width: 20 }}
                multicolor={true}
              />
              :
              <SvgXml
                style={{
                  height: 18,
                  width: 18
                }}
                stroke={App.theme_button_text_color()}
                strokeWidth={2}
                xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>'
              />
          }
        </TouchableOpacity>
      </View>
    )
  }

}