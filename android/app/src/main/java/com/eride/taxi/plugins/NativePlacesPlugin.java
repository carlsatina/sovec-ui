package com.eride.taxi.plugins;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Bundle;

import androidx.annotation.NonNull;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.libraries.places.api.Places;
import com.google.android.libraries.places.api.model.AutocompletePrediction;
import com.google.android.libraries.places.api.model.Place;
import com.google.android.libraries.places.api.net.FetchPlaceRequest;
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsRequest;
import com.google.android.libraries.places.api.net.FindAutocompletePredictionsResponse;
import com.google.android.libraries.places.api.net.PlacesClient;

import java.util.Arrays;
import java.util.List;

@CapacitorPlugin(name = "NativePlaces")
public class NativePlacesPlugin extends Plugin {
    private PlacesClient placesClient;

    @Override
    public void load() {
        ensurePlacesClient();
    }

    @PluginMethod
    public void autocomplete(PluginCall call) {
        String input = call.getString("input", "").trim();
        if (input.isEmpty()) {
            call.reject("input required");
            return;
        }

        ensurePlacesClient();
        if (placesClient == null) {
            call.reject("Google Places SDK not initialized");
            return;
        }

        FindAutocompletePredictionsRequest request =
            FindAutocompletePredictionsRequest.builder().setQuery(input).build();

        placesClient.findAutocompletePredictions(request)
            .addOnSuccessListener((FindAutocompletePredictionsResponse response) -> {
                JSArray items = new JSArray();
                for (AutocompletePrediction prediction : response.getAutocompletePredictions()) {
                    JSObject item = new JSObject();
                    item.put("placeId", prediction.getPlaceId());
                    item.put("description", prediction.getFullText(null).toString());
                    items.put(item);
                }

                JSObject result = new JSObject();
                result.put("items", items);
                call.resolve(result);
            })
            .addOnFailureListener(exception -> call.reject(readableError(exception), exception));
    }

    @PluginMethod
    public void details(PluginCall call) {
        String placeId = call.getString("placeId", "").trim();
        if (placeId.isEmpty()) {
            call.reject("placeId required");
            return;
        }

        ensurePlacesClient();
        if (placesClient == null) {
            call.reject("Google Places SDK not initialized");
            return;
        }

        List<Place.Field> fields = Arrays.asList(
            Place.Field.ID,
            Place.Field.NAME,
            Place.Field.ADDRESS,
            Place.Field.LAT_LNG
        );

        FetchPlaceRequest request = FetchPlaceRequest.builder(placeId, fields).build();
        placesClient.fetchPlace(request)
            .addOnSuccessListener(response -> {
                Place place = response.getPlace();
                LatLng latLng = place.getLatLng();
                if (latLng == null) {
                    call.reject("Place has no coordinates");
                    return;
                }

                JSObject result = new JSObject();
                result.put("placeId", place.getId());
                result.put("name", place.getName());
                result.put("address", place.getAddress());
                result.put("lat", latLng.latitude);
                result.put("lng", latLng.longitude);
                call.resolve(result);
            })
            .addOnFailureListener(exception -> call.reject(readableError(exception), exception));
    }

    private void ensurePlacesClient() {
        if (placesClient != null) {
            return;
        }

        String apiKey = getMapsApiKey();
        if (apiKey == null || apiKey.isEmpty()) {
            return;
        }

        if (!Places.isInitialized()) {
            Places.initialize(getContext(), apiKey);
        }
        placesClient = Places.createClient(getContext());
    }

    private String getMapsApiKey() {
        try {
            ApplicationInfo applicationInfo = getContext()
                .getPackageManager()
                .getApplicationInfo(getContext().getPackageName(), PackageManager.GET_META_DATA);
            Bundle metaData = applicationInfo.metaData;
            if (metaData == null) {
                return null;
            }
            return metaData.getString("com.google.android.geo.API_KEY");
        } catch (PackageManager.NameNotFoundException ignored) {
            return null;
        }
    }

    @NonNull
    private String readableError(Exception exception) {
        if (exception instanceof ApiException) {
            ApiException apiException = (ApiException) exception;
            return "Places API error " + apiException.getStatusCode() + ": " + apiException.getMessage();
        }
        return exception.getMessage() != null ? exception.getMessage() : "Unknown Places API error";
    }
}
