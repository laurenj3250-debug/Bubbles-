
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>SANITY CHECK: IF YOU SEE THIS, WEB BUILD WORKS</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 24, fontWeight: 'bold', color: 'blue' }
});
