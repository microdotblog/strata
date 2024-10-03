import ActionSheet from "react-native-actions-sheet";
import * as React from 'react';
import { observer } from 'mobx-react';
import App from '../../stores/App'
import SecretKeyInput from "./_secret_key";

@observer
export default class SecretKeyPromptSheet extends React.Component {

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
        <SecretKeyInput />
      </ActionSheet>
    )
  }
}
