import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import axios from "axios";
import { baseUrl } from "../utils/services";

export const useFetchLatestMessage = (chat) => {
  const { newMessage, notifications } = useContext(ChatContext);
  const [ latestMessage, setLatestMessage ] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        if (chat?._id) {
          const response = await axios.get(`${baseUrl}/messages/${chat?._id}`);

          const messages = response?.data?.messages 
          const lastMessage = messages[messages?.length - 1];
          setLatestMessage(lastMessage)
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Something went wrong!";
        console.log(errorMessage);
      }
    };

    getMessages()
  }, [newMessage, notifications]);

  return { latestMessage }
};
