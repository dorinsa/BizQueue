import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";

const API_URL = "http://localhost:5000";

type Service = {
  id: string;
  name: string;
  durationMin: number;
  price: number;
};

export default function ServicesScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);

  const [name, setName] = useState("");
  const [durationMin, setDurationMin] = useState("45");
  const [price, setPrice] = useState("120");

  async function authHeader() {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No token. Please login again.");
    return { Authorization: `Bearer ${token}` };
  }

  async function loadServices() {
    setLoading(true);
    try {
      const headers = await authHeader();
      const res = await fetch(`${API_URL}/api/services`, { headers });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data?.message || "Failed to load services");
        return;
      }

      setServices(data.services || []);
    } catch (e: any) {
      Alert.alert("Network error", e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function addService() {
    if (name.trim().length < 2) {
      Alert.alert("Validation", "Service name is required");
      return;
    }

    const dur = Number(durationMin);
    const pr = Number(price);

    if (!Number.isFinite(dur) || dur < 5) {
      Alert.alert("Validation", "Duration must be at least 5 minutes");
      return;
    }
    if (!Number.isFinite(pr) || pr < 0) {
      Alert.alert("Validation", "Price must be 0 or more");
      return;
    }

    setSaving(true);
    try {
      const headers = await authHeader();

      const res = await fetch(`${API_URL}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          name: name.trim(),
          durationMin: dur,
          price: pr,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Error", data?.message || "Failed to create service");
        return;
      }

      // ניקוי שדות + רענון רשימה
      setName("");
      setDurationMin("45");
      setPrice("120");
      await loadServices();
      Alert.alert("Success", "Service created!");
    } catch (e: any) {
      Alert.alert("Network error", e?.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Services" }} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Add Service</Text>

        <TextInput
          placeholder="Name (e.g. Manicure)"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <View style={styles.row}>
          <TextInput
            placeholder="Duration (min)"
            value={durationMin}
            onChangeText={setDurationMin}
            style={[styles.input, styles.half]}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            style={[styles.input, styles.half]}
            keyboardType="numeric"
          />
        </View>

        <Pressable
          style={[styles.primaryButton, saving && { opacity: 0.6 }]}
          onPress={addService}
          disabled={saving}
        >
          <Text style={styles.primaryButtonText}>{saving ? "Saving..." : "Add Service"}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <View style={styles.listHeader}>
          <Text style={styles.cardTitle}>My Services</Text>
          <Pressable onPress={loadServices}>
            <Text style={styles.link}>Reload</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 10 }}>
            <ActivityIndicator />
            <Text style={styles.muted}>Loading...</Text>
          </View>
        ) : services.length === 0 ? (
          <Text style={styles.muted}>No services yet. Add your first one 👆</Text>
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.muted}>
                  {item.durationMin} min • ₪{item.price}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, gap: 14 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
  },
  cardTitle: { fontSize: 18, fontWeight: "700" },
  muted: { color: "#666", marginTop: 6 },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  row: { flexDirection: "row", gap: 10 },
  half: { flex: 1 },

  primaryButton: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#5B8CFF",
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: { color: "white", fontWeight: "bold" },

  listHeader: { marginBottom: 8, flexDirection: "row", justifyContent: "space-between" },
  link: { color: "#5B8CFF", fontWeight: "700" },

  item: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  itemName: { fontSize: 16, fontWeight: "700" },
});
