import { observer } from 'mobx-react'
import * as React from 'react'
import { Platform, ScrollView, Text, TouchableOpacity, View, SafeAreaView } from 'react-native'
import { SFSymbol } from 'react-native-sfsymbols'
import App from '../../stores/App'
import Auth from '../../stores/Auth'
import { SvgXml } from 'react-native-svg';

@observer
export default class PostToolbar extends React.Component{

	_render_destinations() {
		const { posting } = Auth.selected_user
		if (posting?.selected_service?.config?.active_destination() != null && posting?.selected_service?.config?.destination?.length > 1 && posting.toolbar_select_destination_open) {
			return (
				<View style={{ backgroundColor: App.theme_section_background_color(), padding: 5 }}>
					<ScrollView keyboardShouldPersistTaps={'always'} horizontal={true} style={{ overflow: 'hidden', maxWidth: "100%" }} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
						{
							posting.selected_service?.config?.sorted_destinations().map((destination, index) => {
								const is_selected_destination = posting.selected_service?.config?.active_destination()?.uid == destination.uid
								return (
									<TouchableOpacity key={index} onPress={() => { posting.selected_service?.config?.set_default_destination(destination); posting.reset_post_syndicates(); posting.toggle_select_destination() }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 5, backgroundColor: is_selected_destination ? App.theme_selected_button_color() : App.theme_section_background_color(), marginRight: 5 }}>
										<Text style={{ color: App.theme_text_color(), fontWeight: is_selected_destination ? 600 : 300 }}>{destination.name}</Text>
									</TouchableOpacity>
								)
							})
						}
					</ScrollView>
				</View>
			)
		}
		return null
	}
  
	render() {
		const { posting } = Auth.selected_user
		return (
			<SafeAreaView
				style={{
					width: '100%',
					...Platform.select({
						android: {
							position: 'absolute',
							bottom: 0,
							right: 0,
							left: 0,
						}
					})
				}}
			>
				{this._render_destinations()}
				<View
					style={{
						width: '100%',
						backgroundColor: App.theme_section_background_color(),
						padding: 5,
						minHeight: 40,
						flexDirection: 'row',
						alignItems: 'center'
					}}
				>
					<ScrollView keyboardShouldPersistTaps={'always'} horizontal={true} style={{ overflow: 'hidden', maxWidth: "90%" }} contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}>
						<TouchableOpacity style={{minWidth: 30}} onPress={() => posting.handle_text_action("**")}>
							<Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"b"}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{minWidth: 30}} onPress={() => posting.handle_text_action("_")}>
							<Text style={{ fontSize: 18, fontWeight: '600', fontStyle: "italic", textAlign: 'center', padding: 2, color: App.theme_text_color() }}>{"i"}</Text>
						</TouchableOpacity>
						<TouchableOpacity style={{minWidth: 30, marginLeft: 5}} onPress={() => posting.handle_text_action("[]")}>
							{
								Platform.OS === 'ios' ?
									<SFSymbol
										name={'link'}
										color={App.theme_text_color()}
										style={{ height: 20, width: 20 }}
										multicolor={true}
									/>
								: 		
								<SvgXml
									style={{
										height: 18,
										width: 18
									}}
									stroke={App.theme_button_text_color()}
									strokeWidth={2}
									xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
										<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
									</svg>'
								/>
							}
						</TouchableOpacity>
						{
							!this.props.is_post_edit && posting.selected_service?.config?.active_destination() != null && (posting.selected_service?.config?.destination?.length > 1) ?
							<TouchableOpacity style={{marginLeft: 8, marginRight: 8}} onPress={() => {posting.toggle_select_destination()}}>
								<Text style={{ fontSize: 16, fontWeight: '500', textAlign: 'center', color: App.theme_text_color() }}>
									{posting.selected_service.config.active_destination().name}
								</Text>
							</TouchableOpacity>
							: null
						}
					</ScrollView>
					<View
						style={{
							position: 'absolute',
							right: 8,
							bottom: 9,
							flexDirection: 'row',
							alignItems: 'center',
							backgroundColor: App.theme_section_background_color(),
						}}
					>
  					<TouchableOpacity
  						onPress={() => App.navigate_to_screen("PostingOptions")}
  					>
  					{
  						Platform.OS === 'ios' ?
  							<SFSymbol
  								name={'gearshape'}
  								color={App.theme_text_color()}
  								style={{ height: 22, width: 22 }}
  								multicolor={true}
  							/>
  						: 						
  						<SvgXml
									style={{
										height: 18,
										width: 18
									}}
									stroke={App.theme_button_text_color()}
									strokeWidth={2}
									xml='<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  '
								/>
  					}
  					</TouchableOpacity>
						{
							!posting.post_title && !this.props.hide_count &&
							<Text
								style={{
									fontWeight: '400',
									padding: 2,
									color: App.theme_text_color(),
									position: 'absolute',
									top: posting.post_chars_offset(this.props.is_post_edit),
									right: 0,
									backgroundColor: posting.post_assets.length > 5 ? App.theme_background_color() : null,
									opacity: posting.post_assets.length > 5 ? .7 : 1
								}}
							><Text style={{ color: posting.post_text_length() > posting.max_post_length() ? '#a94442' : App.theme_text_color() }}>{posting.post_text_length()}</Text>/{posting.max_post_length()}</Text>
						}
					</View>
				</View>
			</SafeAreaView>
    )
  }
  
}
