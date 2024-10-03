import { useCodeScanner, useCameraPermission, useCameraDevice, Camera } from 'react-native-vision-camera'
import { View } from 'react-native'

export default function QRScanner({ onCodeScanned }) {
  
  const device = useCameraDevice('back')
  const { hasPermission } = useCameraPermission()
  
  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      onCodeScanned(codes)
    }
  })
  
  if(device != null && hasPermission){
    return(
      <View style={{ backgroundColor: 'black', marginBottom: 12, height: 370, width: "100%", borderRadius: 8, overflow: 'hidden' }}>
        <Camera isActive={true} device={device} style={{ flex: 1, borderRadius: 8 }} codeScanner={codeScanner} />
      </View>
    ) 
  }
  else if(device == null && __DEV__){
    return(
      <View style={{ backgroundColor: 'black', marginBottom: 12, height: 370, width: "100%", borderRadius: 8 }}>
      </View>
    )
  }
  return null
  
}
