package com.clarkvpn.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import java.io.FileInputStream
import java.io.FileOutputStream
import java.nio.ByteBuffer

class ClarkVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private var isRunning = false
    private var vpnThread: Thread? = null

    companion object {
        private const val CHANNEL_ID   = "clark_vpn_channel"
        private const val NOTIFICATION_ID = 1001
        private const val TAG = "ClarkVPN"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val payload = intent?.getStringExtra("PAYLOAD") ?: ""
        Log.i(TAG, "Starting VPN Service with payload: $payload")

        // Show persistent foreground notification immediately (like HTTP Injector / DarkTunnel)
        startForeground(NOTIFICATION_ID, buildNotification("Connexion en cours…"))
        startVpn()
        return START_STICKY
    }

    // ── Notification ────────────────────────────────────────────────────────────

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Clark VPN",
                NotificationManager.IMPORTANCE_LOW   // silent — no sound/vibration
            ).apply {
                description = "Statut de la connexion VPN"
                setShowBadge(false)
            }
            val nm = getSystemService(NotificationManager::class.java)
            nm.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(statusText: String): Notification {
        // Tap the notification → open the app
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
        val pi = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            // Small icon shown in the status bar — monochrome, must be white
            .setSmallIcon(R.drawable.ic_vpn_notification)
            // Large icon — our full-colour Clark VPN logo
            .setLargeIcon(
                android.graphics.BitmapFactory.decodeResource(resources, R.drawable.clark_vpn_logo)
            )
            .setContentTitle("Clark VPN")
            .setContentText(statusText)
            .setContentIntent(pi)
            .setOngoing(true)          // cannot be dismissed while VPN is active
            .setShowWhen(false)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification(text: String) {
        val nm = getSystemService(NotificationManager::class.java)
        nm.notify(NOTIFICATION_ID, buildNotification(text))
    }

    // ── VPN logic ────────────────────────────────────────────────────────────────

    private fun startVpn() {
        if (vpnInterface != null) return

        try {
            val builder = Builder()
            builder.addAddress("10.0.0.2", 32)
            builder.addRoute("0.0.0.0", 0)
            builder.addDnsServer("1.1.1.1")
            builder.addDnsServer("8.8.8.8")
            builder.setSession("Clark VPN")
            builder.setMtu(1500)

            vpnInterface = builder.establish()
            isRunning = true

            updateNotification("Connecté ✓  |  Tunnel actif")

            vpnThread = Thread { runVpnTunnel() }
            vpnThread?.start()

        } catch (e: Exception) {
            Log.e(TAG, "Error starting VPN: ${e.message}")
            updateNotification("Erreur de connexion")
            stopSelf()
        }
    }

    private fun runVpnTunnel() {
        @Suppress("UNUSED_VARIABLE")
        val inStream  = FileInputStream(vpnInterface?.fileDescriptor)
        @Suppress("UNUSED_VARIABLE")
        val outStream = FileOutputStream(vpnInterface?.fileDescriptor)
        val packet = ByteBuffer.allocate(32767)

        while (isRunning) {
            try {
                // TODO: forward packets through SSH/V2Ray/HTTP-Inject tunnel
                Thread.sleep(100)
            } catch (e: InterruptedException) {
                break
            } catch (e: Exception) {
                Log.e(TAG, "VPN Loop error: ${e.message}")
                break
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isRunning = false
        vpnThread?.interrupt()
        try { vpnInterface?.close() } catch (e: Exception) {
            Log.e(TAG, "Error closing VPN interface: ${e.message}")
        }
        vpnInterface = null
        Log.i(TAG, "VPN Service stopped")
    }
}
