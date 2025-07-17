import React, { useEffect } from "react";
import '../ocrSection/OCRSection.css'
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../state";
import { fetchTracking } from "../../state/slice/trackingSlice";
import MainOCR from "./MainOCR";

const OCRSection: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()

    useEffect(()=>{
        dispatch(fetchTracking())
    },[])

    return (<MainOCR/>)
}

export default OCRSection
