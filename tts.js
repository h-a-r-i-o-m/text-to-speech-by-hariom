
        document.addEventListener('DOMContentLoaded', function() {
            const textArea = document.getElementById('textArea');
            const charCount = document.getElementById('charCount');
            const speakBtn = document.getElementById('speakBtn');
            const demoBtn = document.getElementById('demoBtn');
            const pauseBtn = document.getElementById('pauseBtn');
            const stopBtn = document.getElementById('stopBtn');
            const statusEl = document.getElementById('status');
            const rateSlider = document.getElementById('rateSlider');
            const rateValue = document.getElementById('rateValue');
            const volumeSlider = document.getElementById('volumeSlider');
            const volumeValue = document.getElementById('volumeValue');
            const pitchSlider = document.getElementById('pitchSlider');
            const pitchValue = document.getElementById('pitchValue');
            const voiceOptions = document.querySelectorAll('.voice-option');
            const browserWarning = document.getElementById('browserWarning');
            const languageSelect = document.getElementById('languageSelect');
            
            let selectedVoice = 'UK English Male';
            let selectedVoiceIntro = "Hello, I'm a British male voice. It's a pleasure to speak with you.";
            let isSpeaking = false;
            let isPaused = false;
            
            // Initialize char count
            charCount.textContent = textArea.value.length;
            
            // Update character count
            textArea.addEventListener('input', function() {
                charCount.textContent = this.value.length;
            });
            
            // Voice selection
            voiceOptions.forEach(option => {
                option.addEventListener('click', function() {
                    voiceOptions.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedVoice = this.getAttribute('data-voice');
                    selectedVoiceIntro = this.getAttribute('data-intro');
                    updateStatus(`Selected voice: ${this.querySelector('.voice-name').textContent}`);
                    
                    // Play voice introduction
                    playVoiceIntroduction();
                });
            });
            
            // Update slider values
            rateSlider.addEventListener('input', function() {
                rateValue.textContent = this.value;
            });
            
            volumeSlider.addEventListener('input', function() {
                volumeValue.textContent = Math.round(this.value * 100) + '%';
            });
            
            pitchSlider.addEventListener('input', function() {
                pitchValue.textContent = this.value;
            });
            
            // Function to update status message
            function updateStatus(message, isError = false) {
                statusEl.innerHTML = isError ? 
                    `<i class="fas fa-exclamation-circle"></i> ${message}` : 
                    `<i class="fas fa-info-circle"></i> ${message}`;
                
                statusEl.style.color = isError ? '#ed5565' : '#666';
                statusEl.style.background = isError ? '#ffebee' : '#f8f9fa';
            }
            
            // Function to play voice introduction
            function playVoiceIntroduction() {
                if (responsiveVoice.voiceSupport()) {
                    responsiveVoice.speak(selectedVoiceIntro, selectedVoice, {
                        rate: parseFloat(rateSlider.value),
                        volume: parseFloat(volumeSlider.value),
                        pitch: parseFloat(pitchSlider.value),
                        onstart: function() {
                            updateStatus('Playing voice introduction...');
                        },
                        onend: function() {
                            updateStatus('Voice introduction complete.');
                        }
                    });
                } else {
                    // Fallback to browser's speech synthesis
                    speakText(selectedVoiceIntro, true);
                }
            }
            
            // Function to speak text
            function speakText(text, isDemo = false) {
                if (!text.trim()) {
                    updateStatus('Please enter some text to convert to speech.', true);
                    return;
                }
                
                // Stop any ongoing speech
                stopSpeech();
                
                // Use the best available API
                if (responsiveVoice.voiceSupport()) {
                    // Use responsivevoice.js
                    responsiveVoice.speak(text, selectedVoice, {
                        rate: parseFloat(rateSlider.value),
                        volume: parseFloat(volumeSlider.value),
                        pitch: parseFloat(pitchSlider.value),
                        onstart: function() {
                            isSpeaking = true;
                            isPaused = false;
                            if (!isDemo) {
                                updateStatus('<span class="pulse"></span>Speaking...');
                                speakBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
                                speakBtn.classList.add('btn-danger');
                                speakBtn.classList.remove('btn-primary');
                            }
                        },
                        onend: function() {
                            isSpeaking = false;
                            if (!isDemo) {
                                updateStatus('Speech finished.');
                                speakBtn.innerHTML = '<i class="fas fa-play"></i> Speak';
                                speakBtn.classList.remove('btn-danger');
                                speakBtn.classList.add('btn-primary');
                            }
                        },
                        onerror: function() {
                            isSpeaking = false;
                            updateStatus('Error occurred while trying to speak.', true);
                            speakBtn.innerHTML = '<i class="fas fa-play"></i> Speak';
                            speakBtn.classList.remove('btn-danger');
                            speakBtn.classList.add('btn-primary');
                        }
                    });
                } else if ('speechSynthesis' in window) {
                    // Use browser's speech synthesis
                    const utterance = new SpeechSynthesisUtterance(text);
                    
                    // Try to find a voice that matches our selection
                    const voices = speechSynthesis.getVoices();
                    let voice = voices.find(v => v.name.includes(selectedVoice));
                    
                    if (voice) {
                        utterance.voice = voice;
                    } else {
                        // Fallback to default voice
                        utterance.lang = languageSelect.value === 'auto' ? 'en-US' : languageSelect.value;
                    }
                    
                    utterance.rate = parseFloat(rateSlider.value);
                    utterance.volume = parseFloat(volumeSlider.value);
                    utterance.pitch = parseFloat(pitchSlider.value);
                    
                    utterance.onstart = function() {
                        isSpeaking = true;
                        isPaused = false;
                        if (!isDemo) {
                            updateStatus('<span class="pulse"></span>Speaking...');
                            speakBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
                            speakBtn.classList.add('btn-danger');
                            speakBtn.classList.remove('btn-primary');
                        }
                    };
                    
                    utterance.onend = function() {
                        isSpeaking = false;
                        if (!isDemo) {
                            updateStatus('Speech finished.');
                            speakBtn.innerHTML = '<i class="fas fa-play"></i> Speak';
                            speakBtn.classList.remove('btn-danger');
                            speakBtn.classList.add('btn-primary');
                        }
                    };
                    
                    utterance.onerror = function() {
                        isSpeaking = false;
                        updateStatus('Error occurred while trying to speak.', true);
                        speakBtn.innerHTML = '<i class="fas fa-play"></i> Speak';
                        speakBtn.classList.remove('btn-danger');
                        speakBtn.classList.add('btn-primary');
                    };
                    
                    speechSynthesis.speak(utterance);
                } else {
                    updateStatus('Your browser does not support speech synthesis.', true);
                }
            }
            
            // Function to play demo
            function playDemo() {
                const demoText = "Hello! This is a demonstration of the selected voice. You can use this text to speech converter to read any text content in any language.";
                speakText(demoText, true);
                updateStatus('Playing voice demo...');
            }
            
            // Function to pause speech
            function pauseSpeech() {
                if (isSpeaking && !isPaused) {
                    if (responsiveVoice.voiceSupport()) {
                        responsiveVoice.pause();
                    } else if ('speechSynthesis' in window) {
                        window.speechSynthesis.pause();
                    }
                    isPaused = true;
                    updateStatus('Speech paused.');
                    pauseBtn.innerHTML = '<i class="fas fa-redo"></i> Resume';
                } else if (isPaused) {
                    if (responsiveVoice.voiceSupport()) {
                        responsiveVoice.resume();
                    } else if ('speechSynthesis' in window) {
                        window.speechSynthesis.resume();
                    }
                    isPaused = false;
                    updateStatus('Resuming speech...');
                    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                }
            }
            
            // Function to stop speech
            function stopSpeech() {
                if (isSpeaking || isPaused) {
                    if (responsiveVoice.voiceSupport()) {
                        responsiveVoice.cancel();
                    } else if ('speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                    }
                    isSpeaking = false;
                    isPaused = false;
                    updateStatus('Speech stopped.');
                    speakBtn.innerHTML = '<i class="fas fa-play"></i> Speak';
                    speakBtn.classList.remove('btn-danger');
                    speakBtn.classList.add('btn-primary');
                    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                }
            }
            
            // Event listeners
            speakBtn.addEventListener('click', () => {
                if (isSpeaking) {
                    stopSpeech();
                } else {
                    speakText(textArea.value);
                }
            });
            
            demoBtn.addEventListener('click', playDemo);
            pauseBtn.addEventListener('click', pauseSpeech);
            stopBtn.addEventListener('click', stopSpeech);
            
            // Check browser compatibility
            if (!window.speechSynthesis && !responsiveVoice.voiceSupport()) {
                browserWarning.style.display = 'flex';
                updateStatus('Your browser has limited speech synthesis support. Some features may not work properly.', true);
            }
            
            // Initialize with a sample text
            updateStatus('Ready to speak. Type your text or click Demo to test a voice.');
        });
  