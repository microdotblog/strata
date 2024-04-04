package blog.micro.strata
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class MBNotesCryptoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "MBNotesCryptoModule"

    @ReactMethod
    fun encrypt(text: String, key: String, promise: Promise) {
        try{
            promise.resolve("Encrypt: Got text: $text and key: $key")
        }
        catch (e: Throwable){
            promise.reject("Encrypt Error:", e)
        }
    }
}