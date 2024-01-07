import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text } from 'react-native';
import Auth from './../../stores/Auth';
import App from '../../stores/App';
import NotebookItem from './notebook_item';

@observer
export default class NotebooksList extends React.Component {

  _render_notebooks = () => {
    return Auth.selected_user.notebooks.map((notebook) => {
      return <NotebookItem key={`notebook_${notebook.id}`} notebook={notebook} />
    })
  }

  render() {
    if (Auth.selected_user != null && Auth.selected_user.notebooks && !App.is_creating_notebook) {
      const notebooks_wording = Auth.selected_user.notebooks.length > 1 ? "notebooks" : "notebook"
      return (
        <View>
          <Text style={{ color: App.theme_text_color(), fontWeight: "400", paddingVertical: 15 }}>
            You have {Auth.selected_user.notebooks.length} {notebooks_wording}:
          </Text>
          {this._render_notebooks()}
        </View>
      )
    }
    return null
  }

}