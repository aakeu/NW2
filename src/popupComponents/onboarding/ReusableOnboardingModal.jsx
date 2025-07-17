import React, { useState } from 'react'
import '../onboarding/OnboardingVideo.css'

const ReusableOnboardingModal = ({
  isOpen,
  onClose,
  children,
  top,
  left,
  tooltipPosition,
  tooltipTopLeft,
  tooltipBottomLeft,
  handleOnboardingNext,
  handleOnboardingBack,
}) => {
  if (!isOpen) return null
  const arrowStyles = {
    top: {
      top: '-10px',
      left: tooltipTopLeft,
      transform: 'translateX(-50%)',
    },
    bottom: {
      bottom: '-10px',
      left: tooltipBottomLeft,
      transform: 'translateX(-50%) rotate(180deg)',
    },
  }

  return (
    <div
      className="reusableOnboardingModal"
      style={{
        top: top,
        left: left,
      }}
    >
      <div className="reusableOnboardingModalContent">
        {children}
        <div className="reusableOnboardingModalActionHolder">
          <button
            onClick={handleOnboardingBack}
            className="reusableOnboardingModalBtnBack"
          >
            Back
          </button>
          <button
            onClick={handleOnboardingNext}
            className="reusableOnboardingModalBtnNext"
          >
            Next
          </button>
          <button onClick={onClose} className="reusableOnboardingModalBtnSkip">
            Skip
          </button>
        </div>
        <div
          className="reusableOnboardingModalArrow"
          style={arrowStyles[tooltipPosition]}
        />
      </div>
    </div>
  )
}

export default ReusableOnboardingModal
