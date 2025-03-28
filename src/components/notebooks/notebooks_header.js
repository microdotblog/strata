import * as React from 'react';
import { observer } from 'mobx-react';
import { Text, View, TouchableOpacity, TextInput, Button, Keyboard, ActivityIndicator } from 'react-native';
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class NotebooksHeader extends React.Component {

  render() {
    return (
      <View style={{
        flexDirection: "column",
        width: "100%",
        marginTop: 15
      }}>
        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          marginBottom: 15
        }}>
          <Text style={{ fontWeight: '800', color: App.theme_text_color() }}>{Auth.selected_user?.can_create_notebook() ? "Select or create a new notebook" : "Select a notebook"}</Text>
          <TouchableOpacity
            onPress={() => App.set_is_creating_notebook()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              opacity: Auth.selected_user?.can_create_notebook() ? 1 : 0
            }}
            disabled={!Auth.selected_user?.can_create_notebook()}
          >
            {
              !App.is_creating_notebook ?
                <>
                  {
                    Platform.OS === 'ios' ?
                      <SFSymbol
                        name={'plus'}
                        color={App.theme_accent_color()}
                        style={{ height: 14, width: 14 }}
                        multicolor={true}
                      />
                      :
                      <SvgXml
                        style={{
                          height: 16,
                          width: 16
                        }}
                        color={App.theme_accent_color()}
                        xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>'
                      />
                  }
                  <Text style={{ color: App.theme_accent_color(), marginLeft: 5, marginRight: 5, fontSize: 15 }}>
                    New
                  </Text>
                </>
                :
                <>
                  <Text style={{ color: App.theme_accent_color(), fontSize: 15 }}>
                    Cancel
                  </Text>
                </>
            }
          </TouchableOpacity>
        </View>
        {
          App.is_creating_notebook && Auth.selected_user?.can_create_notebook() ?
            <View>
              <Text style={{ fontWeight: '500', paddingTop: 15, paddingBottom: 5, color: App.theme_text_color() }}>New notebook:</Text>
              <TextInput
                clearButtonMode={'while-editing'}
                enablesReturnKeyAutomatically={true}
                underlineColorAndroid={'transparent'}
                returnKeyType={'go'}
                style={{
                  backgroundColor: App.theme_input_contrast_background_color(),
                  fontSize: 17,
                  borderColor: App.theme_accent_color(),
                  borderWidth: 1,
                  width: "100%",
                  borderRadius: 5,
                  marginVertical: 8,
                  padding: 8,
                  color: App.theme_text_color()
                }}
                placeholder="Notebook name"
                autoFocus={true}
                blurOnSubmit={true}
                onChangeText={(text) => App.set_temp_notebook_name(text)}
                value={App.temp_notebook_name}
                onSubmitEditing={() => { Auth.selected_user?.create_notebook(App.temp_notebook_name); Keyboard.dismiss() }}
              />
              {
                Auth.selected_user?.is_saving_new_notebook ?
                  <ActivityIndicator style={{ marginTop: 17 }} color={App.theme_accent_color()} />
                  :
                  <Button
                    title="Add Notebook"
                    color={App.theme_accent_color()}
                    onPress={() => { Auth.selected_user?.create_notebook(App.temp_notebook_name); Keyboard.dismiss() }}
                    disabled={App.temp_notebook_name == "" || App.temp_notebook_name?.length < 1}
                  />
              }
            </View>
            : null
        }
      </View>
    )
  }
}