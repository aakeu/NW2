import React from 'react'
import '../loginModal/LoginModal.css'

export default function VerifyAccount({ closeVerifyAccount }) {
  return (
    <div className="verifyAccount">
      <div className="verifyAccountContainer">
        <img
          src="images/popup/close.svg"
          alt="close"
          className="verifyAccountClose"
          onClick={closeVerifyAccount}
        />
        <h2 className="verifyAccountWelcome">Verify your account</h2>
        <p className="verifyAccountDetail">
          A verification link has been sent to your email, click on the link to
          verify your account
        </p>
        <img
          src="images/popup/checkmarkCircle.svg"
          alt="close"
          className="checkmarkImg"
        />
      </div>
    </div>
  )
}
