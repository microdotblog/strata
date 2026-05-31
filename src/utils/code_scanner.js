import {NativeModules, Platform} from 'react-native';

const {MBCodeScannerModule} = NativeModules;

export async function scanNativeQRCode() {
  if (Platform.OS !== 'android') {
    throw new Error('Native QR scanner is only available on Android.');
  }

  if (!MBCodeScannerModule?.scanQRCode) {
    throw new Error('MBCodeScannerModule is not available.');
  }

  return MBCodeScannerModule.scanQRCode();
}
