import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
import App from '../../stores/App'
import Auth from '../../stores/Auth'

@observer
export default class NotesScreen extends React.Component {

  componentDidMount = async () => {
    if (Auth.selected_user != null) {
      Auth.selected_user.check_for_exisence_of_secret_token()
    }
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Notes Screen</Text>
      </View>
    )
  }

}