import ActionSheet from "react-native-actions-sheet";
import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity } from 'react-native';
import Auth from './../../stores/Auth';
import AccountSwitcher from '../menu/account_switcher'
import App from '../../stores/App';

@observer
export default class MenuSheet extends React.Component {

  render() {
    return (
      <ActionSheet
        id={this.props.sheet_id}
        //snapPoints={[40, 75, 100]}
        //initialSnapIndex={[1]}
        overdrawEnabled={true}
        gestureEnabled={Auth.selected_user?.can_use_notes()}
        containerStyle={{
          backgroundColor: App.theme_background_color_secondary()
        }}
        closable={Auth.selected_user?.can_use_notes()}
      >
        <View
          style={{
            padding: 15,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 16,
            backgroundColor: App.theme_background_color_secondary()
          }}
        >
          {
            Auth.selected_user != null ?
              <AccountSwitcher />
              :
              <TouchableOpacity
                //onPress={loginScreen}
                style={{
                  padding: 8,
                  paddingHorizontal: 16,
                  backgroundColor: App.theme_button_background_color(),
                  borderRadius: 5,
                }}
              >
                <Text style={{ fontWeight: "700", color: "orange" }}>Please sign in to continue</Text>
              </TouchableOpacity>
          }

        </View>
      </ActionSheet>
    )
  }

}