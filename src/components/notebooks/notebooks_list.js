import * as React from 'react';
import { observer } from 'mobx-react';
import { View, TouchableOpacity, Text } from 'react-native';
import Auth from './../../stores/Auth';
import App from '../../stores/App';

@observer
export default class NotebooksList extends React.Component {

  _render_notebooks = () => {
    return Auth.selected_user.notebooks.map((notebook) => {
      const is_selected = notebook === Auth.selected_user.selected_notebook
      return (
        <TouchableOpacity
          onPress={() => Auth.selected_user.set_selected_notebook(notebook)}
          key={`notebook_${notebook.id}`}
          style={{
            marginBottom: 8,
            padding: 12,
            borderRadius: 8,
            backgroundColor: App.theme_input_contrast_background_color(),
            opacity: is_selected ? 1 : .6
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: App.theme_text_color() }}>{notebook.title}</Text>
        </TouchableOpacity>
      )
    })
  }

  render() {
    if (Auth.selected_user != null && Auth.selected_user.notebooks) {
      const notebooks_wording = Auth.selected_user.notebooks.length > 1 ? "notebooks" : "notebook"
      return (
        <View>
          <Text style={{ color: App.theme_text_color(), fontWeight: "400", paddingVertical: 15 }}>
            You have {Auth.selected_user.notebooks.length} {notebooks_wording}:
          </Text>
          {this._render_notebooks()}
        </View>
      )
    }
    return null
  }

}