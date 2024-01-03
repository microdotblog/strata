import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import App from './../../stores/App';
import Auth from './../../stores/Auth';

@observer
export default class NotebookItem extends React.Component {

  render() {
    const { notebook } = this.props
    const is_selected = notebook === Auth.selected_user?.selected_notebook
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
  }

}