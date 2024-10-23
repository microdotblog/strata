import * as React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import AudioRecorderPlayer, { AudioEncoderAndroidType, AudioSourceAndroidType, AVModeIOSOption, AVEncoderAudioQualityIOSType, AVEncodingOption } from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { observer } from 'mobx-react';
import App from '../../stores/App';
import Auth from '../../stores/Auth';

const silenceThreshold = -50; // dB threshold for silence
const maxSilenceDuration = 4; // in seconds

@observer
export default class DictationSheet extends React.Component {

	constructor(props) {
		super(props);

		this.audioRecorderPlayer = new AudioRecorderPlayer();
		this.audioPath = "";
		this.state = {
			is_recording: false,
			is_uploading: false,
			silence_duration: 0
		};

		this.silenceTimer = null;
	}

	componentDidMount = async () => {
		this.startRecording();
	}
	
	componentWillUnmount = async () => {
		if (this.state.is_recording) {
			this.cancelRecording();
		}
	}

	removeAudioFile = async (filename) => {
		const path = `${RNFS.CachesDirectoryPath}/${filename}`;
		const exists = await RNFS.exists(path);
		if (exists) {
			await RNFS.unlink(path);
		}		
	}

	startRecording = async () => {
		console.log("Starting recording...");
		this.setState({ is_recording: true });
	
		const filename = "sound.m4a";
		const audio_set = {
			AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
			AudioSourceAndroid: AudioSourceAndroidType.MIC,
			AVModeIOS: AVModeIOSOption.measurement,
			AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
			AVNumberOfChannelsKeyIOS: 1,
			AVFormatIDKeyIOS: AVEncodingOption.aac,
		};
		const metering_enabled = true;
		
		try {
			await this.removeAudioFile(filename);

			this.audioPath = await this.audioRecorderPlayer.startRecorder(filename, audio_set, metering_enabled);
			this.audioRecorderPlayer.addRecordBackListener((e) => {
				this.checkAudioLevel(e.currentMetering);
			});
	
			this.silenceTimer = setInterval(() => {
				this.checkSilence();
			}, 500);
		}
		catch (error) {
			console.error("Failed to start recording:", error);
		}
	};
	
	stopRecording = async () => {
		this.setState({ is_recording: false, silence_duration: 0 });
		clearInterval(this.silenceTimer);
		
		try {
			await this.audioRecorderPlayer.stopRecorder();
			this.audioRecorderPlayer.removeRecordBackListener();
			console.log("Recording stopped");
		
			const file_stats = await RNFS.stat(this.audioPath);
			console.log("Stats:", file_stats);
		}
		catch (error) {
			console.error("Failed to stop recording:", error);
		}
	};
	
	cancelRecording = async () => {
		this.stopRecording().then(() => {
			this.removeAudioFile(this.audioPath);
			SheetManager.hide("dictation-sheet");
		});
	};
	
	finishRecording = async () => {
		this.stopRecording().then(() => {
			this.uploadAudio();
		});
	};
	
	uploadAudio = async () => {
		this.setState({ is_uploading: true });
		
		try {
			let file_data = await RNFS.readFile(this.audioPath, 'base64');
			file_data = "data:;base64," + file_data;
			const file_id = Math.floor(Math.random() * 1000000);
			
			const upload_form_data = new FormData();
			upload_form_data.append('file_data', file_data);
			upload_form_data.append('file_id', file_id);
			
			console.log(`File ID: ${file_id}`);
			
			await fetch('https://micro.blog/account/upload_part', {
				method: 'POST',
				headers: {
				  'Authorization': `Bearer ${Auth.selected_user?.token()}`
				},
				body: upload_form_data
			});
			
			const finished_form_data = new FormData();
			finished_form_data.append('file_id', file_id);
			finished_form_data.append('file_defer', '1');
			finished_form_data.append('file_destination', 'transcribe');
			
			await fetch('https://micro.blog/account/upload_finished', {
				method: 'POST',
				headers: {
				  'Authorization': `Bearer ${Auth.selected_user?.token()}`
				},
				body: finished_form_data
			});
		
			this.transcriptionTimer = setInterval(async () => {
				try {
					const response = await fetch(`https://micro.blog/account/upload_transcript?file_id=${file_id}`, {
						headers: {
							'Authorization': `Bearer ${Auth.selected_user?.token()}`
						}						
					});
					const response_data = await response.json();
		
					if (response_data.text && response_data.text.trim() != '') {
						console.log('Transcription text:', response_data.text);
						clearInterval(this.transcriptionTimer);
						await this.saveNote(response_data.text);
					}
				}
				catch (error) {
					console.error('Failed to get transcription:', error);
					clearInterval(this.transcriptionTimer);
				}
			}, 2000);
		}
		catch (error) {
			console.error('Failed to upload audio:', error);
		}
		finally {
			this.setState({ is_uploading: false });
		}
	};
	
	saveNote = async (note_text) => {
		// ...
	};
	
	checkAudioLevel = (decibels) => {
		const { silence_duration } = this.state;
			
		if (decibels < silenceThreshold) {
			// add time we've waited
			this.setState({ silence_duration: silence_duration + 0.5 });
		}
		else {
			// reset duration if sound is detected
			this.setState({ silence_duration: 0 });
		}
	};
	
	checkSilence = () => {
		const { silence_duration } = this.state;
		
		if (silence_duration >= maxSilenceDuration) {
			console.log("Detected seconds of silence, stopping");
			this.finishRecording();
		}
	};

	render() {
		const { is_recording, is_uploading } = this.state;

		return (
			<ActionSheet
				containerStyle={{
					backgroundColor: App.theme_background_color_secondary(),
					padding: 15,
					paddingTop: 0
				}}
				gestureEnabled={true}
				useBottomSafeAreaPadding={true}
				id={this.props.sheet_id}
			>
				<View style={{ padding: 15 }}>
					{ is_recording &&
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
							<Text style={{ flex: 1, fontSize: 16, marginRight: 15, color: App.theme_text_color() }}>Recording your note... It will be transcribed in the cloud and then added as a note. The audio will be deleted.</Text>
							<TouchableOpacity
								onPress={this.cancelRecording}
								style={{
									padding: 8,
									paddingHorizontal: 10,
									borderRadius: 8,
									backgroundColor: App.theme_border_color()
								}}
							>
								<Text style={{ color: App.theme_text_color() }}>Cancel</Text>
							</TouchableOpacity>
						</View>
					}
					
					{ is_uploading &&
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
							<Text style={{ flex: 1, fontSize: 16, marginRight: 15, color: App.theme_text_color() }}>Uploading audio for transcription...</Text>
							<ActivityIndicator color={App.theme_accent_color()} size={'large'} />
						</View>
					}
				</View>
			</ActionSheet>
		)
	}

}