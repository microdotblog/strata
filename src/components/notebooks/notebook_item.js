import * as React from 'react';
import { observer } from 'mobx-react';
import { Text, TouchableOpacity, View, Platform, ActivityIndicator, TextInput, Keyboard } from 'react-native';
import App from './../../stores/App';
import Auth from './../../stores/Auth';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class NotebookItem extends React.Component {

  componentWillUnmount = async () => {
    Auth.selected_user?.reset_notebook_state(this.props?.notebook)
  }

  render() {
    const { notebook } = this.props
    const is_selected = (notebook === Auth.selected_user?.selected_notebook) || notebook.is_renaming_notebook

    if (!notebook.is_renaming_notebook) {
      return (
        <TouchableOpacity
          onPress={() => Auth.selected_user.set_selected_notebook(notebook, true)}
          key={`notebook_${notebook.id}`}
          style={{
            marginBottom: 8,
            padding: 12,
            borderRadius: 8,
            backgroundColor: App.theme_input_contrast_background_color(),
            opacity: is_selected ? 1 : .6,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: App.theme_text_color() }}>{notebook.title}</Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 20
            }}
          >
            <TouchableOpacity
              onPress={() => notebook.set_is_renaming_notebook(true)}
              hitSlop={8}
            >
              {
                Platform.OS === "ios" ?
                  <SFSymbol
                    name={'pencil'}
                    color={App.theme_text_color()}
                    style={{ height: 22, width: 22 }}
                    multicolor={true}
                  />
                  :
                  <SvgXml
                    style={{
                      height: 22,
                      width: 22
                    }}
                    color={App.theme_text_color()}
                    xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                    </svg>'
                  />
              }
            </TouchableOpacity>
            {
              Auth.selected_user.notebooks?.length > 1 ?
                <TouchableOpacity
                  onPress={() => Auth.selected_user.trigger_notebook_delete(notebook)}
                  hitSlop={2}
                >
                  {
                    Platform.OS === "ios" ?
                      <SFSymbol
                        name={'trash'}
                        color={App.theme_danger_color()}
                        style={{ height: 22, width: 22 }}
                        multicolor={true}
                      />
                      :
                      <SvgXml
                        style={{
                          height: 22,
                          width: 22
                        }}
                        color={App.theme_danger_color()}
                        xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>'
                      />
                  }
                </TouchableOpacity>
                : null
            }
          </View>
        </TouchableOpacity>
      )
    }
    else {
      return (
        <View
          key={`notebook_${notebook.id}`}
          style={{
            marginBottom: 8,
            padding: 12,
            borderRadius: 8,
            backgroundColor: App.theme_input_contrast_background_color(),
            opacity: is_selected ? 1 : .6,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <TextInput
            enablesReturnKeyAutomatically={true}
            underlineColorAndroid={'transparent'}
            returnKeyType={'go'}
            style={{
              backgroundColor: App.theme_input_contrast_background_color(),
              fontSize: 18,
              borderColor: App.theme_accent_color(),
              borderWidth: 1,
              width: "70%",
              borderRadius: 5,
              padding: 8,
              color: App.theme_text_color()
            }}
            placeholder="Notebook name"
            autoFocus={true}
            blurOnSubmit={true}
            onChangeText={(text) => notebook.set_temp_notebook_name(text)}
            value={notebook.temp_notebook_name}
            onSubmitEditing={() => { notebook.rename_notebook(); Keyboard.dismiss() }}
          />
          {
            notebook.is_setting_notebook_name ?
              <ActivityIndicator color={App.theme_accent_color()} />
              :
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 20
                }}
              >
                <TouchableOpacity
                  onPress={() => notebook.rename_notebook()}
                  hitSlop={8}
                  disabled={!notebook.can_save_rename()}
                  style={{
                    opacity: notebook.can_save_rename() ? 1 : .5
                  }}
                >
                  {
                    Platform.OS === "ios" ?
                      <SFSymbol
                        name={'checkmark'}
                        color={App.theme_confirm_color()}
                        style={{ height: 22, width: 22 }}
                        multicolor={true}
                      />
                      :
                      <SvgXml
                        style={{
                          height: 22,
                          width: 22
                        }}
                        color={App.theme_confirm_color()}
                        xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>'
                      />
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => notebook.set_is_renaming_notebook(false)}
                  hitSlop={2}
                >
                  {
                    Platform.OS === "ios" ?
                      <SFSymbol
                        name={'xmark'}
                        color={App.theme_text_color()}
                        style={{ height: 22, width: 22 }}
                        multicolor={true}
                      />
                      :
                      <SvgXml
                        style={{
                          height: 22,
                          width: 22
                        }}
                        color={App.theme_text_color()}
                        xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>'
                      />
                  }
                </TouchableOpacity>
              </View>
          }
        </View>
      )
    }

  }

}