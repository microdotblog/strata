import ActionSheet from "react-native-actions-sheet"
import * as React from 'react'
import { observer } from 'mobx-react'
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

  componentWillUnmount = async () => {
    App.set_is_creating_notebook(false)
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
        <NotebooksHeader />
        <NotebooksList />
      </ActionSheet>
    )
  }
}