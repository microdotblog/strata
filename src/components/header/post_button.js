import * as React from 'react';
import { observer } from 'mobx-react';
import { Keyboard, TouchableOpacity, Text } from 'react-native';
import App from './../../stores/App';
import Auth from '../../stores/Auth';

@observer
export default class PostButton extends React.Component {

	render() {
		const { post_status } = Auth.selected_user?.posting
    return (
      <TouchableOpacity
        style={{ paddingHorizontal: 8 }}
        onPress={async () => {
					const sent = await Auth.selected_user.posting.send_post()
					if (sent) {
						Keyboard.dismiss()
						App.go_back()
					}
        }}>
        <Text style={{ color: App.theme_accent_color(), fontSize: 16 }}>
          {post_status === "draft" ? "Save" : "Post"}
        </Text>
      </TouchableOpacity>
    )
  }

}
