import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class TagsButton extends React.Component {

  render() {
    if (Auth.selected_user != null) {
      return (
        <TouchableOpacity
          onPress={() => App.open_sheet("tags")}
        >
          {
            Platform.OS === 'ios' ?
              <SFSymbol
                name={'tag'}
                color={App.theme_text_color()}
                style={{ height: 22, width: 22 }}
              />
              :
              <SvgXml
                style={{
                  height: 22,
                  width: 22
                }}
                color={App.theme_text_color()}
                xml={`
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
                  </svg>
                  `}
              />
          }
        </TouchableOpacity>
      )
    }
    return null
  }

}
