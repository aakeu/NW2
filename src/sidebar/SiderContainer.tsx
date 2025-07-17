// import React from 'react'
import MenuBar from '../components/menuBar/MenuBar'
import Footer from '../components/footer/Footer'
import { useSelector } from 'react-redux'
import { RootState } from '../state'
import './sidebar.css'

// export default function SiderContainer({children}:{children: React.ReactNode}) {
//   const {isDarkMode} = useSelector((state:RootState)=>state.theme)

//   return (
//     <div className={`sider-container ${isDarkMode ? "darkmode" : "lightmode"}`}>
//         <div className='sider-col-1'>
//             <div className='child'>
//                 {children}
//             </div>
//             <MenuBar />
//         </div>
//         <Footer />
//     </div>
//   )
// }


//Video Summary
// src/sidebar/SiderContainer.tsx

// src/sidebar/SiderContainer.tsx

import React, { useEffect, useState, useCallback } from 'react';
// import MenuBar from '../components/menuBar/MenuBar';
// import Footer from '../components/footer/Footer';
// import { useSelector } from 'react-redux';
// import { RootState } from '../state';
// import './sidebar.css';

// Floating consent/recording panel
const FloatingPanel: React.FC<{
  open: boolean;
  recording: boolean;
  onAgree: () => void;
  onStop: () => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}> = ({ open, recording, onAgree, onStop, onCancel, loading, error }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 10000,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
        padding: '2.2em 2em 2em 2em',
        minWidth: 340,
        maxWidth: 420,
        width: '96%',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Cancel X button in top right */}
        <button
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            background: 'transparent',
            border: 'none',
            fontSize: 20,
            fontWeight: 700,
            color: '#999',
            cursor: 'pointer',
            lineHeight: 1,
            zIndex: 1
          }}
          title="Cancel and dismiss"
          aria-label="Cancel and dismiss"
        >
          ×
        </button>
        {!recording && (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 18 }}>
              Meeting Summarization Consent
            </div>
            <div style={{ marginBottom: 24, color: '#444', fontSize: 15 }}>
              By choosing to summarize this meeting, you agree to inform all participants that their audio may be processed for transcription and summarization.
            </div>
            {error && (
              <div style={{ color: 'red', marginBottom: 14 }}>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
              <button
                onClick={onAgree}
                disabled={loading}
                style={{
                  padding: '12px 38px',
                  fontSize: 16,
                  background: '#2365bf',
                  color: '#fff',
                  borderRadius: 6,
                  border: 0,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? "Starting..." : "I Agree"}
              </button>
              <button
                onClick={onCancel}
                disabled={loading}
                style={{
                  padding: '12px 38px',
                  fontSize: 16,
                  background: '#eee',
                  color: '#222',
                  borderRadius: 6,
                  border: 0,
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
        {recording && (
          <>
            <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10, color: '#21653e' }}>
              <span role="img" aria-label="recording">🔴</span> Recording in Progress...
            </div>
            <div style={{ color: '#555', marginBottom: 18, fontSize: 14 }}>
              Both your browser tab (participants) and microphone (host) audio are being captured for summarization.
            </div>
            <button
              onClick={onStop}
              disabled={loading}
              style={{
                padding: '12px 36px',
                fontSize: 16,
                background: '#d43434',
                color: '#fff',
                borderRadius: 6,
                border: 0,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Stopping...' : 'Stop & Summarize'}
            </button>
            <div style={{ fontSize: 13, color: '#999', marginTop: 10 }}>
              Please keep this panel open until the meeting ends.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

type RecordingStatus = 'idle' | 'ready' | 'recording' | 'error' | 'summary' | 'cancelled';

const SiderContainer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useSelector((state: RootState) => state.theme);

  // State
  const [status, setStatus] = useState<RecordingStatus>('ready');
  const [isRecording, setIsRecording] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFloatingPanel, setShowFloatingPanel] = useState(true);
  const [loading, setLoading] = useState(false);

  // Handle background messages
  const handleBackgroundMessages = useCallback((message: any) => {
    if (message.action === 'recordingStartedUpdate') {
      setStatus('recording');
      setIsRecording(true);
      setError(null);
      setSummary(null);
      setLoading(false);
      setShowFloatingPanel(true);
    } else if (message.action === 'recordingErrorUpdate') {
      setStatus('error');
      setIsRecording(false);
      setError(message.error || 'Unknown error occurred.');
      setLoading(false);
      setShowFloatingPanel(true);
    } else if (message.action === 'summarySaved') {
      setStatus('summary');
      setIsRecording(false);
      setSummary(message.summary);
      setLoading(false);
      setShowFloatingPanel(false); // Hide panel after summary, but you can keep true if you want summary inside
    } else if (message.action === 'recordingCancelled') {
      setStatus('cancelled');
      setIsRecording(false);
      setError(null);
      setLoading(false);
      setShowFloatingPanel(false);
    }
  }, []);

  // On mount: get current status and last summary
  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'getRecordingStatus' }, (response) => {
      if (response?.isRecording) {
        setIsRecording(true);
        setStatus('recording');
        setError(response.error ?? null);
        setShowFloatingPanel(true);
      } else {
        setIsRecording(false);
        setStatus('ready');
        setError(response?.error ?? null);
        setShowFloatingPanel(true);
      }
    });
    chrome.storage.local.get('meetingSummary', (data) => {
      if (data.meetingSummary) setSummary(data.meetingSummary);
    });
    chrome.runtime.onMessage.addListener(handleBackgroundMessages);
    return () => {
      chrome.runtime.onMessage.removeListener(handleBackgroundMessages);
    };
  }, [handleBackgroundMessages]);

  // ---- User actions ----
  const handleStartParticipantRecording = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'startParticipantRecording' }, (response) => {
      setLoading(false);
      if (response?.status === 'error') {
        setStatus('error');
        setError(response.error || 'Failed to start participant audio recording.');
        setShowFloatingPanel(true);
      } else {
        setIsRecording(true);
        setStatus('recording');
        setShowFloatingPanel(true);
      }
    });
  };

  const handleStopRecording = () => {
    setLoading(true);
    setStatus('ready');
    chrome.runtime.sendMessage({ action: 'stopRecording' }, (response) => {
      setLoading(false);
      // Summary will be shown via background message
    });
  };

  // Cancel and fully dismiss the floating panel
  const handleCancelFloating = () => {
    setLoading(true);
    chrome.runtime.sendMessage({ action: 'cancelRecordingFromSidePanel' }, () => {
      setLoading(false);
      setIsRecording(false);
      setStatus('cancelled');
      setSummary(null);
      setError(null);
      setShowFloatingPanel(false);
    });
  };

  // ---- Summary View (still shows in normal sidebar area) ----
  const renderSummary = () => (
    <div className="sidebar-summary">
      <h3>Meeting Summary</h3>
      <div className="sidebar-summary-box" style={{
        whiteSpace: 'pre-wrap',
        background: '#f7f7f7',
        padding: 12,
        borderRadius: 8,
        border: '1px solid #eee',
        marginBottom: 12,
        maxHeight: 300,
        overflowY: 'auto'
      }}>
        {summary}
      </div>
      <button onClick={() => setShowFloatingPanel(true)} style={{ marginRight: 8 }}>
        New Meeting
      </button>
    </div>
  );

  return (
    <div className={`sider-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Floating consent/recording panel (always overlays) */}
      <FloatingPanel
        open={showFloatingPanel}
        recording={isRecording && status === 'recording'}
        onAgree={handleStartParticipantRecording}
        onStop={handleStopRecording}
        onCancel={handleCancelFloating}
        loading={loading}
        error={error}
      />

      <MenuBar />
      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 8 }}>Meeting Summarizer</h2>
        {status === 'summary' && summary && renderSummary()}
        {status === 'ready' && !showFloatingPanel && !isRecording && !summary && !error && (
          <div style={{ color: '#888', marginTop: 16 }}>
            Ready to summarize. Click <strong>"I Agree"</strong> to start.
          </div>
        )}
        {loading && (
          <div style={{ color: '#888', marginTop: 8 }}>
            Please wait...
          </div>
        )}
      </div>
      <Footer />
      {children}
    </div>
  );
};


export default SiderContainer;
