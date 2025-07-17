import React, { useEffect, useState } from "react";
import '../deleteModal/DeleteModal.css';
import { AppDispatch, RootState } from "../../state";
import { useDispatch, useSelector } from "react-redux";
import { setShowMeetingDetailsModal } from "../../state/slice/reusableStatesSlice";

const MeetingDetailsModal: React.FC = () => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const { meetingDescription} 
        = useSelector((state: RootState) => state.reusable)
    const dispatch = useDispatch<AppDispatch>()

    return (
        <div className={isDarkMode ? "meetingDescriptionModalDark" : "meetingDescriptionModal"}>
            <div className="meetingDescriptionModalContent">
                <img
                    src="images/close.svg"
                    alt="close"
                    className="deleteModalClose"
                    onClick={() => {
                        dispatch(setShowMeetingDetailsModal(false))
                    }}
                />
                <h3
                    className={
                        isDarkMode ? 'meetingDescriptionHeaderDark' : 'meetingDescriptionHeader'
                    }
                >
                    {meetingDescription.title ? meetingDescription.title : "Meeting Details"}
                </h3>
                <p className="meetingDescriptionContentInfo">
                    {meetingDescription.description ? meetingDescription.description : "No description available."}
                </p>
            </div>
        </div>
    );
}

export default MeetingDetailsModal;