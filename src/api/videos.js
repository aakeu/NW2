import { getChromeStorage, setChromeStorage } from '../utils/utility.tsx'
import { getSecureToken } from './auth.ts'

export async function get_all_videos() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/user/videos/retrieve-videos`)

  try {
    const req = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) throw new Error('error retrieving videos')
    const data = await req.json()
    return data
  } catch (error) {
    // console.error('error retrieving videos', error)
  }
}

export async function delete_all_videos_In_Folder(id, selectedVidFolderName) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(
    `${QAPI}/user/videos/removeVideosFromFolder/${id}?selectedVidFolderName=${encodeURIComponent(
      selectedVidFolderName,
    )}`,
  )

  try {
    const req = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 204) {
      const errorMessage = 'Failed to delete, Please Try again'
      return { success: false, message: errorMessage }
    }

    return {
      success: true,
      message: `Video Folder ${selectedVidFolderName} and its contents deleted successfully`,
    }
  } catch (error) {
    // console.error('Failed to delete video', error)
    return {
      success: false,
      message: 'Failed to delete video. Please try again.',
    }
  }
}

export async function delete_selected_video(id, selectedVideoName) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(
    `${QAPI}/user/videos/selectedVideo/${id}?selectedVideoName=${encodeURIComponent(
      selectedVideoName,
    )}`,
  )

  try {
    const req = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 204) {
      const errorMessage = 'Failed to delete, Please Try again'
      return { success: false, message: errorMessage }
    }

    const updateExistingData =
      (await getChromeStorage('dashboardVidDetail')) || []
    const parsedVidUrl = JSON.parse(updateExistingData.videoUrl)
    const filteredVidUrl = parsedVidUrl.filter(
      (data) => data.name !== selectedVideoName,
    )
    const data = {
      ...updateExistingData,
      videoUrl: JSON.stringify(filteredVidUrl),
    }
    await setChromeStorage({ dashboardVidDetail: data })

    return {
      success: true,
      message: `Video deleted successfully!!`,
    }
  } catch (error) {
    // console.error('Failed to delete video', error)
    return {
      success: false,
      message: 'Failed to delete video. Please try again.',
    }
  }
}
