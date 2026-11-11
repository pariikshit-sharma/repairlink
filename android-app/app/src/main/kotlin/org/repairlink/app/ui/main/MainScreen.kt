package org.repairlink.app.ui.main

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation3.runtime.NavKey
import org.repairlink.app.R
import org.repairlink.app.data.ServerPreferences
import org.repairlink.app.data.UrlValidationResult
import org.repairlink.app.data.normalizeServerUrl
import org.repairlink.app.ui.theme.RepairLinkBackground
import org.repairlink.app.ui.theme.RepairLinkBorder
import org.repairlink.app.ui.theme.RepairLinkError
import org.repairlink.app.ui.theme.RepairLinkMint
import org.repairlink.app.ui.theme.RepairLinkNavy
import org.repairlink.app.ui.theme.RepairLinkSurface
import org.repairlink.app.ui.theme.RepairLinkTeal
import org.repairlink.app.ui.theme.RepairLinkTextPrimary
import org.repairlink.app.ui.theme.RepairLinkTextSecondary

@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val initialUrl = remember { ServerPreferences.getSavedUrl(context) }
    val initialAutoConnect = remember { ServerPreferences.isAutoConnectEnabled(context) }

    var activeUrl by rememberSaveable {
        mutableStateOf(
            if (initialAutoConnect && initialUrl.isNotBlank()) initialUrl else null
        )
    }

    if (activeUrl != null) {
        RepairLinkWebWorkspace(
            serverUrl = activeUrl!!,
            onSwitchServer = {
                ServerPreferences.clearAutoConnect(context)
                activeUrl = null
            },
            modifier = modifier
        )
    } else {
        ServerSetupScreen(
            initialUrl = initialUrl,
            initialAutoConnect = initialAutoConnect,
            onConnect = { normalizedUrl, autoConnect ->
                ServerPreferences.saveConfig(context, normalizedUrl, autoConnect)
                activeUrl = normalizedUrl
            },
            modifier = modifier
        )
    }
}

@Composable
internal fun ServerSetupScreen(
    initialUrl: String,
    initialAutoConnect: Boolean,
    onConnect: (normalizedUrl: String, autoConnect: Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    var urlInput by rememberSaveable { mutableStateOf(initialUrl) }
    var autoConnect by rememberSaveable { mutableStateOf(initialAutoConnect) }
    var validationError by rememberSaveable { mutableStateOf<String?>(null) }

    fun attemptLaunch() {
        when (val result = normalizeServerUrl(urlInput)) {
            is UrlValidationResult.Valid -> {
                validationError = null
                urlInput = result.normalizedUrl
                onConnect(result.normalizedUrl, autoConnect)
            }
            is UrlValidationResult.Invalid -> {
                validationError = result.reason
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(RepairLinkBackground)
            .statusBarsPadding()
            .navigationBarsPadding()
            .imePadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Brand Header
        Card(
            colors = CardDefaults.cardColors(containerColor = RepairLinkSurface),
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, RepairLinkBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_repairlink_logo),
                        contentDescription = stringResource(id = R.string.app_name),
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(12.dp))
                    )
                    Column {
                        Text(
                            text = "REPAIRLINK",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = RepairLinkNavy,
                            letterSpacing = 0.5.sp
                        )
                        Surface(
                            color = RepairLinkMint,
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(
                                text = "Android Companion App",
                                color = RepairLinkNavy,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                    }
                }

                Text(
                    text = stringResource(id = R.string.tagline),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = RepairLinkTeal
                )
            }
        }

        // Server Connection Card
        Card(
            colors = CardDefaults.cardColors(containerColor = RepairLinkSurface),
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, RepairLinkBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = "Connect to RepairLink",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = RepairLinkNavy
                )

                Text(
                    text = "Enter your deployed Vercel HTTPS URL or your PC's local Wi-Fi Next.js server address.",
                    style = MaterialTheme.typography.bodySmall,
                    color = RepairLinkTextSecondary
                )

                OutlinedTextField(
                    value = urlInput,
                    onValueChange = {
                        urlInput = it
                        if (validationError != null) validationError = null
                    },
                    label = { Text("App Server URL") },
                    placeholder = { Text("http://192.168.1.10:3000 or https://...") },
                    singleLine = true,
                    isError = validationError != null,
                    supportingText = validationError?.let { err ->
                        { Text(text = err, color = RepairLinkError) }
                    },
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Uri,
                        imeAction = ImeAction.Go
                    ),
                    keyboardActions = KeyboardActions(
                        onGo = { attemptLaunch() }
                    ),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = RepairLinkTeal,
                        focusedLabelColor = RepairLinkTeal,
                        cursorColor = RepairLinkTeal
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Text(
                    text = "Quick Presets",
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = RepairLinkTextPrimary
                )

                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                urlInput = ServerPreferences.DEFAULT_EMULATOR_URL
                                validationError = null
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, RepairLinkBorder)
                        ) {
                            Text("Emulator (10.0.2.2)", fontSize = 12.sp, color = RepairLinkNavy)
                        }

                        OutlinedButton(
                            onClick = {
                                urlInput = ServerPreferences.DEFAULT_LOCALHOST_URL
                                validationError = null
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, RepairLinkBorder)
                        ) {
                            Text("USB (localhost)", fontSize = 12.sp, color = RepairLinkNavy)
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = {
                                urlInput = "http://192.168."
                                validationError = null
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, RepairLinkBorder)
                        ) {
                            Text("Wi-Fi IP (192.168...)", fontSize = 12.sp, color = RepairLinkNavy)
                        }

                        OutlinedButton(
                            onClick = {
                                urlInput = "https://"
                                validationError = null
                            },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, RepairLinkBorder)
                        ) {
                            Text("Vercel HTTPS", fontSize = 12.sp, color = RepairLinkNavy)
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Open directly on next launch",
                        style = MaterialTheme.typography.bodySmall,
                        color = RepairLinkTextPrimary
                    )
                    Switch(
                        checked = autoConnect,
                        onCheckedChange = { autoConnect = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = RepairLinkSurface,
                            checkedTrackColor = RepairLinkTeal
                        )
                    )
                }

                Button(
                    onClick = { attemptLaunch() },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = RepairLinkTeal,
                        contentColor = RepairLinkSurface
                    )
                ) {
                    Text(
                        text = "Open REPAIRLINK App",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }

        // Connection Help Guide
        Card(
            colors = CardDefaults.cardColors(containerColor = RepairLinkSurface),
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, RepairLinkBorder),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "How to test on your Android phone",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = RepairLinkNavy
                )
                GuideStep(
                    number = "1",
                    text = "Same Wi-Fi: Run pnpm start -H 0.0.0.0 on your PC and enter http://<PC-WiFi-IP>:3000."
                )
                GuideStep(
                    number = "2",
                    text = "USB Cable: Connect phone via USB Debugging, run adb reverse tcp:3000 tcp:3000, and tap USB (localhost)."
                )
                GuideStep(
                    number = "3",
                    text = "Live Cloud: Deploy to Vercel and enter your https://...vercel.app URL to test anywhere."
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))
    }
}

@Composable
private fun GuideStep(number: String, text: String) {
    Row(
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Box(
            modifier = Modifier
                .padding(top = 2.dp)
                .size(20.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(RepairLinkMint),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = number,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = RepairLinkNavy
            )
        }
        Text(
            text = text,
            style = MaterialTheme.typography.bodySmall,
            color = RepairLinkTextSecondary
        )
    }
}
