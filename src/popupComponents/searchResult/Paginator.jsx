import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getScholarStoredQuery, getStoredQuery } from '../../utils/utility'
import { setQueryState } from '../../popupState/slice/browserSlice'

export default function Paginator({ phase, nextPhase, searchEngine }) {
  const [pageNumbers, setPageNumbers] = useState([1, 2, 3, 4])
  const dispatch = useDispatch()

  const searchEngineAndState = async () => {
    if (searchEngine === 'Google') {
      const storedQuery = await getStoredQuery()
      dispatch(setQueryState({ query: storedQuery || '' }))
    }
    if (searchEngine === 'GoogleScholar') {
      const scholarStoredQuery = await getScholarStoredQuery()
      dispatch(setQueryState({ query: scholarStoredQuery || '' }))
    }
  }

  const handleNextPage = async () => {
    setPageNumbers((prevPageNumbers) => {
      const newPageNumbers = prevPageNumbers.map((num) => num + 4)
      nextPhase(newPageNumbers[0])
      return newPageNumbers
    })
    searchEngineAndState()
  }

  const handleFirstPage = async () => {
    setPageNumbers([1, 2, 3, 4])
    nextPhase(1)
    searchEngineAndState()
  }
  const handleLastPage = async () => {
    setPageNumbers([5, 6, 7, 8])
    nextPhase(8)
    searchEngineAndState()
  }

  const handlePageClick = async (page) => {
    nextPhase(page)
    searchEngineAndState()
  }

  useEffect(() => {
    setPageNumbers([1, 2, 3, 4])
  }, [searchEngine])

  return (
    <div className="paginatorContainer">
      <span
        className={`firstPageNumber ${phase === 1 && 'disableFirstNumber'}`}
        onClick={handleFirstPage}
      >
        {'<'}
      </span>
      {pageNumbers.map((page) => (
        <span
          key={page}
          className={`pageNumber ${phase === page && 'selectedPageNumber'}`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </span>
      ))}
      <span
        className={`nextPageNumber ${phase === 8 && 'disableNextNumber'}`}
        onClick={handleNextPage}
      >
        {'...'}
      </span>
      <span
        className={`lastPageNumber ${phase === 8 && 'disableLastNumber'}`}
        onClick={handleLastPage}
      >
        {'>'}
      </span>
    </div>
  )
}
