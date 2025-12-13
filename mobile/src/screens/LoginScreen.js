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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import { WavePattern, GentleButton, BubbleAnimation, AnimatedBlob, PatternBackground, SugarbumLogo } from '../components';
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

      // Provide specific error messages based on error type
      let errorTitle = 'Login Failed';
      let errorMessage = 'Unable to login. Please try again.';

      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const serverError = error.response.data?.error;

        if (status === 401) {
          // Unauthorized - wrong password or user not found
          if (serverError?.toLowerCase().includes('password')) {
            errorMessage = 'Incorrect password. Please try again.';
          } else if (serverError?.toLowerCase().includes('user') || serverError?.toLowerCase().includes('not found')) {
            errorMessage = 'No account found with this email address.';
          } else {
            errorMessage = 'Invalid email or password.';
          }
        } else if (status === 400) {
          errorMessage = serverError || 'Please check your email and password.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = serverError || errorMessage;
        }
      } else if (error.request) {
        // Network error - no response received
        errorTitle = 'Connection Error';
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }

      Alert.alert(errorTitle, errorMessage);
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
      <BubbleAnimation color={theme.colors.teal} size={250} opacity={0.15} duration={28000} style={{ top: '-10%', right: '-20%' }} />
      <AnimatedBlob color={theme.colors.lavender} size={200} opacity={0.18} shape="shape2" duration={32000} style={{ bottom: '-8%', left: '-15%' }} />
      <BubbleAnimation color={theme.colors.slate} size={180} opacity={0.12} duration={25000} style={{ top: '40%', left: '-12%' }} />
      <AnimatedBlob color={theme.colors.peach} size={160} opacity={0.14} shape="shape4" duration={30000} style={{ bottom: '30%', right: '-10%' }} />
      <BubbleAnimation color={theme.colors.mossGreen} size={140} opacity={0.16} duration={26000} style={{ top: '20%', right: '85%' }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Sugarbum branding */}
          <View style={styles.brandContainer}>
            <View style={styles.logoContainer}>
              <SugarbumLogo size={180} showSignals={true} />
            </View>
            <Text style={[theme.textStyles.h1, styles.title]}>Sugarbum</Text>
            <Text style={[theme.textStyles.body, styles.subtitle]}>
              Be together, apart
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
