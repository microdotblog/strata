import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/Bookmarks';
import ProfileImage from './../../components/header/profile_image';
// import NewNoteButton from '../../components/header/new_note';

const BookmarksStack = createNativeStackNavigator();

@observer
export default class Bookmarks extends React.Component{

  render() {
    return(
      <BookmarksStack.Navigator>
        <BookmarksStack.Screen
          name="Bookmarks"
          component={BookmarksScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            // headerRight: () => <NewNoteButton />,
            headerTintColor: App.theme_text_color()
          }}
        />
      </BookmarksStack.Navigator>
    )
  }

}
