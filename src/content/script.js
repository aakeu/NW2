chrome.storage.local.get('sidebarState', (result) => {
  if (result.sidebarState === 'open') {
    toggleSidebar()
  }
})

function toggleSidebar() {
  const existingSidebar = document.getElementById('extension-sidebar')
  if (existingSidebar) {
    document.body.style.marginRight = '0'
    existingSidebar.remove()
  } else {
    const sidebarWidth = 400
    const sidebarHTML = `
        <div id="extension-sidebar" style="position:fixed;top:0;right:0;width:${sidebarWidth}px;height:100%;background-color:#f1f1f1;z-index:1000;box-shadow:-2px 0 5px rgba(0,0,0,0.1);">
          <div id="extension-sidebar-content" style="padding:10px;overflow-y:auto;height:100%;position:relative;">
            <button id="close-sidebar" style="position:absolute;top:10px;right:10px;background-color:red;color:white;border:none;border-radius:3px;cursor:pointer;padding:5px;">X</button>
            <h1 style="text-align:center;color:#007bff;margin-top:30px;">Bookmark Your Tabs</h1>
            <ul id="bookmark-list" style="list-style-type:none;padding:0;"></ul>
            <div id="resizer" style="position:absolute;width:10px;height:100%;top:0;left:-10px;cursor:ew-resize;"></div>
          </div>
        </div>
      `
    document.body.insertAdjacentHTML('beforeend', sidebarHTML)
    document.body.style.marginRight = `${sidebarWidth}px`

    const closeSidebarBtn = document.getElementById('close-sidebar')
    closeSidebarBtn.addEventListener('click', () => {
      chrome.storage.local.set({ sidebarState: 'closed' })
      document.body.style.marginRight = '0'
      document.getElementById('extension-sidebar').remove()
    })

    const resizer = document.getElementById('resizer')
    resizer.addEventListener('mousedown', initResize, false)

    function initResize(e) {
      window.addEventListener('mousemove', resize, false)
      window.addEventListener('mouseup', stopResize, false)
    }

    function resize(e) {
      const newWidth = window.innerWidth - e.clientX
      document.getElementById('extension-sidebar').style.width = newWidth + 'px'
      document.body.style.marginRight = newWidth + 'px'
    }

    function stopResize(e) {
      window.removeEventListener('mousemove', resize, false)
      window.removeEventListener('mouseup', stopResize, false)
    }

    chrome.runtime.sendMessage({ action: 'fetchTabs' })
  }
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'populateTabs') {
    const bookmarkList = document.getElementById('bookmark-list')
    message.tabs.forEach((tab) => {
      const listItem = document.createElement('li')
      listItem.textContent = tab.title
      listItem.style =
        'background-color:#fff;margin:10px 0;padding:10px;border-radius:4px;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1);'
      listItem.addEventListener('click', () => {
        chrome.bookmarks.create({ title: tab.title, url: tab.url })
      })
      bookmarkList.appendChild(listItem)
    })
  }
})


function readGoogleSearchResults() {
  function extractQuery() {
    const url = window.location.href;
    let isGoogle = url.includes('google.com/search');
    let isGoogleScholar = url.includes('scholar.google.com');

    if (isGoogle || isGoogleScholar) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const searchQuery = urlParams.get('q');
      if (searchQuery) {
        const result = {
          searchQuery,
          url,
          isGoogle,
          isGoogleScholar,
          isUsed: false,
          dateAdded: new Date().toISOString(),
        };
        chrome.runtime.sendMessage(
          { action: 'latestNewQuery', data: result },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
            }
          },
        );
      }
    }
  }

  window.addEventListener('load', extractQuery);

  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      extractQuery();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

readGoogleSearchResults();


async function addElement() {
  const wrapper = document.createElement('qsp-mini-app');
  const imageUrl = chrome.runtime.getURL('images/quicksearchIcon.svg');
  const btnTop = await chrome.storage.local.get(['positionY', 'side', 'movedBefore'])

  const shadow = wrapper.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    .main-btn {
      display: flex;
      align-items: center;
      position: fixed;
      border: none;
      right: 0;
      z-index: 999999;
      padding: 8px 10px;
      background: #fff;
      border-radius: 9999px 0 0 9999px;
      cursor: pointer; 
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease-in-out;
    }

    .main-btn.m-on-left {
      left: 0;
      right: auto;
      padding-left: 10px;
      padding-right: auto;
      border-radius: 0 9999px 9999px 0;
    }

    .main-rounded {
      display: flex;
      align-items: center;
      position: fixed;
      border: none;
      z-index: 999999;
      padding: 8px;
      background: #fff;
      border-radius: 50%;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease-in-out;
    }

    .main-rounded img {
      width: 20px;
      height: 20px;
    }

    .main-btn:hover {
      padding-left: 14px;
      padding-right: 14px;
    }

    .main-btn:hover .close-btn {
      display: block;
    }

    .main-btn img {
      width: 20px;
      height: 20px;
    }

    .close-btn {
      position: absolute;
      bottom: -2px;
      left: -2px;
      background: red;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 10px;
      width: 16px;
      height: 16px;
      display: none;
      text-align: center;
      cursor: pointer;
      padding: 0; 
    }

    .close-btn.b-on-left {
      left: auto;
      right: -2px;
    }

    .confirm-box {
      padding: 12px;
      position: absolute;
      bottom: 100%;
      font-family: poppins;
      color: grey;
      right: 50%;
      width: auto;
      border: none;
      outline: none;
      white-space: nowrap;
      display: none;
      align-items: start;
      flex-direction: column;
      background: #fff;
      z-index: 999999999;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      gap: 12px;
    }
    
    .confirm-box.c-on-left {
      right: auto;
      left: 50%;
    }
  `;

  const mainButton = document.createElement('button');
  const closeBtn = document.createElement('button');
  const confirmBox = document.createElement('div');

  // Handle mainButton
  mainButton.className = btnTop && btnTop.side === 'left' ? 'main-btn m-on-left' : 'main-btn';
  mainButton.style.top = btnTop && btnTop.movedBefore ? `${btnTop.positionY}px` : 'auto'
  mainButton.style.bottom = btnTop && btnTop.movedBefore ? `auto` : '150px'

  mainButton.innerHTML = `<img src="${imageUrl}" alt="search icon" />`;
  mainButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggle_sidebar' });
  });

  // Handle closebtn
  closeBtn.className = btnTop && btnTop.side === 'left' ? 'close-btn b-on-left' : 'close-btn';
  closeBtn.textContent = '×';  
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    confirmBox.style.display = 'flex'
    confirmBox.focus()
  });

  // Handle confirm box
  confirmBox.tabIndex = 0;
  confirmBox.onblur = () => confirmBox.style.display = 'none';
  confirmBox.className = btnTop && btnTop.side === 'left' ? 'confirm-box c-on-left' : 'confirm-box';
  confirmBox.innerHTML = `
    <span class='disable-site' >Disable on this site</span>
    <span class='disable-all' >Disable on all site</span>
  `;

  // Handle events
  const disableThisSite = confirmBox.querySelector('.disable-site');
  disableThisSite.addEventListener('click', (e) => {
    e.stopPropagation();

    confirmBox.style.display = 'none'
    wrapper.remove() // remove qsp-mini-app
  });

  const disableAllSites = confirmBox.querySelector('.disable-all');
  disableAllSites.addEventListener('click', (e) => {
    e.stopPropagation();

    chrome.storage.local.set({ buttonDisabledGlobally: true });
    confirmBox.style.display = 'none'
    wrapper.remove() // remove qsp-mini-app
  });

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let positionX = 0;
  let positionY = 0;

  mainButton.addEventListener('mousedown', (e) => {
    e.preventDefault();

    isDragging = true;
    const rect = mainButton.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    positionX = e.clientX - offsetX;
    positionY = e.clientY - offsetY;
    
    mainButton.style.position = 'fixed';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    if(!btnTop.movedBefore){
      chrome.storage.local.set({movedBefore: true})
    }


    mainButton.className = 'main-rounded';
    positionX = e.clientX - offsetX;
    positionY = e.clientY - offsetY;

    mainButton.style.left = `${e.clientX - offsetX}px`;
    mainButton.style.top = `${e.clientY - offsetY}px`;
    mainButton.style.right = 'auto'; // Reset right to allow manual positioning
    mainButton.style.bottom = 'auto';
    mainButton.style.cursor = 'move';
  });

  window.addEventListener('mouseup', () => {
    if(!isDragging) return;

    isDragging = false;
    mainButton.style.cursor = 'pointer';
    mainButton.style.left = `auto`;
    const centerX = window.innerWidth / 2;

    if (positionX < centerX) {
      mainButton.className = 'main-btn m-on-left';
      closeBtn.className = 'close-btn b-on-left';
      confirmBox.className = 'confirm-box c-on-left';
      
      chrome.storage.local.set({ positionY, side: 'left' });
    } else {
      mainButton.style.right = '0';
      mainButton.className = 'main-btn';
      closeBtn.className = 'close-btn';
      confirmBox.className = 'confirm-box';

      chrome.storage.local.set({ positionY, side: 'right' });
    }

    window.onmouseup = null;
    window.onmousemove = null;
  });

  shadow.appendChild(style);
  mainButton.appendChild(closeBtn)
  mainButton.appendChild(confirmBox)
  shadow.appendChild(mainButton);
  document.documentElement.appendChild(wrapper);
}

// ReEnable it on the site on reload
chrome.storage.local.set({ disabledSites: [] });

// Run only if not disabled
chrome.storage.local.get(['displayType', 'buttonDisabledGlobally'], (res) => {
  const globallyDisabled = res.buttonDisabledGlobally;

  if (res.displayType === 'sidebar' && !globallyDisabled) {
    addElement();
  }
});



//video summary

// src/content/script.js
// ================= Video Summary Content Script =================
console.log("UnifiedMeetingSummarizer: content script loaded");

let userMediaRecorder = null;
let userMediaAudioChunks = [];
let recordingTimeoutId = null;

// ========== STEP 1: Detect Active Meeting Platform ==========
function checkMeetingPlatform() {
    const url = window.location.href;
    const isGoogleMeetActive = /meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(url);
    const isZoomActive = url.includes("zoom.us/j/");
    const isTeamsActive = url.includes("teams.microsoft.com/l/meetup/");
    if (isGoogleMeetActive || isZoomActive || isTeamsActive) {
        console.log("Meeting detected, showing summary prompt.");
        showSummaryPrompt();
    } else {
        removeSummaryPrompt();
        removeClickExtensionPrompt();
    }
}

// ========== STEP 2: UI Prompt Functions ==========
function showSummaryPrompt() {
    if (document.getElementById("summaryPrompt") || document.getElementById("clickExtensionPrompt")) return;

    const promptDiv = document.createElement("div");
    promptDiv.id = "summaryPrompt";
    promptDiv.style = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #fff;
        border: 2px solid #333;
        padding: 15px;
        z-index: 9999;
        border-radius: 5px;
        font-family: sans-serif;
        color: #333;
    `;
    promptDiv.innerHTML = `
        <p><strong>Would you like a summary of this meeting?</strong></p>
        <button id="startSummary" style="margin-right: 10px;">Yes, Start Summary</button>
        <button id="cancelSummary">No</button>
        <p id="errorMessage" style="color: red; display: none;"></p>
    `;
    document.body.appendChild(promptDiv);

    // document.getElementById("startSummary").addEventListener("click", () => {
    //     promptDiv.remove();
    //     showClickExtensionPrompt();
    //     chrome.runtime.sendMessage({ action: "userIntendsToSummarize" });
    // });

    document.getElementById("startSummary").addEventListener("click", () => {
    promptDiv.remove();
    // Start mic (host audio) immediately:
    startUserMediaRecording();
    // Inform background that summarization is intended:
    chrome.runtime.sendMessage({ action: "userIntendsToSummarize" });
    // Show instructions for opening the extension:
    showClickExtensionPrompt();
});

    document.getElementById("cancelSummary").addEventListener("click", () => {
        promptDiv.remove();
        chrome.runtime.sendMessage({ action: "cancelRecording" });
    });
}

function showClickExtensionPrompt() {
    if (document.getElementById("clickExtensionPrompt")) return;

    const instructionDiv = document.createElement("div");
    instructionDiv.id = "clickExtensionPrompt";
    instructionDiv.style = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #fff;
        border: 2px solid #333;
        padding: 15px;
        z-index: 9999;
        border-radius: 5px;
        font-family: sans-serif;
        color: #333;
        text-align: center;
    `;
    instructionDiv.innerHTML = `
        <p><strong>To proceed:</strong></p>
        <p>Click the extension icon and open the <strong>Meeting Summarizer</strong> side panel</p>
        <p>Then click <strong>"I Agree"</strong></p>
    `;
    document.body.appendChild(instructionDiv);
}

function removeSummaryPrompt() {
    const prompt = document.getElementById("summaryPrompt");
    if (prompt) prompt.remove();
}
function removeClickExtensionPrompt() {
    const prompt = document.getElementById("clickExtensionPrompt");
    if (prompt) prompt.remove();
}

// ========== STEP 3: Microphone Recording ==========
async function startUserMediaRecording() {
    try {
        console.log("Requesting microphone access...");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        userMediaRecorder = new MediaRecorder(stream);
        userMediaAudioChunks = [];

        userMediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                userMediaAudioChunks.push(event.data);
                console.log(`Audio chunk captured: ${event.data.size}`);
            }
        };

        userMediaRecorder.onstop = () => {
            if (userMediaAudioChunks.length === 0) {
                console.warn("No audio data captured from mic.");
                return;
            }
            const audioBlob = new Blob(userMediaAudioChunks, { type: "audio/webm" });
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Audio = reader.result.split(",")[1];
                console.log("Sending mic audio to background...");
                chrome.runtime.sendMessage({ action: "processUserAudio", audioBase64: base64Audio });
            };
            reader.readAsDataURL(audioBlob);
            stream.getTracks().forEach((track) => track.stop());
            window.removeEventListener("beforeunload", handleUnload);
        };

        userMediaRecorder.start();
        console.log("Mic recorder started, will auto-stop in 2 hours");

        // Set max duration (2 hours)
        recordingTimeoutId = setTimeout(() => {
            if (userMediaRecorder && userMediaRecorder.state !== "inactive") {
                userMediaRecorder.stop();
                console.log("Mic recorder stopped by timeout.");
            }
        }, 2 * 60 * 60 * 1000);

        // Add window unload handler so recording doesn't hang on tab close
        window.addEventListener("beforeunload", handleUnload);
    } catch (err) {
        console.error("Mic access failed:", err);
        alert("Mic access failed. Please allow microphone permissions.");
        chrome.runtime.sendMessage({ action: "recordingError", error: "Microphone access failed." });
    }
}

function handleUnload() {
    if (userMediaRecorder && userMediaRecorder.state !== "inactive") {
        clearTimeout(recordingTimeoutId);
        userMediaRecorder.stop();
        console.log("Mic recorder stopped by tab unload.");
    }
    window.removeEventListener("beforeunload", handleUnload);
}

// ========== STEP 4: Listen for Background Requests ==========
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Content script received message:", message);

    if (message.action === "startMicRecording") {
        console.log("Received startMicRecording from background");
        removeClickExtensionPrompt();
        startUserMediaRecording();
        sendResponse({ status: "micRecordingStarted" });
        return true;
    } else if (message.action === "stopAllRecordings") {
        if (userMediaRecorder && userMediaRecorder.state !== "inactive") {
            clearTimeout(recordingTimeoutId);
            userMediaRecorder.stop();
            console.log("Mic recorder stopped via stopAllRecordings");
        }
        window.removeEventListener("beforeunload", handleUnload);
        sendResponse({ status: "userMediaStopped" });
        return true;
    } else if (message.action === "cancelUserIntention") {
        removeSummaryPrompt();
        removeClickExtensionPrompt();
        if (userMediaRecorder && userMediaRecorder.state !== "inactive") {
            userMediaRecorder.stop();
            console.log("User media recorder stopped due to cancellation");
        }
        sendResponse({ status: "userIntentionCancelled" });
        return true;
    } else if (message.action === "recordingStarted") {
        removeClickExtensionPrompt();
        sendResponse({ status: 'promptRemoved' });
        return true;
    }
});

// ========== STEP 5: Initialize ==========
function initContentScript() {
    checkMeetingPlatform();
    let lastUrl = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            checkMeetingPlatform();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}
initContentScript();