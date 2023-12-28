import ActionSheet from "react-native-actions-sheet";
import * as React from 'react';
import { observer } from 'mobx-react';
import { SafeAreaView, Text } from 'react-native';
import App from '../../stores/App'
//import Auth from '../../stores/Auth'

@observer
export default class NotebooksListSheet extends React.Component {

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
        <SafeAreaView style={{ justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: App.theme_text_color(), fontWeight: "400", paddingVertical: 15 }}>
            Notes in Micro.blog are encrypted. To sync notes across devices, you will need to save a secret key so the notes can be decrypted later. If you lose your key, you will lose access to your notes too.
          </Text>
        </SafeAreaView>
      </ActionSheet>
    )
  }
}