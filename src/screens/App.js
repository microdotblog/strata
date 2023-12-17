import * as React from 'react';
import { observer } from 'mobx-react';
import { Text, View } from 'react-native';
import { NavigationContainer, NavigationContext } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import App from './../stores/App';
import Auth from './../stores/Auth';
import LoadingScreen from './loading/Loading';
import LoginScreen from './login/Login';
import NotesScreen from './notes/Notes';
import NewNoteModalScreen from './notes/New';
import ProfileImage from './../components/header/profile_image';
import NewNoteButton from '../components/header/new_note';
import { SheetProvider } from "react-native-actions-sheet";
import "./../components/sheets/sheets";

const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

@observer
export default class MainApp extends React.Component {

  async componentDidMount() {
    App.hydrate()
  }

  render() {
    return (
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
                    </Stack.Group>
                    <Stack.Group screenOptions={{ presentation: 'modal' }}>
                      <Stack.Screen name="NewNote" component={NewNoteModalScreen} />
                    </Stack.Group>
                  </>
            }
          </Stack.Navigator>
        </NavigationContainer>
      </SheetProvider>
    )
  }

}
