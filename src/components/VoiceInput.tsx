'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PROJECT_TOOLS, PROJECT_INSTRUCTIONS, MODEL, BASE_URL } from '@/lib/projectTools';

interface VoiceInputProps {
  onToolCall: (toolCall: any) => void;
  selectedProjectId: string | null;
  drafts: any[];
  onAcceptDraft: (draftId: string) => void;
  onRejectDraft: (draftId: string) => void;
}

export default function VoiceInput({ onToolCall, selectedProjectId, drafts, onAcceptDraft, onRejectDraft }: VoiceInputProps) {
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const tracks = useRef<RTCRtpSender[] | null>(null);

  // Start a new realtime session
  async function startSession() {
    try {
      if (!selectedProjectId) {
        setConnectionError('Please select a project first');
        return;
      }

      if (!isSessionStarted) {
        setIsSessionStarted(true);
        setConnectionError(null);

        // Get an ephemeral session token
        const session = await fetch("/api/session").then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to get session: ${response.status}`);
          }
          return response.json();
        });

        const sessionToken = session.client_secret.value;
        const sessionId = session.id;

        console.log("Session id:", sessionId);

        // Create a peer connection
        const pc = new RTCPeerConnection();

        // Set up to play remote audio from the model
        if (!audioElement.current) {
          audioElement.current = document.createElement("audio");
        }
        audioElement.current.autoplay = true;
        pc.ontrack = (e) => {
          if (audioElement.current) {
            audioElement.current.srcObject = e.streams[0];
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

        stream.getTracks().forEach((track) => {
          const sender = pc.addTrack(track, stream);
          if (sender) {
            tracks.current = [...(tracks.current || []), sender];
          }
        });

        // Set up data channel for sending and receiving events
        const dc = pc.createDataChannel("oai-events");
        setDataChannel(dc);

        // Start the session using the Session Description Protocol (SDP)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sdpResponse = await fetch(`${BASE_URL}?model=${MODEL}`, {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/sdp",
          },
        });

        if (!sdpResponse.ok) {
          throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
        }

        const answer: RTCSessionDescriptionInit = {
          type: "answer",
          sdp: await sdpResponse.text(),
        };
        await pc.setRemoteDescription(answer);

        peerConnection.current = pc;
      }
    } catch (error: any) {
      console.error("Error starting session:", error);
      setConnectionError(error.message);
      setIsSessionStarted(false);
    }
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }
    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionStarted(false);
    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    setAudioStream(null);
    setIsListening(false);
    setConnectionError(null);
  }

  // Grabs a new mic track and replaces the placeholder track in the transceiver
  async function startRecording() {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setAudioStream(newStream);

      // If we already have an audioSender, just replace its track:
      if (tracks.current) {
        const micTrack = newStream.getAudioTracks()[0];
        tracks.current.forEach((sender) => {
          sender.replaceTrack(micTrack);
        });
      } else if (peerConnection.current) {
        // Fallback if audioSender somehow didn't get set
        newStream.getTracks().forEach((track) => {
          const sender = peerConnection.current?.addTrack(track, newStream);
          if (sender) {
            tracks.current = [...(tracks.current || []), sender];
          }
        });
      }

      setIsListening(true);
      console.log("Microphone started.");
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  }

  // Replaces the mic track with a placeholder track
  function stopRecording() {
    setIsListening(false);

    // Stop existing mic tracks so the user's mic is off
    if (audioStream) {
      audioStream.getTracks().forEach((track) => track.stop());
    }
    setAudioStream(null);

    // Replace with a placeholder (silent) track
    if (tracks.current) {
      const placeholderTrack = createEmptyAudioTrack();
      tracks.current.forEach((sender) => {
        sender.replaceTrack(placeholderTrack);
      });
    }
  }

  // Creates a placeholder track that is silent
  function createEmptyAudioTrack(): MediaStreamTrack {
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    return destination.stream.getAudioTracks()[0];
  }

  // Send a message to the model
  const sendClientEvent = useCallback(
    (message: any) => {
      if (dataChannel) {
        message.event_id = message.event_id || crypto.randomUUID();
        dataChannel.send(JSON.stringify(message));
      } else {
        console.error(
          "Failed to send message - no data channel available",
          message
        );
      }
    },
    [dataChannel]
  );

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    async function handleToolCall(output: any) {
      const toolCall = {
        name: output.name,
        arguments: output.arguments,
        call_id: output.call_id,
      };
      console.log("Tool call:", toolCall);
      
      // Handle draft acceptance/rejection directly here
      if (toolCall.name === 'accept_draft_changes') {
        drafts.forEach(draft => onAcceptDraft(draft.id));
        
        sendClientEvent({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: output.call_id,
            output: JSON.stringify({ success: true, message: "All draft changes have been accepted" }),
          },
        });
      } else if (toolCall.name === 'reject_draft_changes') {
        drafts.forEach(draft => onRejectDraft(draft.id));
        
        sendClientEvent({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: output.call_id,
            output: JSON.stringify({ success: true, message: "All draft changes have been rejected" }),
          },
        });
      } else {
        // Pass other tool calls to parent component
        onToolCall(toolCall);
        
        sendClientEvent({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: output.call_id,
            output: JSON.stringify({ success: true }),
          },
        });
      }

      // Force a model response
      sendClientEvent({
        type: "response.create",
      });
    }

    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        console.log("Received event:", event);
        
        if (event.type === "response.done") {
          const output = event.response.output[0];
          if (output?.type === "function_call") {
            handleToolCall(output);
          }
        }
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setIsListening(true);
        
        // Send session config
        const sessionUpdate = {
          type: "session.update",
          session: {
            tools: PROJECT_TOOLS,
            instructions: PROJECT_INSTRUCTIONS,
          },
        };
        sendClientEvent(sessionUpdate);
        console.log("Session update sent:", sessionUpdate);
      });
    }
  }, [dataChannel, sendClientEvent, onToolCall]);

  const handleConnectClick = async () => {
    if (isSessionActive) {
      console.log("Stopping session.");
      stopSession();
    } else {
      console.log("Starting session.");
      startSession();
    }
  };

  const handleMicToggleClick = async () => {
    if (isListening) {
      console.log("Stopping microphone.");
      stopRecording();
    } else {
      console.log("Starting microphone.");
      startRecording();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-2">
        {/* Error display */}
        {connectionError && (
          <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg max-w-xs text-sm">
            {connectionError}
          </div>
        )}
        
        {/* Status indicators */}
        <div className="flex space-x-2">
          {isSessionActive && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
              Connected
            </div>
          )}
          {isListening && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs animate-pulse">
              Listening
            </div>
          )}
        </div>
        
        {/* Microphone toggle button (only show if connected) */}
        {isSessionActive && (
          <button
            onClick={handleMicToggleClick}
            className={`w-12 h-12 rounded-full shadow-md transition-all duration-200 flex items-center justify-center ${
              isListening
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gray-500 hover:bg-gray-600'
            }`}
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        
        {/* Main connect/disconnect button */}
        <button
          onClick={handleConnectClick}
          disabled={isSessionStarted && !isSessionActive}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
            isSessionActive
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } ${isSessionStarted && !isSessionActive ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSessionActive ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center max-w-xs">
          {isSessionActive 
            ? 'Connected to AI assistant. Use mic button to toggle listening.' 
            : 'Click to connect to voice AI'}
        </div>
      </div>
    </div>
  );
}