package org.repairlink.app.ui.main

import android.Manifest
import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.webkit.CookieManager
import android.webkit.GeolocationPermissions
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import org.repairlink.app.ui.theme.RepairLinkBackground
import org.repairlink.app.ui.theme.RepairLinkBorder
import org.repairlink.app.ui.theme.RepairLinkError
import org.repairlink.app.ui.theme.RepairLinkMint
import org.repairlink.app.ui.theme.RepairLinkNavy
import org.repairlink.app.ui.theme.RepairLinkSuccess
import org.repairlink.app.ui.theme.RepairLinkSurface
import org.repairlink.app.ui.theme.RepairLinkTeal
import org.repairlink.app.ui.theme.RepairLinkTextPrimary
import org.repairlink.app.ui.theme.RepairLinkTextSecondary
import org.repairlink.app.ui.theme.RepairLinkWarning

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun RepairLinkWebWorkspace(
    serverUrl: String,
    onSwitchServer: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var webViewRef by remember { mutableStateOf<WebView?>(null) }
    var loadingProgress by remember { mutableIntStateOf(0) }
    var canGoBack by remember { mutableStateOf(false) }
    var pageError by remember { mutableStateOf<String?>(null) }
    var currentTitle by remember { mutableStateOf("RepairLink") }

    var pendingFileCallback by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
    var pendingGeoOrigin by remember { mutableStateOf<String?>(null) }
    var pendingGeoCallback by remember { mutableStateOf<GeolocationPermissions.Callback?>(null) }

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val uris = WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
        pendingFileCallback?.onReceiveValue(uris)
        pendingFileCallback = null
    }

    val locationPermissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        val origin = pendingGeoOrigin
        val callback = pendingGeoCallback
        if (origin != null && callback != null) {
            callback.invoke(origin, granted, false)
        }
        pendingGeoOrigin = null
        pendingGeoCallback = null
    }

    BackHandler(enabled = true) {
        val wv = webViewRef
        if (wv != null && wv.canGoBack()) {
            wv.goBack()
        } else {
            onSwitchServer()
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            pendingFileCallback?.onReceiveValue(null)
            pendingFileCallback = null
            webViewRef?.destroy()
            webViewRef = null
        }
    }

    val configuredHost = remember(serverUrl) {
        try {
            Uri.parse(serverUrl).host?.lowercase() ?: ""
        } catch (_: Exception) {
            ""
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(RepairLinkSurface)
            .statusBarsPadding()
            .navigationBarsPadding()
            .imePadding()
    ) {
        // Slim native navigation utility bar styled in REPAIRLINK Dark Navy
        Surface(
            color = RepairLinkNavy,
            contentColor = RepairLinkSurface,
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
                    .padding(horizontal = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    if (canGoBack) {
                        TextButton(
                            onClick = { webViewRef?.goBack() },
                            colors = ButtonDefaults.textButtonColors(contentColor = RepairLinkSurface)
                        ) {
                            Text("Back", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }

                    val dotColor = when {
                        pageError != null -> RepairLinkError
                        loadingProgress in 1..99 -> RepairLinkWarning
                        else -> RepairLinkSuccess
                    }

                    Box(
                        modifier = Modifier
                            .padding(start = if (canGoBack) 2.dp else 6.dp, end = 8.dp)
                            .size(9.dp)
                            .clip(CircleShape)
                            .background(dotColor)
                    )

                    Text(
                        text = currentTitle.ifBlank { "RepairLink" },
                        color = RepairLinkSurface,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    TextButton(
                        onClick = {
                            pageError = null
                            webViewRef?.reload()
                        },
                        colors = ButtonDefaults.textButtonColors(contentColor = RepairLinkMint)
                    ) {
                        Text("Reload", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                    TextButton(
                        onClick = onSwitchServer,
                        colors = ButtonDefaults.textButtonColors(contentColor = RepairLinkSurface)
                    ) {
                        Text("Server", fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }

        if (loadingProgress in 1..99 && pageError == null) {
            LinearProgressIndicator(
                progress = { loadingProgress / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(3.dp),
                color = RepairLinkTeal,
                trackColor = RepairLinkMint
            )
        }

        Box(modifier = Modifier.weight(1f).fillMaxWidth()) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    WebView(ctx).apply {
                        val cookieManager = CookieManager.getInstance()
                        cookieManager.setAcceptCookie(true)
                        cookieManager.setAcceptThirdPartyCookies(this, true)

                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            databaseEnabled = true
                            useWideViewPort = true
                            loadWithOverviewMode = true
                            allowFileAccess = true
                            setGeolocationEnabled(true)
                            mediaPlaybackRequiresUserGesture = false
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                                mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                            }
                        }

                        webChromeClient = object : WebChromeClient() {
                            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                loadingProgress = newProgress
                            }

                            override fun onReceivedTitle(view: WebView?, title: String?) {
                                if (!title.isNullOrBlank()) {
                                    currentTitle = title.substringBefore(" |").ifBlank { "RepairLink" }
                                }
                            }

                            override fun onShowFileChooser(
                                webView: WebView?,
                                filePathCallback: ValueCallback<Array<Uri>>?,
                                fileChooserParams: FileChooserParams?
                            ): Boolean {
                                pendingFileCallback?.onReceiveValue(null)
                                pendingFileCallback = filePathCallback
                                val chooserIntent = try {
                                    fileChooserParams?.createIntent()
                                } catch (_: Exception) {
                                    null
                                } ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                                    addCategory(Intent.CATEGORY_OPENABLE)
                                    type = "image/*"
                                }
                                return try {
                                    filePickerLauncher.launch(chooserIntent)
                                    true
                                } catch (_: Exception) {
                                    pendingFileCallback?.onReceiveValue(null)
                                    pendingFileCallback = null
                                    false
                                }
                            }

                            override fun onGeolocationPermissionsShowPrompt(
                                origin: String?,
                                callback: GeolocationPermissions.Callback?
                            ) {
                                val hasFine = ContextCompat.checkSelfPermission(
                                    ctx,
                                    Manifest.permission.ACCESS_FINE_LOCATION
                                ) == PackageManager.PERMISSION_GRANTED
                                val hasCoarse = ContextCompat.checkSelfPermission(
                                    ctx,
                                    Manifest.permission.ACCESS_COARSE_LOCATION
                                ) == PackageManager.PERMISSION_GRANTED
                                if (hasFine || hasCoarse) {
                                    callback?.invoke(origin, true, false)
                                } else {
                                    pendingGeoOrigin = origin
                                    pendingGeoCallback = callback
                                    locationPermissionLauncher.launch(
                                        arrayOf(
                                            Manifest.permission.ACCESS_FINE_LOCATION,
                                            Manifest.permission.ACCESS_COARSE_LOCATION
                                        )
                                    )
                                }
                            }
                        }

                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                pageError = null
                                canGoBack = view?.canGoBack() == true
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                canGoBack = view?.canGoBack() == true
                                CookieManager.getInstance().flush()
                            }

                            override fun shouldOverrideUrlLoading(
                                view: WebView?,
                                request: WebResourceRequest?
                            ): Boolean {
                                val targetUri = request?.url ?: return false
                                val scheme = targetUri.scheme?.lowercase() ?: ""
                                if (scheme == "tel" || scheme == "mailto" || scheme == "geo" || scheme == "sms") {
                                    return try {
                                        ctx.startActivity(Intent(Intent.ACTION_VIEW, targetUri))
                                        true
                                    } catch (_: ActivityNotFoundException) {
                                        true
                                    }
                                }
                                val targetHost = targetUri.host?.lowercase() ?: ""
                                val isInternalAppUrl = targetHost == configuredHost ||
                                    targetHost.endsWith(".supabase.co") ||
                                    targetHost.endsWith(".vercel.app")
                                if (!isInternalAppUrl && (scheme == "http" || scheme == "https")) {
                                    return try {
                                        ctx.startActivity(Intent(Intent.ACTION_VIEW, targetUri))
                                        true
                                    } catch (_: ActivityNotFoundException) {
                                        false
                                    }
                                }
                                return false
                            }

                            override fun onReceivedError(
                                view: WebView?,
                                request: WebResourceRequest?,
                                error: WebResourceError?
                            ) {
                                if (request?.isForMainFrame == true) {
                                    val detail = error?.description?.toString()?.ifBlank { null }
                                        ?: "Network connection unavailable."
                                    pageError = detail
                                }
                            }
                        }

                        webViewRef = this
                        loadUrl(serverUrl)
                    }
                },
                update = { view ->
                    webViewRef = view
                }
            )

            if (pageError != null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(RepairLinkBackground)
                        .padding(20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Card(
                        colors = CardDefaults.cardColors(containerColor = RepairLinkSurface),
                        shape = RoundedCornerShape(16.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, RepairLinkBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Text(
                                text = "Unable to connect to RepairLink",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = RepairLinkNavy
                            )
                            Text(
                                text = "Could not load $serverUrl (${pageError ?: "Connection failed"}).",
                                style = MaterialTheme.typography.bodyMedium,
                                color = RepairLinkTextPrimary
                            )
                            Text(
                                text = "Make sure your Next.js server is running with network access (pnpm start -H 0.0.0.0) on the same Wi-Fi, or enter a deployed Vercel HTTPS URL.",
                                style = MaterialTheme.typography.bodySmall,
                                color = RepairLinkTextSecondary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                OutlinedButton(
                                    onClick = onSwitchServer,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("Change URL")
                                }
                                Button(
                                    onClick = {
                                        pageError = null
                                        webViewRef?.loadUrl(serverUrl)
                                    },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(containerColor = RepairLinkTeal)
                                ) {
                                    Text("Retry")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
