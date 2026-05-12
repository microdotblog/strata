import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import App from '../../stores/App';
import BookmarksScreen from '../bookmarks/Bookmarks';
import ProfileImage from './../../components/header/profile_image';
import AddBookmarkButton from '../../components/header/add_bookmark';
import { View } from 'react-native';
import TagsButton from '../../components/header/tags_button';
import { nativeStackStatusBarOptions } from '../../utils/status_bar';

const BookmarksStack = createNativeStackNavigator();

@observer
export default class Bookmarks extends React.Component{

  render() {
    const statusBarOptions = nativeStackStatusBarOptions(
      App.theme,
      App.theme_navbar_background_color(),
    );

    return(
      <BookmarksStack.Navigator
        screenOptions={{
          headerTintColor: App.theme_text_color(),
          ...statusBarOptions,
        }}>
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
          }}
        />
      </BookmarksStack.Navigator>
    );
  }

}
