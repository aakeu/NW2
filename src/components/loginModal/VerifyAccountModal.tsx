import React from 'react'
import '../loginModal/LoginModal.css'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import { setIsOnboardingVideo, setShowVerifyAccountModal } from '../../state/slice/reusableStatesSlice'

const VerifyAccountModal: React.FC = () =>  {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const dispatch  = useDispatch<AppDispatch>()

    const handleClose = () => {
        dispatch(setShowVerifyAccountModal(false))
        dispatch(setIsOnboardingVideo(true))
    }

    return (
        <div className={isDarkMode ? "verifyAccountDark" : "verifyAccount"}>
            <div className="verifyAccountContainer">
                <img
                    src="images/close.svg"
                    alt="close"
                    className="verifyAccountClose"
                    onClick={handleClose}
                    style={{
                        cursor: "pointer"
                    }}
                />
                <h2 className={isDarkMode ? "verifyAccountWelcomeDark" : "verifyAccountWelcome"}>Verify your account</h2>
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

export default VerifyAccountModal
