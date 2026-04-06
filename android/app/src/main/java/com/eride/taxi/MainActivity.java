package com.eride.taxi;

import android.os.Bundle;
import android.webkit.WebSettings;

import com.getcapacitor.BridgeActivity;
import com.eride.taxi.plugins.NativePlacesPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativePlacesPlugin.class);
        super.onCreate(savedInstanceState);
        // Allow HTTP requests from the HTTPS localhost WebView origin.
        // The Capacitor config allowMixedContent flag is unreliable across
        // WebView versions, so we set it explicitly here after bridge init.
        getBridge().getWebView().getSettings()
            .setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
}
