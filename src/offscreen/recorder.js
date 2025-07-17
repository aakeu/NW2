// // src/offscreen/recorder.js
// // This script runs in the offscreen document (offscreen/recorder.html)
// // offscreen/recorder.js
// console.log("UnifiedMeetingSummarizer: Offscreen recorder.js script loaded.");

// let mediaRecorder = null;
// let recordedBlobs = [];
// let mediaStream = null;
// let audioContext = null;
// let mediaStreamSource = null;

// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//   if (message.target !== 'offscreen') return;

//   console.log("Offscreen received message:", message.type);

//   if (message.type === 'startRecording') {
//     console.log('Offscreen: Starting tab audio recording...');
//     const { streamId, duration } = message.data;

//     if (mediaRecorder && mediaRecorder.state !== 'inactive') {
//       console.warn("Offscreen: Stopping previous recorder before starting new one.");
//       mediaRecorder.stop();
//       if (mediaStream) {
//         mediaStream.getTracks().forEach(track => track.stop());
//       }
//       if (audioContext) {
//         audioContext.close();
//       }
//     }

//     recordedBlobs = [];

//     try {
//       console.log("Offscreen: Attempting to get media stream for tab capture with streamId:", streamId);
//       mediaStream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           mandatory: {
//             chromeMediaSource: 'tab',
//             chromeMediaSourceId: streamId
//           }
//         }
//       });
//       console.log("Offscreen: Successfully got MediaStream:", mediaStream);

//       const audioTracks = mediaStream.getAudioTracks();
//       if (audioTracks.length === 0) {
//         const errorMessage = "Offscreen: MediaStream has NO audio tracks for tab capture. Cannot record.";
//         console.error(errorMessage);
//         chrome.runtime.sendMessage({ action: 'recordingError', error: errorMessage });
//         if (mediaStream) {
//           mediaStream.getTracks().forEach(track => track.stop());
//         }
//         return;
//       }

//       console.log("Offscreen: Creating AudioContext and connecting stream.");
//       audioContext = new AudioContext();
//       mediaStreamSource = audioContext.createMediaStreamSource(mediaStream);
//       mediaStreamSource.connect(audioContext.destination);
//       console.log("Offscreen: AudioContext connected.");

//       const mimeType = 'audio/webm;codecs=opus';
//       if (!MediaRecorder.isTypeSupported(mimeType)) {
//         const errorMessage = `Offscreen: MediaRecorder does NOT support ${mimeType}.`;
//         console.error(errorMessage);
//         chrome.runtime.sendMessage({ action: 'recordingError', error: errorMessage });
//         if (mediaStream) {
//           mediaStream.getTracks().forEach(track => track.stop());
//         }
//         if (audioContext) {
//           audioContext.close();
//         }
//         return;
//       }

//       mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
//       console.log("Offscreen: MediaRecorder created. Initial state:", mediaRecorder.state);

//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data && event.data.size > 0) {
//           recordedBlobs.push(event.data);
//           console.log("Offscreen: ondataavailable event received. Chunk size:", event.data.size);
//         } else {
//           console.warn("Offscreen: ondataavailable event received, but data is empty or null.");
//         }
//       };

//       mediaRecorder.onerror = (event) => {
//         console.error('Offscreen: MediaRecorder ERROR:', event.error);
//         chrome.runtime.sendMessage({ action: 'recordingError', error: `Tab Recorder Error: ${event.error.name}` });
//         if (mediaStream) {
//           mediaStream.getTracks().forEach(track => track.stop());
//         }
//         if (audioContext) {
//           audioContext.close();
//         }
//         if (mediaStreamSource) {
//           mediaStreamSource.disconnect();
//         }
//         recordedBlobs = null;
//         mediaRecorder = null;
//         mediaStream = null;
//         audioContext = null;
//         mediaStreamSource = null;
//       };

//       mediaRecorder.onstop = async () => {
//         console.log("Offscreen: MediaRecorder STOPPED. Final state:", mediaRecorder.state);
//         if (mediaStream) {
//           mediaStream.getTracks().forEach(track => track.stop());
//           console.log("Offscreen: MediaStream tracks stopped.");
//         }
//         if (audioContext) {
//           audioContext.close();
//           console.log("Offscreen: AudioContext closed.");
//         }
//         if (mediaStreamSource) {
//           mediaStreamSource.disconnect();
//           console.log("Offscreen: MediaStreamSource disconnected.");
//         }

//         if (recordedBlobs.length === 0) {
//           console.warn("Offscreen: No audio data was collected.");
//           chrome.runtime.sendMessage({ action: 'recordingError', error: 'No tab audio data captured.' });
//           return;
//         }

//         const blob = new Blob(recordedBlobs, { type: mimeType });
//         console.log("Offscreen: Created Blob from recorded data. Size:", blob.size);

//         const base64 = await new Promise((resolve, reject) => {
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             if (reader.result) {
//               resolve(reader.result.split(',')[1]);
//             } else {
//               reject(new Error("FileReader result is null or empty."));
//             }
//           };
//           reader.onerror = () => reject(new Error(`FileReader error: ${reader.error.name}`));
//           reader.readAsDataURL(blob);
//         });

//         console.log("Offscreen: Sending base64 tab audio to background script.");
//         try {
//           await chrome.runtime.sendMessage({
//             action: 'tabAudioRecorded',
//             audioBase64: base64
//           });
//           console.log("Offscreen: Successfully sent tab audio to background script.");
//         } catch (error) {
//           console.error("Offscreen: Error sending tab audio to background script:", error);
//           chrome.runtime.sendMessage({ action: 'recordingError', error: `Failed to send tab recording: ${error.message}` });
//         }

//         recordedBlobs = null;
//         mediaRecorder = null;
//         mediaStream = null;
//         audioContext = null;
//         mediaStreamSource = null;
//       };

//       mediaRecorder.start(10); // Start with 10ms timeslice
//       console.log("Offscreen: MediaRecorder start() called. Current state:", mediaRecorder.state);

//       setTimeout(() => {
//         if (mediaRecorder && mediaRecorder.state === 'recording') {
//           console.log("Offscreen: Timeout reached. Stopping MediaRecorder.");
//           mediaRecorder.stop();
//         }
//       }, duration);

//       sendResponse({ status: 'recording_started' });
//     } catch (error) {
//       console.error('Offscreen: Error in getUserMedia or MediaRecorder setup:', error);
//       chrome.runtime.sendMessage({ action: 'recordingError', error: `Offscreen tab recording setup failed: ${error.message}` });
//       if (mediaStream) {
//         mediaStream.getTracks().forEach(track => track.stop());
//       }
//       if (audioContext) {
//         audioContext.close();
//       }
//       if (mediaStreamSource) {
//         mediaStreamSource.disconnect();
//       }
//       recordedBlobs = null;
//       mediaRecorder = null;
//       mediaStream = null;
//       audioContext = null;
//       mediaStreamSource = null;
//     }

//     return true;
//   }

//   if (message.type === 'stopRecording') {
//     console.log("Offscreen: Received stopRecording message.");
//     if (mediaRecorder && mediaRecorder.state === 'recording') {
//       mediaRecorder.stop();
//       console.log("Offscreen: Recorder stopped via message.");
//     } else {
//       console.log("Offscreen: MediaRecorder not active, no need to stop.");
//     }
//     sendResponse({ status: 'recording_stopped' });
//     return true;
//   }
// });



// src/offscreen/recorder.js
console.log("UnifiedMeetingSummarizer: Offscreen recorder.js loaded.");

let recorder = null;
let audioChunks = [];

// Listen for messages from background.js
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    // Log and only act if this message is intended for the offscreen document
    console.log("Offscreen received message:", message);

    if (message.target !== 'offscreen') return;

    // ---- Start Tab Recording ----
    if (message.type === 'startRecording') {
        console.log('Offscreen: Starting tab audio recording...');
         console.log("Offscreen: startRecording received, streamId:", message.data.streamId);
        const { streamId, duration } = message.data;

          console.log("Offscreen: streamId received for tab recording:", streamId);
        try {
            // Get the tab's audio using the provided streamId
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    mandatory: {
                        chromeMediaSource: 'tab',
                        chromeMediaSourceId: streamId
                    }
                }
            });

            recorder = new MediaRecorder(stream);
            audioChunks = [];
            console.log("Offscreen: MediaRecorder created for tab audio");

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                console.log('Offscreen: Tab audio recording stopped, preparing to send base64 audio...');
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64Audio = reader.result.split(',')[1];
                    chrome.runtime.sendMessage({
                        action: 'tabAudioRecorded',
                        audioBase64: base64Audio
                    });
                    console.log("Offscreen: Sent tabAudioRecorded back to background.", base64Audio.length);
                    recorder = null;
                    audioChunks = [];
                };
                reader.readAsDataURL(blob);
            };

            recorder.start();
            console.log('Offscreen: MediaRecorder started for tab audio');
            console.log('Offscreen: Recorder will auto-stop in', duration, 'ms');

            if (duration) {
                setTimeout(() => {
                    if (recorder && recorder.state !== 'inactive') {
                        recorder.stop();
                        console.log('Offscreen: Auto-stopping tab audio after duration.');
                    }
                }, duration);
            }
            sendResponse({ status: 'recording_started' });
        } catch (err) {
            console.error('Offscreen: Failed to start recording', err);
            chrome.runtime.sendMessage({
                action: 'recordingError',
                error: err.message
            });
            alert("Offscreen recording error: " + err.message);
            sendResponse({ status: 'error', error: err.message });
        }
        return true; // For async sendResponse
    }

    // ---- Stop Tab Recording ----
    if (message.type === 'stopRecording') {
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
            console.log('Offscreen: Recorder stopped via message.');
        } else {
            console.warn('Offscreen: Recorder was already inactive or not started.');
        }
        sendResponse({ status: 'recording_stopped' });
        return true;
    }
});
