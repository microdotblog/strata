import * as React from 'react';
import { observer } from 'mobx-react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import App from '../../stores/App';
import Auth from '../../stores/Auth';
import NotesStack from './NotesStack';
import BookmarksStack from './BookmarksStack';
import HighlightsStack from './HighlightsStack';
import TabIcon from '../../components/tabs/tab';
import LoadingScreen from '../loading/Loading';
import LoginScreen from '../login/Login';
const Tab = createBottomTabNavigator();

@observer
export default class TabNavigator extends React.Component{
  
  async componentDidMount() {
    App.set_navigation(this.props.navigation)
  }

  componentDidUpdate() {
    App.set_navigation(this.props.navigation)
  }

  render() {
    if(Auth.is_hydrating){
      return <LoadingScreen />
    }
    else if(!Auth.is_logged_in()){
      return <LoginScreen />
    }
    return(
      <Tab.Navigator
        id="tab_navigator"
        initialRouteName="NotesStack"
        screenOptions={({ route }) => ({
          tabBarStyle: {
            borderTopColor: App.theme_tabbar_divider_color(),
            borderTopWidth: 0.5
          },
          tabBarIcon: ({ focused, color, size }) => {
            return <TabIcon route={route} focused={focused} size={size} color={color} />;
          },
          headerShown: false,
          tabBarActiveTintColor: App.theme_accent_color(),
          tabBarLabelStyle: {
            fontSize: 12
          }
        })}
        screenListeners={{
          state: (e) => {
            App.set_current_tab_index(e.data.state.index)
          },
          focus: (e) => {
            App.set_current_tab_key(e.target)
          }
        }}
      >
        <Tab.Screen
          name="NotesStack"
          component={NotesStack}
          options={{
            tabBarLabel: "Notes",
            headerTitle: "Notes"
          }}
        />
        <Tab.Screen
          name="BookmarksStack"
          component={BookmarksStack}
          options={{
            tabBarLabel: "Bookmarks",
            headerTitle: "Bookmarks"
          }}
        />
        <Tab.Screen
          name="HighlightsStack"
          component={HighlightsStack}
          options={{
            tabBarLabel: "Highlights",
            headerTitle: "Highlights"
          }}
        />
      </Tab.Navigator>
    )
  }

}
