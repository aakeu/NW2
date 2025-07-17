import React from 'react'
import './HomeScreen.css'
import Search from '../search/Search'
import SearchResults from '../searchResult/SearchResults'
import SiderContainer from '../../sidebar/SiderContainer'

const HomeScreen: React.FC = () => {
  return (
    <SiderContainer>
      <div className='homeScreen'>
        <div className="searchContainerHolder">
          <Search />
          <SearchResults />
        </div>
      </div>
    </SiderContainer>
  )
}

export default HomeScreen
