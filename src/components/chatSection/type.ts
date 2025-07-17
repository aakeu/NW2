import { AuthUser } from "../../state/types/auth";

export interface UserDetail  {
    user: AuthUser
}

export interface Tracking {
  id: number;
  numberOfSearches: number
  numberOfBookmarks: number
  numberOfFolders: number
  numberOfUploads: number
  numberOfLinks: number
  noOfTimesIncognitoIsUsed: number
  noOfTimesChatGptIsUsed: number
  noOfTimesTranslatorIsUsed: number
  noOfTimesOCRIsUsed: number
  createdAt?: Date;
  updatedAt?: Date;
}