import { getUserIDToken, getCustomUUID, decryptData } from "../utils/utils";
import { API_BASE_URL } from "../utils/config";
import { SECRET_KEY } from "../utils/constants";

export const sendMobileNotification = async (senderUUID, CustomUUID, Type, ExpoPushToken, profileImage, username) => {
  try {
    const encryptedIDToken = await getUserIDToken();
    const response = await fetch(`${API_BASE_URL}/users/sendNotification`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${encryptedIDToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ senderUUID, CustomUUID, Type, ExpoPushToken, profileImage, username })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error Sending Mobile Notification:', error);
    throw error;
  }
}