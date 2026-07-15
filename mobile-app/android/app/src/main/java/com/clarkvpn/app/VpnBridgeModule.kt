package com.clarkvpn.app

import android.app.Activity
import android.content.Intent
import android.net.VpnService
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class VpnBridgeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val VPN_PERMISSION_REQUEST_CODE = 1001

        // Held across onActivityResult — cleared after use
        @Volatile var pendingPromise: Promise? = null
        @Volatile var pendingPayload: String? = null
    }

    override fun getName(): String = "VpnBridge"

    @ReactMethod
    fun startVpn(payload: String, promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("E_NO_ACTIVITY", "Activity doesn't exist")
            return
        }

        val permissionIntent = VpnService.prepare(reactApplicationContext)
        if (permissionIntent != null) {
            // Store the promise — it will be resolved in MainActivity.onActivityResult
            pendingPromise = promise
            pendingPayload = payload
            activity.startActivityForResult(permissionIntent, VPN_PERMISSION_REQUEST_CODE)
            // Do NOT resolve the promise here — wait for onActivityResult
        } else {
            // Already have permission → start immediately
            launchService(payload)
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
        promise.resolve("DISCONNECTED")
    }

    /** Called by MainActivity.onActivityResult when the user acts on the VPN permission dialog. */
    fun onVpnPermissionResult(resultCode: Int) {
        val promise = pendingPromise ?: return
        val payload = pendingPayload ?: ""
        pendingPromise = null
        pendingPayload = null

        if (resultCode == Activity.RESULT_OK) {
            // User granted VPN permission → launch the service
            launchService(payload)
            promise.resolve("STARTED")
        } else {
            // User cancelled or denied
            promise.resolve("CANCELLED")
        }
    }

    private fun launchService(payload: String) {
        val serviceIntent = Intent(reactApplicationContext, ClarkVpnService::class.java)
        serviceIntent.putExtra("PAYLOAD", payload)
        reactApplicationContext.startService(serviceIntent)
    }
}
