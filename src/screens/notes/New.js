import * as React from 'react';
import { observer } from 'mobx-react';
import { TextInput, KeyboardAvoidingView, InputAccessoryView, ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import RNFS from 'react-native-fs';
import Posting from '../../stores/Posting'
import PostingToolbar from '../../components/keyboard/posting_toolbar';
import App from '../../stores/App'
import HighlightingText from '../../components/text/highlighting_text';

@observer
export default class NewNoteModalScreen extends React.Component {

  constructor(props) {
    super(props)
    this.input_accessory_view_id = "input_toolbar";
    this.state = {
      htmlContent: ""
    };
  }

  componentDidMount() {
    Posting.hydrate()
    this.loadEditorFiles().then(html => {
      this.setState({ htmlContent: html });
    });
  }

  loadEditorFiles = async () => {
    // these paths are iOS only, need tweaks for Android
    const html_path = `${RNFS.MainBundlePath}/micro_editor.html`;
    const js_path = `${RNFS.MainBundlePath}/micro_editor.js`;
    const css_path = `${RNFS.MainBundlePath}/micro_editor.css`;
    const custom_path = `${RNFS.MainBundlePath}/custom.css`;

    const html_s = await RNFS.readFile(html_path, 'utf8');
    const js_s = await RNFS.readFile(js_path, 'utf8');
    const css_s = await RNFS.readFile(css_path, 'utf8');
    const custom_s = await RNFS.readFile(custom_path, 'utf8');

    const combined_s = `<script>${js_s}</script> \n <style>${css_s} \n ${custom_s}</style> \n ${html_s}`;

    return combined_s;
  };

  render() {    
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: App.theme_background_color() }}>
        <WebView
          originWhitelist={['*']}
          source={{ html: this.state.htmlContent }}
          style={{ flex: 1 }}
        />
        {
          <>
            <PostingToolbar />
          </>
        }
        {
          Posting.is_sending_note ?
            <View
              style={{
                position: 'absolute',
                top: 0,
                height: 200,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10
              }}
            >
              <ActivityIndicator color={App.theme_accent_color()} size={'large'} />
            </View>
            : null
        }
      </KeyboardAvoidingView>
    )
  }  
}