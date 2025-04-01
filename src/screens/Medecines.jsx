import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function Medicines({ navigation }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reminderTimes, setReminderTimes] = useState(['08:00', '14:00', '20:00']);
  const [scheduleType, setScheduleType] = useState('Daily');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [fetchingMedicines, setFetchingMedicines] = useState(false);

  // State to control date picker visibility
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // State to control time picker visibility for each reminder time
  const [showTimePicker, setShowTimePicker] = useState([false, false, false]);

  // Fetch token and medicines on mount
  useEffect(() => {
    const fetchTokenAndMedicines = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (!storedToken) {
        Alert.alert('Session Expired', 'Please log in again.');
        navigation.navigate('Login');
        return;
      }
      setToken(storedToken);
      fetchUserMedicines(storedToken);
    };

    fetchTokenAndMedicines();
  }, []);

  // Fetch user medicines
  const fetchUserMedicines = async (userToken) => {
    try {
      setFetchingMedicines(true);
      const response = await fetch(`${API_URL}/medicines/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch medicines.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch medicines: ' + error.message);
    } finally {
      setFetchingMedicines(false);
    }
  };

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
      const response = await fetch(`${API_URL}/medicines/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medicineData),
      });

      if (response.ok) {
        Alert.alert('Success', 'Medicine added successfully.');
        clearForm();
        fetchUserMedicines(token); // Refresh the medicines list
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

  // Clear the form after successful submission
  const clearForm = () => {
    setName('');
    setDosage('');
    setStartDate(new Date());
    setEndDate(new Date());
    setReminderTimes(['08:00', '14:00', '20:00']);
    setScheduleType('Daily');
  };

  // Handle the start date selection
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);
  };

  // Handle the end date selection
  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };

  // Toggle time picker visibility for a specific reminder
  const toggleTimePicker = (index) => {
    const newShowTimePicker = [...showTimePicker];
    newShowTimePicker[index] = !newShowTimePicker[index];
    setShowTimePicker(newShowTimePicker);
  };

  // Handle time change for reminders
  const handleTimeChange = (event, selectedTime, index) => {
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      const updatedReminderTimes = [...reminderTimes];
      updatedReminderTimes[index] = formattedTime;
      setReminderTimes(updatedReminderTimes);
    }
    
    // Hide the time picker after selection
    const newShowTimePicker = [...showTimePicker];
    newShowTimePicker[index] = false;
    setShowTimePicker(newShowTimePicker);
  };

  // Format reminder times for display
  const formatReminderTimes = (times) => {
    if (!times || !times.length) return 'No reminders set';
    return times.join(', ');
  };

  // Render a medicine item in the list
  const renderMedicineItem = ({ item }) => (
    <View style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <Text style={styles.medicineName}>{item.name}</Text>
        <Text style={styles.medicineDosage}>{item.dosage}</Text>
      </View>
      
      <View style={styles.medicineDetails}>
        <Text style={styles.scheduleType}>
          <Text style={styles.detailLabel}>Schedule: </Text>
          {item.scheduleType}
        </Text>
        
        <Text style={styles.datePeriod}>
          <Text style={styles.detailLabel}>Period: </Text>
          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
        </Text>
        
        <Text style={styles.remindersList}>
          <Text style={styles.detailLabel}>Reminders: </Text>
          {formatReminderTimes(item.reminderTimes)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
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

      {/* Start Date Selection */}
      <View style={styles.dateContainer}>
        <Text style={styles.label}>Start Date:</Text>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>
      
      {showStartDatePicker && (
        <DatePicker
          testID="startDatePicker"
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateChange}
        />
      )}

      {/* End Date Selection */}
      <View style={styles.dateContainer}>
        <Text style={styles.label}>End Date:</Text>
        <TouchableOpacity 
          style={styles.dateButton} 
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>
      
      {showEndDatePicker && (
        <DatePicker
          testID="endDatePicker"
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateChange}
        />
      )}

      {/* Reminder Times */}
      <Text style={styles.sectionTitle}>Reminder Times</Text>
      {reminderTimes.map((time, index) => (
        <View key={index} style={styles.timePickerContainer}>
          <Text style={styles.label}>Reminder {index + 1}:</Text>
          <TouchableOpacity 
            style={styles.timeButton} 
            onPress={() => toggleTimePicker(index)}
          >
            <Text style={styles.timeText}>{time}</Text>
          </TouchableOpacity>
          
          {showTimePicker[index] && (
            <DatePicker
              testID={`timePicker-${index}`}
              value={new Date(`2022-01-01T${time}:00`)}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedTime) => handleTimeChange(event, selectedTime, index)}
            />
          )}
        </View>
      ))}

      <TextInput
        style={styles.input}
        placeholder="Schedule Type (e.g., Daily)"
        value={scheduleType}
        onChangeText={setScheduleType}
      />

      <Button 
        title="Add Medicine" 
        onPress={handleSubmit} 
        disabled={loading} 
      />
      
      {loading && <ActivityIndicator size="large" color="#007bff" style={styles.loader} />}

      {/* Medicines List Section */}
      <View style={styles.medicinesListSection}>
        <Text style={styles.medicinesListTitle}>Your Medicines</Text>
        
        {fetchingMedicines ? (
          <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
        ) : medicines.length > 0 ? (
          <FlatList
            data={medicines}
            renderItem={renderMedicineItem}
            keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
            style={styles.medicinesList}
            scrollEnabled={false} // Disable scrolling to avoid nested scroll issues
          />
        ) : (
          <Text style={styles.noMedicinesText}>No medicines found. Add your first medicine above.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f8f9fa' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10
  },
  input: { 
    height: 40, 
    borderColor: '#ccc', 
    borderWidth: 1, 
    marginBottom: 15, 
    paddingLeft: 10, 
    borderRadius: 5 
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  timePickerContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10 
  },
  label: {
    width: 100,
    fontSize: 16
  },
  dateButton: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    paddingLeft: 10
  },
  dateText: {
    fontSize: 16
  },
  timeButton: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    paddingLeft: 10
  },
  timeText: {
    fontSize: 16
  },
  loader: { 
    marginTop: 20 
  },
  // Medicine list styles
  medicinesListSection: {
    marginTop: 30,
    marginBottom: 20
  },
  medicinesListTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15
  },
  medicinesList: {
    width: '100%'
  },
  medicineCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8
  },
  medicineName: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  medicineDosage: {
    fontSize: 16,
    color: '#555'
  },
  medicineDetails: {
    marginTop: 5
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555'
  },
  scheduleType: {
    fontSize: 15,
    marginBottom: 4
  },
  datePeriod: {
    fontSize: 15,
    marginBottom: 4
  },
  remindersList: {
    fontSize: 15
  },
  noMedicinesText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 15
  }
});