let sideBarIsOpen = 0

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const storedData = await chrome.storage.local.get('displayType')

    if (!storedData.displayType) {
      await chrome.storage.local.set({
        displayType: 'sidebar',
      })
    }

    await chrome.storage.local.set({ updateAvailable: true })
    chrome.action.setBadgeText({ text: '' })
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  }
})

chrome.action.onClicked.addListener(async () => {
  try {
    const { displayType } = await chrome.storage.local.get('displayType')

    if (displayType === 'sidebar') {
      const isOpen = await chrome.sidePanel
        .getOptions()
        .then((options) => options.enabled)
      if (!isOpen) {
        await chrome.sidePanel.open({ windowId: null })
      } else {
        await chrome.sidePanel.setOptions({ enabled: false })
      }
    } else {
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 700,
      })
    }
  } catch (error) {
    console.error('Error handling action click:', error)
  }
})

// Handle close from the browser page

chrome.runtime.onConnect.addListener((port) => {
  if(port.name === 'sidepanel'){
    sideBarIsOpen = 1

    port.onDisconnect.addListener(() => {
      sideBarIsOpen = 0
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === 'toggle_sidebar') {
    chrome.storage.local.get('displayType', (result) => {
      if(result.displayType === 'sidebar' && !sideBarIsOpen){
        chrome.sidePanel.open({ windowId: sender.tab.windowId })
        sideBarIsOpen = 1;
      } else if (result.displayType === 'sidebar') {
        chrome.sidePanel.setOptions({ enabled: false })
        sideBarIsOpen = 0;

        chrome.sidePanel.setOptions({
          enabled: true,
          path: 'sidebar.html'
        })
      }
    })

    return true 
  }
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'verifySettings') {
    chrome.storage.local.get('displayType', (result) => {
      sendResponse({ displayType: result.displayType })
    })
    return true 
  }
})

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'latestNewQuery') {
    const { searchQuery, isGoogle, isGoogleScholar, url, isUsed, dateAdded } =
      message.data;

    const queryItem = {
      searchQuery,
      isGoogle,
      isGoogleScholar,
      isUsed,
      dateAdded,
      url,
    };

    const storageKey = isGoogle
      ? 'extractedGoogleQueryDetails'
      : 'extractedScholarQueryDetails';
    chrome.storage.local.set({ [storageKey]: queryItem }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error storing query:', chrome.runtime.lastError);
      } else {
        chrome.runtime.sendMessage({
          action: 'newQueryAvailable',
          data: queryItem,
        });
      }
    });

    sendResponse({ success: true });
  }
});

const trackedTabs = new Map();
const trackedCurrentTab = { tab: null };
let lastUpdate = Date.now();
const MIN_UPDATE_INTERVAL = 180000;

function isValidUrl(url) {
  return !!url && 
         url.trim() !== '' && 
         !url.startsWith('chrome://extensions/') &&
         !url.startsWith('chrome://newtab/')
}

function updateTabList() {
  chrome.tabs.query({}, (tabs) => {
    const newTabs = new Map();
    
    tabs.forEach((tab) => {
      if (tab.url && isValidUrl(tab.url)) {
        if (!newTabs.has(tab.url)) {
          newTabs.set(tab.url, {
            url: tab.url,
            title: tab.title || 'Untitled',
            favicon: tab.favIconUrl || 'icons/icon48.png',
            foundInStore: false
          });
        }
      }
    });
    
    trackedTabs.clear();
    newTabs.forEach((value, key) => trackedTabs.set(key, value));
    
    chrome.runtime.sendMessage({
      type: 'TABS_UPDATE',
      tabs: Array.from(trackedTabs.values())
    }).catch(() => {});
  });
}

function updateCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.url && isValidUrl(activeTab.url)) {
      trackedCurrentTab.tab = {
        url: activeTab.url,
        title: activeTab.title || 'Untitled',
        favicon: activeTab.favIconUrl || 'icons/icon48.png',
        foundInStore: false
      };
    } else {
      trackedCurrentTab.tab = {
        url: null,
        title: "There are no carriers or apps available...",
        favicon: "images/tabScreenshot.svg"
      };
    }
    
    chrome.runtime.sendMessage({
      type: 'CURRENT_TAB_UPDATE',
      tab: trackedCurrentTab.tab
    }).catch(() => {});
  });
}

function conditionalUpdate() {
  const now = Date.now();
  if (now - lastUpdate >= MIN_UPDATE_INTERVAL) {
    updateTabList();
    updateCurrentTab();
    lastUpdate = now;
  }
}

chrome.tabs.onCreated.addListener((tab) => {
  updateTabList()
  if (tab.active) updateCurrentTab();
  lastUpdate = Date.now();
})
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.title || changeInfo.favIconUrl) {
    updateTabList();
    if (tab.active) updateCurrentTab(); 
    lastUpdate = Date.now();
  }
});
chrome.tabs.onRemoved.addListener(() => {
  updateTabList()
  updateCurrentTab();
  lastUpdate = Date.now();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateCurrentTab();
  lastUpdate = Date.now();
});

updateTabList();
updateCurrentTab();
// setInterval(conditionalUpdate, 30000);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TABS') {
    sendResponse({
      tabs: Array.from(trackedTabs.values())
    });
  } else if (message.type === 'GET_THE_CURRENT_TAB') {
    sendResponse({
      tab: trackedCurrentTab.tab
    });
  }
  return true;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'USER_LOGGED_IN' || message.type === 'USER_LOGGED_OUT') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})

let isAuthFlowInProgress = false

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'loginWithGoogle') {
    // console.log("loginWithGoogle")
    if (isAuthFlowInProgress) {
      sendResponse({
        success: false,
        error: 'Authentication flow is already in progress.',
      })
      return true
    }
    isAuthFlowInProgress = true

    fetch(
      `https://quicksearchserver-8ee1999baeab.herokuapp.com/api/auth/google/extension/start`,
      {
        method: 'GET',
      },
    )
      .then((response) => response.json())
      .then((data) => {
        const authUrl = data.authUrl
        // console.log('Auth URL:', authUrl)
        chrome.identity.launchWebAuthFlow(
          {
            url: authUrl,
            interactive: true,
          },
          function (redirectUrl) {
            isAuthFlowInProgress = false
            if (chrome.runtime.lastError) {
              // console.error(
              //   'Error during launchWebAuthFlow:',
              //   chrome.runtime.lastError,
              // )
              sendResponse({
                success: false,
                error: chrome.runtime.lastError.message,
              })
              return
            }

            const urlParams = new URLSearchParams(new URL(redirectUrl).search)
            const code = urlParams.get('code')

            fetch(
              `https://quicksearchserver-8ee1999baeab.herokuapp.com/api/auth/google/extension/redirect?code=${code}`,
              {
                method: 'GET',
              },
            )
              .then((response) => response.json())
              .then(async (data) => {
                if (data.token && data.refreshToken) {
                  chrome.runtime.sendMessage({
                    action: 'loginCompleted',
                    token: data.token,
                    refreshToken: data.refreshToken,
                    user: data.user,
                    tokenExpires: data.tokenExpires,
                    isNewUser: data.isNewUser || false,
                  })
                } else if (
                  data.message === 'Google Authentication Failed' &&
                  data.error === 'Http Exception'
                ) {
                  chrome.runtime.sendMessage({
                    action: 'needLoginViaEmailAndPassword',
                    provider: 'email',
                  })
                } else {
                  chrome.runtime.sendMessage({
                    action: 'loginFailed',
                    error: 'Failed to get tokens from server',
                  })
                }
              })
              .catch((error) => {
                console.error('Error fetching redirect URL:', error)
                sendResponse({ success: false, error: error.message })
              })
          },
        )
      })
      .catch((error) => {
        console.error('Error fetching OAuth start URL:', error)
        sendResponse({ success: false, error: error.message })
      })
  }
  return true
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FOLDERS_FETCHED') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BOOKMARK_DETAILS_FETCHED') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_HOME_SECTION') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_CURRENT_TAB_SECTION') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_ALL_TABS_SECTION') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_GPT_SECTION') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_PROFILE_SECTION') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_STORED_DATA') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'USER_STATUS_FETCHED') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GPT_STORED') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_COLLECTIONS') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_FAVORITES') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_LINKS') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_IMAGES') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_VIDEOS') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_ARTICLES') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_SETTINGS') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_HELPCENTER') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_CARD_DISPLAY') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_DASHBOARD_SECTION_LIST_DISPLAY') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DASHBOARD_COLLECTION_FOLDERS') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DASHBOARD_COLLECTION_ANCESTOR_FOLDERS') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DASHBOARD_COLLECTION_FOLDERS_BOOKMARKS') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DASHBOARD_IMAGE_DETAIL') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DASHBOARD_ARTICLE_DETAIL') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DASHBOARD_VIDEO_DETAIL') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ONBOARDING') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_IN_NEW_TAB') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SELECTED_BOOKMARK_PARENT_NAME') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHAT_GPT_USED') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_STORED_GPT') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO_MAIN_GPT_SECTION') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO__GPT_TRANSLATE_SECTION') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BACK_TO__GPT_OCR_SECTION') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GPT_ACTIVE_DETAILS') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_GPT_DATA') {
    chrome.runtime.sendMessage(message)
  }
  sendResponse({ success: true })
})
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadImage') {
    downloadImage(request.url)
  }
  sendResponse({ success: true })
})

function downloadImage(url, filename) {
  chrome.downloads.download(
    {
      url: url,
      filename: filename,
      saveAs: true,
    },
    function (downloadId) {
      console.log(`Download initiated with ID: ${downloadId}`)
    },
  )
}




//video meeting
// src/background/background.js
// background.js
// ================= Existing Imports and Setup =================
console.log("QuickSearchPlus: background.js loaded");

// ========== Global States ==========
const OFFSCREEN_DOCUMENT_PATH = 'offscreen/recorder.html';

let isRecording = false;
let userMediaAudioBase64 = null;
let tabAudioBase64 = null;
let recordingError = null;

const recordingDurationMs = 2 * 60 * 60 * 1000; // 2 hours

// ========== Utilities ==========

async function setupOffscreenDocument() {
    const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
    const contexts = await chrome.runtime.getContexts({});
    const exists = contexts.some(
        c => c.contextType === 'OFFSCREEN_DOCUMENT' && c.documentUrl === offscreenUrl
    );
    if (!exists) {
        await chrome.offscreen.createDocument({
            url: OFFSCREEN_DOCUMENT_PATH,
            reasons: ['USER_MEDIA'],
            justification: 'Recording tab audio for meeting summarization.'
        });
        console.log("Background: Offscreen document created.");
    } else {
        console.log("Background: Offscreen document already exists.");
    }
}

async function closeOffscreenDocument() {
    const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
    const contexts = await chrome.runtime.getContexts({});
    const exists = contexts.some(
        c => c.contextType === 'OFFSCREEN_DOCUMENT' && c.documentUrl === offscreenUrl
    );
    if (exists) {
        await chrome.offscreen.closeDocument();
        console.log("Background: Offscreen document closed.");
    }
}

function base64ToBlob(base64, type = 'application/octet-stream') {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type });
}

async function sendToAssemblyAI(audioBlob) {
    const ASSEMBLY_API_KEY = "87c2bf3b211b4a73b23d4d21e64218b4";
    if (!audioBlob || audioBlob.size === 0) throw new Error("No audio blob provided to AssemblyAI.");

    const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
        method: "POST",
        headers: { Authorization: ASSEMBLY_API_KEY },
        body: audioBlob,
    });
    const uploadData = await uploadRes.json();
    if (!uploadData.upload_url) throw new Error(`AssemblyAI Upload failed: ${JSON.stringify(uploadData)}`);

    const transcriptionRes = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
            Authorization: ASSEMBLY_API_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ audio_url: uploadData.upload_url }),
    });
    const transcriptionData = await transcriptionRes.json();
    if (!transcriptionData.id) throw new Error(`AssemblyAI transcription failed: ${JSON.stringify(transcriptionData)}`);

    let transcriptText = "";
    while (true) {
        await new Promise(r => setTimeout(r, 3000));
        const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptionData.id}`, {
            headers: { Authorization: ASSEMBLY_API_KEY }
        });
        const pollData = await pollRes.json();
        if (pollData.status === "completed") {
            transcriptText = pollData.text;
            break;
        } else if (pollData.status === "error") {
            throw new Error(`AssemblyAI error: ${pollData.error}`);
        }
    }
    return transcriptText;
}

async function sendToDeepSeekAPI(transcriptText) {
    const DEEPSEEK_API_KEY = "sk-6ddc6415e9284e2098093e7b4c5a5b3e";
    if (!transcriptText || transcriptText.trim().length === 0) throw new Error("No transcript for DeepSeek summarization.");

    try {
        const summaryRes = await fetch("https://api.deepseek.com/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{
                    role: "user",
                    content: `Summarize the following meeting transcript, focusing on key points, decisions, and actions. Bullet format preferred if possible:\n\n${transcriptText}`
                }],
                max_tokens: 500
            }),
        });
        if (!summaryRes.ok) throw new Error("DeepSeek summary API returned an error.");
        const summaryData = await summaryRes.json();
        return summaryData.choices?.[0]?.message?.content || "No summary generated.";
    } catch (err) {
        console.error("DeepSeek API error:", err);
        throw err;
    }
}

async function processAllAudioAndSummarize() {
    let combinedTranscript = "";
    if (userMediaAudioBase64) {
        const blob = base64ToBlob(userMediaAudioBase64, 'audio/webm');
        try {
            const userTranscript = await sendToAssemblyAI(blob);
            combinedTranscript += `[Speaker A (Host)]: ${userTranscript}\n\n`;
        } catch (err) {
            combinedTranscript += "[Host Transcription Error]\n\n";
        }
    }
    if (tabAudioBase64) {
        const blob = base64ToBlob(tabAudioBase64, 'audio/webm');
        try {
            const tabTranscript = await sendToAssemblyAI(blob);
            combinedTranscript += `[Speaker B (Participants)]: ${tabTranscript}\n\n`;
        } catch (err) {
            combinedTranscript += "[Participants Transcription Error]\n\n";
        }
    }
    if (!combinedTranscript.trim()) throw new Error("No transcript generated from either audio source.");
    return await sendToDeepSeekAPI(combinedTranscript);
}

// ========== Main Listener ==========

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("Background: Received message:", message);

    // 1. Get recording status
    if (message.action === 'getRecordingStatus') {
        sendResponse({ isRecording, error: recordingError });
        return true;
    }

    // 2. Set meeting tab id (after user clicks Yes in meeting page prompt)
    if (message.action === 'userIntendsToSummarize') {
        await chrome.storage.local.set({ currentMeetingTabId: sender.tab.id });
        sendResponse({ status: 'userIntentionReceived' });
        return true;
    }

    // 3. Start mic/host audio only (from content script, after Yes)
    if (message.action === 'processUserAudio' && message.audioBase64) {
        userMediaAudioBase64 = message.audioBase64;
        console.log("Background: Received host (mic) audio, length:", message.audioBase64.length);
        sendResponse({ status: "User audio received" });
        return true;
    }

    // 4. Start tab/participant audio (from sidebar, after I Agree)
    if (message.action === 'startParticipantRecording') {
        const { currentMeetingTabId } = await chrome.storage.local.get('currentMeetingTabId');
        if (!currentMeetingTabId) {
            const errMsg = "No meeting tab available. Please click Yes on the meeting page first.";
            sendResponse({ status: "error", error: errMsg });
            return true;
        }
        try {
            await setupOffscreenDocument(); // always call before sending to offscreen!
            const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: currentMeetingTabId });
            chrome.runtime.sendMessage({
                target: 'offscreen',
                type: 'startRecording',
                data: { streamId, tabId: currentMeetingTabId, duration: recordingDurationMs }
            });
            chrome.runtime.sendMessage({ action: 'recordingStartedUpdate' });
            isRecording = true;
            sendResponse({ status: "participant recording started" });
        } catch (error) {
            sendResponse({ status: "error", error: error.message });
        }
        return true;
    }

    // 5. Receive participant (tab) audio from offscreen
    if (message.action === 'tabAudioRecorded' && message.audioBase64) {
        tabAudioBase64 = message.audioBase64;
        console.log("Background: Received tab (participant) audio, length:", message.audioBase64.length);
        sendResponse({ status: "Tab audio received" });
        return true;
    }

    // 6. Stop both recordings, wait for both blobs, summarize
    if (message.action === "stopRecording") {
        const { currentMeetingTabId } = await chrome.storage.local.get('currentMeetingTabId');

        // Tell content script to stop mic
        if (currentMeetingTabId) {
            try {
                await chrome.tabs.sendMessage(currentMeetingTabId, { action: 'stopAllRecordings' });
            } catch (e) { console.warn("Background: Failed to stop mic audio", e); }
        }
        // Tell offscreen doc to stop tab recording
        try {
            chrome.runtime.sendMessage({ target: 'offscreen', type: 'stopRecording' });
        } catch (e) { console.warn("Background: Failed to stop tab audio", e); }

        isRecording = false;
        recordingError = null;
        await chrome.storage.local.remove('currentMeetingTabId');

        // Wait for both blobs before summarizing
        const waitForBothAudio = async () => {
            let attempts = 0;
            const maxAttempts = 50; // Wait up to 5 seconds
            while ((!userMediaAudioBase64 || !tabAudioBase64) && attempts < maxAttempts) {
                await new Promise(res => setTimeout(res, 100));
                attempts++;
            }
            if (!userMediaAudioBase64 || !tabAudioBase64) {
                const errMsg = "Failed to capture both Host and Participant audio.";
                chrome.storage.local.set({ meetingSummary: errMsg });
                chrome.runtime.sendMessage({ action: 'recordingErrorUpdate', error: errMsg });
                sendResponse({ status: "Error", summary: errMsg });
            } else {
                try {
                    const summary = await processAllAudioAndSummarize();
                    console.log("Meeting Summary:", summary);
                    chrome.storage.local.set({ meetingSummary: summary }, () => {
                        chrome.runtime.sendMessage({ action: 'summarySaved', summary });
                        sendResponse({ status: "Summary saved", summary });
                    });
                } catch (err) {
                    const errMsg = `Error generating summary: ${err.message}`;
                    chrome.storage.local.set({ meetingSummary: errMsg });
                    chrome.runtime.sendMessage({ action: 'recordingErrorUpdate', error: errMsg });
                    sendResponse({ status: "Error", summary: errMsg });
                }
            }
            await closeOffscreenDocument();
        };
        waitForBothAudio();
        return true;
    }

    // 7. Recording error
    if (message.action === 'recordingError') {
        isRecording = false;
        recordingError = message.error;
        chrome.storage.local.set({ meetingSummary: `Recording failed: ${message.error}` });
        const { currentMeetingTabId } = await chrome.storage.local.get('currentMeetingTabId');
        if (currentMeetingTabId) {
            chrome.tabs.sendMessage(currentMeetingTabId, { action: 'cancelUserIntention' }).catch(() => {});
        }
        await closeOffscreenDocument();
        await chrome.storage.local.remove('currentMeetingTabId');
        chrome.runtime.sendMessage({ action: 'recordingErrorUpdate', error: message.error });
        return true;
    }

    // 8. Cancel
    if (message.action === 'cancelRecording' || message.action === 'cancelRecordingFromSidePanel') {
        isRecording = false;
        userMediaAudioBase64 = null;
        tabAudioBase64 = null;
        recordingError = null;
        chrome.storage.local.set({ meetingSummary: "Recording cancelled by user." });
        const { currentMeetingTabId } = await chrome.storage.local.get('currentMeetingTabId');
        if (currentMeetingTabId) {
            chrome.tabs.sendMessage(currentMeetingTabId, { action: 'cancelUserIntention' }).catch(() => {});
        }
        await closeOffscreenDocument();
        chrome.runtime.sendMessage({ action: 'recordingCancelled' });
        await chrome.storage.local.remove('currentMeetingTabId');
        sendResponse({ status: 'cancelled' });
        return true;
    }
});

// Always open the side panel when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});
