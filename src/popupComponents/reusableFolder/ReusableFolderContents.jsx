import React, { useEffect, useRef } from 'react'
import '../reusableFolder/ReusableFolderContents.css'

export default function ReusableFolderContents({
  handleFolderOpen,
  selectedFolder,
  folderOpen,
  setFolderOpen,
  allFolders,
  handleSelectFolder,
  isMarginLeft,
  placedOnTop,
}) {
  const folderRef = useRef(null)

  const handleClickOutside = (event) => {
    if (folderRef.current && !folderRef.current.contains(event.target)) {
      setFolderOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  return (
    <div
      className={`folderSelectHolder ${
        isMarginLeft ? 'folderSelectHolderMgLeft' : ''
      }`}
      ref={folderRef}
    >
      <div className="folderSelectContentArrow" onClick={handleFolderOpen}>
        <span className="selectedFolder">
          {selectedFolder ? selectedFolder : 'Select a folder'}
        </span>
        <img src="images/popup/arrowUp.svg" alt="arrow" className="arrowUp" />
      </div>
      {folderOpen && (
        <div
          className={
            placedOnTop ? 'folderContentsHolderOnTop' : 'folderContentsHolder'
          }
          id="folderContentsHolder"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="folderContentsContainer">
            <span
              className="folderContentName"
              onClick={() => handleSelectFolder(null)}
            >
              Select a folder
            </span>
            {Array.isArray(allFolders) &&
              allFolders.map((folder) => (
                <span
                  className={`folderContentName ${
                    selectedFolder === folder.name
                      ? 'folderContentNameExtra'
                      : ''
                  }`}
                  key={folder.id}
                  onClick={() => handleSelectFolder(folder.name)}
                  style={
                    folder === selectedFolder
                      ? {
                          backgroundColor: '#F0F7FB',
                        }
                      : {}
                  }
                >
                  {folder.name}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
