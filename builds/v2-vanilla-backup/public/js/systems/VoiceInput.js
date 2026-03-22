/**
 * AI Academy - Voice Input
 * Speech recognition for voice-based interaction
 */

const i18n = window.i18n;

class VoiceInput {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.onResult = null;
        this.onError = null;
        this._initRecognition();
    }

    _initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = i18n.lang === 'nl' ? 'nl-NL' : 'en-US';

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (this.onResult) this.onResult(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (this.onError) this.onError(event.error);
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
        };
    }

    start() {
        if (!this.recognition) return false;
        if (this.isListening) return true;

        // Update language
        this.recognition.lang = i18n.lang === 'nl' ? 'nl-NL' : 'en-US';

        try {
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (e) {
            console.error('Could not start speech recognition:', e);
            return false;
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
}

window.VoiceInput = VoiceInput;
export { VoiceInput };
