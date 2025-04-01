import React, { useEffect, useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

export default function HealthTracker() {
  const [formData, setFormData] = useState({
    date: new Date(),
    bloodSugar: '',
    bloodPressure: '',
    cholesterol: '',
    weight: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [healthData, setHealthData] = useState([]); // Stores fetched health records
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setFormData({ ...formData, date: selectedDate });
    }
    setShowDatePicker(false);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const fetchHealthData = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'You must be logged in.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/health/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        if (!data || data.length === 0) {
          setHealthData([]); // No data available
          return;
        }

        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Show latest first
        setHealthData(sortedData);
      } else {
        Alert.alert('Error', 'Failed to fetch data.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Error', 'You must be logged in to add health data.');
      return;
    }

    const formattedDate = formData.date.toISOString().split('T')[0];

    const dataToSend = {
      date: formattedDate,
      bloodSugar: parseFloat(formData.bloodSugar) || 0,
      bloodPressure: formData.bloodPressure,
      cholesterol: parseFloat(formData.cholesterol) || 0,
      weight: parseFloat(formData.weight) || 0,
    };

    try {
      const response = await fetch(`${API_URL}/health/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        Alert.alert('Success', 'Health data added successfully!');
        fetchHealthData(); // Refresh data after adding
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to add data.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error while adding data.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>📊 Health Tracker</Text>

      {/* Date Picker */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateText}>📅 {formData.date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={formData.date} mode="date" display="default" onChange={handleDateChange} />
      )}

      {/* Input Fields */}
      {['bloodSugar', 'bloodPressure', 'cholesterol', 'weight'].map((field) => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={`Enter ${field}`}
          keyboardType={field === 'bloodPressure' ? 'default' : 'numeric'}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
        />
      ))}

      {/* Submit Button */}
      <TouchableOpacity onPress={handleSubmit} style={styles.addButton}>
        <Text style={styles.buttonText}>➕ Add Data</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>📋 Health Records</Text>

      {/* Show Health Data */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : healthData.length === 0 ? (
        <Text style={styles.noDataText}>No health data available.</Text>
      ) : (
        <View>
          {healthData.map((entry, index) => (
            <View key={index} style={styles.healthCard}>
              <Text style={styles.healthText}>📅 Date: {entry.date}</Text>
              <Text style={styles.healthText}>🩸 Blood Sugar: {entry.bloodSugar} mg/dL</Text>
              <Text style={styles.healthText}>💖 Blood Pressure: {entry.bloodPressure}</Text>
              <Text style={styles.healthText}>🧬 Cholesterol: {entry.cholesterol} mg/dL</Text>
              <Text style={styles.healthText}>⚖️ Weight: {entry.weight} kg</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  dateButton: { backgroundColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 10 },
  dateText: { textAlign: 'center', fontWeight: 'bold' },
  addButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, marginBottom: 20 },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  noDataText: { textAlign: 'center', fontSize: 16, marginTop: 20 },
  healthCard: { backgroundColor: '#e3e3e3', padding: 10, marginBottom: 10, borderRadius: 5 },
  healthText: { fontSize: 16, marginBottom: 3 },
});

