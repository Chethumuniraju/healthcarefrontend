import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { API_URL } from '@env';

export default function UserSignup({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !address || !phoneNumber) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, address, phoneNumber }),
      });
  
      const responseText = await response.text(); // 🔹 Get raw response text
      console.log('Raw API Response:', responseText);
  
      // ✅ Handle non-JSON responses
      let data;
      try {
        data = JSON.parse(responseText); // Attempt to parse JSON
      } catch {
        data = { message: responseText }; // If parsing fails, treat it as plain text
      }
  
      if (response.ok) {
        Alert.alert('Signup Successful', data.message || 'You can now login!');
        navigation.navigate('UserLogin');
      } else {
        Alert.alert('Signup Failed', data.message || 'Try again.');
      }
    } catch (error) {
      console.error('Signup Error:', error);
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };
  


  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Signup</Text>

      <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput placeholder="Password" style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput placeholder="Address" style={styles.input} value={address} onChangeText={setAddress} />
      <TextInput placeholder="Phone Number" style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />

      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Signup</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('UserLogin')}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 15,
    color: '#007bff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
};
