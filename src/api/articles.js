import { getChromeStorage, setChromeStorage } from '../utils/utility.tsx'
import { getSecureToken } from './auth.ts'

export async function get_all_articles() {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(`${QAPI}/user/articles/retrieve-articles`)

  try {
    const req = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (req.status !== 200) throw new Error('error retrieving articles')
    const data = await req.json()
    return data
  } catch (error) {
    // console.error('error retrieving articles', error)
  }
}

export async function delete_all_articles_In_Folder(id, selectedArtFolderName) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(
    `${QAPI}/user/articles/removeArticlesFromFolder/${id}?selectedArtFolderName=${encodeURIComponent(
      selectedArtFolderName,
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
      message: `Article Folder ${selectedArtFolderName} and its contents deleted successfully`,
    }
  } catch (error) {
    // console.error('Failed to delete article', error)
    return {
      success: false,
      message: 'Failed to delete article. Please try again.',
    }
  }
}

export async function delete_selected_article(id, selectedArticleName) {
  const QAPI = process.env.REACT_APP_QAPI_URL
  const token = await getSecureToken('token')
  const url = new URL(
    `${QAPI}/user/articles/selectedArticle/${id}?selectedArticleName=${encodeURIComponent(
      selectedArticleName,
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
      (await getChromeStorage('dashboardArtDetail')) || []
    const parsedArtUrl = JSON.parse(updateExistingData.articleUrl)
    const filteredArtUrl = parsedArtUrl.filter(
      (data) => data.name !== selectedArticleName,
    )
    const data = {
      ...updateExistingData,
      articleUrl: JSON.stringify(filteredArtUrl),
    }
    await setChromeStorage({ dashboardArtDetail: data })

    return {
      success: true,
      message: `Article deleted successfully!!`,
    }
  } catch (error) {
    // console.error('Failed to delete article', error)
    return {
      success: false,
      message: 'Failed to delete article. Please try again.',
    }
  }
}
