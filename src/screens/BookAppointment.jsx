import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from '@react-native-community/datetimepicker'; // For DatePicker
import { Platform } from 'react-native'; // To handle platform-specific UI for DatePicker

export default function AddMedicine({ navigation }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [startDate, setStartDate] = useState(new Date()); // Default to current date
  const [endDate, setEndDate] = useState(new Date()); // Default to current date
  const [reminderTimes, setReminderTimes] = useState(['08:00', '14:00', '20:00']); // Default reminder times
  const [scheduleType, setScheduleType] = useState('Daily');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Fetch token on mount
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.navigate('Login');
        return;
      }
      setToken(storedToken);
    };

    fetchToken();
  }, []);

  // Handle form submission to add a new medicine
  const handleSubmit = async () => {
    if (!name || !dosage || !startDate || !endDate || reminderTimes.some(time => !time)) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    const medicineData = {
      name,
      dosage,
      startDate,
      endDate,
      reminderTimes,
      scheduleType,
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/medicines/user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicineData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Medicine added successfully.');
        navigation.goBack(); // Navigate back after successful submission
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to add medicine.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle the date and time selection
  const handleTimeChange = (index, selectedTime) => {
    const updatedReminderTimes = [...reminderTimes];
    updatedReminderTimes[index] = selectedTime;
    setReminderTimes(updatedReminderTimes);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Medicine</Text>

      <TextInput
        style={styles.input}
        placeholder="Medicine Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Dosage (e.g., 500mg)"
        value={dosage}
        onChangeText={setDosage}
      />

      {/* Calendar Picker for Start Date */}
      <Text>Start Date</Text>
      <DatePicker
        style={styles.datePicker}
        value={startDate}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(event, selectedDate) => setStartDate(selectedDate || startDate)}
      />

      {/* Calendar Picker for End Date */}
      <Text>End Date</Text>
      <DatePicker
        style={styles.datePicker}
        value={endDate}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={(event, selectedDate) => setEndDate(selectedDate || endDate)}
      />

      {/* Time Picker for Reminder Times */}
      {reminderTimes.map((time, index) => (
        <View key={index} style={styles.timePickerContainer}>
          <Text>Reminder Time {index + 1}</Text>
          <DatePicker
            style={styles.datePicker}
            value={new Date(`2022-01-01T${time}:00`)} // Use default date to focus on time
            mode="time"
            display="spinner"
            onChange={(event, selectedTime) => handleTimeChange(index, selectedTime.toLocaleTimeString())}
          />
        </View>
      ))}

      <TextInput
        style={styles.input}
        placeholder="Schedule Type (e.g., Daily)"
        value={scheduleType}
        onChangeText={setScheduleType}
      />

      <Button title="Add Medicine" onPress={handleSubmit} disabled={loading} />
      
      {loading && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingLeft: 10, borderRadius: 5 },
  datePicker: { width: '100%', marginBottom: 10 },
  timePickerContainer: { marginBottom: 10 },
  loader: { marginTop: 20 },
});
