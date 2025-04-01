import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DoctorDashboard({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  // ✅ Fetch appointments on mount
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

        const response = await fetch(`${API_URL}/appointments/doctor`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        const data = await response.json();
        if (response.ok) {
          // ✅ Sort by latest appointment first
          const sortedAppointments = data.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
          setAppointments(sortedAppointments);
          setFilteredAppointments(sortedAppointments);
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
    return date.toLocaleString();
  };

  // ✅ Filter Appointments By Selected Date
  const filterByDate = (date) => {
    setSelectedDate(date);
    if (!date) {
      setFilteredAppointments(appointments); // Reset filter if no date is selected
    } else {
      const formattedDate = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
      const filtered = appointments.filter((item) => item.appointmentDate.startsWith(formattedDate));
      setFilteredAppointments(filtered);
    }
  };

  // ✅ Change Appointment Status (Accept/Cancel)
  const updateStatus = async (appointmentId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}/status?newStatus=${newStatus}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert('Success', `Appointment ${newStatus.toLowerCase()} successfully.`);
        setAppointments((prevAppointments) =>
          prevAppointments.map((appointment) =>
            appointment.id === appointmentId ? { ...appointment, status: newStatus } : appointment
          )
        );
        filterByDate(selectedDate); // Refresh filtered list
      } else {
        Alert.alert('Error', `Failed to update appointment status.`);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doctor's Dashboard</Text>

      {/* ✅ Date Picker Button */}
      <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.datePickerText}>
          {selectedDate ? `📅 ${selectedDate.toDateString()}` : '📅 Select Date'}
        </Text>
      </TouchableOpacity>

      {/* ✅ Show Date Picker when needed */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) filterByDate(date);
          }}
        />
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : filteredAppointments.length === 0 ? (
        <Text style={styles.noAppointments}>No appointments found.</Text>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.patientName}>👤 {item.user?.name || 'Unknown Patient'}</Text>
              <Text style={styles.contactInfo}>📞 Contact: {item.user?.phone || 'N/A'}</Text>
              <Text style={styles.contactInfo}>📧 Email: {item.user?.email || 'N/A'}</Text>
              <Text style={styles.appointmentDate}>📅 {formatDateTime(item.appointmentDate)}</Text>
              <Text style={[styles.status, item.status === 'Cancelled' ? styles.cancelledStatus : null]}>
                🟢 Status: {item.status}
              </Text>

              {/* Action Buttons */}
              {item.status === 'Scheduled' && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.acceptButton} onPress={() => updateStatus(item.id, 'Accepted')}>
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => updateStatus(item.id, 'Cancelled')}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
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
  datePickerButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  datePickerText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  noAppointments: { fontSize: 18, textAlign: 'center', marginTop: 20, color: 'gray' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  patientName: { fontSize: 18, fontWeight: 'bold' },
  contactInfo: { fontSize: 14, color: 'gray', marginTop: 3 },
  appointmentDate: { fontSize: 14, marginTop: 5 },
  status: { fontSize: 14, fontWeight: 'bold', marginTop: 5 },
  cancelledStatus: { color: 'red' }, // Make status red if cancelled
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  acceptButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, flex: 1, marginRight: 5 },
  cancelButton: { backgroundColor: 'red', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
});
