package org.repairlink.app.ui.main

import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.repairlink.app.ui.theme.RepairLinkTheme

/** UI tests for [org.repairlink.app.ui.main.ServerSetupScreen]. */
class MainScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ComponentActivity>()

    @Before
    fun setup() {
        composeTestRule.setContent {
            RepairLinkTheme {
                ServerSetupScreen(
                    initialUrl = "",
                    initialAutoConnect = false,
                    onConnect = { _, _ -> }
                )
            }
        }
    }

    @Test
    fun launchButton_andBrand_exist() {
        composeTestRule.onNodeWithText("REPAIRLINK").assertExists()
        composeTestRule.onNodeWithText("Open REPAIRLINK App").assertExists()
    }
}
