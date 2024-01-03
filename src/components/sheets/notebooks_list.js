import ActionSheet from "react-native-actions-sheet"
import * as React from 'react'
import { observer } from 'mobx-react'
import { SafeAreaView } from 'react-native'
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import NotebooksHeader from "../notebooks/notebooks_header"
import NotebooksList from "../notebooks/notebooks_list"

@observer
export default class NotebooksListSheet extends React.Component {

  componentDidMount = async () => {
    if (Auth.selected_user != null) {
      await Auth.selected_user.fetch_notebooks()
    }
  }

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
        <SafeAreaView>
          <NotebooksHeader />
          <NotebooksList />
        </SafeAreaView>
      </ActionSheet>
    )
  }
}