package com.volleyscore.pro2;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.util.ArrayList;

/**
 * Custom Capacitor plugin for Android Speech Recognition.
 *
 * Key design decisions:
 * 1. SpeechRecognizer is created ONCE and REUSED across sessions (no destroy/recreate overhead)
 * 2. Long silence timeouts via Intent extras keep the recognizer listening longer
 * 3. On results, restart is done via cancel() + startListening() (fast, no cold-start)
 * 4. Only destroy/recreate on ERROR_RECOGNIZER_BUSY or fatal errors
 * 5. All communication is event-based — start() resolves immediately
 */
@CapacitorPlugin(
    name = "VoiceRecognitionCustom",
    permissions = {
        @Permission(strings = { "android.permission.RECORD_AUDIO" }, alias = "microphone")
    }
)
public class VoiceRecognitionPlugin extends Plugin {

    private static final String TAG = "VoiceRecPlugin";

    // Events
    private static final String EVENT_PARTIAL_RESULTS = "partialResults";
    private static final String EVENT_FINAL_RESULTS = "finalResults";
    private static final String EVENT_LISTENING_STATE = "listeningState";
    private static final String EVENT_RECOGNITION_ERROR = "recognitionError";

    // Error constant not in older SDKs
    private static final int ERROR_TOO_MANY_REQUESTS = 10;

    // Silence timeout: how long to listen before auto-stopping (ms)
    private static final long SILENCE_TIMEOUT_MS = 10000L;   // 10s of complete silence
    private static final long POSSIBLY_DONE_MS   = 5000L;    // 5s of possibly-complete silence
    private static final long MIN_LISTEN_MS       = 30000L;  // listen at least 30s per session

    // State
    private SpeechRecognizer speechRecognizer;
    private RecognitionListener recognitionListener;
    private boolean isListening = false;
    private boolean continuousMode = false;
    private String currentLocale = "pt-BR";
    private boolean partialResultsEnabled = true;

    // Error tracking
    private int consecutiveErrors = 0;
    private static final int MAX_CONSECUTIVE_ERRORS = 8;

    // Previous partial results for deduplication
    private String previousPartialText = "";

    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    // --------------------------------------------------------------------------
    // PLUGIN METHODS
    // --------------------------------------------------------------------------

    @PluginMethod
    public void start(PluginCall call) {
        String language = call.getString("language", "pt-BR");
        boolean partialResults = call.getBoolean("partialResults", true);
        boolean continuous = call.getBoolean("continuous", false);

        this.currentLocale = language;
        this.partialResultsEnabled = partialResults;
        this.continuousMode = continuous;
        this.consecutiveErrors = 0;
        this.previousPartialText = "";

        Log.i(TAG, "start() language=" + language + " partial=" + partialResults + " continuous=" + continuous);

        mainHandler.post(() -> {
            ensureRecognizer();
            beginListening();
        });

        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        Log.i(TAG, "stop()");
        this.continuousMode = false;

        mainHandler.post(() -> {
            cancelPendingRestarts();
            doStop();
        });

        call.resolve();
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        boolean available = SpeechRecognizer.isRecognitionAvailable(getContext());
        JSObject ret = new JSObject();
        ret.put("available", available);
        call.resolve(ret);
    }

    // --------------------------------------------------------------------------
    // RECOGNIZER LIFECYCLE
    // --------------------------------------------------------------------------

    /**
     * Creates the SpeechRecognizer if it doesn't exist yet.
     * The recognizer is REUSED across sessions — only destroyed on fatal errors.
     */
    private void ensureRecognizer() {
        if (speechRecognizer != null) return;

        if (!SpeechRecognizer.isRecognitionAvailable(getContext())) {
            Log.e(TAG, "SpeechRecognizer not available");
            emitError(SpeechRecognizer.ERROR_CLIENT, "NOT_AVAILABLE", false);
            emitListeningState(false);
            return;
        }

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(getActivity());
        recognitionListener = createListener();
        speechRecognizer.setRecognitionListener(recognitionListener);
        Log.i(TAG, "SpeechRecognizer created");
    }

    /**
     * Starts listening using the current recognizer (no destroy/recreate).
     */
    private void beginListening() {
        if (speechRecognizer == null) {
            Log.e(TAG, "beginListening: recognizer is null");
            emitError(SpeechRecognizer.ERROR_CLIENT, "NO_RECOGNIZER", false);
            emitListeningState(false);
            return;
        }

        try {
            Intent intent = createRecognizerIntent();
            previousPartialText = "";
            speechRecognizer.startListening(intent);
            Log.d(TAG, "startListening() called");
        } catch (Exception e) {
            Log.e(TAG, "beginListening failed: " + e.getMessage(), e);
            emitError(SpeechRecognizer.ERROR_CLIENT, "START_FAILED", continuousMode);
            if (continuousMode) {
                scheduleRestart(1000);
            } else {
                emitListeningState(false);
            }
        }
    }

    /**
     * Creates the Intent with long silence timeouts for extended listening.
     */
    private Intent createRecognizerIntent() {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, currentLocale);
        intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, partialResultsEnabled);
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 5);

        // DICTATION_MODE: keeps recognizer listening through pauses
        intent.putExtra("android.speech.extra.DICTATION_MODE", true);

        // Extended silence timeouts — key to continuous listening
        // These tell the recognizer to wait longer before deciding speech is done
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, SILENCE_TIMEOUT_MS);
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, POSSIBLY_DONE_MS);
        intent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, MIN_LISTEN_MS);

        return intent;
    }

    /**
     * Fast restart: cancel current session and start new one on the SAME recognizer.
     * No destroy/recreate overhead.
     */
    private void fastRestart() {
        if (speechRecognizer == null) {
            ensureRecognizer();
        }
        try {
            speechRecognizer.cancel();
        } catch (Exception e) {
            Log.w(TAG, "cancel() before restart failed: " + e.getMessage());
        }
        // Small delay to let the system breathe between sessions
        mainHandler.postDelayed(this::beginListening, 150);
    }

    /**
     * Full restart: destroy and recreate recognizer (used after ERROR_RECOGNIZER_BUSY).
     */
    private void fullRestart(long delayMs) {
        destroyRecognizer();
        mainHandler.postDelayed(() -> {
            if (continuousMode) {
                ensureRecognizer();
                beginListening();
            }
        }, delayMs);
    }

    private void destroyRecognizer() {
        cancelPendingRestarts();
        if (speechRecognizer != null) {
            try {
                speechRecognizer.cancel();
                speechRecognizer.destroy();
            } catch (Exception e) {
                Log.w(TAG, "destroyRecognizer error: " + e.getMessage());
            }
            speechRecognizer = null;
            recognitionListener = null;
        }
        isListening = false;
    }

    private void doStop() {
        if (speechRecognizer != null) {
            try {
                speechRecognizer.stopListening();
            } catch (Exception ignored) {}
        }
        destroyRecognizer();
        emitListeningState(false);
    }

    // --------------------------------------------------------------------------
    // RECOGNITION LISTENER
    // --------------------------------------------------------------------------

    private RecognitionListener createListener() {
        return new RecognitionListener() {
            @Override
            public void onReadyForSpeech(Bundle params) {
                Log.d(TAG, "onReadyForSpeech");
                isListening = true;
                emitListeningState(true);
            }

            @Override public void onBeginningOfSpeech() {}
            @Override public void onRmsChanged(float rmsdB) {}
            @Override public void onBufferReceived(byte[] buffer) {}

            @Override
            public void onEndOfSpeech() {
                Log.d(TAG, "onEndOfSpeech");
                // Don't emit stopped — wait for onResults or onError
            }

            @Override
            public void onError(int error) {
                Log.w(TAG, "onError: " + error + " (" + getErrorName(error) + ")");
                handleRecognitionError(error);
            }

            @Override
            public void onResults(Bundle results) {
                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (matches != null && !matches.isEmpty()) {
                    Log.i(TAG, "onResults: " + matches.get(0));
                    emitFinalResults(matches);
                }

                // Success resets all error counters
                consecutiveErrors = 0;

                if (continuousMode) {
                    // Fast restart on same recognizer — no gap in listening
                    Log.d(TAG, "Continuous: fast restart");
                    fastRestart();
                } else {
                    isListening = false;
                    emitListeningState(false);
                }
            }

            @Override
            public void onPartialResults(Bundle partialResults) {
                ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (matches != null && !matches.isEmpty()) {
                    String text = matches.get(0);
                    if (!text.equals(previousPartialText)) {
                        previousPartialText = text;
                        emitPartialResults(matches);
                    }
                }
            }

            @Override
            public void onEvent(int eventType, Bundle params) {}
        };
    }

    // --------------------------------------------------------------------------
    // ERROR HANDLING
    // --------------------------------------------------------------------------

    private void handleRecognitionError(int error) {
        consecutiveErrors++;
        boolean tooManyErrors = consecutiveErrors > MAX_CONSECUTIVE_ERRORS;

        if (tooManyErrors) {
            Log.e(TAG, "Too many consecutive errors (" + consecutiveErrors + "). Giving up.");
            emitError(error, getErrorName(error), false);
            destroyRecognizer();
            emitListeningState(false);
            return;
        }

        switch (error) {
            case ERROR_TOO_MANY_REQUESTS: // 10 — Google rate limiting
                long backoff = (long) (2000 * Math.pow(2, Math.min(consecutiveErrors - 1, 4)));
                Log.w(TAG, "Rate limited. Backoff " + backoff + "ms");
                emitError(error, "RATE_LIMITED", continuousMode);
                if (continuousMode) {
                    fullRestart(backoff);
                } else {
                    destroyRecognizer();
                    emitListeningState(false);
                }
                break;

            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: // 8 — needs full recreate
                Log.w(TAG, "Recognizer busy. Full restart in 1s");
                emitError(error, "RECOGNIZER_BUSY", continuousMode);
                if (continuousMode) {
                    fullRestart(1000);
                } else {
                    destroyRecognizer();
                    emitListeningState(false);
                }
                break;

            case SpeechRecognizer.ERROR_NO_MATCH: // 7 — normal in continuous mode
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: // 6 — silence timeout
                // These are expected in continuous mode — just restart quickly
                if (continuousMode) {
                    Log.d(TAG, "Silence/no-match. Fast restart.");
                    // Don't even emit error for these — they're normal
                    fastRestart();
                } else {
                    emitError(error, getErrorName(error), false);
                    destroyRecognizer();
                    emitListeningState(false);
                }
                break;

            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: // 9
                emitError(error, "PERMISSION_DENIED", false);
                destroyRecognizer();
                emitListeningState(false);
                break;

            default: // AUDIO, SERVER, CLIENT, NETWORK, etc.
                emitError(error, getErrorName(error), continuousMode);
                if (continuousMode) {
                    // Try fast restart first; if that fails repeatedly, fullRestart kicks in
                    long delay = 500 + (consecutiveErrors * 300L);
                    Log.w(TAG, "Transient error. Restart in " + delay + "ms (" + consecutiveErrors + "/" + MAX_CONSECUTIVE_ERRORS + ")");
                    fullRestart(delay);
                } else {
                    destroyRecognizer();
                    emitListeningState(false);
                }
                break;
        }
    }

    // --------------------------------------------------------------------------
    // RESTART SCHEDULING
    // --------------------------------------------------------------------------

    private Runnable pendingRestart = null;

    private void scheduleRestart(long delayMs) {
        cancelPendingRestarts();
        pendingRestart = () -> {
            pendingRestart = null;
            if (continuousMode) {
                Log.i(TAG, "Scheduled restart firing...");
                ensureRecognizer();
                beginListening();
            }
        };
        mainHandler.postDelayed(pendingRestart, delayMs);
    }

    private void cancelPendingRestarts() {
        if (pendingRestart != null) {
            mainHandler.removeCallbacks(pendingRestart);
            pendingRestart = null;
        }
    }

    // --------------------------------------------------------------------------
    // EVENT EMITTERS
    // --------------------------------------------------------------------------

    private void emitListeningState(boolean listening) {
        JSObject data = new JSObject();
        data.put("status", listening ? "started" : "stopped");
        notifyListeners(EVENT_LISTENING_STATE, data);
        Log.d(TAG, "emitListeningState: " + (listening ? "started" : "stopped"));
    }

    private void emitPartialResults(ArrayList<String> matches) {
        JSObject data = new JSObject();
        data.put("matches", new JSArray(matches));
        notifyListeners(EVENT_PARTIAL_RESULTS, data);
    }

    private void emitFinalResults(ArrayList<String> matches) {
        JSObject data = new JSObject();
        data.put("matches", new JSArray(matches));
        notifyListeners(EVENT_FINAL_RESULTS, data);
    }

    private void emitError(int errorCode, String message, boolean isRecoverable) {
        JSObject data = new JSObject();
        data.put("errorCode", errorCode);
        data.put("message", message);
        data.put("isRecoverable", isRecoverable);
        notifyListeners(EVENT_RECOGNITION_ERROR, data);
        Log.w(TAG, "emitError: code=" + errorCode + " msg=" + message + " recoverable=" + isRecoverable);
    }

    // --------------------------------------------------------------------------
    // LIFECYCLE
    // --------------------------------------------------------------------------

    @Override
    protected void handleOnPause() {
        Log.d(TAG, "handleOnPause");
        cancelPendingRestarts();
        if (speechRecognizer != null && isListening) {
            try { speechRecognizer.cancel(); } catch (Exception ignored) {}
            isListening = false;
        }
    }

    @Override
    protected void handleOnResume() {
        Log.d(TAG, "handleOnResume: continuousMode=" + continuousMode);
        if (continuousMode) {
            mainHandler.postDelayed(() -> {
                if (continuousMode) {
                    Log.i(TAG, "Resuming continuous recognition");
                    ensureRecognizer();
                    beginListening();
                }
            }, 500);
        }
    }

    @Override
    protected void handleOnDestroy() {
        Log.d(TAG, "handleOnDestroy");
        continuousMode = false;
        cancelPendingRestarts();
        mainHandler.post(this::destroyRecognizer);
    }

    // --------------------------------------------------------------------------
    // HELPERS
    // --------------------------------------------------------------------------

    private String getErrorName(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: return "NETWORK_TIMEOUT";
            case SpeechRecognizer.ERROR_NETWORK: return "NETWORK";
            case SpeechRecognizer.ERROR_AUDIO: return "AUDIO";
            case SpeechRecognizer.ERROR_SERVER: return "SERVER";
            case SpeechRecognizer.ERROR_CLIENT: return "CLIENT";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: return "SPEECH_TIMEOUT";
            case SpeechRecognizer.ERROR_NO_MATCH: return "NO_MATCH";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY: return "RECOGNIZER_BUSY";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: return "INSUFFICIENT_PERMISSIONS";
            case ERROR_TOO_MANY_REQUESTS: return "TOO_MANY_REQUESTS";
            default: return "UNKNOWN(" + error + ")";
        }
    }
}
