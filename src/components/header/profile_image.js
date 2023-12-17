import * as React from 'react';
import { observer } from 'mobx-react';
import { TouchableOpacity, View, Image } from 'react-native';
import Auth from './../../stores/Auth';
import App from './../../stores/App';

@observer
export default class ProfileImage extends React.Component {

  render() {
    if (Auth.selected_user != null) {
      return (
        <TouchableOpacity
          onPress={() => App.open_sheet("menu-sheet")}
          style={{
            width: 28,
            height: 28,
            marginRight: 12
          }}
        >
          {
            Auth.selected_user.avatar != null && Auth.selected_user.avatar !== "" ?
              <Image
                source={{
                  uri: `${Auth.selected_user.avatar}?v=${App.now()}`,
                  cache: "default"
                }}
                resizeMode={"contain"}
                style={{ width: 28, height: 28, borderRadius: 50 }}
              />
              :
              <View style={{ width: 28, height: 28, borderRadius: 50, backgroundColor: App.theme_border_color() }}></View>
          }
        </TouchableOpacity>
      )
    }
    return (
      <View style={{ width: 28, height: 28, borderRadius: 50, backgroundColor: App.theme_border_color() }}></View>
    )
  }

}