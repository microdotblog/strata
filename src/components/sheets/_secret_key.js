import * as React from 'react';
import { observer } from 'mobx-react';
import { SafeAreaView, Text, TextInput, Button, Keyboard, ActivityIndicator, View, TouchableOpacity, Platform } from 'react-native';
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import Tokens from "../../stores/Tokens";
import { SvgXml } from 'react-native-svg';
import QRScanner from './_code_scanner';
import { Camera } from 'react-native-vision-camera';

@observer
export default class SecretKeyInput extends React.Component {
  
  state = {
    isScanning: false,
    canScan: __DEV__ || Camera.getAvailableCameraDevices()?.length > 0
  }
  
  componentDidMount(){
    const cameraPermission = Camera.getCameraPermissionStatus()
    if((cameraPermission == "denied" || cameraPermission == "restricted") && Platform.OS == "ios"){
      this.setState({ canScan: false })
    }
  }
  
  componentWillUnmount(){
    if(this.state.isScanning){
      this.setState({ isScanning: false })
    }
  }
  
  handleCodeScanned = (codes) => {
    if (codes.length > 0 && codes[0].value) {
      const codeValue = codes[0].value
      if(codeValue?.includes("strata://qrcode/")){
        Tokens.set_temp_secret_token(codeValue.replace("strata://qrcode/", ""))
        this.setState({ isScanning: false })
      }
    }
  }
  
  toggleScanner = async () => {
    const cameraPermission = Camera.getCameraPermissionStatus()
    if(cameraPermission == "granted"){
      this.setState(prevState => ({ isScanning: !prevState.isScanning }))
    }
    else{
      const permission = await Camera.requestCameraPermission()
      if(permission == "granted"){
        this.setState(prevState => ({ isScanning: !prevState.isScanning }))
      }
    }
  }

  render() {
    
    const continueIsDisabled = Tokens.temp_secret_token == null || Tokens.temp_secret_token?.length < 64
    
    if (this.state.isScanning && this.state.canScan) {
      return(
        <SafeAreaView style={{ marginLeft: 10, marginRight: 10, minHeight: 480 }}>
          <View style={{ flexDirection: 'column', flex: 1, alignItems: 'center' }}>
            <Text style={{ color: App.theme_text_color(), fontWeight: "600", paddingVertical: 15 }}>
              Scan your QR code:
            </Text>
            <QRScanner onCodeScanned={this.handleCodeScanned} />
            <Button
              title="Cancel"
              color={App.theme_danger_color()}
              onPress={() => this.setState({ isScanning: false })}
            />
          </View>
        </SafeAreaView>
      )
    }
    
    return (
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
          <View
            style={{ 
              flexDirection: 'row',
              justifyContent: this.state.canScan ? 'space-between' : 'center',
              alignItems: 'center',
              width: '100%',
              marginTop: 5
            }}
          >
            {
              this.state.canScan ?
              <TouchableOpacity
                onPress={this.toggleScanner}
                style={{
                  padding: 6,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  backgroundColor: App.theme_border_color(),
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              
              >
                <SvgXml
                  style={{
                    height: 24,
                    width: 24,
                    marginRight: 5,
                  }}
                  color={App.theme_text_color()}
                  xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
                  </svg>'
                />
                <Text style={{ color: App.theme_text_color(), fontWeight: '500' }}>Scan from QR code...</Text>
              </TouchableOpacity>
              : null
            }
            <TouchableOpacity
              onPress={() => { Tokens.add_new_secret_token(Auth.selected_user.username); Keyboard.dismiss() }}
              disabled={continueIsDisabled}
              style={{
                borderRadius: 8
              }}
            >
              <Text
                style={{ 
                  color: !continueIsDisabled ? App.theme_accent_color() : App.theme_placeholder_text_color(),
                  fontSize: 17
                }}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    )
  }
}
