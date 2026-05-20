import {View} from 'react-native';
import {useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import {CodeScanner} from 'react-native-vision-camera-barcode-scanner';

export default function QRScanner({onCodeScanned}) {
  const device = useCameraDevice('back');
  const {hasPermission} = useCameraPermission();

  if (device != null && hasPermission) {
    return (
      <View
        style={{
          backgroundColor: 'black',
          marginBottom: 12,
          height: 370,
          width: '100%',
          borderRadius: 8,
          overflow: 'hidden',
        }}>
        <CodeScanner
          isActive={true}
          style={{flex: 1, borderRadius: 8}}
          barcodeFormats={['qr-code']}
          onBarcodeScanned={onCodeScanned}
        />
      </View>
    );
  } else if (device == null && __DEV__) {
    return (
      <View
        style={{
          backgroundColor: 'black',
          marginBottom: 12,
          height: 370,
          width: '100%',
          borderRadius: 8,
        }}
      />
    );
  }
  return null;
}
