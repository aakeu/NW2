import React, { useState } from 'react'
import { setShowEditProfileModal } from '../../state/slice/reusableStatesSlice'
import { useDispatch, useSelector } from 'react-redux'
import { AuthUser } from '../../state/types/auth'
import { IoClose } from "react-icons/io5";
import { RootState } from '../../state';
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup'
import { MdOutlineVisibility } from 'react-icons/md';
import { AiOutlineEyeInvisible } from 'react-icons/ai'
import { toast } from 'react-toastify';
import { changePassword } from '../../state/slice/authSlice';

interface FieldFnType {
  field: any
  meta: any
}

export default function EditProfile({user, token}:{user: AuthUser|null, token:string|null}) {
  const {isDarkMode} = useSelector((state:RootState) => state.theme)  
  const [passwordField, setPassswordField] = useState({
    current: true,
    new: true,
    confirm: true,
  })
  const dispatch = useDispatch()

  const initialValues = {
    old_password: '',
    new_password: '',
    confirm_password: ''
  }

  const validator = Yup.object({
    old_password: Yup.string()
      .required('This field is required'),
    new_password: Yup.string()
      .required('This field is required')
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s])/gi,
        'Must include upper-Case, lower-case, number and special character'
      )
      .min(10, 'characters must be greater than 9'),
    confirm_password: Yup.string()
      .required('This field is required')
      .oneOf([Yup.ref('new_password')], 'Passwords must match'),
  })

  async function handleChangeOfPassword(
    values: {
      old_password: string
      new_password: string
      confirm_password: string
    },
    {
      setSubmitting,
      resetForm,
    }: FormikHelpers<{
      old_password: string
      new_password: string
      confirm_password: string
    }>
  ) {
    const res = await changePassword(token!, values)
    setSubmitting(false)
    resetForm()
    if (res) {
      toast.success('Password changed successfully')
      return;
    }

    toast.error('Failed to change password. Please try again.')
  }

  return (
    <div className={`edit-profile-container ${isDarkMode && 'edit-profile-dark'}`}>
      <button 
        className='edit-profile-close-btn' 
        onClick={()=>dispatch(setShowEditProfileModal(false))}
      >
        <IoClose size={20}/>
      </button>
      <div className='edit-profile-cover remove-scrollbar'>
        <h2>Edit Profile</h2>
        <p>Use the below form to update profile and change password</p>
        <div>
            <p className='profile-email-header'>USERNAME</p>
            <p className='edit-profile-user-details'>{user?.name}</p>
        </div>
        <div>
            <p className='profile-email-header'>EMAIL</p>
            <p className='edit-profile-user-details'>{user?.email}</p>
        </div>
        <h3>Change Password</h3>
        <Formik 
          initialValues={initialValues} 
          validationSchema={validator}
          onSubmit={handleChangeOfPassword}
        >
          {({ isSubmitting, dirty }) => (
            <Form>
              <label
                htmlFor="old_password"
                className="profile-email-header"
              >
                <p>OLD PASSWORD</p>
              </label>
              <Field name="old_password">
                {({ field, meta }: FieldFnType) => (
                  <div
                    className={`old-password-field-cover ${(meta.error && meta.touched) && 'field-toucehed'}`}
                  >
                    {passwordField.current ? (
                      <input
                        type="password"
                        placeholder="Old Password"
                        {...field}
                        className={`edit-password-input ${isDarkMode && 'input-dark'}`}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Old Password"
                        {...field}
                        className={`edit-password-input ${isDarkMode && 'input-dark'}`}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setPassswordField((prevState) => {
                          return {
                            ...prevState,
                            current: !prevState.current,
                          }
                        })
                      }
                    >
                      {passwordField.current ? (
                        <MdOutlineVisibility size={20} color="#034AA6" />
                      ) : (
                        <AiOutlineEyeInvisible size={20} color="#034AA6" />
                      )}
                    </button>
                  </div>
                )}
              </Field>
              <ErrorMessage
                name="old_password"
                component="div"
                className="edit-error-message"
              />
              <label
                htmlFor="new_password"
                className="profile-email-header"
              >
                <p>NEW PASSWORD</p>
              </label>
              <Field name="new_password">
                {({ field, meta }: FieldFnType) => (
                  <div
                    className={`old-password-field-cover ${(meta.error && meta.touched) && 'field-toucehed'}`}
                  >
                    {passwordField.new ? (
                      <input
                        type="password"
                        placeholder="New Password"
                        {...field}
                        className={`edit-password-input ${isDarkMode && 'input-dark'}`}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="New Password"
                        {...field}
                        className={`edit-password-input ${isDarkMode && 'input-dark'}`}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setPassswordField((prevState) => {
                          return {
                            ...prevState,
                            new: !prevState.new,
                          }
                        })
                      }
                    >
                      {passwordField.new ? (
                        <MdOutlineVisibility size={20} color="#034AA6" />
                      ) : (
                        <AiOutlineEyeInvisible size={20} color="#034AA6" />
                      )}
                    </button>
                  </div>
                )}
              </Field>
              <ErrorMessage
                name="new_password"
                component="div"
                className="edit-error-message"
              />
              <label
                htmlFor="confirm_password"
                className="profile-email-header"
              >
                <p>CONFIRM NEW PASSWORD</p>
              </label>
              <Field name="confirm_password">
                {({ field, meta }: FieldFnType) => (
                  <div
                    className={`old-password-field-cover ${(meta.error && meta.touched) && 'field-toucehed'}`}
                  >
                    {passwordField.confirm ? (
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        {...field}
                        className={`edit-password-input ${isDarkMode && 'input-dark'}`}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder="Confirm New Password"
                        {...field}
                        className={`edit-password-input ${isDarkMode && 'input-dark'}`}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setPassswordField((prevState) => {
                          return {
                            ...prevState,
                            confirm: !prevState.confirm,
                          }
                        })
                      }
                    >
                      {passwordField.confirm ? (
                        <MdOutlineVisibility size={20} color="#034AA6" />
                      ) : (
                        <AiOutlineEyeInvisible size={20} color="#034AA6" />
                      )}
                    </button>
                  </div>
                )}
              </Field>
              <ErrorMessage
                name="confirm_password"
                component="div"
                className="edit-error-message"
              />
              <div className='edit-submit-btn-cover'>
                <button 
                  type='submit'
                  disabled={isSubmitting || !dirty}
                  className={`edit-submit-btn ${isSubmitting || !dirty && 'edit-btn-disabled'}`}
                >
                  Update Password
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}
