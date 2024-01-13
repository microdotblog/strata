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
            "rgb(239,68,68)",
            60,
            progress,
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M 21 2 C 19.354545 2 18 3.3545455 18 5 L 18 7 L 10.154297 7 A 1.0001 1.0001 0 0 0 9.984375 6.9863281 A 1.0001 1.0001 0 0 0 9.8398438 7 L 8 7 A 1.0001 1.0001 0 1 0 8 9 L 9 9 L 9 45 C 9 46.645455 10.354545 48 12 48 L 38 48 C 39.645455 48 41 46.645455 41 45 L 41 9 L 42 9 A 1.0001 1.0001 0 1 0 42 7 L 40.167969 7 A 1.0001 1.0001 0 0 0 39.841797 7 L 32 7 L 32 5 C 32 3.3545455 30.645455 2 29 2 L 21 2 z M 21 4 L 29 4 C 29.554545 4 30 4.4454545 30 5 L 30 7 L 20 7 L 20 5 C 20 4.4454545 20.445455 4 21 4 z M 11 9 L 18.832031 9 A 1.0001 1.0001 0 0 0 19.158203 9 L 30.832031 9 A 1.0001 1.0001 0 0 0 31.158203 9 L 39 9 L 39 45 C 39 45.554545 38.554545 46 38 46 L 12 46 C 11.445455 46 11 45.554545 11 45 L 11 9 z M 18.984375 13.986328 A 1.0001 1.0001 0 0 0 18 15 L 18 40 A 1.0001 1.0001 0 1 0 20 40 L 20 15 A 1.0001 1.0001 0 0 0 18.984375 13.986328 z M 24.984375 13.986328 A 1.0001 1.0001 0 0 0 24 15 L 24 40 A 1.0001 1.0001 0 1 0 26 40 L 26 15 A 1.0001 1.0001 0 0 0 24.984375 13.986328 z M 30.984375 13.986328 A 1.0001 1.0001 0 0 0 30 15 L 30 40 A 1.0001 1.0001 0 1 0 32 40 L 32 15 A 1.0001 1.0001 0 0 0 30.984375 13.986328 z"/></svg>`
          )
        }
      </View>
    </View>
  )

  _return_action = (text, color, x, progress, icon) => {

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
          <SvgXml
            xml={icon}
            width={22}
            height={22}
            stroke={color}
          />
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