import * as React from 'react';
import { Text } from 'react-native';
import ActionSheet from "react-native-actions-sheet";
import { observer } from 'mobx-react';
import App from '../../stores/App';

@observer
export default class NotebooksListSheet extends React.Component {

  componentDidMount = async () => {
  }

  componentWillUnmount = async () => {
  }

  render() {
	return (
	  <ActionSheet
		containerStyle={{
		  backgroundColor: App.theme_background_color_secondary(),
		  padding: 15,
		  paddingTop: 0
		}}
		gestureEnabled={true}
		useBottomSafeAreaPadding={true}
		id={this.props.sheet_id}
	  >
	  	<Text>Hi</Text>
	  </ActionSheet>
	)
  }

}