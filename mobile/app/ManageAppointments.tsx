import { useEffect, useState } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";

const API_URL = "http://192.168.56.1:5000";

type Appointment = {
    id: string;
    startAt: string;
    customerName: string;
    customerPhone?: string;
    notes?: string;
    serviceName?: string;
};


type Service = {
    id: string;
    name: string;
    durationMin: number;
};

export default function ManageAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [availability, setAvailability] = useState<
        { hour: number; available: boolean }[]
    >([]);
    const [selectedHour, setSelectedHour] = useState<number | null>(null);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [notes, setNotes] = useState("");

    async function authHeader() {
        const token = await AsyncStorage.getItem("token");
        return { Authorization: `Bearer ${token}` };
    }

    async function loadServices() {
        const res = await fetch(`${API_URL}/api/services`, {
            headers: await authHeader(),
        });
        const data = await res.json();
        if (res.ok) setServices(data.services || []);
    }

    async function loadAppointments() {
        const res = await fetch(`${API_URL}/api/appointments`, {
            headers: await authHeader(),
        });
        const data = await res.json();
        if (res.ok) setAppointments(data.appointments || []);
    }

    async function loadAvailability(date: string) {
        const res = await fetch(
            `${API_URL}/api/appointments/availability?date=${date}`,
            { headers: await authHeader() }
        );
        const data = await res.json();
        if (res.ok) setAvailability(data.availability || []);
    }

    async function createAppointment() {
        console.log("CREATE APPOINTMENT CLICKED");

        if (!selectedServiceId) {
            Alert.alert("Validation", "Please select a service");
            return;
        }

        if (selectedHour === null) {
            Alert.alert("Validation", "Please select a time");
            return;
        }

        if (!customerName.trim()) {
            Alert.alert("Validation", "Customer name is required");
            return;
        }

        const hourStr = String(selectedHour).padStart(2, "0");

        const startAt = new Date(
            `${selectedDate}T${hourStr}:00:00`
        ).toISOString();


        const payload = {
            serviceId: selectedServiceId,
            startAt,
            customerName,
            customerPhone,
            notes,
        };

        console.log("Payload:", payload);

        try {
            const res = await fetch(`${API_URL}/api/appointments`, {
                method: "POST",
                headers: {
                    ...(await authHeader()),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            console.log("Response:", res.status, data);

            if (!res.ok) {
                Alert.alert("Error", data?.message || "Failed to create appointment");
                return;
            }

            Alert.alert("Success", "Appointment created");

            setSelectedHour(null);
            setCustomerName("");
            setCustomerPhone("");
            setNotes("");

            loadAppointments();
            loadAvailability(selectedDate);
        } catch (e: any) {
            Alert.alert("Network error", e?.message || "Unknown error");
        }
    }

   async function deleteAppointment(id: string) {
  console.log("DELETE CLICKED", id);

  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    const res = await fetch(
      `${API_URL}/api/appointments/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      const data = await res.json();
      Alert.alert("Error", data.message || "Failed to delete appointment");
      return;
    }

    // הסרה מה־UI
    setAppointments((prev) =>
      prev.filter((a) => a.id !== id)
    );
  } catch (e: any) {
    Alert.alert("Network error", e.message);
  }
}





    useEffect(() => {
        loadServices();
        loadAppointments();
        loadAvailability(selectedDate);
    }, []);

    useEffect(() => {
        loadAvailability(selectedDate);
    }, [selectedDate]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Stack.Screen options={{ title: "Manage Appointments" }} />

            <Text style={styles.section}>Upcoming Appointments</Text>
            {appointments.map((a) => (
                <View key={a.id} style={styles.appointmentCard}>
                    <View style={styles.appointmentHeader}>
                        <Text style={styles.dateText}>
                            {new Date(a.startAt).toLocaleString()}
                        </Text>

                        <Pressable
                            onPress={() => deleteAppointment(a.id)}
                            style={styles.deleteButton}
                        >
                            <Text style={styles.deleteText}>Delete</Text>
                        </Pressable>
                    </View>

                    <Text style={styles.serviceText}>
                        Service: {a.serviceName}
                    </Text>

                    <Text>{a.customerName}</Text>
                    <Text>{a.customerPhone}</Text>

                    {a.notes ? <Text>{a.notes}</Text> : null}
                </View>
            ))}



            <Text style={styles.section}>Create Appointment</Text>

            {/* DATE PICKER */}
            <Text style={styles.label}>Date</Text>
            {Platform.OS === "web" ? (
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                        marginBottom: 10,
                    }}
                />
            ) : (
                <TextInput value={selectedDate} editable={false} style={styles.input} />
            )}

            {/* SERVICE */}
            <Text style={styles.label}>Service</Text>
            {services.map((s) => (
                <Pressable
                    key={s.id}
                    style={[
                        styles.option,
                        selectedServiceId === s.id && styles.selected,
                    ]}
                    onPress={() => setSelectedServiceId(s.id)}
                >
                    <Text>
                        {s.name} ({s.durationMin} min)
                    </Text>
                </Pressable>
            ))}

            {/* TIME */}
            <Text style={styles.label}>Time</Text>
            <View style={styles.grid}>
                {availability.map((h) => (
                    <Pressable
                        key={h.hour}
                        disabled={!h.available}
                        style={[
                            styles.hour,
                            !h.available && styles.disabled,
                            selectedHour === h.hour && styles.selected,
                        ]}
                        onPress={() => setSelectedHour(h.hour)}
                    >
                        <Text>{`${h.hour}:00`}</Text>
                    </Pressable>
                ))}
            </View>

            <TextInput
                placeholder="Customer name"
                style={styles.input}
                value={customerName}
                onChangeText={setCustomerName}
            />
            <TextInput
                placeholder="Customer phone"
                style={styles.input}
                value={customerPhone}
                onChangeText={setCustomerPhone}
            />
            <TextInput
                placeholder="Notes"
                style={[styles.input, { height: 80 }]}
                value={notes}
                onChangeText={setNotes}
                multiline
            />

            <Pressable style={styles.createBtn} onPress={createAppointment}>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                    Create Appointment
                </Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    section: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
    appointment: { marginTop: 10 },

    label: { marginTop: 12, fontWeight: "600" },

    option: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginTop: 6,
    },
    selected: { backgroundColor: "#5B8CFF" },

    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    hour: {
        width: "30%",
        padding: 10,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: "center",
    },
    disabled: { opacity: 0.4 },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
    },
    createBtn: {
        marginTop: 20,
        backgroundColor: "#5B8CFF",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    appointmentCard: {
  borderBottomWidth: 1,
  borderColor: "#ddd",
  paddingVertical: 12,
},

appointmentHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

dateText: {
  fontWeight: "bold",
},

serviceText: {
  fontWeight: "600",
  marginTop: 4,
},

deleteButton: {
  paddingHorizontal: 10,
  paddingVertical: 4,
},

deleteText: {
  color: "red",
  fontWeight: "bold",
},


});
