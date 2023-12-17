import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
// import App from '../../stores/App'
// import Auth from '../../stores/Auth'

@observer
export default class EditNoteModalScreen extends React.Component {

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Text>Edit note</Text>
      </View>
    )
  }

}