import { setChromeStorage } from './utility.tsx'

export const backToHomeSection = async () => {
  await setChromeStorage({ homeSection: true })
  await setChromeStorage({ currentTabSection: false })
  await setChromeStorage({ allTabsSection: false })
  await setChromeStorage({ gptSection: false })
  await setChromeStorage({ dashboardSection: false })
  await setChromeStorage({ profileSection: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_HOME_SECTION' })
  }
}

export const backToCurrentTabSection = async () => {
  await setChromeStorage({ currentTabSection: true })
  await setChromeStorage({ homeSection: false })
  await setChromeStorage({ allTabsSection: false })
  await setChromeStorage({ gptSection: false })
  await setChromeStorage({ dashboardSection: false })
  await setChromeStorage({ profileSection: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_CURRENT_TAB_SECTION' })
  }
}

export const backToAllTabsSection = async () => {
  await setChromeStorage({ allTabsSection: true })
  await setChromeStorage({ homeSection: false })
  await setChromeStorage({ currentTabSection: false })
  await setChromeStorage({ gptSection: false })
  await setChromeStorage({ dashboardSection: false })
  await setChromeStorage({ profileSection: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_ALL_TABS_SECTION' })
  }
}
export const backToGptSection = async () => {
  await setChromeStorage({ gptSection: true })
  await setChromeStorage({ homeSection: false })
  await setChromeStorage({ currentTabSection: false })
  await setChromeStorage({ allTabsSection: false })
  await setChromeStorage({ dashboardSection: false })
  await setChromeStorage({ profileSection: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_GPT_SECTION' })
  }
}

export const backToMainGptSection = async () => {
  await setChromeStorage({ mainGptSection: true })
  await setChromeStorage({ gptTranslateSection: false })
  await setChromeStorage({ gptOCRSection: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_MAIN_GPT_SECTION' })
  }
}

export const backToGptTranslateSection = async () => {
  await setChromeStorage({ gptTranslateSection: true })
  await setChromeStorage({ mainGptSection: false })
  await setChromeStorage({ gptOCRSection: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO__GPT_TRANSLATE_SECTION' })
  }
}

export const backToGptOCRSection = async () => {
  await setChromeStorage({ gptOCRSection: true })
  await setChromeStorage({ mainGptSection: false })
  await setChromeStorage({ gptTranslateSection: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO__GPT_OCR_SECTION' })
  }
}

export const backToDashboardSection = async () => {
  setChromeStorage({ dashboardSection: true })
  setChromeStorage({ homeSection: false })
  setChromeStorage({ currentTabSection: false })
  setChromeStorage({ allTabsSection: false })
  setChromeStorage({ gptSection: false })
  setChromeStorage({ profileSection: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_DASHBOARD_SECTION' })
  }
}

export const backToProfileSection = async () => {
  await setChromeStorage({ profileSection: true })
  await setChromeStorage({ homeSection: false })
  await setChromeStorage({ currentTabSection: false })
  await setChromeStorage({ allTabsSection: false })
  await setChromeStorage({ gptSection: false })
  await setChromeStorage({ dashboardSection: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_PROFILE_SECTION' })
  }
}

export const backToDashboardSectionCollections = async () => {
  await setChromeStorage({ dashboardSectionCollections: true })
  await setChromeStorage({ dashboardSectionFavorites: false })
  await setChromeStorage({ dashboardSectionLinks: false })
  await setChromeStorage({ dashboardSectionImages: false })
  await setChromeStorage({ dashboardSectionVideos: false })
  await setChromeStorage({ dashboardSectionArticles: false })
  await setChromeStorage({ dashboardSectionSettings: false })
  await setChromeStorage({ dashboardSectionHelpCenter: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'BACK_TO_DASHBOARD_SECTION_COLLECTIONS',
    })
  }
}
export const backToDashboardSectionFavorites = async () => {
  await setChromeStorage({ dashboardSectionFavorites: true })
  await setChromeStorage({ dashboardSectionCollections: false })
  await setChromeStorage({ dashboardSectionLinks: false })
  await setChromeStorage({ dashboardSectionImages: false })
  await setChromeStorage({ dashboardSectionVideos: false })
  await setChromeStorage({ dashboardSectionArticles: false })
  await setChromeStorage({ dashboardSectionSettings: false })
  await setChromeStorage({ dashboardSectionHelpCenter: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_DASHBOARD_SECTION_FAVORITES' })
  }
}
export const backToDashboardSectionLinks = async () => {
  await setChromeStorage({ dashboardSectionLinks: true })
  await setChromeStorage({ dashboardSectionFavorites: false })
  await setChromeStorage({ dashboardSectionCollections: false })
  await setChromeStorage({ dashboardSectionImages: false })
  await setChromeStorage({ dashboardSectionVideos: false })
  await setChromeStorage({ dashboardSectionArticles: false })
  await setChromeStorage({ dashboardSectionSettings: false })
  await setChromeStorage({ dashboardSectionHelpCenter: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_DASHBOARD_SECTION_LINKS' })
  }
}
export const backToDashboardSectionImages = async () => {
  await setChromeStorage({ dashboardSectionImages: true })
  await setChromeStorage({ dashboardSectionLinks: false })
  await setChromeStorage({ dashboardSectionFavorites: false })
  await setChromeStorage({ dashboardSectionCollections: false })
  await setChromeStorage({ dashboardSectionVideos: false })
  await setChromeStorage({ dashboardSectionArticles: false })
  await setChromeStorage({ dashboardSectionSettings: false })
  await setChromeStorage({ dashboardSectionHelpCenter: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_DASHBOARD_SECTION_IMAGES' })
  }
}
export const backToDashboardSectionVideos = async () => {
  await setChromeStorage({ dashboardSectionVideos: true })
  await setChromeStorage({ dashboardSectionImages: false })
  await setChromeStorage({ dashboardSectionLinks: false })
  await setChromeStorage({ dashboardSectionFavorites: false })
  await setChromeStorage({ dashboardSectionCollections: false })
  await setChromeStorage({ dashboardSectionArticles: false })
  await setChromeStorage({ dashboardSectionSettings: false })
  await setChromeStorage({ dashboardSectionHelpCenter: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_DASHBOARD_SECTION_VIDEOS' })
  }
}
export const backToDashboardSectionArticles = async () => {
  await setChromeStorage({ dashboardSectionArticles: true })
  await setChromeStorage({ dashboardSectionVideos: false })
  await setChromeStorage({ dashboardSectionImages: false })
  await setChromeStorage({ dashboardSectionLinks: false })
  await setChromeStorage({ dashboardSectionFavorites: false })
  await setChromeStorage({ dashboardSectionCollections: false })
  await setChromeStorage({ dashboardSectionSettings: false })
  await setChromeStorage({ dashboardSectionHelpCenter: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_DASHBOARD_SECTION_ARTICLES' })
  }
}

export const backToDashboardSectionSettings = async () => {
  await setChromeStorage({ dashboardSectionSettings: true })
  await setChromeStorage({ dashboardSectionArticles: false })
  await setChromeStorage({ dashboardSectionVideos: false })
  await setChromeStorage({ dashboardSectionImages: false })
  await setChromeStorage({ dashboardSectionLinks: false })
  await setChromeStorage({ dashboardSectionFavorites: false })
  await setChromeStorage({ dashboardSectionCollections: false })
  await setChromeStorage({ dashboardSectionHelpCenter: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_DASHBOARD_SECTION_SETTINGS' })
  }
}
export const backToDashboardSectionHelpCenter = async () => {
  await setChromeStorage({ dashboardSectionHelpCenter: true })
  await setChromeStorage({ dashboardSectionSettings: false })
  await setChromeStorage({ dashboardSectionArticles: false })
  await setChromeStorage({ dashboardSectionVideos: false })
  await setChromeStorage({ dashboardSectionImages: false })
  await setChromeStorage({ dashboardSectionLinks: false })
  await setChromeStorage({ dashboardSectionFavorites: false })
  await setChromeStorage({ dashboardSectionCollections: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'BACK_TO_DASHBOARD_SECTION_HELPCENTER' })
  }
}

export const backToDashboardSectionCardDisplay = async () => {
  await setChromeStorage({ dashboardSectionCardDisplay: true })
  await setChromeStorage({ dashboardSectionListDisplay: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'BACK_TO_DASHBOARD_SECTION_CARD_DISPLAY',
    })
  }
}

export const backToDashboardSectionListDisplay = async () => {
  await setChromeStorage({ dashboardSectionListDisplay: true })
  await setChromeStorage({ dashboardSectionCardDisplay: false })

  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({
      type: 'BACK_TO_DASHBOARD_SECTION_LIST_DISPLAY',
    })
  }
}
