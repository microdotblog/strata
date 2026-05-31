package blog.micro.strata

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning

class MBCodeScannerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "MBCodeScannerModule"

    @ReactMethod
    fun scanQRCode(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Cannot scan without an active activity")
            return
        }

        val options = GmsBarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .enableAutoZoom()
            .build()

        val scanner = GmsBarcodeScanning.getClient(activity, options)

        scanner.startScan()
            .addOnSuccessListener { barcode ->
                val value = barcode.rawValue
                if (value != null) {
                    promise.resolve(value)
                } else {
                    promise.reject("EMPTY_BARCODE", "Scanned code had no value")
                }
            }
            .addOnCanceledListener {
                promise.reject("CANCELED", "Scan canceled by user")
            }
            .addOnFailureListener { error ->
                promise.reject("SCAN_FAILED", error.message ?: "Scan failed", error)
            }
    }
}
