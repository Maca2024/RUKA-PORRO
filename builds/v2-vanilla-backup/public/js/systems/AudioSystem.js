/**
 * AI Academy - Audio System
 * Procedural ambient sounds + per-world configuration
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.audioSources = {};
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        const initAudioContext = () => {
            if (this.initialized) return;
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this._createAmbientSounds();
                this.initialized = true;
                document.removeEventListener('click', initAudioContext);
                document.removeEventListener('keydown', initAudioContext);
            } catch (e) {
                console.warn('Audio not supported:', e);
            }
        };

        document.addEventListener('click', initAudioContext);
        document.addEventListener('keydown', initAudioContext);
    }

    _createAmbientSounds() {
        if (!this.audioContext) return;

        // Wind
        const windGain = this.audioContext.createGain();
        windGain.gain.value = 0.15;
        windGain.connect(this.audioContext.destination);

        const windFilter = this.audioContext.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.value = 400;
        windFilter.connect(windGain);

        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const windNoise = this.audioContext.createBufferSource();
        windNoise.buffer = noiseBuffer;
        windNoise.loop = true;
        windNoise.connect(windFilter);
        windNoise.start();

        this.audioSources.wind = { source: windNoise, gain: windGain, filter: windFilter };

        // Bird chirps
        this._scheduleBirdSounds();

        // Water
        const waterGain = this.audioContext.createGain();
        waterGain.gain.value = 0;
        waterGain.connect(this.audioContext.destination);

        const waterFilter = this.audioContext.createBiquadFilter();
        waterFilter.type = 'bandpass';
        waterFilter.frequency.value = 800;
        waterFilter.Q.value = 0.5;
        waterFilter.connect(waterGain);

        const waterNoise = this.audioContext.createBufferSource();
        waterNoise.buffer = noiseBuffer;
        waterNoise.loop = true;
        waterNoise.connect(waterFilter);
        waterNoise.start();

        this.audioSources.water = { source: waterNoise, gain: waterGain };
    }

    _scheduleBirdSounds() {
        if (!this.audioContext || !this.initialized) return;

        const playBirdChirp = () => {
            if (!this.audioContext || this.audioContext.state === 'closed') return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800 + Math.random() * 1200, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400 + Math.random() * 800, this.audioContext.currentTime + 0.1);

            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.15);

            setTimeout(playBirdChirp, 2000 + Math.random() * 8000);
        };

        setTimeout(playBirdChirp, 1000 + Math.random() * 3000);
    }

    update(playerPosition, playerVelocity, isSprinting, lakes) {
        if (!this.initialized || !this.audioSources.wind) return;

        const playerSpeed = Math.sqrt(playerVelocity.x ** 2 + playerVelocity.z ** 2);
        const heightFactor = Math.min(1, playerPosition.y / 50);
        const windVolume = 0.1 + heightFactor * 0.15 + playerSpeed * 0.01;
        this.audioSources.wind.gain.gain.setTargetAtTime(
            Math.min(0.4, windVolume), this.audioContext.currentTime, 0.3
        );

        this.audioSources.wind.filter.frequency.setTargetAtTime(
            isSprinting ? 600 : 350, this.audioContext.currentTime, 0.2
        );

        if (this.audioSources.water && lakes) {
            let nearWater = false;
            for (const lake of lakes) {
                const dist = Math.sqrt(
                    (playerPosition.x - lake.x) ** 2 + (playerPosition.z - lake.z) ** 2
                );
                if (dist < lake.radius * 1.5) {
                    const waterVolume = Math.max(0, 1 - dist / (lake.radius * 1.5)) * 0.2;
                    this.audioSources.water.gain.gain.setTargetAtTime(
                        waterVolume, this.audioContext.currentTime, 0.5
                    );
                    nearWater = true;
                    break;
                }
            }
            if (!nearWater) {
                this.audioSources.water.gain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);
            }
        }
    }
}

window.AudioSystem = AudioSystem;
export { AudioSystem };
