import React, { useState, useEffect } from 'react'
import '../onboarding/OnboardingVideo.css'

const OnboardingVideo = ({ setShowOnboarding, setIsModalOpen, setIsQuickSearchLogoDesc }) => {
  const [isVisible, setIsVisible] = useState(true)
  let player

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player('onboardingVideo', {
        events: {
          onReady: onPlayerReady,
        },
      })
    }
  }, [])

  const onPlayerReady = (event) => {
    if (!event.target.getPlayerState() === window.YT.PlayerState.PLAYING) {
      event.target.playVideo()
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setShowOnboarding(false)
    setIsModalOpen(true)
    setIsQuickSearchLogoDesc(true)
  }

  return (
    <div>
      {isVisible && (
        <div id="onBordingVideoModal" className="onboardingVideoContainer">
          <div className="onboardingVideoModalContent">
            <button
              className="onboardingVideoCloseBtn"
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
              }}
            >
              Close
            </button>
            <iframe
              id="onboardingVideo"
              src="https://www.youtube.com/embed/QAlHhsX7KOI?autoplay=1&enablejsapi=1&origin=chrome-extension://mnajmgeoflfbiekjmchpjbbkkljfdopm"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingVideo
