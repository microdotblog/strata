import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class AddBookmarkButton extends React.Component {

  render() {
    if (Auth.selected_user != null) {
      const plusIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>`
      return (
        <TouchableOpacity
          onPress={() => App.navigate_to_screen("AddBookmark")}
        >
          {
            Platform.OS === 'ios' ?
              <SFSymbol
                name={'plus'}
                color={App.theme_text_color()}
                style={{ height: 22, width: 22 }}
                multicolor={true}
              />
              :
              <SvgXml
                style={{
                  height: 22,
                  width: 22
                }}
                color={App.theme_text_color()}
                xml={plusIcon}
              />
          }
        </TouchableOpacity>
      )
    }
    return null
  }

}
