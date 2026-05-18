import * as React from 'react';
import {Platform} from 'react-native';
import {observer} from 'mobx-react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import App from '../../stores/App';
import Auth from '../../stores/Auth';
import NotesStack from './NotesStack';
import BookmarksStack from './BookmarksStack';
import HighlightsStack from './HighlightsStack';
import TabIcon from '../../components/tabs/tab';
import LoadingScreen from '../loading/Loading';
import LoginScreen from '../login/Login';

const useNativeTabs = Platform.OS === 'ios';
const Tab = useNativeTabs
  ? createNativeBottomTabNavigator()
  : createBottomTabNavigator();

const iosTabIcons = {
  NotesStack: () => ({
    type: 'sfSymbol',
    name: 'note.text',
  }),
  BookmarksStack: ({focused}) => ({
    type: 'sfSymbol',
    name: focused ? 'star.fill' : 'star',
  }),
  HighlightsStack: () => ({
    type: 'sfSymbol',
    name: 'highlighter',
  }),
};

const tabScreens = [
  {
    name: 'NotesStack',
    component: NotesStack,
    label: 'Notes',
    title: 'Notes',
  },
  {
    name: 'BookmarksStack',
    component: BookmarksStack,
    label: 'Bookmarks',
    title: 'Bookmarks',
  },
  {
    name: 'HighlightsStack',
    component: HighlightsStack,
    label: 'Highlights',
    title: 'Highlights',
  },
];

@observer
export default class TabNavigator extends React.Component {
  async componentDidMount() {
    App.set_navigation(this.props.navigation);
  }

  componentDidUpdate() {
    App.set_navigation(this.props.navigation);
  }

  getScreenOptions = route => {
    if (useNativeTabs) {
      return {
        tabBarIcon: iosTabIcons[route.name],
        tabBarActiveTintColor: App.theme_accent_color(),
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarMinimizeBehavior: 'onScrollDown',
      };
    }

    return {
      tabBarStyle: {
        borderTopColor: App.theme_tabbar_divider_color(),
        borderTopWidth: 0.5,
      },
      tabBarIcon: ({focused, color, size}) => {
        return (
          <TabIcon route={route} focused={focused} size={size} color={color} />
        );
      },
      tabBarActiveTintColor: App.theme_accent_color(),
      tabBarLabelStyle: {
        fontSize: 12,
      },
    };
  };

  render() {
    if (Auth.is_hydrating) {
      return <LoadingScreen />;
    }
    if (!Auth.is_logged_in()) {
      return <LoginScreen />;
    }

    return (
      <Tab.Navigator
        id="tab_navigator"
        initialRouteName="NotesStack"
        screenOptions={({route}) => ({
          ...this.getScreenOptions(route),
          headerShown: false,
        })}
        screenListeners={{
          state: e => {
            App.set_current_tab_index(e.data.state.index);
          },
          focus: e => {
            App.set_current_tab_key(e.target);
          },
        }}>
        {tabScreens.map(screen => (
          <Tab.Screen
            key={screen.name}
            name={screen.name}
            component={screen.component}
            options={{
              tabBarLabel: screen.label,
              headerTitle: screen.title,
            }}
          />
        ))}
      </Tab.Navigator>
    );
  }
}
