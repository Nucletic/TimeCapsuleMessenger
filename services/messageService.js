import { getUserIDToken, getCustomUUID, decryptData } from "../utils/utils";
import { API_BASE_URL } from "../utils/config";
import { SECRET_KEY } from "../utils/constants";

export const AddMessageContact = async (UserCustomUUID, navigation, CommonActions) => {
  try {
    navigation.dispatch(CommonActions.navigate({ name: 'Chats' }));

    const CustomUUID = await getCustomUUID();
    const encryptedIDToken = await getUserIDToken();
    const response = await fetch(`${API_BASE_URL}/users/AddChatContact`, {
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

  } catch (error) {
    console.error('Error Adding Message Contact:', error);
    throw error;
  }
}