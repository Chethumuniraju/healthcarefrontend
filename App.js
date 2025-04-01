import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import Home from './src/screens/Home';
import UserLogin from './src/screens/UserLogin';
import DoctorLogin from './src/screens/DoctorLogin';
import UserSignup from './src/screens/UserSignup';
import DoctorSignup from './src/screens/DoctorSignup';
import Appointments from './src/screens/Apointments';
import Dashboard from './src/screens/UserDashboard';
import BookAppointment from './src/screens/BookAppointment';
import UserBookings from './src/screens/UserBookings';
import DocterDashboard from './src/screens/DocterDashboard';
import HealthTracker from './src/screens/HealthTracker';
import Medicines from './src/screens/Medecines';
import Navbar from './src/screens/Navbar';
import { API_URL } from '@env';

const Stack = createStackNavigator();

export default function App() {
  console.log(API_URL); // Ensure API_URL is being logged to check the value
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar is included */}
      <View style={styles.navbarContainer}>
        <Navbar />
      </View>

      {/* Main navigation container */}
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Define all the screens */}
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="UserLogin" component={UserLogin} />
          <Stack.Screen name="DoctorLogin" component={DoctorLogin} />
          <Stack.Screen name="UserSignup" component={UserSignup} />
          <Stack.Screen name="DoctorSignup" component={DoctorSignup} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Appointments" component={Appointments} />
          <Stack.Screen name="BookAppointment" component={BookAppointment} />
          <Stack.Screen name="UserBookings" component={UserBookings} />
          <Stack.Screen name="DoctorDashboard" component={DocterDashboard} />
          <Stack.Screen name="HealthTracker" component={HealthTracker} />
          <Stack.Screen name="Medicine" component={Medicines} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* Status bar configuration */}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navbarContainer: {
    paddingTop: 20, // Adjust for the status bar height
    backgroundColor: '#1E3A8A', // Blue color you used for navbar background
  },
});
