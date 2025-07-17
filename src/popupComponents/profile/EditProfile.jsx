import React, { useEffect, useState } from 'react'
import '../profile/ProfileSection.css'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field } from 'formik'
import { useNotification } from '../notification/NotificationContext'
import { update_user } from '../../api/users'
import { useAuth } from '../../utils/AuthContext'
import ChangePassword from './ChangePassword'

export default function EditProfile({ setEditProfile, userDetail }) {
  const [fileName, setFileName] = useState('No file chosen')
  const [picture, setPicture] = useState(null)
  const [notification, setNotification] = useState({ message: '', type: '' })
  const { createNotification } = useNotification()
  const { getUserStatus } = useAuth()
  console.log('the picture', picture)

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    setPicture(file)
    setFileName(file ? file.name : 'No file chosen')
  }

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

  const editProfileValidator = Yup.object({
    name: Yup.string()
      .required('This field is required')
      .min(3, 'Characters must be greater than 2'),
  })

  const editProfileInitialValues = {
    name: userDetail.user.name,
  }

  const handleDivClick = () => {
    document.getElementById('fileInput').click()
  }

  const handleEditProfileSubmit = async (values, { setSubmitting }) => {
    const formData = new FormData()
    formData.append('name', values.name)
    if (picture) {
      formData.append('picture', picture)
    }
    const response = await update_user(userDetail.user.id, formData)

    setSubmitting(false)
    if (response.success) {
      await getUserStatus()
      setNotification({ message: response.message, type: 'success' })
    } else {
      console.error(response.message)
      setNotification({ message: response.message, type: 'error' })
    }
  }
  return (
    <>
      <div className="editProfileModal">
        <img
          src="images/popup/close.svg"
          alt="close"
          className="editProfileModalClose"
          onClick={() => {
            setEditProfile(false)
          }}
        />
        <div className="editProfileModalContainer">
          <h2 className="editProfileHeader">Edit Profile</h2>
          <span className="editProfileInstruction">
            Use the below form to update profile and change password
          </span>
          <Formik
            initialValues={editProfileInitialValues}
            validationSchema={editProfileValidator}
            onSubmit={handleEditProfileSubmit}
            enableReinitialize
          >
            {({ isSubmitting, isValid, dirty, values }) => (
              <Form>
                <div className="editProfileModalNameErrorHolder">
                  <Field name="name">
                    {({ field, _, meta }) => (
                      <div className="editProfileModalNameHolder">
                        <span className="editProfileModalNameText">NAME</span>
                        <input
                          type="text"
                          className={`editProfileModalNameInput ${
                            meta.error && meta.touched
                              ? 'editProfileModalNameInputExtra'
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
                    className="editProfileModalNameError"
                  />
                </div>
                <div className="editProfileImgUpload" onClick={handleDivClick}>
                  <input
                    type="file"
                    id="fileInput"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <div className="editProfileUploadContainer">
                    <div className="editProfileUploadFile">
                      <img
                        src="images/popup/uploAd.svg"
                        alt="close"
                        className="editProfileUploadFileImg"
                      />
                      Upload File
                    </div>
                    <span className="editProfileUploadText">{fileName}</span>
                  </div>
                </div>
                <button
                  disabled={
                    (values.name.trim() === userDetail.user.name.trim() &&
                      !picture) ||
                    isSubmitting
                  }
                  className={`${
                    (values.name.trim() === userDetail.user.name.trim() &&
                      !picture) ||
                    isSubmitting
                      ? 'editProfileBtnExtra'
                      : 'editProfileBtn'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Save Changes'}
                </button>
              </Form>
            )}
          </Formik>
          <ChangePassword setEditProfile={setEditProfile} />
        </div>
      </div>
    </>
  )
}
