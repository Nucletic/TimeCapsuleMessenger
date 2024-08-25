import { getUserIDToken, getCustomUUID, decryptData } from "../utils/utils";
import { API_BASE_URL } from "../utils/config";
import { SECRET_KEY } from "../utils/constants";
import { sendMobileNotification } from "./notificationService";


export const CheckFollowing = async (UserCustomUUID) => {
  try {
    const CustomUUID = await getCustomUUID();
    const encryptedIDToken = await getUserIDToken();
    const response = await fetch(`${API_BASE_URL}/users/checkFollowing`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${encryptedIDToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userUUID: CustomUUID, otherUserUUID: UserCustomUUID })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.isFollowing;

  } catch (error) {
    console.error('Error Checking Following:', error)
    throw error;
  }
}

export const checkMutualFriends = async (UserCustomUUID) => {
  try {
    const CustomUUID = await getCustomUUID();
    const encryptedIDToken = await getUserIDToken();
    const response = await fetch(`${API_BASE_URL}/users/checkMutualFriends/${CustomUUID}/${UserCustomUUID}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${encryptedIDToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.friends;

  } catch (error) {
    console.error('Error Checking Mutual Friends:', error);
    throw error;
  }
}


export const checkBlockedUser = async (UserCustomUUID) => {
  try {
    const encryptedIDToken = await getUserIDToken();
    const response = await fetch(`${API_BASE_URL}/users/checkBlockedUser/${UserCustomUUID}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${encryptedIDToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.blocked;

  } catch (error) {
    console.error('Error Checking Blocked:', error);
    throw error;
  }
}


export const addChatmate = async (UserCustomUUID, ExpoPushToken, profileImage, username) => {
  try {
    const CustomUUID = await getCustomUUID();
    const encryptedIDToken = await getUserIDToken();
    const response = await fetch(`${API_BASE_URL}/users/${UserCustomUUID}/ChatmateRequest`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${encryptedIDToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ senderUUID: CustomUUID })
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    sendMobileNotification(CustomUUID, UserCustomUUID, 'CHATMATE_REQUEST', ExpoPushToken, profileImage, username);
    return true;

  } catch (error) {
    console.error('Error Sending Chatmate Request:', error);
    throw error;
  }
}