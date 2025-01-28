import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { baseUrl } from "../utils/services";

export const useFetchRecipientUser = (chat, user) => {
  const [recipientUser, setRecipientUser] = useState(null);
  const recipientId = chat?.members.find((id) => id != user.id);
  
  useEffect(() => {
    const getUser = async () => {
      try {
        if (recipientId) {
          const response = await axios.get(
            `${baseUrl}/users/find/${recipientId}`
          );
          setRecipientUser(response.data);
        }
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Something went wrong!";
        toast.error(errorMessage);
      }
    };
    getUser();
  }, [recipientId]);

  return { recipientUser };
};
