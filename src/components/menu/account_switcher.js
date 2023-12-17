import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';

@observer
export default class AccountSwitcher extends React.Component {

  _render_current_user = () => {
    return (
      <View
        //onPress={() => profileScreen(Auth.selected_user.username, App.current_screen_id)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          paddingTop: 14,
          paddingBottom: 7,
          paddingHorizontal: 16,
          backgroundColor: App.theme_button_background_color(),
          borderRadius: 20,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0
        }}
        activeOpacity={1}
      >
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <View style={{ marginRight: 15 }}>
            <Image
              source={{
                uri: `${Auth.selected_user.avatar}?v=${App.now()}`
              }}
              resizeMode={"contain"}
              style={{ width: 40, height: 40, borderRadius: 50 }}
            />
          </View>
          <View>
            {/* <Text style={{ fontWeight: '600', color: App.theme_button_text_color() }}>{Auth.selected_user.full_name}</Text> */}
            <Text style={{ fontWeight: '600', color: App.theme_button_text_color() }}>@{Auth.selected_user.username}</Text>
          </View>
        </View>
      </View>
    )
  }

  _render_account_switcher = () => {
    return (
      <View
        style={{
          padding: 8,
          paddingHorizontal: 0,
          backgroundColor: App.theme_button_background_color(),
          width: '100%',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20
        }}>
        {
          Auth.all_users_except_current().map((user, index) => {
            return (
              <TouchableOpacity
                onPress={() => Auth.select_user(user)}
                key={user.username}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-between',
                  marginLeft: 16,
                  paddingBottom: index === Auth.all_users_except_current().length - 1 ? 0 : 18,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <View style={{ marginRight: 15 }}>
                    <Image
                      source={{
                        uri: `${user.avatar}?v=${App.now()}`
                      }}
                      resizeMode={"contain"}
                      style={{ width: 40, height: 40, borderRadius: 50 }}
                    />
                  </View>
                  <View>
                    <Text style={{ fontWeight: '600', color: App.theme_button_text_color() }}>{user.full_name}</Text>
                    <Text style={{ color: App.theme_button_text_color() }}>@{user.username}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }
        {/*this._render_add_account_button()*/}
        {this._render_account_logout_button()}
      </View>
    )
  }

  _render_add_account_button = () => {
    return (
      <TouchableOpacity
        //onPress={loginScreen}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
          marginTop: Auth.users.length > 1 ? 10 : 0,
          marginLeft: 16,
          paddingTop: Auth.users.length > 1 ? 8 : 0
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 50,
              marginRight: 8,
              backgroundColor: App.theme_input_background_color(),
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            {
              Platform.OS === 'ios' ?
                <SFSymbol
                  name={'plus'}
                  color={App.theme_text_color()}
                  style={{ height: 18, width: 18 }}
                  multicolor={true}
                />
                :
                <SvgXml
                  style={{
                    height: 20,
                    width: 20
                  }}
                  color={App.theme_text_color()}
                  xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>'
                />
            }
          </View>

          <Text style={{ color: App.theme_button_text_color(), marginLeft: 6 }}>Add Account...</Text>
        </View>
      </TouchableOpacity>
    )
  }

  _render_account_logout_button = () => {
    const sign_out_wording = Auth.users?.length > 1 ? `Sign Out of @${Auth.selected_user.username}` : "Sign Out"
    return (
      <TouchableOpacity
        onPress={() => Auth.logout_user()}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'space-between',
          borderTopWidth: .5,
          borderColor: App.theme_alt_background_div_color(),
          paddingTop: 15,
          paddingBottom: 10,
          //marginTop: 15
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', width: "100%", justifyContent: 'center' }}>
          <Text style={{ color: 'red' }}>{sign_out_wording}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  render() {
    if (Auth.selected_user != null) {
      return (
        <View
          style={{
            width: '100%',
            paddingTop: 5
          }}
        >
          {this._render_current_user()}
          {this._render_account_switcher()}
        </View>
      )
    }
    return null
  }

}