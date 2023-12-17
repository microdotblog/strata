import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import NotesList from '../../components/notes/notes_list';

@observer
export default class NewNoteModalScreen extends React.Component {

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text>New note</Text>
      </View>
    )
  }

}