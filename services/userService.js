import { getUserIDToken, getCustomUUID, decryptData } from "../utils/utils";
import { API_BASE_URL } from "../utils/config";
import { SECRET_KEY } from "../utils/constants";



export const getOwnProfile = async () => {
  try {
    const encryptedIdToken = await getUserIDToken();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${encryptedIdToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    let newUserData = {
      profileImage: data.user.profileImage,
      bannerImage: data.user.bannerImage,
      userId: data.user.userId,
      name: data.user.name,
      username: data.user.username,
      email: decryptData(data.user.email, SECRET_KEY),
      interests: data.user.interests,
      chatmateCount: data.user.chatmateCount,
      bio: data.user.bio,
      ExpoPushToken: data.user.ExpoPushToken,
    }
    return newUserData;

  } catch (error) {
    console.error('Error Fetching profile:', error);
    throw error;
  }
}

export const getUserProfile = async (UserCustomUUID) => {
  try {
    const encryptedIdToken = await getUserIDToken();
    const response = await fetch(`${API_BASE_URL}/users/${UserCustomUUID}/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${encryptedIdToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    let newUserData = {
      profileImage: data.user.profileImage,
      bannerImage: data.user.bannerImage,
      userId: data.user.userId,
      name: data.user.name,
      username: data.user.username,
      email: decryptData(data.user.email, SECRET_KEY),
      interests: data.user.interests,
      chatmateCount: data.user.chatmateCount,
      bio: data.user.bio,
      ExpoPushToken: data.user.ExpoPushToken,
    }
    return newUserData;

  } catch (error) {
    console.error('Error Fetching profile:', error);
    throw error;
  }
}

export const getUserRecommendation = async () => {
  try {
    const CustomUUID = await getCustomUUID();
    const encryptedIDToken = await getUserIDToken();
    const response = await fetch(`${API_BASE_URL}/users/getUserRecommendations/${CustomUUID}`, {
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
    return data.recommendations;

  } catch (error) {
    console.error('Error Fetching User Recommendations:', error);
    throw error;
  }
}