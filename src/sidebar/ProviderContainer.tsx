import { store } from '../state'
import React from 'react'
import { Provider } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css'
import { Bounce, ToastContainer } from 'react-toastify'

export default function ProviderContainer({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Provider store={store}>
      <>
        {children}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          theme="light"
          transition={Bounce}
        />
      </>
    </Provider>
  )
}
