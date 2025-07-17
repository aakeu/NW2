import React, { useEffect, useState } from "react";
import '../chatSection/ChatSection.css'
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state";
import MainChat from "./mainchat/MainChat";
import { UserDetail } from "./type";
import { loadAuthData } from "../../state/slice/authSlice";
import { fetchTracking } from "../../state/slice/trackingSlice";

const ChatSection: React.FC = () => {
    const [userDetail, setUserDetail] = useState<UserDetail>()
    const dispatch = useDispatch<AppDispatch>()

    async function setUser(){
        const {user} = await loadAuthData()
        setUserDetail({user: user!})

    }

    useEffect(()=>{
        setUser()
        dispatch(fetchTracking())
    },[])

    return (
        <MainChat userDetail={userDetail!} />
    )
}

export default ChatSection
