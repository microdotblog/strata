import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import Auth from '../../stores/Auth'
import NotesList from '../../components/notes/notes_list';

@observer
export default class NotesScreen extends React.Component {

  componentDidMount = async () => {
    if (Auth.selected_user != null) {
      await Auth.selected_user.hydrate()
      await Auth.selected_user.check_for_exisence_of_secret_token()
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <NotesList />
      </View>
    )
  }

}