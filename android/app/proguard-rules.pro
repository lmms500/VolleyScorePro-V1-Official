# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# ===========================================
# VolleyScore Pro - ProGuard Rules
# ===========================================

# Keep debugging info for crash reports
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ===========================================
# Capacitor
# ===========================================
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# ===========================================
# Firebase
# ===========================================
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.internal.** { *; }
-keepattributes *Annotation*

# ===========================================
# Google Auth
# ===========================================
-keep class com.google.android.gms.auth.** { *; }
-keep class com.google.android.gms.common.** { *; }

# ===========================================
# AdMob
# ===========================================
-keep public class com.google.android.gms.ads.** { *; }
-keep public class com.google.ads.** { *; }

# ===========================================
# WebView JavaScript Interface
# ===========================================
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ===========================================
# OkHttp / Retrofit (used by Firebase)
# ===========================================
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# ===========================================
# Gson / JSON serialization
# ===========================================
-keepattributes Signature
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer
