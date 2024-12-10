import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Platform, Animated, ActivityIndicator } from 'react-native';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { MenuView } from '@react-native-menu/menu';
import LockedNoteItem from './locked_note_item';

@observer
export default class NoteItem extends React.Component {

  constructor(props) {
    super(props)
    this._swipeable = React.createRef()
  }
  
  componentDidMount(){
    this.triggerNoteUnlock()
  }
  
  componentDidUpdate(){
    this.triggerNoteUnlock()
  }
  
  triggerNoteUnlock(){
    if(!this.props.note.is_locked()){
      this.props.note.unlock()
    }
  }

  _right_actions = (progress) => (
    <View style={{ flexDirection: "row" }}>
      <View>
        {
          this._return_action(
            'Delete',
            App.theme_danger_color(),
            60,
            progress,
            `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>`,
            'trash'
          )
        }
      </View>
    </View>
  )

  _return_action = (text, color, x, progress, icon, symbol) => {

    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });

    const press_handler = () => {
      this._swipeable?.current?.close()
      if (text === "Delete") {
        this.props.note?.trigger_action("delete_note")
      }
    };

    return (
      <Animated.View
        style={{
          transform: [{ translateX: trans }],
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <RectButton
          style={{
            paddingHorizontal: 10,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12
          }}
          onPress={press_handler}>
          {
            Platform.OS === 'ios' ?
              <SFSymbol
                name={symbol}
                color={color}
                style={{ height: 22, width: 22 }}
                multicolor={true}
              />
              :
              <SvgXml
                style={{
                  height: 22,
                  width: 22
                }}
                color={color}
                xml={icon}
              />
          }
        </RectButton>
      </Animated.View>
    );
  }

  render() {
    const { note } = this.props
    if (note.is_locked()) {
      return <LockedNoteItem />
    }
    else if(!note.is_locked() && !note.unlocked){
      return null
    }
    return (
      <Swipeable
        ref={this._swipeable}
        friction={1}
        overshootFriction={8}
        enableTrackpadTwoFingerGesture={true}
        renderRightActions={(progress) => this._right_actions(progress)}
        containerStyle={{
          marginTop: 15,
          opacity: note.can_do_action() ? 1 : .5,
          position: "relative"
        }}
        enabled={note.can_do_action()}
      >
        <MenuView
          shouldOpenOnLongPress={true}
          onPressAction={({ nativeEvent }) => {
            const event_id = nativeEvent.event
            note.trigger_action(event_id)
          }}
          actions={
            note._microblog.is_shared ? [
              {
                title: "Open",
                id: "open_in_browser",
                image: Platform.select({
                  ios: 'safari'
                })
              },
              {
                title: "Unshare",
                id: "unshare_note",
                image: Platform.select({
                  ios: 'xmark'
                })
              },
              {
                title: "Delete",
                id: "delete_note",
                image: Platform.select({
                  ios: 'trash'
                }),
                attributes: {
                  destructive: true
                }
              }              
            ]            
            :
            [{
              title: "Share",
              id: "share_note",
              image: Platform.select({
                ios: 'square.and.arrow.up'
              })
            },
            {
              title: "Delete",
              id: "delete_note",
              image: Platform.select({
                ios: 'trash'
              }),
              attributes: {
                destructive: true
              }
            }
          ]}
        >
          <TouchableOpacity
            onPress={() => note.prep_and_open_posting()}
            onLongPress={() => {}}
            style={{
              padding: 12,
              backgroundColor: note.background_color(),
              borderRadius: 12,
              opacity: 1,
              ...note._microblog.is_shared ? {
                paddingBottom: 8
              } : null
            }}
          >
            {
              note.title && <Text style={{ color: App.theme_text_color(), marginBottom: 4, fontWeight: "600" }}>{note.title}</Text>
            }
            <Text style={{ color: App.theme_text_color() }}>{note.truncated_text()}</Text>
            {
              note._microblog.is_shared ?
                <View
                  style={{
                    backgroundColor: App.theme_background_color(),
                    alignSelf: "flex-start",
                    padding: 1,
                    paddingHorizontal: 8,
                    borderRadius: 8,
                    marginTop: 8,
                    flexDirection: "row",
                    alignItems: "center"
                  }}
                >
                  {
                    Platform.OS === 'ios' ?
                      <SFSymbol
                        name={'link'}
                        color={App.theme_text_color()}
                        style={{ height: 12, width: 12 }}
                        multicolor={true}
                      />
                      :
                      <SvgXml
                        style={{
                          height: 12,
                          width: 12
                        }}
                        color={App.theme_text_color()}
                        xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                        </svg>'
                      />
                  }
                  <Text style={{ fontSize: 13, color: App.theme_text_color(), marginLeft: 5 }}>Shared</Text>
                </View>
                : null
            }
          </TouchableOpacity>
          {
            !note.can_do_action() ?
              <ActivityIndicator
                color={App.theme_accent_color()}
                style={{
                  position: "absolute",
                  alignSelf: "center",
                  top: "30%"
                }}
              />
              : null
          }
        </MenuView>
      </Swipeable >
    )
  }

}
