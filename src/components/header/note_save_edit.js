import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, Text } from 'react-native';
import App from './../../stores/App';
import Posting from '../../stores/Posting';

@observer
export default class NoteSaveEditButton extends React.Component {

  render() {
    return (
      <TouchableOpacity>
        <Text style={{ color: App.theme_accent_color() }}>{this.props.title}</Text>
      </TouchableOpacity>
    )
  }

}