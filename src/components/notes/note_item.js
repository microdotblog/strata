import * as React from 'react';
import { observer } from 'mobx-react';
import { View, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import App from './../../stores/App';
import { SFSymbol } from 'react-native-sfsymbols';
import { SvgXml } from 'react-native-svg';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';

@observer
export default class NoteItem extends React.Component {

  constructor(props) {
    super(props)
    this._swipeable = React.createRef()
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
        this._trigger_delete()
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

  _trigger_delete = () => {
    console.log("_trigger_delete")
  }

  render() {
    const { note } = this.props
    return (
      <Swipeable
        ref={this._swipeable}
        friction={1}
        overshootFriction={8}
        enableTrackpadTwoFingerGesture={true}
        renderRightActions={(progress) => this._right_actions(progress)}
        containerStyle={{
          marginTop: 15,
        }}
      >
        <TouchableOpacity
          onPress={() => note.is_locked() ? App.open_sheet("secret-key-prompt-sheet") : note.prep_and_open_posting()}
          style={{
            padding: 12,
            backgroundColor: App.theme_note_background_color(),
            borderRadius: 12,
            opacity: note.is_locked() ? .5 : 1
          }}
        >
          {
            note.is_locked() ?
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                {
                  Platform.OS === 'ios' ?
                    <SFSymbol
                      name={'lock'}
                      color={App.theme_text_color()}
                      style={{ height: 20, width: 20 }}
                      multicolor={true}
                    />
                    :
                    <SvgXml
                      style={{
                        height: 20,
                        width: 20
                      }}
                      color={App.theme_text_color()}
                      xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>'
                    />
                }
                <Text style={{ color: App.theme_text_color(), fontWeight: "600", marginTop: 8 }}>Note locked</Text>
              </View>
              :
              <>
                {
                  note.title && <Text style={{ color: App.theme_text_color(), marginBottom: 4, fontWeight: "600" }}>{note.title}</Text>
                }
                <Text style={{ color: App.theme_text_color() }}>{note.truncated_text()}</Text>
              </>
          }
        </TouchableOpacity>
      </Swipeable>
    )
  }

}