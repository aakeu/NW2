import React, { useEffect } from "react";
import '../profileSection/ProfileSection.css'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import { FaAngleLeft } from "react-icons/fa6";
import { PiDotOutlineFill } from "react-icons/pi";
import { MdEmail } from "react-icons/md";
import { setShowEditProfileModal } from "../../state/slice/reusableStatesSlice";
import { activities, activitiesList, features, featuresList, trackingKey } from "../../utils/profile";
import FeatureContainer from "./FeatureContainer";
import { syncFetchEncryptToken } from "../../state/slice/getEncryptionTokenSlice";
import { toast } from "react-toastify";
import ActivityContainer from "./ActivityContainer";
import { fetchTracking } from "../../state/slice/trackingSlice";

const ProfileSection: React.FC = () => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const {user} = useSelector((state:RootState)=> state.auth)
    const dispatch = useDispatch<AppDispatch>()
    const {tracking} = useSelector((state:RootState)=>state.tracking)

    function editProfile (){
        dispatch(setShowEditProfileModal(true))
    }

    async function handleChangePlan(){
        const token = await syncFetchEncryptToken()
        if(token){
            window.open(`${process.env.WEB_APP_URL}dashboard?page=setting&t=pay&from=extension&token=${encodeURIComponent(token)}`)
        } else {
            toast.error('Please try again an error occurred.')
        }
    }

    useEffect(()=>{
        dispatch(fetchTracking())
    },[])

    return (
        <>
            {user && tracking ? (
                <div className={`${isDarkMode ? "profileSectionDark" : "profileSection"}`}>
                    <div className="profile-header">
                        <FaAngleLeft size={20} />
                        <h2>My Profile</h2>
                    </div>
                    <div className="profile-container remove-scrollbar ">
                        <div className="profile-user-details">
                            <div className="profile-phase1">
                                <div className="profile-img">
                                    <img 
                                        src={user.picture ? user.picture : 'images/placeholder.svg'}
                                    />
                                </div>
                                <div className="profile-details">
                                    <div className="profile-name">
                                        <p className="profile-username-header">USERNAME</p>
                                        <div className="profile-username">
                                            <span>{user.name}</span>
                                            <p className={`profile-sub-type ${user.subscriptionType === 'free' && 'free-sub'}`}>
                                                <PiDotOutlineFill size={24} />
                                                <span>{user.subscriptionType.toUpperCase()}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={editProfile} className="profile-edit-btn">Edit Profile</button>
                                </div>
                            </div>
                            <div className="profile-email-cover">   
                                <div className="profile-email-icon">
                                   <MdEmail />
                                </div>
                                <div className="profile-email-container">
                                    <span className='profile-email-header'>EMAIL</span>
                                    <span className="profile-email-text">{user.email}</span>
                                </div>
                            </div>
                        </div>
                        <div className="profile-info">
                            <div>
                                <h2 className="profile-info-header">Features</h2>
                                <div className="profile-feat-list">
                                    {featuresList.map((itm, i)=> (
                                        <div key={i} className="profile-feat-item">
                                            <FeatureContainer
                                                Icon={features[itm as keyof typeof features].icon} 
                                                name={itm} 
                                                featureState={features[itm as keyof typeof features][user.subscriptionType as 'free'|'standard'|'premium']}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleChangePlan}
                                    className='edit-submit-btn profile-btn-margin'
                                >
                                    Change Plan
                                </button>
                            </div>
                            <div>
                                <h2 className="profile-info-header">Account Activities</h2>
                                <div className="profile-feat-list">
                                    {activitiesList.map((name, i)=> {
                                        const total = activities[name as keyof typeof activities][user.subscriptionType as 'free'|'standard'|'premium']
                                        const current = tracking[trackingKey[name as keyof typeof trackingKey] as keyof typeof tracking] as number
                                        
                                        if(typeof total !== 'boolean')
                                            return (
                                                <div key={i} className="profile-feat-item">
                                                    <ActivityContainer name={name} current={current} total={total}/>
                                                </div>
                                            )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='profile-loader-container'>
                <span className="loader"></span>
                </div>
            )}
        </>
    )
}

export default ProfileSection