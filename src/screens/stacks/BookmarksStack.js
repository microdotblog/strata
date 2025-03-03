import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookmarksScreen from '../bookmarks/Bookmarks';
import ProfileImage from './../../components/header/profile_image';
import AddBookmarkButton from '../../components/header/add_bookmark';
import { View } from 'react-native';
import TagsButton from '../../components/header/tags_button';

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
            headerRight: () => (
              <View style={{ justifyContent: 'center', alignItems: 'center', gap: 15, flexDirection: 'row' }}>
                <TagsButton />
                <AddBookmarkButton />
              </View>
            ),
            headerTintColor: App.theme_text_color()
          }}
        />
      </BookmarksStack.Navigator>
    )
  }

}
