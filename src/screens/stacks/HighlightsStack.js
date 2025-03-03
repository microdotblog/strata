import * as React from 'react';
import { observer } from 'mobx-react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HighlightsScreen from '../highlights/Highlights';
import ProfileImage from './../../components/header/profile_image';

const HighlightsStack = createNativeStackNavigator();

@observer
export default class Highlights extends React.Component{

  render() {
    return(
      <HighlightsStack.Navigator>
        <HighlightsStack.Screen
          name="Highlights"
          component={HighlightsScreen}
          options={{
            headerLeft: () => <ProfileImage />,
            // headerRight: () => <NewNoteButton />,
            headerTintColor: App.theme_text_color()
          }}
        />
      </HighlightsStack.Navigator>
    )
  }

}
