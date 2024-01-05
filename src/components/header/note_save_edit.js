import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Text } from 'react-native';
import App from './../../stores/App';
import Posting from './../../stores/Posting';

@observer
export default class NoteSaveEditButton extends React.Component {

  render() {
    const posting_enabled = Posting.posting_button_enabled()
    return (
      <TouchableOpacity style={{ opacity: posting_enabled ? 1 : .25 }} onPress={() => posting_enabled ? Posting.send_note() : null}>
        <Text style={{ color: App.theme_accent_color(), fontSize: 16 }}>{this.props.title}</Text>
      </TouchableOpacity>
    )
  }

}