import React, { useEffect, useState } from 'react'
import './LoginModal.css'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field, FormikHelpers } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../state'
import { setActiveLoginType } from '../../state/slice/loginModalSlice'
import { useNotification } from '../notification/NotificationContext'
import { loginWithGoogle, signIn, signUp } from '../../state/slice/authSlice'
import { fetchAllBookmarks} from '../../state/slice/bookmarkSlice'
import { fetchAllImages } from '../../state/slice/imageSlice'
import { fetchAllVideos } from '../../state/slice/videoSlice'
import { fetchAllArticles } from '../../state/slice/articleSlice'
import { fetchAllFolders } from '../../state/slice/folderSlice'
import { setIsOnboardingVideo, setShowVerifyAccountModal } from '../../state/slice/reusableStatesSlice'

type LoginValues = {
  email: string
  password: string
  remember: boolean
}

type SignUpValues = {
  name: string
  email: string
  password: string
  confirm_password: string
  remember: boolean
}

const LoginModal: React.FC = () => {
  const [passwordField, setPasswordField] = useState(true)
  const [confirmPasswordField, setConfirmPasswordField] = useState(true)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()
  const [isGoogleAuthentication, setIsGoogleAuthentication] = useState(false)
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
  const loginType = useSelector(
    (state: RootState) => state.loginType.activeLoginType,
  )
  const { isLoading, error } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const showNotification = (message: string, type: string) => {
      createNotification({
        message: message,
        duration: 5000,
        background: type === 'success' ? 'green' : 'red',
        color: '#fff',
      })
    }
    if (notification.message) {
      showNotification(notification.message, notification.type)

      if (
        loginType === 'signInModal' ||
        loginType === 'signUpModal' ||
        loginType === 'googleAuthentication'
      ) {
        dispatch(setActiveLoginType(''))
      }

      if (loginType === "signUpModal") {
        dispatch(setShowVerifyAccountModal(true))
      }
    }
  }, [notification, createNotification, loginType, dispatch])

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

  const signUpValidator = Yup.object({
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

  const signUpInitialValues: SignUpValues = {
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    remember: false,
  }

  const handleSubmit = async (
    values: LoginValues | SignUpValues,
    { setSubmitting }: FormikHelpers<LoginValues | SignUpValues>,
  ) => {
    try {
      if (loginType === 'signInModal') {
        const loginValues = values as LoginValues
        const { remember, ...signInDetails } = loginValues

        const result = await dispatch(signIn(signInDetails)).unwrap()

        setNotification({
          message: result.message || 'Login successful!',
          type: 'success',
        })
        await Promise.all([
          dispatch(fetchAllBookmarks()).unwrap(),
          dispatch(fetchAllFolders()).unwrap(),
          dispatch(fetchAllImages()).unwrap(),
          dispatch(fetchAllVideos()).unwrap(),
          dispatch(fetchAllArticles()).unwrap(),
        ]);
      } else if (loginType === 'signUpModal') {
        const signUpValues = values as SignUpValues
        const { confirm_password, remember, ...signUpDetails } = signUpValues

        const result = await dispatch(signUp(signUpDetails)).unwrap()

        setNotification({
          message:
            result.message || 'Sign-up successful! Please check your email.',
          type: 'success',
        })
        await Promise.all([
          dispatch(fetchAllBookmarks()).unwrap(),
          dispatch(fetchAllFolders()).unwrap(),
          dispatch(fetchAllImages()).unwrap(),
          dispatch(fetchAllVideos()).unwrap(),
          dispatch(fetchAllArticles()).unwrap(),
        ]);
      }
    } catch (err: any) {
      const errorMessage =
        err.message ||
        error ||
        'An unexpected error occurred. Please try again.'
      setNotification({
        message: errorMessage,
        type: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleAuthentication = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsGoogleAuthentication(true)
    setActiveLoginType('googleAuthentication')

    try {
      const result = await dispatch(loginWithGoogle()).unwrap()
      setNotification({
        message: 'Google login successful',
        type: 'success',
      })

      if (result.isNewUser) {
        dispatch(setIsOnboardingVideo(true))
      }
    } catch (err: any) {
      setNotification({
        message:
          err.message || 'Failed to log in with Google. Please try again.',
        type: 'error',
      })
    } finally {
      setIsGoogleAuthentication(false)
    }
  }

  return (
    <div className={isDarkMode ? 'loginModalDark' : 'loginModal'}>
      <img
        src="images/close.svg"
        alt="closeIcon"
        className="loginModalCloseIcon"
        onClick={() => dispatch(setActiveLoginType(''))}
      />
      <div className="loginModalContents">
        <h2
          className={isDarkMode ? 'loginModalHeaderDark' : 'loginModalHeader'}
        >
          {loginType === 'signInModal' ? 'Welcome back!' : 'Create an account'}
        </h2>
        <span
          className={
            isDarkMode ? 'loginModalSubHeaderDark' : 'loginModalSubHeader'
          }
        >
          {loginType === 'signInModal'
            ? 'Please login using your account'
            : 'Please fill the form to setup an account'}
        </span>
        <Formik<LoginValues | SignUpValues>
          initialValues={
            loginType === 'signInModal'
              ? loginInitialValues
              : loginType === 'signUpModal'
              ? signUpInitialValues
              : loginInitialValues
          }
          validationSchema={
            loginType === 'signInModal'
              ? loginValidator
              : loginType === 'signUpModal'
              ? signUpValidator
              : loginValidator
          }
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form>
              {loginType === 'signUpModal' && (
                <div className="loginModalNameErrorHolder">
                  <Field name="name">
                    {({ field, meta }: { field: any; meta: any }) => (
                      <div className="loginModalNameHolder">
                        <span className="loginModalNameText">NAME</span>
                        <input
                          type="text"
                          placeholder="Goodnews John"
                          className={`${
                            isDarkMode
                              ? 'loginModalNameInputDark'
                              : 'loginModalNameInput'
                          } ${
                            meta.error && meta.touched
                              ? 'loginModalNameInputExtra'
                              : ''
                          }`}
                          name="name"
                          {...field}
                          disabled={isSubmitting || isLoading}
                        />
                      </div>
                    )}
                  </Field>
                  <ErrorMessage
                    name="name"
                    component="div"
                    className={
                      isDarkMode
                        ? 'loginModalNameErrorDark'
                        : 'loginModalNameError'
                    }
                  />
                </div>
              )}
              <div className="loginModalEmailErrorHolder">
                <Field name="email">
                  {({ field, meta }: { field: any; meta: any }) => (
                    <div className="loginModalEmailHolder">
                      <span className="loginModalEmailText">EMAIL</span>
                      <input
                        type="email"
                        name="email"
                        {...field}
                        placeholder="goodnews@gmail.com"
                        className={`${
                          isDarkMode
                            ? 'loginModalEmailInputDark'
                            : 'loginModalEmailInput'
                        } ${
                          meta.error && meta.touched
                            ? 'loginModalEmailInputExtra'
                            : ''
                        }`}
                        disabled={isSubmitting || isLoading}
                      />
                    </div>
                  )}
                </Field>
                <ErrorMessage
                  name="email"
                  component="div"
                  className={
                    isDarkMode
                      ? 'loginModalEmailErrorDark'
                      : 'loginModalEmailError'
                  }
                />
              </div>
              <div className="loginModalPasswordErrorHolder">
                <Field name="password">
                  {({ field, meta }: { field: any; meta: any }) => (
                    <div className="loginModalPasswordHolder">
                      <span className="loginModalPasswordText">PASSWORD</span>
                      {passwordField ? (
                        <input
                          type="password"
                          placeholder="******"
                          className={`${
                            isDarkMode
                              ? 'loginModalPasswordInputDark'
                              : 'loginModalPasswordInput'
                          } ${
                            meta.error && meta.touched
                              ? 'loginModalPasswordInputExtra'
                              : ''
                          }`}
                          name="password"
                          {...field}
                          disabled={isSubmitting || isLoading}
                        />
                      ) : (
                        <input
                          type="text"
                          placeholder="password"
                          className={`${
                            isDarkMode
                              ? 'loginModalPasswordInputDark'
                              : 'loginModalPasswordInput'
                          } ${
                            meta.error && meta.touched
                              ? 'loginModalPasswordInputExtra'
                              : ''
                          }`}
                          name="password"
                          {...field}
                          disabled={isSubmitting || isLoading}
                        />
                      )}
                      <img
                        src={
                          passwordField
                            ? 'images/openEye.svg'
                            : 'images/closeEye.svg'
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
                  className={
                    isDarkMode
                      ? 'loginModalPasswordErrorDark'
                      : 'loginModalPasswordError'
                  }
                />
              </div>
              {loginType === 'signUpModal' && (
                <div className="loginModalConfirmPasswordErrorHolder">
                  <Field name="confirm_password">
                    {({ field, meta }: { field: any; meta: any }) => (
                      <div className="loginModalConfirmPasswordHolder">
                        <span className="loginModalConfirmPasswordText">
                          CONFIRM PASSWORD
                        </span>
                        {confirmPasswordField ? (
                          <input
                            type="password"
                            placeholder="Confirm Password"
                            className={`${
                              isDarkMode
                                ? 'loginModalConfirmPasswordInputDark'
                                : 'loginModalConfirmPasswordInput'
                            } ${
                              meta.error && meta.touched
                                ? 'loginModalConfirmPasswordInputExtra'
                                : ''
                            }`}
                            name="confirm_password"
                            {...field}
                            disabled={isSubmitting || isLoading}
                          />
                        ) : (
                          <input
                            type="text"
                            placeholder="Confirm Password"
                            className={`${
                              isDarkMode
                                ? 'loginModalConfirmPasswordInputDark'
                                : 'loginModalConfirmPasswordInput'
                            } ${
                              meta.error && meta.touched
                                ? 'loginModalConfirmPasswordInputExtra'
                                : ''
                            }`}
                            name="confirm_password"
                            {...field}
                            disabled={isSubmitting || isLoading}
                          />
                        )}
                        <img
                          src={
                            confirmPasswordField
                              ? 'images/openEye.svg'
                              : 'images/closeEye.svg'
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
                    className={
                      isDarkMode
                        ? 'loginModalConfirmPasswordErrorDark'
                        : 'loginModalConfirmPasswordError'
                    }
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
                  : loginType === 'signInModal'
                  ? 'LOGIN'
                  : 'CREATE AN ACCOUNT'}
              </button>
            </Form>
          )}
        </Formik>
        {loginType === 'signInModal' && (
          <div
            className={
              isDarkMode
                ? 'loginModalForgotPassResetDark'
                : 'loginModalForgotPassReset'
            }
          >
            Forgot your password?{' '}
            <span className="loginModalReset">Reset Here</span>
          </div>
        )}
        <span className={isDarkMode ? 'loginModalOrDark' : 'loginModalOr'}>
          OR
        </span>
        <span
          className={
            isDarkMode
              ? 'loginModalSignWithGoogleDark'
              : 'loginModalSignWithGoogle'
          }
        >
          {loginType === 'signInModal'
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
            src="images/googleLogo.svg"
            alt="googleIcon"
            className="loginModalGoogleIcon"
          />{' '}
          GOOGLE
        </button>
        <span
          className={
            loginType === 'signInModal'
              ? isDarkMode
                ? 'loginModalNoAccountDark'
                : 'loginModalNoAccount'
              : isDarkMode
              ? 'loginModalAlreadyHaveAccountDark'
              : 'loginModalAlreadyHaveAccount'
          }
        >
          {loginType === 'signInModal'
            ? 'Don’t have an account?'
            : 'Already have an account?'}
        </span>
        <button
          className="loginModalCreateAccount"
          onClick={
            loginType === 'signInModal'
              ? () => dispatch(setActiveLoginType('signUpModal'))
              : loginType === 'signUpModal'
              ? () => dispatch(setActiveLoginType('signInModal'))
              : () => {}
          }
        >
          {loginType === 'signInModal' ? 'CREATE AN ACCOUNT' : 'LOGIN'}
        </button>
      </div>
    </div>
  )
}

export default LoginModal
