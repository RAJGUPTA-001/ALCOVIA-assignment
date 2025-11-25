import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const colors = {
  primary: '#667eea',
  primaryDark: '#5568d3',
  danger: '#f56565',
  dangerDark: '#e53e3e',
  success: '#48bb78',
  warning: '#ed8936',
  background: '#f7fafc',
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#e2e8f0',
  lightGray: '#edf2f7',
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  gradientBackground: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    fontSize: 16,
    marginVertical: 10,
    backgroundColor: colors.surface,
  },
  button: {
    width: '100%',
    padding: 14,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: colors.danger,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  message: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    textAlign: 'center',
    color: colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: colors.surface,
  }
});