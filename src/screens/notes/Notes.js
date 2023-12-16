import * as React from 'react';
import { observer } from 'mobx-react';
import { View } from 'react-native';
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import NotesList from '../../components/notes/notes_list';

@observer
export default class NotesScreen extends React.Component {

  componentDidMount = async () => {
    console.log("componentDidMount", Auth.selected_user)
    if (Auth.selected_user != null) {
      await Auth.selected_user.check_for_exisence_of_secret_token()
      await Auth.selected_user.hydrate()
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