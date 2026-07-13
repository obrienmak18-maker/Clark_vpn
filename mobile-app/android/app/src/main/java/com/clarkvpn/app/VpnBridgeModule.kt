package com.clarkvpn.app

import android.content.Intent
import android.net.VpnService
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class VpnBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "VpnBridge"
    }

    @ReactMethod
    fun startVpn(payload: String, promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        // Check if we have permission to start VPN
        val intent = VpnService.prepare(reactApplicationContext)
        if (intent != null) {
            // Request VPN permission from the user
            activity.startActivityForResult(intent, 0)
            promise.resolve("PERMISSION_REQUESTED")
        } else {
            // Already have permission, start the service
            val serviceIntent = Intent(reactApplicationContext, ClarkVpnService::class.java)
            serviceIntent.putExtra("PAYLOAD", payload)
            reactApplicationContext.startService(serviceIntent)
            promise.resolve("STARTED")
        }
    }

    @ReactMethod
    fun stopVpn(promise: Promise) {
        val serviceIntent = Intent(reactApplicationContext, ClarkVpnService::class.java)
        reactApplicationContext.stopService(serviceIntent)
        promise.resolve("STOPPED")
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        // Returns current VPN status - can be expanded to query service state
        promise.resolve("DISCONNECTED")
    }
}
