import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import App from './../../stores/App';

@observer
export default class NoteItem extends React.Component {

  render() {
    const { note } = this.props
    return (
      <TouchableOpacity
        style={{
          padding: 12,
          backgroundColor: App.theme_note_background_color(),
          marginTop: 15,
          borderRadius: 12,
          // elevation: 2,
          // shadowColor: App.theme_note_shadow_color(),
          // shadowOffset: { width: 0, height: 2 },
          // shadowOpacity: 0.15,
          // shadowRadius: 3
        }}
      >
        {
          note.title && <Text style={{ color: App.theme_text_color(), marginBottom: 4, fontWeight: "600" }}>{note.title}</Text>
        }
        <Text style={{ color: App.theme_text_color() }}>{note.decrypted_text()}</Text>
      </TouchableOpacity>
    )
  }

}