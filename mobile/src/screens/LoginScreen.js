import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import { WavePattern, GentleButton, AnimatedBlob, PatternBackground } from '../components';
import theme from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = React.useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      await signIn(response.data.token, response.data.user);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.response?.data?.error || 'Unable to login. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Multi-layered backgrounds */}
      <WavePattern color={theme.colors.sageGreen} opacity={0.08} />
      <PatternBackground pattern="dots" color={theme.colors.teal} opacity={0.06} size="small" />
      <PatternBackground pattern="zigzag" color={theme.colors.lavender} opacity={0.04} size="medium" />

      {/* Floating blobs for depth */}
      <AnimatedBlob color={theme.colors.teal} size={250} opacity={0.15} shape="shape1" duration={28000} style={{ top: '-10%', right: '-20%' }} />
      <AnimatedBlob color={theme.colors.lavender} size={200} opacity={0.18} shape="shape2" duration={32000} style={{ bottom: '-8%', left: '-15%' }} />
      <AnimatedBlob color={theme.colors.slate} size={180} opacity={0.12} shape="shape3" duration={25000} style={{ top: '40%', left: '-12%' }} />
      <AnimatedBlob color={theme.colors.peach} size={160} opacity={0.14} shape="shape4" duration={30000} style={{ bottom: '30%', right: '-10%' }} />
      <AnimatedBlob color={theme.colors.mossGreen} size={140} opacity={0.16} shape="shape5" duration={26000} style={{ top: '20%', right: '85%' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Sugarbum branding */}
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>💕</Text>
            </View>
            <Text style={[theme.textStyles.h1, styles.title]}>Sugarbum</Text>
            <Text style={[theme.textStyles.body, styles.subtitle]}>
              Stay connected with your sugarbum
            </Text>
          </View>

          {/* Login form */}
          <View style={styles.form}>
            <TextInput
              style={[theme.textStyles.body, styles.input]}
              placeholder="Email"
              placeholderTextColor={theme.colors.mediumGray}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />

            <TextInput
              style={[theme.textStyles.body, styles.input]}
              placeholder="Password"
              placeholderTextColor={theme.colors.mediumGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            <GentleButton
              title={isLoading ? '...' : 'Login'}
              onPress={handleLogin}
              variant="primary"
              size="large"
              style={styles.loginButton}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.linkButton}
            >
              <Text style={[theme.textStyles.bodySmall, styles.linkText]}>
                Don't have an account?{' '}
                <Text style={styles.linkTextBold}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.dustyRose,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.level2,
  },
  logoEmoji: {
    fontSize: 50,
  },
  title: {
    color: theme.colors.deepNavy,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.mediumGray,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: theme.colors.offWhite,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.lightGray,
    color: theme.colors.charcoal,
    ...theme.shadows.level1,
  },
  loginButton: {
    marginTop: theme.spacing.md,
    width: '100%',
  },
  linkButton: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    color: theme.colors.mediumGray,
    textAlign: 'center',
  },
  linkTextBold: {
    color: theme.colors.dustyRose,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
