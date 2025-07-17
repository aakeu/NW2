import React from "react";
import '../onboarding/Onboarding.css'
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../state";
import {
    setIsOnboardingBookmark,
    setIsOnboardingCarryoutASearch,
     setIsOnboardingDashboardLogo,
     setIsOnboardingGPTLogo,
     setIsOnboardingHomeLogo,
     setIsOnboardingSearchEngine, 
    setIsOnboardingSearchPanel, 
    setIsOnboardingSelectAFolder, 
    setIsOnboardingVisitSite, 
    setShowOnboardingModal 
} from "../../state/slice/reusableStatesSlice";
import { setQuery } from "../../state/slice/searchSlice";
import { setActiveSearchEngineOption } from "../../state/slice/searchEngineOptionSlice";

interface OnboardingProps {
    style?: React.CSSProperties;
    tipPosition?: string
}

const OnboardingModal: React.FC<OnboardingProps> = ({ style, tipPosition }) => {
    const IsDarkMode = useSelector((state: RootState) => state.theme.isDarkMode)
    const { isOnboardingHomeLogo, 
            isOnboardingSearchPanel, 
            isOnboardingSelectSearchEngine,
            isOnboardingCarryoutASearch,
            isOnboardingVisitSite,
            isOnboardingGPTLogo,
            isOnboardingSelectAFolder,
            isOnboardingBookmark,
            isOnboardingDashboardLogo 
        } = useSelector((state: RootState) => state.reusable)
    const dispatch = useDispatch<AppDispatch>()

    const handleSkip = () => {
        dispatch(setShowOnboardingModal(false))
    }
    const handleNext = async () => {
        if (isOnboardingHomeLogo) {
            dispatch(setIsOnboardingSearchPanel(true))
        } else if (isOnboardingSearchPanel) {
            dispatch(setIsOnboardingSearchEngine(true))
        } else if (isOnboardingSelectSearchEngine) {
            dispatch(setActiveSearchEngineOption('Google'))
            dispatch(setIsOnboardingCarryoutASearch(true))
        } else if (isOnboardingCarryoutASearch) {
            dispatch(setQuery({
                query: "History of Tom and Jerry",
                engine: "Google"
            }))
            dispatch(setIsOnboardingVisitSite(true))
        } else if (isOnboardingVisitSite) {
            dispatch(setIsOnboardingGPTLogo(true))
        } else if (isOnboardingGPTLogo) {
            dispatch(setIsOnboardingSelectAFolder(true))
        } else if (isOnboardingSelectAFolder) {
            dispatch(setIsOnboardingBookmark(true))
        } else if (isOnboardingBookmark) {
            dispatch(setIsOnboardingDashboardLogo(true))
        }
    }
    const handlePrevious = async () => {
        if (isOnboardingDashboardLogo) {
            dispatch(setIsOnboardingBookmark(true))
        } else if (isOnboardingBookmark) {
            dispatch(setIsOnboardingSelectAFolder(true))
        } else if (isOnboardingSelectAFolder) {
            dispatch(setIsOnboardingGPTLogo(true))
        } else if (isOnboardingGPTLogo) {
            dispatch(setIsOnboardingVisitSite(true))
        } else if (isOnboardingVisitSite) {
            dispatch(setIsOnboardingCarryoutASearch(true))
        } else if (isOnboardingCarryoutASearch) {
            dispatch(setIsOnboardingSearchEngine(true))
        } else if (isOnboardingSelectSearchEngine) {
            dispatch(setIsOnboardingSearchPanel(true))
        } else if (isOnboardingSearchPanel) {
            dispatch(setIsOnboardingHomeLogo(true))
        }
    }
    return (
        <div className={`${IsDarkMode ? 'onboardingModalDark' : 'onboardingModal'} 
            ${IsDarkMode ? `${tipPosition}Dark` : tipPosition}`}
            style={style}
        >
            <div className="onboardingModalContent">
                <img
                    src="images/close.svg"
                    alt="close"
                    className="deleteModalClose"
                    onClick={() => {
                        dispatch(setShowOnboardingModal(false))
                    }}
                />
                {isOnboardingHomeLogo && (
                    <p className={"onboardingDetails"}>
                        Welcome to QuickSearch+! Anytime you need to return to your starting 
                        point, just click the logo. It’s your quick way back home, no matter where you are.
                    </p>
                )}
                {isOnboardingSearchPanel && (
                    <p className={"onboardingDetails"}>
                        Here's your search panel! Dive into the 
                        web using our keyword-based search. Get results directly within the extension, 
                        making your search experience smarter and faster.
                    </p>
                )}
                {isOnboardingSelectSearchEngine && (
                    <p className={"onboardingDetails"}>
                        Select Your Search Engine! Whether you're looking for 
                        general web results or academic papers, easily switch between Google and Google 
                        Scholar to get the most relevant results for your search. 
                    </p>
                )}
                {isOnboardingCarryoutASearch && (
                    <p className={"onboardingDetails"}>
                       Try It Out! Enter your search term and see how your results 
                        display directly in the extension. Experience the convenience of browsing without 
                        leaving your page! 
                    </p>
                )}
                {isOnboardingVisitSite && (
                    <p className={"onboardingDetails"}>
                       Get Instant Insights! Hover over the 'Visit Site' label for 3 seconds to 
                        reveal a quick, informative summary of the webpage—no clicks needed, just pure 
                        convenience 
                    </p>
                )}
                {isOnboardingGPTLogo && (
                    <p className={"onboardingDetails"}>
                        Unlock AI Power! Click on the GPT to switch from keyword 
                        searches to natural language queries. Ask questions, get answers—right within 
                        QuickSearch+. 
                    </p>
                )}
                {isOnboardingSelectAFolder && (
                    <p className={"onboardingDetails"}>
                        Organize with Ease! Step 1: Select a folder or leave 
                        it unselected to decide where your URL will be saved. A simple click on the 
                        bookmark icon does the rest!  
                    </p>
                )}
                {isOnboardingBookmark && (
                    <p className={"onboardingDetails"}>
                        Finalize Your Bookmark! Click the bookmark to save it to your chosen 
                        folder. Your favorite links are now just a click away! 
                    </p>
                )}
                {isOnboardingDashboardLogo && (
                    <p className={"onboardingDetails"}>
                        Click on 'Dashboard' to view all your bookmarked items and more, 
                        all in one place! 
                    </p>
                )}
                <div className="onboardAction">
                    <button className="onboardingBtnSkip" onClick={handleSkip}>Skip</button>
                    <button 
                        className={`onboardingBtnPrevious ${isOnboardingHomeLogo && "onboardingBtnPreviousExtra"}`}
                        onClick={handlePrevious}
                    >Previous</button>
                    <button 
                        className={`onboardingBtnNext ${isOnboardingDashboardLogo && "onboardingBtnNextExtra"}`}
                        onClick={handleNext}
                    >Next</button>
                </div>
            </div>
        </div>
    )
}

export default OnboardingModal