import { FiSearch } from "react-icons/fi";
import { MdOutlineYoutubeSearchedFor, MdOutlineVpnKey, MdOutlineBookmarks } from "react-icons/md";
import { PiFolderSimpleBold } from "react-icons/pi";
import { TbCloudUpload } from "react-icons/tb";
import { CgScreen, CgSearchLoading } from "react-icons/cg";
import { BiSupport } from "react-icons/bi";

export const features = {
  "Internet Search": {
    free: "limited",
    standard: true,
    premium: true,
    icon: FiSearch
  },
  "Search Recall Service": {
    free: true,
    standard: true,
    premium: true,
    icon: MdOutlineYoutubeSearchedFor
  },
  "Bookmarks": {
    free: "limited",
    standard: true,
    premium: true,
    icon: MdOutlineBookmarks
  },
  "Folders": {
    free: "limited",
    standard: true,
    premium: true,
    icon: PiFolderSimpleBold
  },
  "ChatGPT": {
    free: "limited",
    standard: true,
    premium: true,
    icon: 'images/gpt.svg'
  },
  "File Upload (cloud storage)": {
    free: false,
    standard: true,
    premium: true,
    icon: TbCloudUpload
  },
  "QuickScan (Web Summary)": {
    free: false,
    standard: true,
    premium: true,
    icon: CgSearchLoading
  },
  "Web Portal (via QSP incognito browser)": {
    free: false,
    standard: false,
    premium: true,
    icon: CgScreen
  },
  "VPN (via QSP incognito browser)": {
    free: false,
    standard: false,
    premium: true,
    icon: MdOutlineVpnKey
  },
  "Priority Support by email": {
    free: false,
    standard: false,
    premium: true,
    icon: BiSupport
  }
};

export const featuresList = [
  "Internet Search",
  "Search Recall Service",
  "Bookmarks",
  "Folders",
  "ChatGPT",
  "File Upload (cloud storage)",
  "QuickScan (Web Summary)",
  "Web Portal (via QSP incognito browser)",
  "VPN (via QSP incognito browser)",
  "Priority Support by email"
]

export const activities = {
  "Bookmarks": {
    free: 30,
    standard: 0,
    premium: 0
  },
  "Folders": {
    free: 5,
    standard: 0,
    premium: 0
  },
  "Gpt Search": {
    free: 5,
    standard: 0,
    premium: 0
  },
  "File Upload": {
    free: false,
    standard: 0,
    premium: 0
  },
  // "QuickScan (web summary)": {
  //   free: false,
  //   standard: 50,
  //   premium: 50
  // }
}

export const activitiesList = [
  "Bookmarks",
  "Folders",
  "Gpt Search",
  "File Upload",
  // "QuickScan (web summary)"
]

export const trackingKey = { 
"Gpt Search": "noOfTimesChatGptIsUsed",
"Bookmarks": 'numberOfBookmarks',
"Folders": "numberOfFolders",
"File Upload": "numberOfUploads"
}

