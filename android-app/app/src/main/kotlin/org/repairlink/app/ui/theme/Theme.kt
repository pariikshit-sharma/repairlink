package org.repairlink.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val RepairLinkColorScheme = lightColorScheme(
    primary = RepairLinkTeal,
    onPrimary = RepairLinkSurface,
    primaryContainer = RepairLinkMint,
    onPrimaryContainer = RepairLinkNavy,
    secondary = RepairLinkNavy,
    onSecondary = RepairLinkSurface,
    secondaryContainer = ColorTokens.NavySoft,
    onSecondaryContainer = RepairLinkNavy,
    tertiary = RepairLinkAmber,
    onTertiary = RepairLinkSurface,
    background = RepairLinkBackground,
    onBackground = RepairLinkTextPrimary,
    surface = RepairLinkSurface,
    onSurface = RepairLinkTextPrimary,
    surfaceVariant = ColorTokens.SurfaceSoft,
    onSurfaceVariant = RepairLinkTextSecondary,
    outline = RepairLinkBorder,
    error = RepairLinkError,
    onError = RepairLinkSurface,
)

private object ColorTokens {
    val NavySoft = androidx.compose.ui.graphics.Color(0xFFE9EEF3)
    val SurfaceSoft = androidx.compose.ui.graphics.Color(0xFFF1F5F8)
}

@Composable
fun RepairLinkTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = RepairLinkColorScheme,
        typography = Typography,
        content = content
    )
}
