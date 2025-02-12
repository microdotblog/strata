import * as React from 'react';
import { observer } from 'mobx-react';
import { Platform } from 'react-native';
import { SFSymbol } from "react-native-sfsymbols";
import { SvgXml } from 'react-native-svg';
import App from '../../stores/App';

@observer
export default class Tab extends React.Component {
  
  _returnIconNameOrAsset() {
    const { route } = this.props;
    

    switch (route.name) {
      case "NotesStack":
        return "note.text"
      case "BookmarksStack":
        return "star"
      case "HighlightsStack":
        return "highlighter"
      default:
        return null
    }
  }
  
  return_svg = () => {
    const { route, focused } = this.props;
    const color = focused ? App.theme_accent_color() : App.theme_text_color();

    switch (route.name) {
      case 'NotesStack':
        return(
          <SvgXml
            style={{
              height: 24,
              width: 24
            }}
            color={color}
            strokeWidth={2}
            xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor">
              <path d="M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z"></path>
              <path d="M9 7l6 0"></path>
              <path d="M9 11l6 0"></path>
              <path d="M9 15l4 0"></path>
            </svg>'
          />
        )
      case 'BookmarksStack':
        return(
          <SvgXml
            style={{
              height: 24,
              width: 24
            }}
            color={color}
            strokeWidth={2}
            xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor">
              <path d="M17.286 21.09q -1.69 .001 -5.288 -2.615q -3.596 2.617 -5.288 2.616q -2.726 0 -.495 -6.8q -9.389 -6.775 2.135 -6.775h.076q 1.785 -5.516 3.574 -5.516q 1.785 0 3.574 5.516h.076q 11.525 0 2.133 6.774q 2.23 6.802 -.497 6.8"></path>
            </svg>'
          />
        )
      case 'HighlightsStack':
        return(
          <SvgXml
            style={{
              height: 24,
              width: 24
            }}
            color={color}
            strokeWidth={2}
            xml='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" width="24" height="24" stroke-width="2">
              <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"></path>
              <path d="M13.5 6.5l4 4"></path>
              <path d="M16 19h6"></path>
            </svg>'
          />
        )
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
      return(this.return_svg())
    }
  }
}
