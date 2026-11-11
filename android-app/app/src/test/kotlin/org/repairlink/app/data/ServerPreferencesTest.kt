package org.repairlink.app.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ServerPreferencesTest {
    @Test
    fun normalizeServerUrl_rejectsBlankInput() {
        val result = normalizeServerUrl("   ")
        assertTrue(result is UrlValidationResult.Invalid)
    }

    @Test
    fun normalizeServerUrl_rejectsUnsupportedScheme() {
        val result = normalizeServerUrl("file:///etc/passwd")
        assertTrue(result is UrlValidationResult.Invalid)
    }

    @Test
    fun normalizeServerUrl_prefixesHttpForLanIp() {
        val result = normalizeServerUrl("192.168.1.25:3000/")
        assertEquals(UrlValidationResult.Valid("http://192.168.1.25:3000"), result)
    }

    @Test
    fun normalizeServerUrl_prefixesHttpsForHostedDomain() {
        val result = normalizeServerUrl("repairlink.vercel.app/")
        assertEquals(UrlValidationResult.Valid("https://repairlink.vercel.app"), result)
    }
}
