import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserBookings({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // ✅ Fetch token & appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (!storedToken) {
          Alert.alert('Session Expired', 'Please log in again.');
          navigation.navigate('Login');
          return;
        }
        setToken(storedToken);

        const response = await fetch(`${API_URL}/appointments/user`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        const data = await response.json();
        if (response.ok) {
          setAppointments(data);
        } else {
          Alert.alert('Error', 'Failed to fetch appointments.');
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // ✅ Convert Date-Time format
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Converts to local date & time
  };

  // ✅ Cancel Appointment Function
  const cancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/status?newStatus=Cancelled`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Appointment cancelled successfully.');
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === appointmentId ? { ...appointment, status: 'Cancelled' } : appointment
          )
        );
      } else {
        Alert.alert('Error', 'Failed to cancel appointment.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Appointments</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : appointments.length === 0 ? (
        <Text style={styles.noAppointments}>No appointments found.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.doctorName}>Dr. {item.doctor.name}</Text>
              <Text style={styles.hospital}>{item.doctor.hospitalName}</Text>
              <Text style={styles.category}>{item.doctor.category}</Text>
              <Text style={styles.appointmentDate}>📅 {formatDateTime(item.appointmentDate)}</Text>

              {/* Status with color change */}
              <Text style={[styles.status, item.status === 'Cancelled' ? styles.cancelledStatus : null]}>
                🟢 Status: {item.status}
              </Text>

              {/* Show Cancel Button if status is Scheduled */}
              {item.status === 'Scheduled' && (
                <TouchableOpacity style={styles.cancelButton} onPress={() => cancelAppointment(item.id)}>
                  <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  noAppointments: { fontSize: 18, textAlign: 'center', marginTop: 20, color: 'gray' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  doctorName: { fontSize: 18, fontWeight: 'bold' },
  hospital: { fontSize: 16, color: 'gray' },
  category: { fontSize: 16, fontStyle: 'italic' },
  appointmentDate: { fontSize: 14, marginTop: 5 },
  status: { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  cancelledStatus: { color: 'red' }, // Make status red if cancelled
  cancelButton: { backgroundColor: 'red', padding: 10, borderRadius: 5, marginTop: 10 },
  cancelButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});
