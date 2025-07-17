import React, { useEffect } from 'react'
import { useState } from 'react'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field } from 'formik'
import { useNotification } from '../notification/NotificationContext'
import { change_password } from '../../api/users'

export default function ChangePassword({ setEditProfile }) {
  const [isOldPassword, setIsOldPassword] = useState(false)
  const [isNewPassword, setIsNewPassword] = useState(false)
  const [isConfirmNewPassword, setIsConfirmNewPassword] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()

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
      if (notification.type === 'success') {
        setEditProfile(false)
      }
    }
  }, [notification])

  const changePasswordValidator = Yup.object({
    oldPassword: Yup.string().required('This field is required'),
    newPassword: Yup.string()
      .required('This field is required')
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])/gi,
        'Must include upper-Case, lower-case, number and special character',
      )
      .min(10, 'characters must be greater than 9'),
    confirmNewPassword: Yup.string()
      .required('This field is required')
      .oneOf(
        [Yup.ref('newPassword')],
        'Confirm new password must match New password',
      ),
  })

  const changePasswordInitialValues = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  }

  const handleChangePasswordSubmit = async (values, { setSubmitting }) => {
    const {
      oldPassword: currentPassword,
      newPassword,
      confirmNewPassword,
    } = values
    console.log('Renamed values:', { currentPassword, newPassword, confirmNewPassword });
    const response = await change_password(
      currentPassword,
      newPassword,
      confirmNewPassword,
    )
    setSubmitting(false)
    if (response.success) {
      setNotification({ message: response.message, type: 'success' })
    } else {
      console.error(response.message)
      setNotification({ message: response.message, type: 'error' })
    }
  }

  return (
    <>
      <div className="changePasswordContainer">
        <h2 className="changePasswordHeader">Change Password</h2>
        <Formik
          initialValues={changePasswordInitialValues}
          validationSchema={changePasswordValidator}
          onSubmit={handleChangePasswordSubmit}
          enableReinitialize
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form>
              <div className="changeOldPasswordHolderErrorHolder">
                <Field name="oldPassword">
                  {({ field, _, meta }) => (
                    <div className="changeOldPasswordHolder">
                      <span className="changeOldPasswordText">
                        OLD PASSWORD
                      </span>
                      <input
                        type={isOldPassword ? 'password' : 'text'}
                        placeholder="******"
                        className={`changeOldPasswordInput ${
                          meta.error && meta.touched
                            ? 'changeOldPasswordInputExtra'
                            : ''
                        }`}
                        name="oldPassword"
                        {...field}
                      />

                      <img
                        src={
                          isOldPassword
                            ? 'images/popup/openEye.svg'
                            : 'images/popup/closeEye.svg'
                        }
                        alt="close"
                        className="changePasswordEye"
                        onClick={() => setIsOldPassword(!isOldPassword)}
                      />
                    </div>
                  )}
                </Field>
                <ErrorMessage
                  name="oldPassword"
                  component="div"
                  className="oldPasswordPasswordError"
                />
              </div>
              <div className="changeNewPasswordHolderErrorHolder">
                <Field name="newPassword">
                  {({ field, _, meta }) => (
                    <div className="changeNewPasswordHolder">
                      <span className="changeNewPasswordText">
                        NEW PASSWORD
                      </span>
                      <input
                        type={isNewPassword ? 'password' : 'text'}
                        placeholder="******"
                        className={`changeNewPasswordInput ${
                          meta.error && meta.touched
                            ? 'changeNewPasswordInputExtra'
                            : ''
                        }`}
                        name="newPassword"
                        {...field}
                      />

                      <img
                        src={
                          isNewPassword
                            ? 'images/popup/openEye.svg'
                            : 'images/popup/closeEye.svg'
                        }
                        alt="close"
                        className="changePasswordEye"
                        onClick={() => setIsNewPassword(!isNewPassword)}
                      />
                    </div>
                  )}
                </Field>
                <ErrorMessage
                  name="newPassword"
                  component="div"
                  className="newPasswordPasswordError"
                />
              </div>
              <div className="changeConfirmNewPasswordHolderErrorHolder">
                <Field name="confirmNewPassword">
                  {({ field, _, meta }) => (
                    <div className="changeConfirmNewPasswordHolder">
                      <span className="changeConfirmNewPasswordText">
                        CONFIRM NEW PASSWORD
                      </span>
                      <input
                        type={isConfirmNewPassword ? 'password' : 'text'}
                        placeholder="******"
                        className={`changeConfirmNewPasswordInput ${
                          meta.error && meta.touched
                            ? 'changeConfirmNewPasswordInputExtra'
                            : ''
                        }`}
                        name="confirmNewPassword"
                        {...field}
                      />

                      <img
                        src={
                          isConfirmNewPassword
                            ? 'images/popup/openEye.svg'
                            : 'images/popup/closeEye.svg'
                        }
                        alt="close"
                        className="changePasswordEye"
                        onClick={() =>
                          setIsConfirmNewPassword(!isConfirmNewPassword)
                        }
                      />
                    </div>
                  )}
                </Field>
                <ErrorMessage
                  name="confirmNewPassword"
                  component="div"
                  className="confirmNewPasswordPasswordError"
                />
              </div>
              <button
                disabled={!dirty || !isValid || isSubmitting}
                className={`${
                  !dirty || !isValid || isSubmitting
                    ? 'changePasswordBtnExtra'
                    : 'changePasswordBtn'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Update Password'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </>
  )
}
