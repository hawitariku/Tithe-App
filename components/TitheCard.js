import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TitheCard({ amount, status }) {
  return (
    <View style={styles.container}>
      <Text style={styles.amount}>Tithe: ETB {amount}</Text>
      <Text style={[styles.status, status === 'done' ? styles.done : styles.pending]}>
        Status: {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  pending: {
    color: '#ff9800',
  },
  done: {
    color: '#4caf50',
  },
});