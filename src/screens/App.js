import * as React from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { observer } from 'mobx-react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import App from './../stores/App';
import Auth from './../stores/Auth';
import LoadingScreen from './loading/Loading';
import LoginScreen from './login/Login';
import NotesScreen from './notes/Notes';
import NewNoteModalScreen from './notes/New';
import EditNoteModalScreen from './notes/Edit';
import ProfileImage from './../components/header/profile_image';
import NewNoteButton from '../components/header/new_note';
import NoteSaveEditButton from '../components/header/note_save_edit';
import CloseModalButton from '../components/header/close';
import BackButton from '../components/header/back';
import { SheetProvider, SheetManager } from "react-native-actions-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "./../components/sheets/sheets";

const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

const { MBNotesScriptingModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(MBNotesScriptingModule);

const subscription = eventEmitter.addListener("CreateNote", (event) => {
  SheetManager.show("dictation-sheet");
});

@observer
export default class MainApp extends React.Component {

  async componentDidMount() {
    App.hydrate()
  }

  render() {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SheetProvider>
          <NavigationContainer theme={{
            dark: App.is_dark_mode(),
            colors: {
              background: App.theme_background_color(),
              text: App.theme_text_color(),
              card: App.theme_navbar_background_color()
            }
          }}>
            <Stack.Navigator initialRouteName="Notes">
              {
                App.is_hydrating ?
                  <Stack.Screen
                    name="Loading"
                    component={LoadingScreen}
                    options={{
                      headerShown: false
                    }}
                  />
                  :
                  !Auth.is_logged_in() ?
                    <Stack.Screen
                      name="Login"
                      component={LoginScreen}
                      options={{
                        title: 'Sign in',
                      }}
                    />
                    :
                    <>
                      <Stack.Group>
                        <Stack.Screen name="Notes" component={NotesScreen} options={{
                          headerLeft: () => <ProfileImage />,
                          headerRight: () => <NewNoteButton />
                        }} />
                        <Stack.Screen
                          name="EditNote"
                          component={EditNoteModalScreen}
                          options={{
                            title: "Edit Note",
                            headerLeft: () => <BackButton />,
                            headerRight: () => <NoteSaveEditButton title="Save" />
                          }}
                        />
                      </Stack.Group>
                      <Stack.Group screenOptions={{ presentation: 'modal' }}>
                        <Stack.Screen
                          name="NewNote"
                          component={NewNoteModalScreen}
                          options={{
                            title: "New Note",
                            headerLeft: () => <CloseModalButton />,
                            headerRight: () => <NoteSaveEditButton title="Save" />
                          }}
                        />
                      </Stack.Group>
                    </>
              }
            </Stack.Navigator>
          </NavigationContainer>
        </SheetProvider>
      </GestureHandlerRootView>
    )
  }

}
