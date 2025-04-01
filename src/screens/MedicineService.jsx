import { Alert } from "react-native";
import { API_URL } from "@env"; // Ensure API_URL is in .env file

// Fetch medicines for the user
export const fetchUserMedicines = async (userToken) => {
  try {
    const response = await fetch(`${API_URL}/medicines/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return await response.json(); // Returns medicine list
    } else {
      const errorData = await response.json();
      Alert.alert("Error", errorData.message || "Failed to fetch medicines.");
      return [];
    }
  } catch (error) {
    Alert.alert("Error", "Failed to fetch medicines: " + error.message);
    return [];
  }
};
