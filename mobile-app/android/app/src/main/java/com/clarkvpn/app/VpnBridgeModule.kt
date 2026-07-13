package com.clarkvpn.app

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class VpnBridgeModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "VpnBridge"
    }

    @ReactMethod
    fun startVpn(payload: String, promise: Promise) {
        val activity = currentActivity
        if (activity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist")
            return
        }

        // Check if we have permission to start VPN
        val intent = VpnService.prepare(reactContext)
        if (intent != null) {
            // Need to ask for permission (this should be handled via startActivityForResult in a full impl)
            // For simplicity in this architectural setup, we assume permission or we would launch intent.
            activity.startActivityForResult(intent, 0)
            promise.resolve("PERMISSION_REQUESTED")
        } else {
            // Already have permission, start the service
            val serviceIntent = Intent(reactContext, ClarkVpnService::class.java)
            serviceIntent.putExtra("PAYLOAD", payload)
            reactContext.startService(serviceIntent)
            promise.resolve("STARTED")
        }
    }

    @ReactMethod
    fun stopVpn(promise: Promise) {
        val serviceIntent = Intent(reactContext, ClarkVpnService::class.java)
        reactContext.stopService(serviceIntent)
        promise.resolve("STOPPED")
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        // Ideally we would query a static variable or bound service.
        // Returning a mock status for the bridge.
        promise.resolve("DISCONNECTED") 
    }
}
