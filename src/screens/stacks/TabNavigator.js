import * as React from 'react';
import {Platform, View} from 'react-native';
import {observer} from 'mobx-react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeBottomTabNavigator} from '@react-navigation/bottom-tabs/unstable';
import App from '../../stores/App';
import Auth from '../../stores/Auth';
import NotesStack from './NotesStack';
import BookmarksStack from './BookmarksStack';
import HighlightsStack from './HighlightsStack';
import NotesScreen from '../notes/Notes';
import BookmarksScreen from '../bookmarks/Bookmarks';
import HighlightsScreen from '../highlights/Highlights';
import TabIcon from '../../components/tabs/tab';
import ProfileImage from '../../components/header/profile_image';
import NewNoteButton from '../../components/header/new_note';
import TagsButton from '../../components/header/tags_button';
import AddBookmarkButton from '../../components/header/add_bookmark';
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

const bookmarksHeaderRight = () => (
  <View
    style={{
      justifyContent: 'center',
      alignItems: 'center',
      gap: 15,
      flexDirection: 'row',
    }}>
    <TagsButton />
    <AddBookmarkButton />
  </View>
);

const tabScreens = [
  {
    name: 'NotesStack',
    label: 'Notes',
    title: 'Notes',
    component: useNativeTabs ? NotesScreen : NotesStack,
    nativeHeaderOptions: {
      headerLeft: () => <ProfileImage />,
      headerRight: () => <NewNoteButton />,
    },
  },
  {
    name: 'BookmarksStack',
    label: 'Bookmarks',
    title: 'Bookmarks',
    component: useNativeTabs ? BookmarksScreen : BookmarksStack,
    nativeHeaderOptions: {
      headerLeft: () => <ProfileImage />,
      headerRight: bookmarksHeaderRight,
    },
  },
  {
    name: 'HighlightsStack',
    label: 'Highlights',
    title: 'Highlights',
    component: useNativeTabs ? HighlightsScreen : HighlightsStack,
    nativeHeaderOptions: {
      headerLeft: () => <ProfileImage />,
    },
  },
];

const tabScreenListeners = {
  state: e => {
    const {index, routes} = e.data.state;
    App.set_current_tab_index(index);
    const routeName = routes[index]?.name;
    if (routeName) {
      App.set_current_tab_key(routeName);
    }
  },
};

const AuthenticatedTabNavigator = React.memo(function AuthenticatedTabNavigator({
  accentColor,
  textColor,
  dividerColor,
}) {
  const screenOptions = React.useMemo(() => {
    if (useNativeTabs) {
      return ({route}) => ({
        tabBarIcon: iosTabIcons[route.name],
        tabBarActiveTintColor: accentColor,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarMinimizeBehavior: 'onScrollDown',
        headerShown: true,
        headerTintColor: textColor,
        lazy: false,
      });
    }

    return ({route}) => ({
      tabBarStyle: {
        borderTopColor: dividerColor,
        borderTopWidth: 0.5,
      },
      tabBarIcon: ({focused, color, size}) => (
        <TabIcon route={route} focused={focused} size={size} color={color} />
      ),
      tabBarActiveTintColor: accentColor,
      tabBarLabelStyle: {
        fontSize: 12,
      },
      headerShown: false,
    });
  }, [accentColor, textColor, dividerColor]);

  return (
    <Tab.Navigator
      id="tab_navigator"
      initialRouteName="NotesStack"
      screenOptions={screenOptions}
      screenListeners={tabScreenListeners}>
      {tabScreens.map(screen => (
        <Tab.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{
            tabBarLabel: screen.label,
            headerTitle: screen.title,
            ...(useNativeTabs ? screen.nativeHeaderOptions : null),
          }}
        />
      ))}
    </Tab.Navigator>
  );
});

@observer
export default class TabNavigator extends React.Component {
  async componentDidMount() {
    App.set_navigation(this.props.navigation);
  }

  componentDidUpdate() {
    App.set_navigation(this.props.navigation);
  }

  render() {
    if (Auth.is_hydrating) {
      return <LoadingScreen />;
    }
    if (!Auth.is_logged_in()) {
      return <LoginScreen />;
    }

    return (
      <AuthenticatedTabNavigator
        accentColor={App.theme_accent_color()}
        textColor={App.theme_text_color()}
        dividerColor={App.theme_tabbar_divider_color()}
      />
    );
  }
}
