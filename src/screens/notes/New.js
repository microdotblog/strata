import * as React from 'react';
import { observer } from 'mobx-react';
import { TextInput, KeyboardAvoidingView, InputAccessoryView, ActivityIndicator, View } from 'react-native';
import Posting from '../../stores/Posting'
import PostingToolbar from '../../components/keyboard/posting_toolbar';
import App from '../../stores/App'
import HighlightingText from '../../components/text/highlighting_text';
// import Auth from '../../stores/Auth'

@observer
export default class NewNoteModalScreen extends React.Component {

  constructor(props) {
    super(props)
    this.input_accessory_view_id = "input_toolbar";
  }

  componentDidMount() {
    Posting.hydrate()
  }

  render() {
    if (Platform.OS === 'ios') {
      return (
        <>
          <HighlightingText
            placeholderTextColor="lightgrey"
            style={{
              minHeight: 300,
              fontSize: 17,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: 0,
              flex: 1,
              padding: 10,
              color: App.theme_text_color()
            }}
            editable={!Posting.is_sending_post}
            multiline={true}
            scrollEnabled={true}
            returnKeyType={'default'}
            keyboardType={'default'}
            autoFocus={true}
            autoCorrect={true}
            clearButtonMode={'while-editing'}
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid={'transparent'}
            value={Posting.note_text}
            selection={Posting.text_selection_flat}
            onChangeText={({ nativeEvent: { text } }) => {
              !Posting.is_sending_note ? Posting.set_note_text_from_typing(text) : null
            }}
            onSelectionChange={({ nativeEvent: { selection } }) => {
              Posting.set_text_selection(selection)
            }}
            inputAccessoryViewID={this.input_accessory_view_id}
          />
          <InputAccessoryView nativeID={this.input_accessory_view_id}>
            <PostingToolbar />
          </InputAccessoryView>        
        {
          Posting.is_sending_note ?
            <View
              style={{
                position: 'absolute',
                top: 0,
                height: 200,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10
              }}
            >
              <ActivityIndicator color={App.theme_accent_color()} size={'large'} />
            </View>
            : null
        }
        </>
      )
    }
    else {
      return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
          <TextInput
            placeholderTextColor="lightgrey"
            style={{
              fontSize: 17,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: 5,
              marginBottom: 90,
              padding: 10,
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
            value={Posting.note_text}
            onChangeText={(text) => !Posting.is_sending_note ? Posting.set_note_text(text) : null}
            onSelectionChange={({ nativeEvent: { selection } }) => {
              Posting.set_text_selection(selection)
            }}
            editable={!Posting.is_sending_note}
          />
          {
            <>
              <PostingToolbar />
            </>
          }
          {
            Posting.is_sending_note ?
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  height: 200,
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10
                }}
              >
                <ActivityIndicator color={App.theme_accent_color()} size={'large'} />
              </View>
              : null
          }
        </KeyboardAvoidingView>
      )
    }
  }

}