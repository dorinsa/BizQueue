import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import axios from "axios";

const API_URL = "http://localhost:5000";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [fullName, setFullName] = useState("");


  async function register() {
  try {
    console.log("Register clicked", { fullName, email });

    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: fullName?.trim(),
        email: email?.trim().toLowerCase(),
        password,
        role: "OWNER",
      }),
    });

    const data = await res.json();
    console.log("Register response:", res.status, data);

    if (!res.ok) {
      alert(data?.message || "Register failed");
      return;
    }

    alert("Account created! Please login.");
    router.replace("/login");
  } catch (e: any) {
    console.log("Register error:", e);
    alert(e?.message || "Network error");
  }
}


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      
       <TextInput placeholder="Full name" value={fullName} onChangeText={setFullName} style={styles.input} />

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <Pressable style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 12 },
  button: { backgroundColor: "#5B8CFF", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
});
