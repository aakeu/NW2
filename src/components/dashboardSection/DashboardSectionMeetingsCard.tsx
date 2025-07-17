import React, { useRef, useState } from 'react';
import '../dashboardSection/DashboardSection.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../state';
import DashboardMeetingDeleteModal from './DashboardMeetingDeleteModal';
import { getDateAdded } from '../../utils/siderUtility/siderUtility';
import { setMeetingDescription, setShowMeetingDetailsModal } from '../../state/slice/reusableStatesSlice';

const DashboardSectionMeetingsCard: React.FC = () => {
    const [openMeetingDeleteModal, setOpenMeetingDeleteModal] = useState(false);
    const [chosenIndex, setChosenIndex] = useState<number | null>(null);
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const hideMeetingDeleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const handleShowMeetingDeleteModal = (number: number) => {
        if (hideMeetingDeleteTimeoutRef.current) clearTimeout(hideMeetingDeleteTimeoutRef.current);
        setChosenIndex(number)
        setOpenMeetingDeleteModal(true);
    };
    
    const handleHideMeetingDeleteModal = () => {
        hideMeetingDeleteTimeoutRef.current = setTimeout(
            () => {
                setChosenIndex(null)
                setOpenMeetingDeleteModal(false);
            },
            200,
        );
    };
    const handleMeetingDetailsClick = () => {
            dispatch(setShowMeetingDetailsModal(true))
            dispatch(setMeetingDescription({
            title: `Meeting held on ${getDateAdded(new Date())}`,
            description: `
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
                Lorem Ipsum is simply dummy text of the printing and 
                typesetting industry. 
            `
        }));
    };

    return (
        <div className="dashboardSectionMeetingsCard">
            {new Array(17).fill(null).map((_, index) => (
                <div className={isDarkMode ? "dashboardSectionMeetingsCardContentsDark" 
                    : "dashboardSectionMeetingsCardContents"} key={index}>
                    <h3 className='dashboardSectionMeetingsCardTitle'
                        onClick={handleMeetingDetailsClick}
                    >Meeting on 12/05/2024</h3>
                    <p className="dashboardSectionMeetingsCardDescription"
                        onClick={handleMeetingDetailsClick}
                    >
                        Lorem Ipsum is simply dummy text of the printing and 
                        typesetting industry. 
                    </p>
                    <div className='dashboardMeetingsOptions'>
                        <img src={isDarkMode ? 'images/ellipses.svg'
                            :'images/popup/ellipses.svg'} 
                            alt='ellipse' 
                            className='dashboardMeetingsEllipses' 
                            onMouseEnter={() => handleShowMeetingDeleteModal(index + 1)}
                            onMouseLeave={handleHideMeetingDeleteModal}
                        />
                        {openMeetingDeleteModal && chosenIndex && chosenIndex === index + 1 &&
                            <DashboardMeetingDeleteModal
                                onMouseEnter={() => handleShowMeetingDeleteModal(index + 1)}
                                onMouseLeave={handleHideMeetingDeleteModal}
                                data={{ id: index + 1, name: `Meeting held on ${getDateAdded(new Date())}` }}
                            />
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardSectionMeetingsCard