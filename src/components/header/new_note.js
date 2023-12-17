import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Text } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';

@observer
export default class NewNoteButton extends React.Component {

  render() {
    if (Auth.selected_user != null && Auth.selected_user.secret_token()) {
      return (
        <TouchableOpacity
          onPress={() => App.navigate_to_screen("NewNote")}
          style={{
            width: 28,
            height: 28
          }}
        >
          <Text>+</Text>
        </TouchableOpacity>
      )
    }
    return null
  }

}