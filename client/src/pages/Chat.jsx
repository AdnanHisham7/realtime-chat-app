import React, { useContext, useState, useRef, useEffect, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Toaster } from 'sonner'
import { ChatContext } from '../context/ChatContext'
import Sidebar from '../components/Sidebar'
import UserChat from '../components/UserChat'
import DiscoverChats from '../components/DiscoverChats'
import ChatBox from '../components/ChatBox'
import { faComments, faGear, faUserGroup, faUserCircle, faPhoneSlash, faMicrophone, faVideo, faVideoSlash, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons'
import { useFetchAllUsers } from '../hooks/useFetchAllUsers'
import { baseUrl } from '../utils/services'
import useFetchUserProfile from '../hooks/useFetchUserProfile'
import { useFetchRecipientUser } from '../hooks/useFetchRecipient'

const Chat = () => {
  const { user } = useContext(AuthContext);
  const {
    userChats,
    currentChat,
    updateCurrentChat,
    call,
    answerCall,
    endCall,
    localStream,
    remoteStream,
    isCallActive,
    toggleMute,
    toggleVideo,
    isVideoEnabled,
    isMuted
  } = useContext(ChatContext);
  const { recipientUser } = useFetchRecipientUser(currentChat, user);
  const { userProfile } = useFetchUserProfile();

  const { allUsers, loading: allUsersLoading } = useFetchAllUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatBoxVisible, setChatBoxVisible] = useState(false);
  const [isDiscoverChatsVisible, setDiscoverChatsVisible] = useState(false); // New state

  // WebRTC related
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(0);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const ringtoneRef = useRef(null);
  const [isRingtoneLoaded, setIsRingtoneLoaded] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);

  // remote stream effect
  useEffect(() => {
    if (remoteVideoRef.current) {
      if (remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch(console.error);
        };
      } else {
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [remoteStream, isCallActive]);

  // local stream effect
  useEffect(() => {
    if (localVideoRef.current) {
      if (localStream) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play().catch(console.error);
        };
      } else {
        localVideoRef.current.srcObject = null; // Clear when stream ends
      }
    }
  }, [localStream, isCallActive]); // Add isCallActive dependency

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      // Clone the stream to avoid reference issues
      const audioStream = new MediaStream(remoteStream.getAudioTracks());
      audioRef.current.srcObject = audioStream;
      audioRef.current.play().catch(console.error);
    }
  }, [remoteStream, call]);

  const setupAudioAnalyzer = useCallback(() => {
    if (!remoteStream) return;
    const audioStream = new MediaStream(remoteStream.getAudioTracks());
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      console.error("AudioContext is not supported in this browser.");
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const source = audioContext.createMediaStreamSource(audioStream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const updateVolume = () => {
      analyser.getByteFrequencyData(dataArray);
      let sum = dataArray.reduce((a, b) => a + b, 0);
      let avg = sum / bufferLength;
      setVolume(avg / 255);
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };
    updateVolume();
  }, [remoteStream, call?.type]);

  useEffect(() => {
    let audioContext;
    const setup = async () => {
      if (remoteStream && call.type !== 'video') {
        audioContext = await setupAudioAnalyzer();
      }
    };
    setup();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [call?.type, remoteStream, setupAudioAnalyzer]);

  // Detect first user interaction (click/touch) and enable ringtone
  useEffect(() => {
    const enableAudio = () => setIsUserInteracted(true);

    document.addEventListener("click", enableAudio, { once: true });
    document.addEventListener("touchstart", enableAudio, { once: true });

    return () => {
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };
  }, []);

  useEffect(() => {
    const ringtone = ringtoneRef.current;
    if (!ringtone || !userProfile?.ringtone) return;

    const handleCanPlay = () => {
      setIsRingtoneLoaded(true);
    };

    ringtone.src = userProfile.ringtone;
    ringtone.load();
    ringtone.addEventListener('canplaythrough', handleCanPlay);

    return () => {
      ringtone.removeEventListener('canplaythrough', handleCanPlay);
      setIsRingtoneLoaded(false);
    };
  }, [userProfile?.ringtone]);


  // play effect to handle loading retries
  useEffect(() => {
    if (call?.isReceivingCall && isUserInteracted) {
      const playWithRetry = () => {
        ringtoneRef.current.play()
          .catch(err => {
            console.error('Play failed, retrying...', err);
            setTimeout(playWithRetry, 500);
          });
      };

      playWithRetry();
    } else {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, [call?.isReceivingCall, isUserInteracted]);

  // Preload the new ringtone
  useEffect(() => {
    if (ringtoneRef.current && userProfile?.ringtone) {
      ringtoneRef.current.src = userProfile.ringtone;
      ringtoneRef.current.load();
    }
  }, [userProfile?.ringtone]);

  // memoized caller
  const caller = React.useMemo(() =>
    call?.fromId ? allUsers.find(u => u._id === call.fromId) : null,
    [call?.fromId, allUsers]
  );

  const handleChatClick = (chat) => {
    updateCurrentChat(chat);
    setChatBoxVisible(true); // Show ChatBox on small screens
  };

  const handleBackToChats = () => {
    setChatBoxVisible(false); // Show ChatList again
  };

  const handleDiscoverToggle = () => {
    setDiscoverChatsVisible(!isDiscoverChatsVisible); // Toggle DiscoverChats visibility
  };

  // Add memoization for filtered chats
  const filteredChats = React.useMemo(() =>
    userChats?.filter(chat => {
      if (!user || allUsersLoading) return false;
      const recipientId = chat.members.find(id => id !== user.id);
      const recipient = allUsers.find(u => u._id === recipientId);
      return recipient?.name.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [],
    [userChats, user, allUsers, allUsersLoading, searchQuery]
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen">

      {/* Call initializing Interface */}
      {call && !isCallActive && !call?.isReceivingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-midGray p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              {call.type === 'video' ? "Calling..." : "Dialing..."}
            </h2>
            {call.type === 'video' && localStream && (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-32 h-32 object-cover rounded-lg mx-auto"
              />
            )}
            {call.type === 'audio' && (
              <div className="w-32 h-32 flex flex-col items-center justify-center bg-transparent rounded-lg mx-auto">
                {userProfile?.profileImage ? (
                  <img
                    src={`${baseUrl}${userProfile.profileImage}`}
                    alt="Your profile"
                    className="w-28 h-28 rounded-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faUserCircle}
                    className="w-20 h-20 text-gray-400"
                  />
                )}
              </div>
            )}
            <div className="flex justify-center mt-4 gap-4">
              <button
                onClick={endCall}
                className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600"
              >
                Cancel Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ringtone Audio Element */}
      <audio
        ref={ringtoneRef}
        src={userProfile?.ringtone || '/ringtones/ringtone1.mp3'}
        loop
      ></audio>

      {/* Incoming Call UI */}
      {call?.isReceivingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-midGray p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Incoming {call.type} call from {call?.name || "unknown"}
            </h2>

            <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-full mx-auto mb-4">
              {caller?.profileImage ? (
                <img
                  src={`${baseUrl}${caller.profileImage}`}
                  alt="Caller"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUserCircle}
                  className="w-20 h-20 text-gray-400"
                />
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  endCall();
                  ringtoneRef.current.pause();
                  ringtoneRef.current.currentTime = 0;
                }}
                className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  answerCall();
                  ringtoneRef.current.pause();
                  ringtoneRef.current.currentTime = 0;
                }}
                className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Active Call Interface*/}
      {isCallActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-midGray p-6 rounded-lg w-full max-w-4xl shadow-lg">
            <div className={`grid ${call.type === 'audio' ? 'grid-cols-2' : 'grid-cols-1'} gap-6 h-[70vh]`}>

              {/* Video Call UI */}
              {call.type === 'video' ? (
                <div className="w-full h-full flex flex-col">
                  {/* Remote Video */}
                  <div className="flex-1 relative bg-black flex items-center justify-center rounded-lg overflow-hidden shadow-md">
                    {remoteStream && (
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-[835px] h-[320px] object-cover rounded-md"
                      />
                    )}
                    <div className="absolute bottom-4 left-4 text-white bg-black/50 px-4 py-2 rounded-md text-sm font-medium shadow">
                      {(user?.name == call?.name ? recipientUser?.name : call?.name) || 'Participant'}
                    </div>
                  </div>

                  {/* Local Video & Controls */}
                  <div className="flex justify-between items-end p-4 bg-black/20 rounded-lg mt-4">
                    {/* Local Video */}
                    <div className="w-40 h-28 rounded-lg overflow-hidden shadow-lg border-2 border-white">
                      {localStream && (
                        <video
                          ref={localVideoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Call Controls */}
                    <div className="flex gap-6">
                      <button
                        onClick={endCall}
                        className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-all shadow-lg"
                      >
                        <FontAwesomeIcon icon={faPhoneSlash} className="text-xl" />
                      </button>

                      {call.type === 'video' && (
                        <button
                          onClick={() => toggleVideo(!isVideoEnabled)}
                          className={`p-4 rounded-full transition-all shadow-lg ${isVideoEnabled ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-black hover:bg-gray-200'
                            }`}
                        >
                          <FontAwesomeIcon icon={isVideoEnabled ? faVideo : faVideoSlash} />
                        </button>
                      )}

                      <button
                        onClick={() => toggleMute(!isMuted)}
                        className={`p-4 rounded-full transition-all shadow-lg ${isMuted ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                      >
                        <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Audio Call UI
                <>
                  {/* Local User Icon */}
                  <div className="relative flex flex-col items-center justify-center rounded-md border border-gray-600 bg-gray-800 p-6 shadow-lg">
                    {userProfile?.profileImage ? (
                      <img
                        src={`${baseUrl}${userProfile.profileImage}`}
                        alt="Your profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="w-32 h-32 text-gray-400"
                      />
                    )}
                    <div className="text-white text-sm mt-3 font-medium">You</div>
                  </div>

                  {/* Remote User Icon */}
                  <div
                    className="relative flex flex-col items-center justify-center rounded-md border border-primary p-6 shadow-lg"
                    style={{
                      backgroundColor: `rgba(211, 211, 211, ${volume * 2})`,
                      transition: 'background-color 0.1s linear',
                    }}
                  >
                    {(recipientUser?.profileImage || caller?.profileImage) ? (
                      <img
                        src={`${baseUrl}${(user?.name == call?.name ? recipientUser?.profileImage : caller?.profileImage)}`}
                        alt="Caller"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faUserCircle}
                        className="w-32 h-32 text-red-400"
                      />
                    )}
                    <div className="text-white text-sm mt-3 font-medium">
                      {(user?.name == call?.name ? recipientUser?.name : call?.name) || 'Participant'}
                    </div>

                    {/* Audio Element for Non-Video Call */}
                    {remoteStream && <audio ref={audioRef} autoPlay />}
                  </div>
                </>
              )}
            </div>

            {/* Audio Call Controls */}
            {call.type === 'audio' && (
              <div className="flex justify-center mt-6 gap-4">
                <button
                  onClick={endCall}
                  className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-all shadow-lg font-medium"
                >
                  End Call
                </button>
                <button
                  onClick={() => toggleMute(!isMuted)}
                  className={`p-4 rounded-full transition-all shadow-lg ${isMuted ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                >
                  <FontAwesomeIcon icon={isMuted ? faMicrophoneSlash : faMicrophone} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Sidebar */}
      <Sidebar className="hidden lg:block" />

      <Toaster position='bottom-left' />

      {/* Bottom Navigation for Small Screens */}
      <div className={`${isChatBoxVisible ? "hidden" : ""} lg:hidden fixed bottom-0 z-20 w-full bg-white dark:bg-customGray border-t dark:border-gray-800 flex justify-around py-2 shadow-md`}>
        <button className="flex-1 text-center">
          <FontAwesomeIcon icon={faComments} className="text-gray-600 dark:text-gray-300" />
        </button>
        <button className="flex-1 text-center">
          <FontAwesomeIcon icon={faUserGroup} className="text-gray-600 dark:text-gray-300" />
        </button>
        <button className="flex-1 text-center">
          <FontAwesomeIcon icon={faGear} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>


      {/* Chats List Section */}
      <div
        className={`w-full lg:w-1/3 lg:my-8 lg:ml-10 lg:mr-4 min-w-[300px] flex flex-col transition-transform duration-300 ${isChatBoxVisible ? "hidden lg:flex" : ""
          }`}
      >
        <div className={`${isDiscoverChatsVisible ? "hidden" : ""} w-full mx-auto rounded-lg border dark:border-gray-800 bg-white min-h-screen lg:min-h-0 dark:bg-customGray h-full flex flex-col`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4">
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200">Chats</h1>
            <button
              onClick={handleDiscoverToggle}
              className="px-2 py-1 text-xs font-medium text-gray-900 dark:text-gray-200 bg-transparent rounded-md hover:bg-gray-200 dark:hover:bg-midGray border border-gray-400 dark:border-gray-800"
            >
              + New
            </button>
          </div>


          {/* Search Bar */}
          <div className="p-4">
            <input
              type="text"
              placeholder="Chat search..."
              className="w-full p-3 border bg-transparent text-black dark:text-gray-200 border-gray-300 dark:border-gray-800 rounded-md text-xs focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto flex-1 scrollbar-hide">
            {!allUsersLoading && filteredChats.length > 0 ? (
              filteredChats.map((chat, index) => (
                <div key={index} onClick={() => handleChatClick(chat)}>
                  <UserChat chat={chat} user={user} />
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-gray-500">
                {allUsersLoading ? 'Loading...' : 'No chats found.'}
              </p>
            )}
          </div>
        </div>
        {/* Discover Chats Section */}
        {isDiscoverChatsVisible && (
          <DiscoverChats
            handleCancel={handleDiscoverToggle}
            onChatSelect={handleChatClick} // reuse the same function as chat list items
          />
        )}

      </div>


      {/* ChatBox Section */}
      <div
        className={`w-full lg:w-2/3 lg:my-8 lg:mx-4 lg:ml-0 min-w-[300px] flex flex-col transition-transform duration-300 ${isChatBoxVisible ? "flex" : "hidden lg:flex"
          }`}
      >
        <ChatBox handleBackToChats={handleBackToChats} />
      </div>
    </div>
  );
};




export default Chat
