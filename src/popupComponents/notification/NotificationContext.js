import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const createNotification = ({
    message,
    duration = 3000,
    background = '#333',
    color = '#fff',
  }) => {
    const id = Date.now()
    const newNotification = { id, message, duration, background, color }

    setNotifications([newNotification])

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, duration)
  }

  return (
    <NotificationContext.Provider value={{ createNotification }}>
      {children}

      <div id="notification-container" style={containerStyle}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              ...notificationStyle,
              background: notification.background,
              color: notification.color,
              maxWidth: '250px',
              whiteSpace: 'normal',
            }}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

const containerStyle = {
  position: 'fixed',
  top: '0px',
  left: '0px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}

const notificationStyle = {
  display: 'flex',
  padding: '10px',
  margin: '10px 0',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  whiteSpace: 'nowrap',
  transition: 'all 0.3s ease',
}
