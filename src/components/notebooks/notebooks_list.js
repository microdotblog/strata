import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TouchableOpacity, Text } from 'react-native';
import Auth from './../../stores/Auth';
import App from '../../stores/App';

@observer
export default class NotebooksList extends React.Component {

  render() {
    if (Auth.selected_user != null && Auth.selected_user.notebooks) {
      const notebooks_wording = Auth.selected_user.notebooks.length > 1 ? "notebooks" : "notebook"
      return (
        <View>
          <Text style={{ color: App.theme_text_color(), fontWeight: "400", paddingVertical: 15 }}>
            You have {Auth.selected_user.notebooks.length} {notebooks_wording}:
          </Text>
          <Text>Notebooks list here</Text>
        </View>
      )
    }
    return null
  }

}