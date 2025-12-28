import { View, Text, Pressable, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Home() {
  async function logout() {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BizQueue</Text>

      <Pressable style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20 },
  button: { marginTop: 20, padding: 12, backgroundColor: "#FF5B5B", borderRadius: 8 },
  buttonText: { color: "white", fontWeight: "bold" },
});
