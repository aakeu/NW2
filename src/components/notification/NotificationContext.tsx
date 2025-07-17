import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Notification {
  id: number
  message: string
  duration?: number
  background?: string
  color?: string
}

interface NotificationContextType {
  createNotification: (notification: Omit<Notification, 'id'>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    )
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const createNotification = ({
    message,
    duration = 3000,
    background = '#333',
    color = '#fff',
  }: Omit<Notification, 'id'>) => {
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

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  top: '0px',
  left: '0px',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}

const notificationStyle: React.CSSProperties = {
  display: 'flex',
  padding: '10px',
  margin: '10px 0',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  whiteSpace: 'nowrap',
  transition: 'all 0.3s ease',
}
