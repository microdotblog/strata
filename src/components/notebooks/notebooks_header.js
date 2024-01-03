import * as React from 'react';
import { observer } from 'mobx-react';
import { Text, View, TouchableOpacity } from 'react-native';
import App from '../../stores/App'
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class NotebooksHeader extends React.Component {

  render() {
    return (
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        marginBottom: 15
      }}>
        <Text style={{ fontWeight: '800', color: App.theme_text_color() }}>Select or create a notebook</Text>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center"
          }}
        >
          <Text style={{ color: App.theme_accent_color(), marginRight: 5, fontSize: 15 }}>Create</Text>
          {
            Platform.OS === 'ios' ?
              <SFSymbol
                name={'plus'}
                color={App.theme_accent_color()}
                style={{ height: 20, width: 20 }}
                multicolor={true}
              />
              :
              <SvgXml
                style={{
                  height: 22,
                  width: 22
                }}
                color={App.theme_accent_color()}
                xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
               </svg>'
              />
          }
        </TouchableOpacity>
      </View>
    )
  }
}