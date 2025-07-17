import React, { useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import * as Yup from 'yup'
import { Formik, Form, ErrorMessage, Field } from 'formik'
import '../gpt/GptSection.css'
import { Spinner } from '../../utils/utility'

export default function GptQuestionAnswer({
  response,
  query,
  selectedGptHistory,
  immediateResponse,
  userDetail,
  loading,
  setGptModal,
  activeChatId,
}) {
  const sanitizedContent = DOMPurify.sanitize(response)
  const [hoveredGptQuestion, setHoveredGptQuestion] = useState(null)
  const [gptQuestionData, setGptQuestionData] = useState('')
  const [selectedGptResponse, setSelectedGptResponse] = useState(null)
  const hideEditQuestionTimeoutRef = useRef(null)

  const copySelectedResponse = async (text) => {
    setSelectedGptResponse(text)
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setTimeout(() => {
          setSelectedGptResponse(null)
        }, 2000)
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  const saveSelectedResponse = async (query, text) => {
    const streamlinedName = query.split(' ').join('').slice(0, 27) + '...'
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${streamlinedName}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShowEditGptQuestion = (question) => {
    if (hideEditQuestionTimeoutRef.current) {
      clearTimeout(hideEditQuestionTimeoutRef.current)
    }
    setHoveredGptQuestion(question)
  }

  const handleHideEditGptQuestion = () => {
    hideEditQuestionTimeoutRef.current = setTimeout(() => {
      setHoveredGptQuestion(null)
    }, 200)
  }

  const editGptQuestionValidator = Yup.object({
    gptQuestion: Yup.string().required('This field is required'),
  })

  const handleEditGptQuestionSubmit = (values, { setSubmitting }) => {
    setGptQuestionData('')
    setSubmitting(false)
  }

  return (
    <>
      <div className="gptQuestionAnswer">
        {selectedGptHistory &&
          selectedGptHistory.result &&
          Array.isArray(selectedGptHistory.result) &&
          selectedGptHistory.result.length > 0 &&
          selectedGptHistory.result.map((data, index) => (
            <div key={data.id} className="gptQuestionAnswerContainer">
              <div className="gptQuestionHolder">
                {gptQuestionData === data.query ? (
                  <Formik
                    initialValues={{
                      gptQuestion: gptQuestionData || data.query,
                    }}
                    validationSchema={editGptQuestionValidator}
                    onSubmit={handleEditGptQuestionSubmit}
                    enableReinitialize
                  >
                    {({ isSubmitting, isValid, dirty }) => (
                      <Form>
                        <div className="gptQuestionEditAreaHolder">
                          <Field name="gptQuestion">
                            {({ field }) => (
                              <textarea
                                {...field}
                                className="gptQuestionEditDataTextarea"
                                rows={8}
                              />
                            )}
                          </Field>
                          <ErrorMessage
                            name="gptQuestion"
                            component="div"
                            className="gptQuestionEditDataTextareaError"
                          />
                          <div className="gptQuestionEditDataActionHolder">
                            <div className="gptQuestionEditDataActionContent">
                              <button
                                type="button"
                                className="gptQuestionEditDataCancelBtn"
                                onClick={() => setGptQuestionData('')}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className={`${
                                  !dirty || !isValid || isSubmitting
                                    ? 'gptQuestionEditDataSendBtnExtra'
                                    : 'gptQuestionEditDataSendBtn'
                                }`}
                                disabled={!dirty || !isValid || isSubmitting}
                              >
                                {isSubmitting ? 'Submitting...' : 'Send'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <div
                    className="gptQuestion"
                    onMouseEnter={() => handleShowEditGptQuestion(data.query)}
                    onMouseLeave={handleHideEditGptQuestion}
                  >
                    {data.query}
                    {hoveredGptQuestion === data.query && (
                      <>
                        <div
                          className="gptQuestionEditIconHolder"
                          onMouseEnter={() =>
                            handleShowEditGptQuestion(data.query)
                          }
                          onMouseLeave={handleHideEditGptQuestion}
                          onClick={() => setGptQuestionData(data.query)}
                        >
                          <img
                            src="images/popup/gptQuestionEditIcon.svg"
                            alt="edit icon"
                            className="gptQuestionEditIcon"
                          />
                        </div>
                        <div className="gptQuestionEditTooltip">
                          Edit message
                        </div>
                      </>
                    )}
                  </div>
                )}
                {userDetail && userDetail.token && userDetail.user.picture && (
                  <div className="gptQuestionUserHolder">
                    <img
                      src={userDetail.user.picture}
                      alt="gptQuestionUserImg"
                      className="gptQuestionUserImg"
                    />
                    <div className="gptUserOnline"></div>
                  </div>
                )}
                {userDetail && userDetail.token && !userDetail.user.picture && (
                  <div className="gptQuestionUserHolder">
                    {userDetail.user.name.slice(0, 1).toUpperCase()}
                    <div className="gptUserOnline"></div>
                  </div>
                )}
              </div>
              <div className="gptAnswerHolder">
                <div>
                  <img
                    src="images/popup/chatGptIcon.svg"
                    alt="gpt"
                    className="gptAnswerIcon"
                  />
                </div>
                <div className="gptAnswer">
                  <div
                    className="gptImmediateAnswerContent"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(data.response),
                    }}
                  ></div>
                  {/* {data.gpt} */}
                  <div className="gptAnswerActionHolder">
                    <div className="gptAnswerActionContents">
                      {selectedGptResponse === data.response && (
                        <div className="gptCopiedDiv">Copied to clipboard</div>
                      )}
                      <img
                        src="images/popup/copy.svg"
                        alt="gpt action icon"
                        className="gptActionIcon"
                        onClick={() => copySelectedResponse(data.response)}
                      />
                      <img
                        src="images/popup/save.svg"
                        alt="gpt action icon"
                        className="gptActionIcon"
                        onClick={() =>
                          saveSelectedResponse(data.query, data.response)
                        }
                      />
                      <img
                        src="images/popup/delete.svg"
                        alt="delete icon"
                        className="gptActionIcon"
                        onClick={() =>
                          setGptModal({
                            id: activeChatId,
                            queryId: data.id,
                            title: data.query,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        {immediateResponse && (
          <div className="gptImmediateResponse">
            <div className="gptImmediateResponseQuestionHolder">
              {gptQuestionData === query ? (
                <Formik
                  initialValues={{
                    gptQuestion: gptQuestionData || query,
                  }}
                  validationSchema={editGptQuestionValidator}
                  onSubmit={handleEditGptQuestionSubmit}
                  enableReinitialize
                >
                  {({ isSubmitting, isValid, dirty }) => (
                    <Form className="gptResponseForm">
                      <div className="gptQuestionEditAreaHolder">
                        <Field name="gptQuestion">
                          {({ field }) => (
                            <textarea
                              {...field}
                              className="gptQuestionEditDataTextarea"
                              rows={8}
                            />
                          )}
                        </Field>
                        <ErrorMessage
                          name="gptQuestion"
                          component="div"
                          className="gptQuestionEditDataTextareaError"
                        />
                        <div className="gptQuestionEditDataActionHolder">
                          <div className="gptQuestionEditDataActionContent">
                            <button
                              type="button"
                              className="gptQuestionEditDataCancelBtn"
                              onClick={() => setGptQuestionData('')}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className={`${
                                !dirty || !isValid || isSubmitting
                                  ? 'gptQuestionEditDataSendBtnExtra'
                                  : 'gptQuestionEditDataSendBtn'
                              }`}
                              disabled={!dirty || !isValid || isSubmitting}
                            >
                              {isSubmitting ? 'Submitting...' : 'Send'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Form>
                  )}
                </Formik>
              ) : (
                <>
                  <div
                    className="gptImmediateResponseQuestion"
                    onMouseEnter={() => handleShowEditGptQuestion(query)}
                    onMouseLeave={handleHideEditGptQuestion}
                  >
                    {query}
                    {hoveredGptQuestion === query && (
                      <>
                        <div
                          className="gptQuestionEditIconHolder"
                          onMouseEnter={() => handleShowEditGptQuestion(query)}
                          onMouseLeave={handleHideEditGptQuestion}
                          onClick={() => setGptQuestionData(query)}
                        >
                          <img
                            src="images/popup/gptQuestionEditIcon.svg"
                            alt="edit icon"
                            className="gptQuestionEditIcon"
                          />
                        </div>
                        <div className="gptQuestionEditTooltip">
                          Edit message
                        </div>
                      </>
                    )}
                  </div>
                  {userDetail &&
                    userDetail.token &&
                    userDetail.user.picture && (
                      <div className="gptQuestionUserHolder">
                        <img
                          src={userDetail.user.picture}
                          alt="gptQuestionUserImg"
                          className="gptQuestionUserImg"
                        />
                        <div className="gptUserOnline"></div>
                      </div>
                    )}
                  {userDetail &&
                    userDetail.token &&
                    !userDetail.user.picture && (
                      <div className="gptQuestionUserHolder">
                        {userDetail.user.name.slice(0, 1).toUpperCase()}
                        <div className="gptUserOnline"></div>
                      </div>
                    )}
                  {/* <div className="gptQuestionUserHolder">
                    BP
                    <div className="gptUserOnline"></div>
                  </div> */}
                </>
              )}
            </div>
            <div className="gptImmediateAnswerHolder">
              <div>
                <img
                  src="images/popup/chatGptIcon.svg"
                  alt="gpt"
                  className="gptImmediateAnswerIcon"
                />
              </div>
              <div className="gptImmediateAnswer">
                {loading ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Spinner />
                  </div>
                ) : (
                  <>
                    <div
                      className="gptImmediateAnswerContent"
                      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                    ></div>
                    <div className="gptImmediateAnswerActionHolder">
                      <div className="gptImmediateAnswerActionContents">
                        {selectedGptResponse === sanitizedContent && (
                          <div className="gptCopiedDiv">
                            Copied to clipboard
                          </div>
                        )}
                        <img
                          src="images/popup/copy.svg"
                          alt="gpt action icon"
                          className="gptActionIcon"
                          onClick={() =>
                            copySelectedResponse(
                              sanitizedContent,
                              setSelectedGptResponse,
                            )
                          }
                        />
                        <img
                          src="images/popup/save.svg"
                          alt="gpt action icon"
                          className="gptActionIcon"
                          onClick={() =>
                            saveSelectedResponse(query, sanitizedContent)
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
