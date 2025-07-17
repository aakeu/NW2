import React, { forwardRef, useEffect, useState } from 'react'
import '../gpt/GptSection.css'

const GptLanguages = forwardRef(
  (
    {
      customClass,
      setSelectedSourceLanguage,
      setSelectedTargetLanguage,
      openSourceModal,
      openTargetModal,
      languages,
      setLanguages,
      searchTerm,
      setSearchTerm,
      setOpenSourceModal,
      setOpenTargetModal,
    },
    ref,
  ) => {
    const [filteredLanguages, setFilteredLanguages] = useState(languages)

    const handleSelectLanguage = (language) => {
      if (openSourceModal) {
        setSelectedSourceLanguage(language)
        setOpenSourceModal(false)
      } else if (openTargetModal) {
        setSelectedTargetLanguage(language)
        setOpenTargetModal(false)
      }
    }

    useEffect(() => {
      if (!searchTerm) {
        setFilteredLanguages(languages)
        return
      }
      const filtered = languages.filter((language) =>
        language.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredLanguages(filtered)
    }, [searchTerm, languages])

    return (
      <div
        ref={ref}
        className={`gptTranslationLanguageContents ${customClass}`}
      >
        <div className="gptTranslationLanguageContentsHolder">
          <div className="gptTranslationLanguageSearchContainer">
            <img
              src="images/popup/search.svg"
              alt="search icon"
              className="gptSearchSendIcon"
            />
            <input
              type="text"
              className="gptTranslationLanguageSearchInput"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map((language, index) => (
              <div
                key={`${language}-${index}`}
                className="gptTranslationLanguageTextHolder"
                onClick={() => handleSelectLanguage(language)}
              >
                <span className="gptTranslationLanguageText">{language}</span>
              </div>
            ))
          ) : (
            <div className="gptTranslationLanguageTextHolder">
              Loading languages...
            </div>
          )}
        </div>
      </div>
    )
  },
)

export default GptLanguages
