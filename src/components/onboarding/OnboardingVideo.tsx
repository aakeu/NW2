import React, { useEffect, useState } from "react";
import '../onboarding/Onboarding.css'
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state";
import { setIsOnboardingHomeLogo, setIsOnboardingVideo, setShowOnboardingModal } from "../../state/slice/reusableStatesSlice";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const OnboardingVideo: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true)
    const dispatch = useDispatch<AppDispatch>()
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
  
    interface OnPlayerReadyEvent {
      target: {
        getPlayerState: () => number;
        playVideo: () => void;
      };
    }

    const onPlayerReady = (event: OnPlayerReadyEvent) => {
      if (!event.target.getPlayerState() === window.YT.PlayerState.PLAYING) {
        event.target.playVideo();
      }
    };
  
    const handleClose = () => {
      setIsVisible(false)
      dispatch(setIsOnboardingVideo(false))
      dispatch(setShowOnboardingModal(true))
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