import React, { useEffect, useRef, useState } from 'react';
import '../chatModelSelection/ChatModelSelection.css';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../state';
import { modelDetails } from './ChatModelDetails';
import { setChatModelDetail } from '../../../state/slice/reusableStatesSlice';
import { MdOutlineKeyboardArrowUp, MdOutlineKeyboardArrowDown } from "react-icons/md";

const ChatModelSelection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredModel, hoverModel] = useState<number | null>(null);
  const [descriptionPosition, setDescriptionPosition] = useState<{ top: number; left: number } | null>(null);
  const [modelDescription, setModelDescription] = useState<string | null>(null);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { chatModelDetail } = useSelector((state: RootState) => state.reusable);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dispatch = useDispatch<AppDispatch>();
  const hideModelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleShowModelDescr = (index: number) => {
    if (hideModelTimeoutRef.current) clearTimeout(hideModelTimeoutRef.current);
    hoverModel(index);
    const item = itemRefs.current[index];
    if (item) {
      const rect = item.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const isMobile = window.innerWidth <= 640;
  
        if (isMobile) {
          setDescriptionPosition({
            top: rect.top - containerRect.top - rect.height * 4.5,
            left: rect.left - containerRect.left,
          });
        } else {
          setDescriptionPosition({
            top: rect.top - containerRect.top,
            left: rect.left - containerRect.left + rect.width + 10,
          });
        }
      }
    }
  };

  const handleHideModelDescr = () => {
    hideModelTimeoutRef.current = setTimeout(() => {
      hoverModel(null);
      setDescriptionPosition(null);
      setModelDescription(null)
    }, 200);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  return (
    <div className="chatModelSelectionContainer" ref={containerRef}>
      <div
        className={isDarkMode ? 'chatAIModel' : 'chatAIModelLight'}
        onClick={() => setIsModalOpen((prev) => !prev)}
      >
        <img src={chatModelDetail?.image} alt="Chat AI Model" className="imageHeight" />
        <span className="chatAIModelText">{chatModelDetail?.name}</span>
        {isModalOpen ? <MdOutlineKeyboardArrowUp /> : <MdOutlineKeyboardArrowDown />}
      </div>
      {isModalOpen && (
        <div className={`chatAIModalList ${isDarkMode && 'chatAIModalListDark'}`}>
          <div className="chatAIModelItem">
            {modelDetails.map((model, index) => (
              <div
                key={index}
                className="chatAIModelItemHolder"
                ref={(el) => { itemRefs.current[index] = el; }} 
                onMouseEnter={() => {
                    handleShowModelDescr(index)
                    setModelDescription(model.description)
                }}
                onMouseLeave={handleHideModelDescr}
                onClick={() => {
                  dispatch(
                    setChatModelDetail({
                      name: model.name,
                      image: model.image,
                      model: model.model,
                      description: model.description,
                    })
                  );
                  setIsModalOpen(false);
                  handleHideModelDescr()
                }}
              >
                <img src={model.image} alt={model.name} className="chatAIModelImage" />
                <span className="chatAIModelName">{model.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {hoveredModel !== null && descriptionPosition && (
        <div
          className="chatAIModelItemDescription"
          style={{
            top: `${descriptionPosition.top}px`,
            left: `${descriptionPosition.left}px`,
          }}
          onMouseEnter={() => handleShowModelDescr(hoveredModel)}
          onMouseLeave={handleHideModelDescr}
        >
          <p className="chatAIModelDescriptionText">
            {modelDescription}
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatModelSelection;