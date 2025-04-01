import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Dashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Dashboard</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Appointments')}
      >
        <Text style={styles.buttonText}>Book Appointment</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('HealthTracker')}
      >
        <Text style={styles.buttonText}>Track your Health</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Medicine')}
      >
        <Text style={styles.buttonText}>Track your Medicine</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    marginBottom: 10, // Added spacing between buttons
    width: '80%', // Optional: Ensure buttons have consistent width
    alignItems: 'center', // Align text in the center of the button
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
