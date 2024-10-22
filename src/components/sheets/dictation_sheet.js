import * as React from 'react';
import { View, Text, Button } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import AudioRecorderPlayer, { AudioEncoderAndroidType, AudioSourceAndroidType, AVModeIOSOption, AVEncoderAudioQualityIOSType, AVEncodingOption } from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import { observer } from 'mobx-react';
import App from '../../stores/App';

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
	}
	
	componentWillUnmount = async () => {
		if (this.state.is_recording) {
			this.stopRecording();
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
			
			// await this.audioRecorderPlayer.startPlayer();
			await this.uploadAudio();
		}
		catch (error) {
			console.error("Failed to stop recording:", error);
		}
	};
	
	uploadAudio = async () => {		
	};
	
	checkAudioLevel = (decibels) => {
		const { silence_duration } = this.state;
			
		if (decibels < silenceThreshold) {
			// add time we've waited
			this.setState({ silence_duration: silence_duration + .5 });
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
			this.stopRecording();
		}
	};

	render() {
		const { is_recording } = this.state;

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
				<Text>Hi</Text>
				<Button
					title={is_recording ? "Stop Recording" : "Start Recording"}
					onPress={is_recording ? this.stopRecording : this.startRecording}
				/>
			</ActionSheet>
		)
	}

}