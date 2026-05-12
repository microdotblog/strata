import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import App from '../../stores/App';
import NotesScreen from '../notes/Notes';
import ProfileImage from './../../components/header/profile_image';
import NewNoteButton from '../../components/header/new_note';
import { nativeStackStatusBarOptions } from '../../utils/status_bar';

const NotesStack = createNativeStackNavigator();

@observer
export default class Notes extends React.Component{

  render() {
    const statusBarOptions = nativeStackStatusBarOptions(
      App.theme,
      App.theme_navbar_background_color(),
    );

    return(
      <NotesStack.Navigator
        screenOptions={{
          headerTintColor: App.theme_text_color(),
          ...statusBarOptions,
        }}>
        <NotesStack.Screen
          name="Notes"
          component={NotesScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewNoteButton />,
          }}
        />
      </NotesStack.Navigator>
    );
  }

}
