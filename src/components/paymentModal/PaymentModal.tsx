import React, { useEffect, useState } from 'react'
import '../paymentModal/PaymentModal.css'
import { useNotification } from '../notification/NotificationContext'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import { setActivationNeeded } from '../../state/slice/reusableStatesSlice'
import { AuthState } from '../../state/types/auth'
import { fetchEncryptionToken } from '../../state/slice/getEncryptionTokenSlice'

export default function PaymentModal() {
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { paymentModalInfo } = useSelector((state: RootState) => state.reusable)
  const encryptionToken = useSelector(
    (state: RootState) => state.encryptionToken,
  )
  const status = useSelector((state: RootState) => state.userStatus)
  const { isDarkMode } = useSelector((state: RootState) => state.theme)
  const { createNotification } = useNotification()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const showNotification = (message: string, type: string) => {
      createNotification({
        message: message,
        duration: 5000,
        background:
          type === 'success' ? 'green' : type === 'warn' ? '#4eabbc' : 'red',
        color: '#fff',
      })
    }
    if (notification.message) {
      showNotification(notification.message, notification.type)
      if (notification.type === 'success') {
      }
    }
  }, [notification])

  const startPayment = async () => {
    let encryptedToken
    try {
      encryptedToken = encryptionToken.token
    } catch (error) {
      setNotification({
        message: 'Failed to get payment token. Please try again later.',
        type: 'error',
      })
      return
    }

    const paymentUrl = `${
      process.env.WEB_APP_URL
    }dashboard?page=setting&t=pay&from=extension&token=${encodeURIComponent(
      encryptedToken || '',
    )}`

    const width = 1000
    const height = 800
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const paymentWindow = window.open(
      paymentUrl,
      'Payment',
      `width=${width},height=${height},top=${top},left=${left}`,
    )

    if (!paymentWindow) {
      setNotification({
        message:
          'Please allow popups for this extension to proceed with payment.',
        type: 'warn',
      })
      return
    }

    const checkPaymentWindowClosed = () => {
      if (paymentWindow.closed) {
        // paymentWindow.closed = false
        clearInterval(interval)
        handleUserStatus()
      }
    }

    const interval = setInterval(checkPaymentWindowClosed, 1)

    async function handleUserStatus() {
      let userStatus
      try {
        userStatus = status.status
        console.log(userStatus)
      } catch (error) {
        setNotification({
          message: 'Unable to fetch user status. Please try again later.',
          type: 'error',
        })
        return
      }

      const result = await chrome.storage.local.get('auth')
      const currentAuth: AuthState = result.auth || {
        token: null,
        refreshToken: null,
        tokenExpires: null,
        user: null,
      }

      const updatedAuth = {
        ...currentAuth,
        user: JSON.stringify(userStatus),
      }

      await chrome.storage.local.set({
        auth: updatedAuth,
      })

      // await setSecureToken('user', JSON.stringify(userStatus))

      dispatch(setActivationNeeded(false))

      if (userStatus && userStatus.isSubscribed) {
        setNotification({
          message: 'Your subscription has been activated',
          type: 'success',
        })
      } else {
        setNotification({
          message: 'Payment failed, please try again',
          type: 'error',
        })
      }
    }
  }

  useEffect(() => {
    dispatch(fetchEncryptionToken())
  }, [dispatch])
  
  return (
    <div className={isDarkMode ? 'paymentModalDark' : 'paymentModal'}>
      <div className="paymentModalContent">
        <span
          onClick={() => dispatch(setActivationNeeded(false))}
          className={isDarkMode ? 'paymentModalCloseDark' : 'paymentModalClose'}
        >
          X
        </span>
        <span className="paymentModalHeading">
          {paymentModalInfo
            ? paymentModalInfo
            : 'You must subscribe before using this service'}
        </span>
        <button onClick={startPayment} className="paymentModalBtn">
          {'Upgrade'}{' '}
          <img
            src="images/arrowRight.svg"
            alt="arrow"
            className="paymentBtnArrow"
          />
        </button>
      </div>
    </div>
  )
}
