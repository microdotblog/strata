import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotesScreen from '../notes/Notes';
import ProfileImage from './../../components/header/profile_image';
import NewNoteButton from '../../components/header/new_note';
// import { getSharedScreens } from './SharedStack'

const NotesStack = createNativeStackNavigator();

@observer
export default class Notes extends React.Component{

  render() {
    //const sharedScreens = getSharedScreens(NotesStack, "Notes")
    return(
      <NotesStack.Navigator>
        <NotesStack.Screen
          name="Notes"
          component={NotesScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            headerRight: () => <NewNoteButton />,
            headerTintColor: App.theme_text_color()
          }}
        />
      </NotesStack.Navigator>
    )
  }

}
