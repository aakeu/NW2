export async function tabScreenshotCapture() {
    try {
      const screenshotUrl = await captureTabScreenshot()
  
      return screenshotUrl
    } catch (error) {
      console.error('Error capturing screenshot:', error)
      throw error
    }
  
    function captureTabScreenshot() {
      return new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message)
          } else {
            resolve(dataUrl)
          }
        })
      })
    }
  }
  