import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { API_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function Appointments() {
  const [category, setCategory] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();

  const categories = [
    { label: 'All', value: 'All' },
    { label: 'Cardiologist', value: 'Cardiologist' },
    { label: 'Dentist', value: 'Dentist' },
    { label: 'Neurologist', value: 'Neurologist' },
    { label: 'Pediatrician', value: 'Pediatrician' },
    { label: 'Dermatologist', value: 'Dermatologist' },
    { label: 'General', value: 'General' }
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/doctors/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setDoctors(data);
      } else {
        Alert.alert('Error', 'Failed to fetch doctors');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = category === 'All' || category === null 
    ? doctors 
    : doctors.filter(doc => doc.category === category);

  return (
    <View style={styles.container}>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('UserBookings')}
        style={styles.button}
      >
        📅 View Appointments
      </Button>

      <Text style={styles.title}>Book an Appointment</Text>

      {/* Dropdown for Category Selection */}
      <DropDownPicker
        open={open}
        value={category}
        items={categories}
        setOpen={setOpen}
        setValue={setCategory}
        setItems={() => {}}
        placeholder="Select a Category"
        style={styles.dropdown}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.doctorName}>{item.name}</Text>
                <Text style={styles.info}>Category: {item.category}</Text>
                <Text style={styles.info}>Hospital: {item.hospitalName}</Text>
                <Text style={styles.info}>Email: {item.email}</Text>
                <Text style={styles.info}>Phone: {item.phoneNumber}</Text>
                <Text style={styles.info}>Address: {item.address}</Text>
              </Card.Content>
              <Card.Actions>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('BookAppointment', { doctorId: item.id })}
                >
                  Book Appointment
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  dropdown: { marginBottom: 15 },
  card: { marginVertical: 10, borderRadius: 8, backgroundColor: 'white', elevation: 4, padding: 10 },
  doctorName: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  info: { fontSize: 16, color: '#555', marginBottom: 3 },
  button: { marginBottom: 15, backgroundColor: '#007bff' },
});
