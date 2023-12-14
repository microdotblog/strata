import * as React from 'react';
import { observer, Provider } from 'mobx-react';
import { Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import App from './../stores/App';
import Auth from './../stores/Auth';
import LoginScreen from './login/Login';
import ProfileImage from './../components/profile_image';

const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

function NotesScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Notes Screen</Text>
      <TouchableOpacity style={{ marginTop: 25 }} onPress={Auth.logout_all_user}>
        <Text style={{ color: "red" }}>Logout...</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
    </View>
  )
}

@observer
export default class MainApp extends React.Component {

  async componentDidMount() {
    App.hydrate()
  }

  render() {
    return (
      <Provider app={App}>
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
                  <Stack.Screen name="Notes" component={NotesScreen} options={{
                    headerLeft: () => <ProfileImage />
                  }} />
            }
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    )
  }

}
