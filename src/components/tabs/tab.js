import * as React from 'react';
import { observer } from 'mobx-react';
import { Platform, Image } from 'react-native';
import { SFSymbol } from "react-native-sfsymbols";
import App from '../../stores/App';

@observer
export default class Tab extends React.Component {
  
  _returnIconNameOrAsset() {
    const { route } = this.props;
    const isIOS = Platform.OS === "ios";

    switch (route.name) {
      case "NotesStack":
        return isIOS ? "note.text" : null;
      case "BookmarksStack":
        return isIOS ? "star" : null;
      case "HighlightsStack":
        return isIOS ? "tag" : null;
      default:
        return null
    }
  }
  
  render() {
    const iconNameOrAsset = this._returnIconNameOrAsset();
    const { focused } = this.props;
    const color = focused ? App.theme_accent_color() : App.theme_text_color();

    if (Platform.OS === "ios") {
      return (
        <SFSymbol
          name={iconNameOrAsset}
          color={color}
          size={18}
          multicolor={false}
        />
      );
    } else {
      return iconNameOrAsset ? (
        <Image
          source={iconNameOrAsset}
          style={{ width: 24, height: 24, tintColor: color }}
        />
      ) : null;
    }
  }
}
