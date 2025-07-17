import React from 'react'
import './Search.css'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import {
  SearchEngineOptionType,
  setActiveSearchEngineOption,
} from '../../state/slice/searchEngineOptionSlice'
import {
  setActivationNeeded,
  setPaymentModalInfo,
} from '../../state/slice/reusableStatesSlice'

interface SearchEngineOptionProps {
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const SearchEngineOption: React.FC<SearchEngineOptionProps> = ({
  onMouseEnter,
  onMouseLeave,
}) => {
  const searchEngine = useSelector(
    (state: RootState) => state.searchEngineOption.searchEngine,
  )
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const { user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  const handleSearchEngine = (search: SearchEngineOptionType) => {
    if (search === 'GoogleScholar' && user && !user.isSubscribed) {
      dispatch(setActivationNeeded(true))
      dispatch(
        setPaymentModalInfo(
          'With your current plan, you can only use the selected search engine. Upgrade your plan to access additional search engines and enhance your browsing experience!',
        ),
      )
      return
    }
    dispatch(setActiveSearchEngineOption(search))
  }

  return (
    <div
      className={isDarkMode ? 'searchEngineOptionDark' : 'searchEngineOption'}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="searchEngineOptionContents">
        <div
          className={
            isDarkMode ? 'googleOptionHolderDark' : 'googleOptionHolder'
          }
          onClick={() => handleSearchEngine('Google')}
          style={
            searchEngine === 'Google'
              ? {
                  backgroundColor: isDarkMode ? '#2c2c2c' : '#eef1f9',
                  borderRadius: '6px',
                  transition: '0.5s ease-in-out',
                }
              : {}
          }
        >
          <img
            src="images/googleIcon.svg"
            alt="googleIcon"
            className="googleOptionHolderIcon"
          />
          <span className={isDarkMode ? 'googleTextDark' : 'googleText'}>
            Google
          </span>
        </div>

        <div
          className={
            isDarkMode
              ? 'googleScholarOptionHolderDark'
              : 'googleScholarOptionHolder'
          }
          onClick={() => handleSearchEngine('GoogleScholar')}
          style={
            searchEngine === 'GoogleScholar'
              ? {
                  backgroundColor: isDarkMode ? '#2c2c2c' : '#eef1f9',
                  borderRadius: '6px',
                  transition: '0.5s ease-in-out',
                }
              : {}
          }
        >
          <img
            src="images/googleScholar.svg"
            alt="googleScholarIcon"
            className="googleScholarOptionHolderIcon"
          />
          <span
            className={
              isDarkMode ? 'googleScholarTextDark' : 'googleScholarText'
            }
          >
            Google Scholar
          </span>
        </div>
      </div>
    </div>
  )
}

export default SearchEngineOption
