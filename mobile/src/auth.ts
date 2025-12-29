import AsyncStorage from "@react-native-async-storage/async-storage";

export async function authHeader(): Promise<Record<string, string>> {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}
