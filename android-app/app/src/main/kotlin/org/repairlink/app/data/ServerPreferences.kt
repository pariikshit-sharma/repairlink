package org.repairlink.app.data

import android.content.Context
import java.net.URI

object ServerPreferences {
    private const val PREFS_NAME = "repairlink_app_prefs"
    private const val KEY_SERVER_URL = "server_url"
    private const val KEY_AUTO_CONNECT = "auto_connect"

    const val DEFAULT_EMULATOR_URL = "http://10.0.2.2:3000"
    const val DEFAULT_LOCALHOST_URL = "http://localhost:3000"

    fun getSavedUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getString(KEY_SERVER_URL, "") ?: ""
    }

    fun isAutoConnectEnabled(context: Context): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getBoolean(KEY_AUTO_CONNECT, false)
    }

    fun saveConfig(context: Context, url: String, autoConnect: Boolean) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_SERVER_URL, url)
            .putBoolean(KEY_AUTO_CONNECT, autoConnect)
            .apply()
    }

    fun clearAutoConnect(context: Context) {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_AUTO_CONNECT, false)
            .apply()
    }
}

sealed interface UrlValidationResult {
    data class Valid(val normalizedUrl: String) : UrlValidationResult
    data class Invalid(val reason: String) : UrlValidationResult
}

fun normalizeServerUrl(rawInput: String): UrlValidationResult {
    val trimmed = rawInput.trim().trimEnd('/')
    if (trimmed.isEmpty()) {
        return UrlValidationResult.Invalid("Enter your RepairLink web or local server URL.")
    }

    val hasScheme = trimmed.contains("://")
    if (hasScheme) {
        val lower = trimmed.lowercase()
        if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
            return UrlValidationResult.Invalid("Only http:// or https:// URLs are supported.")
        }
    }

    val candidate = if (hasScheme) {
        trimmed
    } else {
        val lower = trimmed.lowercase()
        val isLocalNetwork = lower.startsWith("localhost") ||
            lower.startsWith("10.") ||
            lower.startsWith("127.") ||
            lower.startsWith("192.168.") ||
            lower.matches(Regex("^172\\.(1[6-9]|2[0-9]|3[0-1])\\..*"))
        if (isLocalNetwork) "http://$trimmed" else "https://$trimmed"
    }

    val parsed = try {
        URI(candidate)
    } catch (_: Exception) {
        null
    }

    val host = parsed?.host
    if (host.isNullOrBlank()) {
        return UrlValidationResult.Invalid("Enter a valid domain or IP address (for example, http://192.168.1.10:3000).")
    }

    return UrlValidationResult.Valid(candidate)
}
