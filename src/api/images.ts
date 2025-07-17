import { getChromeStorage, setChromeStorage } from '../utils/utility'
import { getSecureToken } from './auth'

export async function get_all_images() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/user/images/retrieve-images`)

  try {
    const req = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) throw new Error('error retrieving images')
    const data = await req.json()
    return data
  } catch (error) {
    // console.error('error retrieving images', error)
  }
}

export async function delete_all_images_In_Folder(id:number, selectedImgFolderName:string) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(
    `${QAPI}/user/images/removeImagesFromFolder/${id}?selectedImgFolderName=${encodeURIComponent(
      selectedImgFolderName,
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
      message: `Image Folder ${selectedImgFolderName} and its contents deleted successfully`,
    }
  } catch (error) {
    // console.error('Failed to delete image', error)
    return {
      success: false,
      message: 'Failed to delete image. Please try again.',
    }
  }
}

export async function delete_selected_image(id:number, selectedImgName:string) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(
    `${QAPI}/user/images/selectedImage/${id}?selectedImgName=${encodeURIComponent(
      selectedImgName,
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
      (await getChromeStorage('dashboardImgDetail')) || {}
    const parsedImgUrl = JSON.parse((updateExistingData as any)?.imageUrl)
    const filteredImgUrl = parsedImgUrl.filter(
      (data:any) => data.name !== selectedImgName,
    )
    const data = {
      ...updateExistingData,
      imageUrl: JSON.stringify(filteredImgUrl)
    }
    await setChromeStorage({ dashboardImgDetail: data })

    return {
      success: true,
      message: `Image deleted successfully!!`,
    }
  } catch (error) {
    // console.error('Failed to delete image', error)
    return {
      success: false,
      message: 'Failed to delete image. Please try again.',
    }
  }
}
