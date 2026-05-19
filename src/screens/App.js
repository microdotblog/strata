import * as React from 'react';
import { observer } from 'mobx-react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import App from './../stores/App';
import TabNavigator from './stacks/TabNavigator';
import NewNoteModalScreen from './notes/New';
import EditNoteModalScreen from './notes/Edit';
import AddBookmarkScreen from './bookmarks/AddBookmark';
import NoteSaveEditButton from '../components/header/note_save_edit';
import CloseModalButton from '../components/header/close';
import BackButton from '../components/header/back';
import { SheetProvider } from 'react-native-actions-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './../components/sheets/sheets';
import PostingStack from './stacks/PostingStack';
import {
  isAndroidStatusBarSupported,
  nativeStackStatusBarOptions,
  statusBarStyleForTheme,
} from '../utils/status_bar';

const Stack = createNativeStackNavigator();

@observer
export default class MainApp extends React.Component {

  async componentDidMount() {
    App.hydrate();
  }

  render() {
    const statusBarBackgroundColor = App.theme_navbar_background_color();
    const statusBarOptions = nativeStackStatusBarOptions(
      App.theme,
      statusBarBackgroundColor,
    );
    const showStatusBar = isAndroidStatusBarSupported();

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {showStatusBar && (
          <StatusBar
            backgroundColor={statusBarBackgroundColor}
            barStyle={statusBarStyleForTheme(App.theme)}
            translucent={false}
          />
        )}
        <SheetProvider>
          <NavigationContainer
            theme={{
              dark: App.is_dark_mode(),
              colors: {
                background: App.theme_background_color(),
                text: App.theme_text_color(),
                card: statusBarBackgroundColor,
                primary: App.theme_accent_color(),
              },
              fonts: DefaultTheme.fonts,
            }}>
            <Stack.Navigator
              initialRouteName={'Tabs'}
              screenOptions={{
                headerShown: false,
                headerTintColor: App.theme_text_color(),
                ...statusBarOptions,
              }}>
              <>
                <Stack.Screen name="Tabs" component={TabNavigator} />
                <Stack.Group>
                  <Stack.Screen
                    name="EditNote"
                    component={EditNoteModalScreen}
                    options={{
                      title: 'Edit Note',
                      headerLeft: () => <BackButton />,
                      headerRight: () => <NoteSaveEditButton title="Save" />,
                      headerShown: true,
                    }}
                  />
                </Stack.Group>
                <Stack.Group screenOptions={{ presentation: 'modal' }}>
                  <Stack.Screen
                    name="NewNote"
                    component={NewNoteModalScreen}
                    options={{
                      title: 'New Note',
                      headerLeft: () => <CloseModalButton />,
                      headerRight: () => <NoteSaveEditButton title="Save" />,
                      headerShown: true,
                    }}
                  />
                  <Stack.Screen
                    name="AddBookmark"
                    component={AddBookmarkScreen}
                    options={{
                      title: 'Add Bookmark',
                      headerLeft: () => <CloseModalButton />,
                      //headerRight: () => <NoteSaveEditButton title="Save" />,
                      headerShown: true,
                    }}
                  />
                  <Stack.Screen
                    name="Posting"
                    component={PostingStack}
                    options={{
                      headerTitle: 'New Post',
                      gestureEnabled: false,
                      headerShown: false,
                    }}
                  />
                </Stack.Group>
              </>
            </Stack.Navigator>
          </NavigationContainer>
        </SheetProvider>
      </GestureHandlerRootView>
    );
  }

}
