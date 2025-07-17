import React from 'react'
import '../components/index.css'
import { createRoot } from 'react-dom/client'
import Sidebar from '../components/siderbar/Sidebar'
import { NotificationProvider } from '../components/notification/NotificationContext'
import ProviderContainer from './ProviderContainer'

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <ProviderContainer>
      <NotificationProvider>
        <Sidebar />
      </NotificationProvider>
    </ProviderContainer>,
)
