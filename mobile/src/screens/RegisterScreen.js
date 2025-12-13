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
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import { WavePattern, GentleButton, AnimatedBlob, BubbleAnimation, PatternBackground, SugarbumLogo } from '../components';
import theme from '../theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = React.useContext(AuthContext);

  const handleRegister = async () => {
    // Helper for showing alerts (web-compatible)
    const showAlert = (title, message) => {
      if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    // Validate required fields
    if (!name || !email || !password) {
      showAlert('Error', 'Please fill in all required fields (Name, Email, Password)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      showAlert('Error', 'Password must be at least 8 characters');
      return;
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name,
        email: email.toLowerCase().trim(),
        phone: phone.trim() || undefined,
        password,
      });

      await signUp(response.data.token, response.data.user);
    } catch (error) {
      console.error('Register error:', error);
      showAlert(
        'Registration Failed',
        error.response?.data?.error || 'Unable to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Multi-layered backgrounds */}
      <WavePattern color={theme.colors.deepTeal} opacity={0.07} />
      <PatternBackground pattern="triangles" color={theme.colors.mutedPurple} opacity={0.05} size="medium" />
      <PatternBackground pattern="grid" color={theme.colors.mossGreen} opacity={0.03} size="large" />

      {/* Floating blobs */}
      <BubbleAnimation color={theme.colors.deepTeal} size={240} opacity={0.14} duration={29000} style={{ top: '-12%', left: '-18%' }} />
      <AnimatedBlob color={theme.colors.mutedPurple} size={190} opacity={0.17} shape="shape4" duration={31000} style={{ top: '25%', right: '-10%' }} />
      <BubbleAnimation color={theme.colors.slate} size={170} opacity={0.13} duration={27000} style={{ bottom: '15%', left: '-8%' }} />
      <AnimatedBlob color={theme.colors.peach} size={150} opacity={0.15} shape="shape3" duration={24000} style={{ bottom: '45%', right: '82%' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Sugarbum branding */}
            <View style={styles.brandContainer}>
              <View style={styles.logoContainer}>
                <SugarbumLogo size={160} showSignals={true} />
              </View>
              <Text style={[theme.textStyles.h1, styles.title]}>Join Sugarbum</Text>
              <Text style={[theme.textStyles.body, styles.subtitle]}>
                Be together, apart
              </Text>
            </View>

            {/* Registration form */}
            <View style={styles.form}>
              <TextInput
                style={[theme.textStyles.body, styles.input]}
                placeholder="Name *"
                placeholderTextColor={theme.colors.mediumGray}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <TextInput
                style={[theme.textStyles.body, styles.input]}
                placeholder="Email *"
                placeholderTextColor={theme.colors.mediumGray}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />

              <TextInput
                style={[theme.textStyles.body, styles.input]}
                placeholder="Phone (optional)"
                placeholderTextColor={theme.colors.mediumGray}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />

              <TextInput
                style={[theme.textStyles.body, styles.input]}
                placeholder="Password *"
                placeholderTextColor={theme.colors.mediumGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password-new"
              />

              <TextInput
                style={[theme.textStyles.body, styles.input]}
                placeholder="Confirm Password *"
                placeholderTextColor={theme.colors.mediumGray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />

              <GentleButton
                title={isLoading ? '...' : 'Create Account'}
                onPress={handleRegister}
                variant="primary"
                size="large"
                style={styles.signupButton}
              />

              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.linkButton}
              >
                <Text style={[theme.textStyles.bodySmall, styles.linkText]}>
                  Already have an account?{' '}
                  <Text style={styles.linkTextBold}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['3xl'],
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.navyText,
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
  signupButton: {
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
    color: theme.colors.sageGreen,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
