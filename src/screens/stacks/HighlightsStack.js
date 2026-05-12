import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import App from '../../stores/App';
import HighlightsScreen from '../highlights/Highlights';
import ProfileImage from './../../components/header/profile_image';
import { nativeStackStatusBarOptions } from '../../utils/status_bar';

const HighlightsStack = createNativeStackNavigator();

@observer
export default class Highlights extends React.Component{

  render() {
    const statusBarOptions = nativeStackStatusBarOptions(
      App.theme,
      App.theme_navbar_background_color(),
    );

    return(
      <HighlightsStack.Navigator
        screenOptions={{
          headerTintColor: App.theme_text_color(),
          ...statusBarOptions,
        }}>
        <HighlightsStack.Screen
          name="Highlights"
          component={HighlightsScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            // headerRight: () => <NewNoteButton />,
          }}
        />
      </HighlightsStack.Navigator>
    );
  }

}
