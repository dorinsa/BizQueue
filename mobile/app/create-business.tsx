import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const API_URL = "http://localhost:5000";

export default function CreateBusiness() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Beauty");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    if (name.trim().length < 2) {
      Alert.alert("Validation", "Business name is required");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Auth", "Please login again");
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/business`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          category: category.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data?.message || "Failed to create business");
        return;
      }

      Alert.alert("Success", "Business created!");
      router.replace("/home");
    } catch (e: any) {
      Alert.alert("Network error", e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Business</Text>

      <TextInput
        placeholder="Business name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Category (e.g. Beauty)"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />

      <TextInput
        placeholder="Phone (optional)"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TextInput
        placeholder="Address (optional)"
        value={address}
        onChangeText={setAddress}
        style={styles.input}
      />

      <Pressable
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "Saving..." : "Create"}</Text>
      </Pressable>

      <Pressable onPress={() => router.back()}>
        <Text style={styles.link}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#5B8CFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "white", fontWeight: "bold" },
  link: { marginTop: 16, textAlign: "center", textDecorationLine: "underline" },
});
