import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, Stack } from "expo-router";

const API_URL = "http://localhost:5000";

type Business = {
  id: string;
  name: string;
  category?: string;
  phone?: string;
  address?: string;
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);

  async function logout() {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  }

  async function fetchMyBusiness() {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/business/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 404) {
        setBusiness(null);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data?.message || "Failed to load business");
        return;
      }

      setBusiness(data.business);
    } catch (e: any) {
      Alert.alert("Network error", e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMyBusiness();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header + Logout */}
      <Stack.Screen
        options={{
          title: "Home",
          headerRight: () => (
            <Pressable onPress={logout} style={{ marginRight: 12 }}>
              <Text style={styles.logoutHeaderText}>Logout</Text>
            </Pressable>
          ),
        }}
      />

      <Text style={styles.title}>Welcome to BizQueue</Text>

      {loading ? (
        <View style={{ marginTop: 10, alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={styles.muted}>Loading...</Text>
        </View>
      ) : business ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Business</Text>
          <Text style={styles.value}>{business.name}</Text>
          <Text style={styles.muted}>
            {business.category || "General"}
            {business.address ? ` • ${business.address}` : ""}
          </Text>

          {/* Manage Services */}
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/services")}
          >
            <Text style={styles.primaryButtonText}>Manage Services</Text>
          </Pressable>

          {/* 🔹 Manage Appointments */}
          <Pressable
            style={[styles.primaryButton, { marginTop: 10 }]}
            onPress={() => router.push("/ManageAppointments")}
          >
            <Text style={styles.primaryButtonText}>Manage Appointments</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No business yet</Text>
          <Text style={styles.muted}>
            Create your business to start managing appointments.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/create-business")}
          >
            <Text style={styles.primaryButtonText}>Create Business</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
  },

  card: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
  },
  muted: {
    color: "#666",
  },

  primaryButton: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#5B8CFF",
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  logoutHeaderText: {
    color: "#FF5B5B",
    fontWeight: "bold",
  },
});
