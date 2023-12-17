import * as React from 'react';
import { observer } from 'mobx-react';
import { TextInput, KeyboardAvoidingView } from 'react-native';
// import App from '../../stores/App'
// import Auth from '../../stores/Auth'

@observer
export default class NewNoteModalScreen extends React.Component {

  constructor(props) {
    super(props)
    this.input_accessory_view_id = "input_toolbar";
  }

  render() {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
        <TextInput
          placeholderTextColor="lightgrey"
          style={{
            fontSize: 18,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            marginTop: 3,
            marginBottom: 38,
            padding: 8,
            color: App.theme_text_color()
          }}
          multiline={true}
          scrollEnabled={true}
          returnKeyType={'default'}
          keyboardType={'default'}
          autoFocus={true}
          autoCorrect={true}
          clearButtonMode={'while-editing'}
          enablesReturnKeyAutomatically={true}
          underlineColorAndroid={'transparent'}
          inputAccessoryViewID={this.input_accessory_view_id}
        />
      </KeyboardAvoidingView>
    )
  }

}