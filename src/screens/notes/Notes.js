import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import App from '../../stores/App'
import Auth from '../../stores/Auth'

@observer
export default class NotesScreen extends React.Component {

  componentDidMount = async () => {
    console.log("MOUNTED NOTES")
    if (Auth.selected_user != null) {
      Auth.selected_user.check_for_exisence_of_secret_token()
    }
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Notes Screen</Text>
        <TouchableOpacity style={{ marginTop: 25 }} onPress={Auth.logout_all_user}>
          <Text style={{ color: "red" }}>Logout...</Text>
        </TouchableOpacity>
      </View>
    )
  }

}