import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class NewNoteButton extends React.Component {

  render() {
    if (Auth.selected_user != null) {
      const plusIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>`

      const lockIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>`
      return (
        <TouchableOpacity
          onPress={() => Auth.selected_user.secret_token() ? App.navigate_to_screen("NewNote") : App.open_sheet("secret-key-prompt-sheet")}
        >
          {
            Platform.OS !== 'ios' ?
              <SFSymbol
                name={Auth.selected_user.secret_token() ? 'plus' : 'lock'}
                color={App.theme_text_color()}
                style={{ height: 20, width: 20 }}
                multicolor={true}
              />
              :
              <SvgXml
                style={{
                  height: 22,
                  width: 22
                }}
                color={App.theme_text_color()}
                xml={Auth.selected_user.secret_token() ? plusIcon : lockIcon}
              />
          }
        </TouchableOpacity>
      )
    }
    return null
  }

}