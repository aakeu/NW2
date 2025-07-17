import React, { useEffect, useState } from 'react'
import '../paymentModal/PaymentModal.css'
import { getEncryptedToken } from '../../api/default'
import { useNotification } from '../notification/NotificationContext'
import { get_user_status } from '../../api/users'
import { setSecureToken } from '../../api/auth'

export default function PaymentModal({ setActivationNeeded, info }) {
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()

  useEffect(() => {
    const showNotification = (message, type) => {
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
        handleCloseDeleteModal()
      }
    }
  }, [notification])

  const startPayment = async () => {
    let encryptedToken
    try {
      encryptedToken = await getEncryptedToken()
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
      encryptedToken,
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
        userStatus = await get_user_status()
        console.log(userStatus)
      } catch (error) {
        setNotification({
          message: 'Unable to fetch user status. Please try again later.',
          type: 'error',
        })
        return
      }

      await setSecureToken('user', JSON.stringify(userStatus))

      setActivationNeeded(false)

      if (userStatus.isSubscribed) {
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
  return (
    <div className="paymentModal">
      <div className="paymentModalContent">
        <span
          onClick={() => setActivationNeeded(false)}
          className="paymentModalClose"
        >
          X
        </span>
        <span className="paymentModalHeading">
          {info ? info : 'You must subscribe before using this service'}
        </span>
        <button onClick={startPayment} className="paymentModalBtn">
          {'Upgrade'}{' '}
          <img
            src="images/popup/arrowRight.svg"
            alt="arrow"
            className="paymentBtnArrow"
          />
        </button>
      </div>
    </div>
  )
}
