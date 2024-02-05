import ActionSheet from "react-native-actions-sheet";
import * as React from 'react';
import { observer } from 'mobx-react';
import { SafeAreaView, Text, TextInput, Button, Keyboard, ActivityIndicator, View } from 'react-native';
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
        <SafeAreaView style={{ marginLeft: 10, marginRight: 10 }}>
          <Text style={{ color: App.theme_text_color(), fontWeight: "400", paddingVertical: 15 }}>
            Notes in Micro.blog are encrypted. To sync notes across devices, you will need the secret key from Micro.blog on the web so the notes can be decrypted. If you lose your key, you will lose access to your notes too.
          </Text>
          <View style={{ flexDirection: "row", paddingTop: 5, paddingBottom: 15 }}>
            <Text style={{ flex: 1, color: App.theme_text_color(), fontWeight: "600" }}>
              Enter your saved key:
            </Text>
            {
              Auth.selected_user.is_syncing_with_icloud ?
                <ActivityIndicator style={{ flex: 1, alignItems: "flex-end" }} size={"small"} color={App.theme_accent_color()} />          
                : null
            } 
          </View>
          <View style={{ width: "100%", position: "relative", justifyContent: "center", alignItems: "center" }}>
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
                color: App.theme_text_color(),
                opacity: Auth.selected_user.is_syncing_with_icloud ? .4 : 1
              }}
              onChangeText={(text) => Tokens.set_temp_secret_token(text)}
              value={Tokens.temp_secret_token}
              editable={!Auth.selected_user.is_syncing_with_icloud}
            />
            <Button
              title="Continue"
              color={App.theme_accent_color()}
              onPress={() => { Tokens.add_new_secret_token(Auth.selected_user.username); Keyboard.dismiss() }}
              disabled={Tokens.temp_secret_token == null || Tokens.temp_secret_token?.length < 64}
            />
          </View>
        </SafeAreaView>
      </ActionSheet>
    )
  }
}