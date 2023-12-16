import ActionSheet from "react-native-actions-sheet";
import * as React from 'react';
import { observer } from 'mobx-react';
import { SafeAreaView, Text, TextInput, Button, Keyboard } from 'react-native';
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import Tokens from "../../stores/Tokens";

@observer
export default class SecretKeyPromptSheet extends React.Component {

  render() {
    return (
      <ActionSheet
        containerStyle={{
          backgroundColor: App.theme_background_color_secondary(),
          padding: 15,
          paddingHorizontal: 12,
          borderRadius: 8,
          elevation: 2
        }}
        id={this.props.sheet_id}
      >
        <SafeAreaView style={{ justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: App.theme_text_color(), fontWeight: "400", paddingVertical: 15 }}>
            Notes in Micro.blog are encrypted. To sync notes across devices, you will need to save a secret key so the notes can be decrypted later. If you lose your key, you will lose access to your notes too.
          </Text>
          <Text style={{ color: App.theme_text_color(), fontWeight: "600", paddingBottom: 15 }}>
            Enter your saved key:
          </Text>
          <TextInput
            multiline={true}
            placeholderTextColor="lightgrey"
            placeholder={"Enter your saved key"}
            returnKeyType={'done'}
            blurOnSubmit={true}
            autoFocus={false}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode={'while-editing'}
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid={'transparent'}
            style={{
              backgroundColor: App.theme_input_contrast_background_color(),
              fontSize: 17,
              borderColor: App.theme_accent_color(),
              borderWidth: 1,
              minHeight: 70,
              width: "100%",
              borderRadius: 5,
              marginVertical: 8,
              padding: 8,
              color: App.theme_text_color()
            }}
            onChangeText={(text) => Tokens.set_temp_secret_token(text)}
            value={Tokens.temp_secret_token}
          />
          <Button
            title="Continue"
            color={App.theme_accent_color()}
            onPress={() => { Tokens.add_new_secret_token(Auth.selected_user.username); Keyboard.dismiss() }}
            disabled={Tokens.temp_secret_token == null || Tokens.temp_secret_token?.length < 68}
          />
        </SafeAreaView>
      </ActionSheet>
    )
  }
}