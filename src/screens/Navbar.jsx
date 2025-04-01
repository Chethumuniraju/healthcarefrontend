import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Navbar = () => {
  return (
    <View style={styles.navbar}>
      <Text style={styles.text}>HealthCare</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    width: '100%',
    height: 60,
    backgroundColor: '#007BFF', // Blue color for the navbar
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 1000,
  },
  text: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Navbar;
