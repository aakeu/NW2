import React, { useState, useEffect } from 'react'
import '../loginModal/LoginModal.css'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field } from 'formik'
import { sign_in, sign_up } from '../../api/default'
import { useNotification } from '../notification/NotificationContext'
import { useAuth } from '../../utils/AuthContext'

export default function LoginModal({ setShowLoginModal, openVerifyAccount }) {
  const [modalType, setModalType] = useState('login')
  const [loading, setLoading] = useState(true)
  const [passwordField, setPasswordField] = useState(true)
  const [confirmPasswordField, setConfirmPasswordField] = useState(true)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const [isGoogleAuthentication, setIsGoogleAuthentication] = useState(false)
  const { createNotification } = useNotification()
  const { login } = useAuth()

  const handleShowLogin = () => setModalType('login')
  const handleShowSignup = () => setModalType('signup')

  useEffect(() => {
    const showNotification = (message, type) => {
      createNotification({
        message: message,
        duration: 5000,
        background: type === 'success' ? 'green' : 'red',
        color: '#fff',
      })
    }
    if (notification.message) {
      showNotification(notification.message, notification.type)
      // if (modalType === 'signup') {
      //   openVerifyAccount()
      // }
      if (modalType === 'login') {
        setShowLoginModal(false)
      }
    }
  }, [notification, createNotification, modalType, setShowLoginModal])

  const loginValidator = Yup.object({
    email: Yup.string()
      .required('This field is required')
      .email('Invalid email format'),
    password: Yup.string().required('This field is required'),
  })

  const loginInitialValues = {
    email: '',
    password: '',
    remember: false,
  }

  const signUPValidator = Yup.object({
    name: Yup.string()
      .required('This field is required')
      .min(3, 'Characters must be greater than 2')
      .matches(
        /^[A-Za-z\s]+$/,
        'Only alphabetic characters and spaces are allowed',
      ),
    email: Yup.string()
      .required('This field is required')
      .email('Invalid email format'),
    password: Yup.string()
      .required('This field is required')
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])/gi,
        'Must include uppercase, lowercase, number and special character',
      )
      .min(10, 'characters must be greater than 9'),
    confirm_password: Yup.string()
      .required('This field is required')
      .oneOf([Yup.ref('password')], 'Passwords must match'),
  })

  const signUpInitialValues = {
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    remember: false,
  }

  const handleSignupSubmit = async (values, { setSubmitting }) => {
    const { confirm_password, remember, ...details } = values
    const response = await sign_up(details)
    setSubmitting(false)
    if (response.success) {
      await login({
        token: response.token,
        refreshToken: response.refreshToken,
        tokenExpires: response.tokenExpires,
        user: response.user,
      })
      setNotification({ message: response.message, type: 'success' })
      openVerifyAccount()
    } else {
      setNotification({ message: response.message, type: 'error' })
      console.error(response.message)
    }
  }

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    const response = await sign_in(values)
    setSubmitting(false)
    if (response.success) {
      await login({
        token: response.token,
        refreshToken: response.refreshToken,
        tokenExpires: response.tokenExpires,
        user: response.user,
      })
      setNotification({ message: response.message, type: 'success' })
    } else {
      setNotification({ message: response.message, type: 'error' })
      console.error(response.message)
    }
  }

  const handleGoogleAuthentication = async (event) => {
    event.preventDefault()
    setIsGoogleAuthentication(true)

    try {
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'loginWithGoogle' })
      }
      chrome.runtime.onMessage.addListener(async function (message) {
        if (message.action === 'loginCompleted') {
          await login({
            token: message.token,
            refreshToken: message.refreshToken,
            tokenExpires: message.tokenExpires,
            user: message.user,
          })
          setNotification({
            message: 'Google login successful',
            type: 'success',
          })
          setIsGoogleAuthentication(false)
        } else if (message.action === 'needLoginViaEmailAndPassword') {
          console.error('User needs to login via email/password')
          setNotification({
            message: `Please log in using your email and password. Account is linked with ${message.provider}.`,
            type: 'error',
          })
          setIsGoogleAuthentication(false)
        } else if (message.action === 'loginFailed') {
          console.error(
            'Failed to log in with Google:',
            message.error || 'Unknown error',
          )
          setNotification({
            message: 'Failed to log in with Google. Please try again.',
            type: 'error',
          })
          setIsGoogleAuthentication(false)
        }
      })
    } catch (error) {
      console.error('Error during Google login:', error)
      setNotification({
        message: 'Failed to log in with Google. Please try again.',
        type: 'error',
      })
      setIsGoogleAuthentication(false)
    }
  }

  return (
    <>
      <div
        className={
          modalType === 'login' ? 'loginModal loginModalExtra' : 'loginModal'
        }
      >
        <div className="loginModalContainer">
          <img
            src="images/popup/close.svg"
            alt="close"
            className="loginModalClose"
            onClick={() => {
              setShowLoginModal(false)
            }}
          />
          <h2 className="loginModalWelcome">
            {modalType === 'login' ? 'Welcome back!' : 'Create an account'}
          </h2>
          <span className="loginModalInstr">
            {modalType === 'login'
              ? 'Please login using your account'
              : 'Please fill the form to setup an account'}
          </span>
          <Formik
            initialValues={
              modalType === 'login' ? loginInitialValues : signUpInitialValues
            }
            validationSchema={
              modalType === 'login' ? loginValidator : signUPValidator
            }
            onSubmit={
              modalType === 'login' ? handleLoginSubmit : handleSignupSubmit
            }
            enableReinitialize
          >
            {({ isSubmitting, isValid, dirty }) => (
              <Form>
                {modalType === 'signup' && (
                  <div className="loginModalNameErrorHolder">
                    <Field name="name">
                      {({ field, _, meta }) => (
                        <div className="loginModalNameHolder">
                          <span className="loginModalNameText">NAME</span>
                          <input
                            type="text"
                            placeholder="Goodnews John"
                            className={`loginModalNameInput ${
                              meta.error && meta.touched
                                ? 'loginModalNameInputExtra'
                                : ''
                            }`}
                            name="name"
                            {...field}
                          />
                        </div>
                      )}
                    </Field>
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="loginModalNameError"
                    />
                  </div>
                )}
                <div className="loginModalEmailErrorHolder">
                  <Field name="email">
                    {({ field, _, meta }) => (
                      <div className="loginModalEmailHolder">
                        <span className="loginModalEmailText">EMAIL</span>
                        <input
                          type="email"
                          name="email"
                          {...field}
                          placeholder="goodnews@gmail.com"
                          className={`loginModalEmailInput ${
                            meta.error && meta.touched
                              ? 'loginModalEmailInputExtra'
                              : ''
                          }`}
                        />
                      </div>
                    )}
                  </Field>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="loginModalEmailError"
                  />
                </div>
                <div className="loginModalPasswordErrorHolder">
                  <Field name="password">
                    {({ field, _, meta }) => (
                      <div className="loginModalPasswordHolder">
                        <span className="loginModalPasswordText">PASSWORD</span>
                        {passwordField ? (
                          <input
                            type="password"
                            placeholder="******"
                            className={`loginModalPasswordInput ${
                              meta.error && meta.touched
                                ? 'loginModalPasswordInputExtra'
                                : ''
                            }`}
                            name="password"
                            {...field}
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="password"
                            className={`loginModalPasswordInput ${
                              meta.error && meta.touched
                                ? 'loginModalPasswordInputExtra'
                                : ''
                            }`}
                            name="password"
                            {...field}
                          />
                        )}
                        <img
                          src={
                            passwordField
                              ? 'images/popup/openEye.svg'
                              : 'images/popup/closeEye.svg'
                          }
                          alt="close"
                          className="passwordEye"
                          onClick={() => setPasswordField(!passwordField)}
                        />
                      </div>
                    )}
                  </Field>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="loginModalPasswordError"
                  />
                </div>
                {modalType === 'signup' && (
                  <div className="loginModalConfirmPasswordErrorHolder">
                    <Field name="confirm_password">
                      {({ field, _, meta }) => (
                        <div className="loginModalConfirmPasswordHolder">
                          <span className="loginModalConfirmPasswordText">
                            CONFIRM PASSWORD
                          </span>
                          {confirmPasswordField ? (
                            <input
                              type="password"
                              placeholder="Confirm Password"
                              className={`loginModalConfirmPasswordInput ${
                                meta.error && meta.touched
                                  ? 'loginModalConfirmPasswordInputExtra'
                                  : ''
                              }`}
                              name="confirm_password"
                              {...field}
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder="Confirm Password"
                              className={`loginModalConfirmPasswordInput ${
                                meta.error && meta.touched
                                  ? 'loginModalConfirmPasswordInputExtra'
                                  : ''
                              }`}
                              name="confirm_password"
                              {...field}
                            />
                          )}
                          <img
                            src={
                              confirmPasswordField
                                ? 'images/popup/openEye.svg'
                                : 'images/popup/closeEye.svg'
                            }
                            alt="close"
                            className="confirmPasswordEye"
                            onClick={() =>
                              setConfirmPasswordField(!confirmPasswordField)
                            }
                          />
                        </div>
                      )}
                    </Field>
                    <ErrorMessage
                      name="confirm_password"
                      component="div"
                      className="loginModalConfirmPasswordError"
                    />
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!dirty || !isValid || isSubmitting}
                  className={`${
                    !dirty || !isValid || isSubmitting
                      ? 'loginModalSigninBtnExtra'
                      : 'loginModalSigninBtn'
                  }`}
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : modalType === 'login'
                    ? 'LOGIN'
                    : 'CREATE AN ACCOUNT'}
                </button>
              </Form>
            )}
          </Formik>
          {modalType === 'login' && (
            <div className="loginModalForgotPassReset">
              Forgot your password?{' '}
              <span className="loginModalReset">Reset Here</span>
            </div>
          )}
          <span className="loginModalOr">OR</span>
          <span className="loginModalSignWithGoogle">
            {modalType === 'login'
              ? 'Signin with Google'
              : 'Signup with Google'}
          </span>
          <button
            className={`${
              isGoogleAuthentication
                ? 'loginModalSigninWithGoogleBtnAuth'
                : 'loginModalSigninWithGoogleBtn'
            } `}
            onClick={handleGoogleAuthentication}
            disabled={isGoogleAuthentication}
          >
            <img
              src="images/popup/googleLogo.svg"
              alt="googleIcon"
              className="loginModalGoogleIcon"
            />{' '}
            GOOGLE
          </button>
          <span
            className={
              modalType === 'login'
                ? 'loginModalNoAccount'
                : 'loginModalAlreadyHaveAccount'
            }
          >
            {modalType === 'login'
              ? 'Don’t have an account?'
              : 'Already have an account?'}
          </span>
          <button
            className="loginModalCreateAccount"
            onClick={modalType === 'login' ? handleShowSignup : handleShowLogin}
          >
            {modalType === 'login' ? 'CREATE AN ACCOUNT' : 'LOGIN'}
          </button>
        </div>
      </div>
    </>
  )
}
