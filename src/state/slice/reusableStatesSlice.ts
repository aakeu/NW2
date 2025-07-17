import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ReusableState {
  activationNeeded: boolean
  paymentModalInfo: string | null
  showFolderModal: boolean
  folderOpen: boolean
  selectedFolder: string | null
  createNormalFolder: boolean
  selectedParentFolderName: string | null
  showRenameFolderModal: boolean
  folderIdToRenameOrDelete: number | null
  folderNameToRenameOrDelete: string | null
  showDeleteModal: boolean
  showDeleteMeetingModal: boolean
  showEditProfileModal: boolean
  itemToDeleteId: number | null
  itemNameToDelete: string | null
  isFolder: boolean
  isBookmark: boolean
  isDeleteFromFavorite: boolean
  isFilteredMedia: boolean
  filteredMediaTitle: string | null
  filteredMedia: {name: string, url: string}[] | null
  filteredMediaId: number | null
  showMediaDeleteModal: boolean
  showOnboardingModal: boolean
  isOnboardingHomeLogo: boolean
  isOnboardingSearchPanel: boolean
  isOnboardingSelectSearchEngine: boolean
  isOnboardingCarryoutASearch: boolean
  isOnboardingVisitSite: boolean
  isOnboardingGPTLogo: boolean
  isOnboardingSelectAFolder: boolean
  isOnboardingBookmark: boolean
  isOnboardingDashboardLogo: boolean
  isOnboardingVideo: boolean
  showVerifyAccountModal: boolean
  chatModelDetail: {
    name: string | null;
    image: string | undefined;
    model: string;
    description: string | null;
  }
  showMeetingDetailsModal: boolean
  meetingDescription: {
    title: string | null,
    description: string | null
  }
}

const initialState: ReusableState = {
  activationNeeded: false,
  paymentModalInfo: null,
  showFolderModal: false,
  folderOpen: false,
  selectedFolder: null,
  createNormalFolder: false,
  selectedParentFolderName: null,
  showRenameFolderModal: false,
  folderIdToRenameOrDelete: null,
  folderNameToRenameOrDelete: null,
  showDeleteModal: false,
  showDeleteMeetingModal: false,
  showEditProfileModal: false,
  itemToDeleteId: null,
  itemNameToDelete: null,
  isFolder: false,
  isBookmark: false,
  isDeleteFromFavorite: false,
  isFilteredMedia: false,
  filteredMediaTitle: null,
  filteredMedia: null,
  filteredMediaId: null,
  showMediaDeleteModal: false,
  showOnboardingModal: false,
  isOnboardingHomeLogo: false,
  isOnboardingSearchPanel: false,
  isOnboardingSelectSearchEngine: false,
  isOnboardingCarryoutASearch: false,
  isOnboardingVisitSite: false,
  isOnboardingGPTLogo: false,
  isOnboardingSelectAFolder: false,
  isOnboardingBookmark: false,
  isOnboardingDashboardLogo: false,
  isOnboardingVideo: false,
  showVerifyAccountModal: false,
  chatModelDetail: {
    name: "GPT",
    image: "images/gptLogo.svg",
    model: "gpt-4.0",
    description: "A general-purpose AI with high-quality natural language understanding and generation. Great for answering complex questions, summarizing, and creative tasks. Ideal for everyday AI needs, research, writing, and brainstorming"
  },
  showMeetingDetailsModal: false,
  meetingDescription: {
    title: null,
    description: null
  }
}

const saveChatModelDetail = async (chatModelDetail: { name: string | null; image: string | undefined; model: string | null; description: string | null }) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ chatModelDetail: chatModelDetail }, () => {});
  }
}

const saveFilteredMediaToStorage = async (filteredMedia: {name: string, url: string}[] | null) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ filteredMedia: filteredMedia }, () => {});
  }
}

const saveIsFilteredMediaToStorage = async (isFilteredMedia: boolean) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ isFilteredMedia: isFilteredMedia }, () => {});
  }
}

const saveFilteredMediaTitleToStorage = async (filteredMediaTitle: string | null) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ filteredMediaTitle: filteredMediaTitle }, () => {});
  }
}

const saveFilteredMediaIdToStorage = async (filteredMediaId: number | null ) => {
  if (chrome && chrome.storage) {
    chrome.storage.local.set({ filteredMediaId: filteredMediaId }, () => {});
  }
}

const loadChatModelDetail = async (): Promise<{ name: string | null; image: string | undefined; model: string; description: string | null }> => {
  try {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('chatModelDetail');
      return result.chatModelDetail || {
        name: "GPT",
        image: "images/gptLogo.svg",
        model: "gpt-4.0",
        description: "A general-purpose AI with high-quality natural language understanding and generation. Great for answering complex questions, summarizing, and creative tasks. Ideal for everyday AI needs, research, writing, and brainstorming"
      };
    }
    return {
        name: "GPT",
        image: "images/gptLogo.svg",
        model: "gpt-4.0",
        description: "A general-purpose AI with high-quality natural language understanding and generation. Great for answering complex questions, summarizing, and creative tasks. Ideal for everyday AI needs, research, writing, and brainstorming"
      };
  } catch (error) {
    console.error('Error loading chat model detail from storage:', error);
    return {
        name: "GPT",
        image: "images/gptLogo.svg",
        model: "gpt-4.0",
        description: "A general-purpose AI with high-quality natural language understanding and generation. Great for answering complex questions, summarizing, and creative tasks. Ideal for everyday AI needs, research, writing, and brainstorming"
      };
  }
}

const loadFilteredMediaIdFromStorage = async (): Promise<number | null> => {
  try {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('filteredMediaId');
      return result.filteredMediaId || null;
    }
    return null;
  } catch (error) {
    console.error('Error loading filtered media id from storage:', error);
    return null;
  }
}

const loadFilteredMediaTitleFromStorage = async (): Promise<string | null> => {
  try {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('filteredMediaTitle');
      return result.filteredMediaTitle || null;
    }
    return null;
  } catch (error) {
    console.error('Error loading filtered media title from storage:', error);
    return null;
  }
}

const loadIsFilteredMediaFromStorage = async (): Promise<boolean> => {
  try {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('isFilteredMedia');
      return result.isFilteredMedia || false;
    }
    return false;
  } catch (error) {
    console.error('Error loading is filtered media from storage:', error);
    return false;
  }
}

const loadFilteredMediaFromStorage = async (): Promise<{name: string, url: string}[] | null> => {
  try {
    if (chrome && chrome.storage) {
      const result = await chrome.storage.local.get('filteredMedia');
      return result.filteredMedia || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading filtered media from storage:', error);
    return [];
  }
};

export const initializeChatModelDetail = () => async (dispatch: any) => {
  const savedChatModelDetail = await loadChatModelDetail();
  dispatch(setChatModelDetail(savedChatModelDetail))
}

export const initializeFilteredMedia = () => async (dispatch: any) => {
  const savedFilteredMedia = await loadFilteredMediaFromStorage();
  dispatch(setFilteredMedia(savedFilteredMedia));
};

export const initializeIsFilteredMedia = () => async (dispatch: any) => {
  const savedIsFilteredMedia = await loadIsFilteredMediaFromStorage()
  dispatch(setIsFilteredMedia(savedIsFilteredMedia))
}

export const initializeFilteredMediaTitle = () => async (dispatch: any) => {
  const savedFilteredMediaTitle = await loadFilteredMediaTitleFromStorage()
  dispatch(setFilteredMediaTitle(savedFilteredMediaTitle))
}

export const initializeFilteredMediaId = () => async (dispatch: any) => {
  const savedFilteredMediaId = await loadFilteredMediaIdFromStorage()
  dispatch(setFilteredMediaId(savedFilteredMediaId))
}

const reusableSlice = createSlice({
  name: 'reusables',
  initialState,
  reducers: {
    setActivationNeeded: (state, action: PayloadAction<boolean>) => {
      state.activationNeeded = action.payload
    },
    setPaymentModalInfo: (state, action: PayloadAction<string | null>) => {
      state.paymentModalInfo = action.payload
    },
    setShowFolderModal: (state, action: PayloadAction<boolean>) => {
      state.showFolderModal = action.payload
    },
    setFolderOpen: (state, action: PayloadAction<boolean>) => {
      state.folderOpen = action.payload
    },
    setSelectedFolder: (state, action: PayloadAction<string | null>) => {
      state.selectedFolder = action.payload
    },
    setCreateNormalFolder: (state, action: PayloadAction<boolean>) => {
      state.createNormalFolder = action.payload
    },
    setSelectedParentFolderName: (
      state,
      action: PayloadAction<string | null>,
    ) => {
      state.selectedParentFolderName = action.payload
    },
    setShowEditProfileModal: (state, action: PayloadAction<boolean>) => {
      state.showEditProfileModal = action.payload
    },
    setShowRenameFolderModal: (state, action: PayloadAction<boolean>) => {
      state.showRenameFolderModal = action.payload
    },
    setFolderIdToRenameOrDelete: (state, action: PayloadAction<number | null>) => {
      state.folderIdToRenameOrDelete = action.payload
    },
    setFolderNameToRenameOrDelete: (state, action: PayloadAction<string | null>) => {
      state.folderNameToRenameOrDelete = action.payload
    },
    setDeleteModal: (state, action: PayloadAction<boolean>) => {
      state.showDeleteModal = action.payload
    },
    setDeleteMeetingModal: (state, action: PayloadAction<boolean>) => {
      state.showDeleteMeetingModal = action.payload
    },
    setItemToDeleteId: (state, action: PayloadAction<number | null>) => {
      state.itemToDeleteId = action.payload
    },
    setItemNameToDelete: (state, action: PayloadAction<string | null>) => {
      state.itemNameToDelete = action.payload
    },
    setIsFolder: (state, action: PayloadAction<boolean>) => {
      state.isFolder = action.payload
    },
    setIsBookmark: (state, action: PayloadAction<boolean>) => {
      state.isBookmark = action.payload
    },
    setIsDeleteFromFavorite: (state, action: PayloadAction<boolean>) => {
      state.isDeleteFromFavorite = action.payload
    },
    setIsFilteredMedia: (state, action: PayloadAction<boolean>) => {
      state.isFilteredMedia = action.payload
      saveIsFilteredMediaToStorage(action.payload)
    },
    setFilteredMediaTitle: (state, action: PayloadAction<string | null>) => {
      state.filteredMediaTitle = action.payload
      saveFilteredMediaTitleToStorage(action.payload)
    },
    setFilteredMedia: (state, action: PayloadAction<{name: string, url: string}[] | null>) => {
      state.filteredMedia = action.payload
      saveFilteredMediaToStorage(action.payload)
    },
    setFilteredMediaId: (state, action: PayloadAction<number | null>) => {
      state.filteredMediaId = action.payload
      saveFilteredMediaIdToStorage(action.payload)
    },
    setShowMediaDeleteModal: (state, action: PayloadAction<boolean>) => {
      state.showMediaDeleteModal = action.payload
    },
    setShowOnboardingModal: (state, action: PayloadAction<boolean>) => {
      state.showOnboardingModal = action.payload
      state.isOnboardingHomeLogo = action.payload
      state.isOnboardingSearchPanel = false
      state.isOnboardingSelectSearchEngine = false
      state.isOnboardingCarryoutASearch = false
      state.isOnboardingVisitSite = false
      state.isOnboardingGPTLogo = false
      state.isOnboardingSelectAFolder = false
      state.isOnboardingBookmark = false
      state.isOnboardingDashboardLogo = false
    },
    setIsOnboardingHomeLogo: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingHomeLogo = action.payload
      state.isOnboardingSearchPanel = false
      state.isOnboardingSelectSearchEngine = false
      state.isOnboardingCarryoutASearch = false
      state.isOnboardingVisitSite = false
      state.isOnboardingGPTLogo = false
      state.isOnboardingSelectAFolder = false
      state.isOnboardingBookmark = false
      state.isOnboardingDashboardLogo = false
    },
    setIsOnboardingSearchPanel: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingSearchPanel = action.payload
      state.isOnboardingHomeLogo = false
      state.isOnboardingSelectSearchEngine = false
      state.isOnboardingCarryoutASearch = false
      state.isOnboardingVisitSite = false
      state.isOnboardingGPTLogo = false
      state.isOnboardingSelectAFolder = false
      state.isOnboardingBookmark = false
      state.isOnboardingDashboardLogo = false
    },
    setIsOnboardingSearchEngine: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingSelectSearchEngine = action.payload
      state.isOnboardingSearchPanel = false
      state.isOnboardingHomeLogo = false
      state.isOnboardingCarryoutASearch = false
      state.isOnboardingVisitSite = false
      state.isOnboardingGPTLogo = false
      state.isOnboardingSelectAFolder = false
      state.isOnboardingBookmark = false
      state.isOnboardingDashboardLogo = false
    },
    setIsOnboardingCarryoutASearch: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingCarryoutASearch = action.payload
      state.isOnboardingSelectSearchEngine = false
      state.isOnboardingSearchPanel = false
      state.isOnboardingHomeLogo = false
      state.isOnboardingVisitSite = false
      state.isOnboardingGPTLogo = false
      state.isOnboardingSelectAFolder = false
      state.isOnboardingBookmark = false
      state.isOnboardingDashboardLogo = false
    },
    setIsOnboardingVisitSite: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingVisitSite = action.payload
      state.isOnboardingCarryoutASearch = false
      state.isOnboardingSelectSearchEngine = false
      state.isOnboardingSearchPanel = false
      state.isOnboardingHomeLogo = false
      state.isOnboardingGPTLogo = false
      state.isOnboardingSelectAFolder = false
      state.isOnboardingBookmark = false
      state.isOnboardingDashboardLogo = false
    },
    setIsOnboardingGPTLogo: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingGPTLogo = action.payload
      state.isOnboardingVisitSite = false
      state.isOnboardingCarryoutASearch = false
      state.isOnboardingSelectSearchEngine = false
      state.isOnboardingSearchPanel = false
      state.isOnboardingHomeLogo = false
      state.isOnboardingSelectAFolder = false
      state.isOnboardingBookmark = false
      state.isOnboardingDashboardLogo = false
    },
    setIsOnboardingSelectAFolder: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingSelectAFolder = action.payload
      state.isOnboardingGPTLogo = false
      state.isOnboardingVisitSite = false
      state.isOnboardingCarryoutASearch = false
      state.isOnboardingSelectSearchEngine = false
      state.isOnboardingSearchPanel = false
      state.isOnboardingHomeLogo = false
      state.isOnboardingBookmark = false
      state.isOnboardingDashboardLogo = false
    },
    setIsOnboardingBookmark: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingBookmark = action.payload
      state.isOnboardingSelectAFolder = false
      state.isOnboardingGPTLogo = false
      state.isOnboardingVisitSite = false
      state.isOnboardingCarryoutASearch = false
      state.isOnboardingSelectSearchEngine = false
      state.isOnboardingSearchPanel = false
      state.isOnboardingHomeLogo = false
      state.isOnboardingDashboardLogo = false
    },
    setIsOnboardingDashboardLogo: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingDashboardLogo = action.payload
      state.isOnboardingBookmark = false
      state.isOnboardingSelectAFolder = false
      state.isOnboardingGPTLogo = false
      state.isOnboardingVisitSite = false
      state.isOnboardingCarryoutASearch = false
      state.isOnboardingSelectSearchEngine = false
      state.isOnboardingSearchPanel = false
      state.isOnboardingHomeLogo = false
    },
    setIsOnboardingVideo: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingVideo = action.payload
    },
    setShowVerifyAccountModal: (state, action: PayloadAction<boolean>) => {
      state.showVerifyAccountModal = action.payload
    }, 
    setChatModelDetail: (state, action: PayloadAction<{
      name: string | null,
      image: string | undefined,
      model: string,
      description: string | null
    }>) => {
      state.chatModelDetail = action.payload
      saveChatModelDetail(action.payload)
    },
    setShowMeetingDetailsModal: (state, action: PayloadAction<boolean>) => {
      state.showMeetingDetailsModal = action.payload
    },
    setMeetingDescription: (state, action: PayloadAction<{
      title: string | null,
      description: string | null
    }>) => {
      state.meetingDescription = action.payload
    }
  },
})

export const {
  setActivationNeeded,
  setPaymentModalInfo,
  setShowFolderModal,
  setFolderOpen,
  setSelectedFolder,
  setCreateNormalFolder,
  setSelectedParentFolderName,
  setShowRenameFolderModal,
  setFolderIdToRenameOrDelete,
  setFolderNameToRenameOrDelete,
  setDeleteModal,
  setDeleteMeetingModal,
  setItemToDeleteId,
  setItemNameToDelete,
  setIsFolder,
  setIsBookmark,
  setShowEditProfileModal,
  setIsDeleteFromFavorite,
  setIsFilteredMedia,
  setFilteredMediaTitle,
  setFilteredMedia,
  setFilteredMediaId,
  setShowMediaDeleteModal,
  setShowOnboardingModal,
  setIsOnboardingHomeLogo,
  setIsOnboardingSearchPanel,
  setIsOnboardingSearchEngine,
  setIsOnboardingCarryoutASearch,
  setIsOnboardingVisitSite,
  setIsOnboardingGPTLogo,
  setIsOnboardingSelectAFolder,
  setIsOnboardingBookmark,
  setIsOnboardingDashboardLogo,
  setIsOnboardingVideo,
  setShowVerifyAccountModal,
  setChatModelDetail,
  setShowMeetingDetailsModal,
  setMeetingDescription
} = reusableSlice.actions

export default reusableSlice.reducer
