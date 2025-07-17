import React, { useEffect } from "react";
import '../translateSection/TranslateSection.css'
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state";
import { fetchTracking } from "../../state/slice/trackingSlice";
import MainTranslate from "./MainTranslate";

const TranslateSection: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()

    useEffect(()=>{
        dispatch(fetchTracking())
    },[])

    return (
        <MainTranslate/>
    )
}

export default TranslateSection
