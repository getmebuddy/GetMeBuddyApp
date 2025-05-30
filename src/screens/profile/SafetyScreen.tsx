import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Switch,
  Alert, ActivityIndicator, SafeAreaView, ListRenderItemInfo, ScrollView, // Added ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Icon, Button, Divider } from 'react-native-elements';
import { StackScreenProps } from '@react-navigation/stack';

import {
  fetchSafetySettings, updateSafetySettings, fetchBlockedUsers, unblockUser,
} from '../../store/actions/safetyActions'; // Assume typed
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

import { AppDispatch, RootState } from '../../store';
import { AppStackParamList } from '../../navigation'; // Assuming SafetyScreen is in AppStack

// Types
export interface SafetySettingsData {
  hide_location: boolean;
  only_verified_matches: boolean;
  incognito_mode: boolean;
  // Add other settings if any
}

export interface BlockedUser {
  id: string | number; // ID of the block record itself
  blocked_user_id: string | number;
  blocked_user_name: string; // Or full user object if API provides more details
  created_at: string; // ISO date string
}

// Navigation props
type SafetyScreenProps = StackScreenProps<AppStackParamList, 'SafetyScreen'>; // Use correct screen name

const SafetyScreen: React.FC<SafetyScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { safetySettings, blockedUsers, loading } = useSelector((state: RootState) => state.safety as {
    safetySettings: SafetySettingsData | null;
    blockedUsers: BlockedUser[] | null;
    loading: boolean;
  });

  const [hideLocation, setHideLocation] = useState<boolean>(false);
  const [onlyVerifiedMatches, setOnlyVerifiedMatches] = useState<boolean>(false);
  const [incognitoMode, setIncognitoMode] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  useEffect(() => {
    if (safetySettings) {
      setHideLocation(safetySettings.hide_location || false);
      setOnlyVerifiedMatches(safetySettings.only_verified_matches || false);
      setIncognitoMode(safetySettings.incognito_mode || false);
      setHasChanges(false); // Reset after loading from store
    }
  }, [safetySettings]);

  useEffect(() => {
    if (!safetySettings) return;
    const isChanged =
      hideLocation !== (safetySettings.hide_location || false) || // Compare with default if property missing
      onlyVerifiedMatches !== (safetySettings.only_verified_matches || false) ||
      incognitoMode !== (safetySettings.incognito_mode || false);
    setHasChanges(isChanged);
  }, [hideLocation, onlyVerifiedMatches, incognitoMode, safetySettings]);

  const loadData = async () => {
    try {
      await Promise.all([dispatch(fetchSafetySettings()), dispatch(fetchBlockedUsers())]);
    } catch (error) {
      console.error('Error loading safety data:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    }
  };

  const handleSaveSettings = async () => {
    const updatedSettings: Partial<SafetySettingsData> = {
      hide_location: hideLocation,
      only_verified_matches: onlyVerifiedMatches,
      incognito_mode: incognitoMode,
    };
    try {
      await dispatch(updateSafetySettings(updatedSettings));
      setHasChanges(false);
      Alert.alert('Success', 'Safety settings updated!');
    } catch (error) {
      console.error('Error updating safety settings:', error);
      Alert.alert('Error', 'Failed to update settings.');
    }
  };

  const handleUnblockUser = (userId: string | number) => {
    Alert.alert('Unblock User', 'Are you sure you want to unblock this user?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unblock', onPress: async () => {
          try {
            await dispatch(unblockUser(userId));
            // Optionally dispatch(fetchBlockedUsers()); if not handled by unblockUser action internally
          } catch (error) { console.error('Error unblocking user:', error); Alert.alert('Error', 'Failed to unblock user.'); }
        },
      },
    ]);
  };

  const handleNavigateToReportConcern = () => {
    // navigation.navigate('ReportConcern'); // Assuming 'ReportConcern' is a screen in AppStackParamList
    Alert.alert("Navigate", "Navigate to Report Concern Screen (placeholder)");
  };

  const handleNavigateToResource = (resourceName: string) => {
    Alert.alert("Navigate", `Navigate to ${resourceName} (placeholder)`);
  };

  const renderBlockedUserItem = ({ item }: ListRenderItemInfo<BlockedUser>) => (
    <View style={styles.blockedUserItem}>
      <View style={styles.blockedUserInfo}>
        <Text style={styles.blockedUserName}>{item.blocked_user_name}</Text>
        <Text style={styles.blockedDate}>Blocked: {new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      <Button title="Unblock" type="outline" buttonStyle={styles.unblockButton} titleStyle={styles.unblockButtonText} onPress={() => handleUnblockUser(item.blocked_user_id)} />
    </View>
  );

  if (loading && !safetySettings && !blockedUsers) {
    return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={styles.loadingText}>Loading safety settings...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <Icon name="shield-lock" type="material-community" size={30} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Safety & Privacy Center</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Visibility Settings</Text>
          <SettingItem label="Hide Precise Location" description="Only show approximate area to others." value={hideLocation} onValueChange={setHideLocation} />
          <Divider style={styles.divider} />
          <SettingItem label="Verified Users Only" description="Only see and be seen by verified users." value={onlyVerifiedMatches} onValueChange={setOnlyVerifiedMatches} />
          <Divider style={styles.divider} />
          <SettingItem label="Incognito Mode" description="Browse profiles without appearing in searches." value={incognitoMode} onValueChange={setIncognitoMode} />
          {hasChanges && <Button title="Save Visibility Settings" buttonStyle={styles.saveButton} titleStyle={TYPOGRAPHY.button} onPress={handleSaveSettings} loading={loading} disabled={loading} />}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Blocked Users</Text>
          {blockedUsers && blockedUsers.length > 0 ? (
            <FlatList data={blockedUsers} renderItem={renderBlockedUserItem} keyExtractor={(item) => item.id.toString()} ItemSeparatorComponent={() => <Divider style={styles.divider} />} scrollEnabled={false} />
          ) : <Text style={styles.emptyText}>No users blocked.</Text>}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Help & Support</Text>
          <ResourceLinkItem icon="shield-alert" title="Report a Concern" description="Report inappropriate behavior or safety issues." onPress={handleNavigateToReportConcern} />
          <Divider style={styles.divider} />
          <ResourceLinkItem icon="book-open-variant" title="Safety Tips" description="Learn best practices for safe interactions." onPress={() => handleNavigateToResource('SafetyTipsScreen')} />
          <Divider style={styles.divider} />
          <ResourceLinkItem icon="shield-check" title="Verification Guide" description="Understand our verification process." onPress={() => handleNavigateToResource('VerificationGuideScreen')} />
          <Divider style={styles.divider} />
          <ResourceLinkItem icon="format-list-bulleted-type" title="Community Guidelines" description="Our rules for a respectful community." onPress={() => handleNavigateToResource('CommunityGuidelinesScreen')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface SettingItemProps { label: string; description: string; value: boolean; onValueChange: (value: boolean) => void; }
const SettingItem: React.FC<SettingItemProps> = ({ label, description, value, onValueChange }) => (
  <View style={styles.switchItem}>
    <View style={styles.switchInfo}><Text style={styles.switchLabel}>{label}</Text><Text style={styles.switchDescription}>{description}</Text></View>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ false: COLORS.grey300, true: COLORS.primaryLight }} thumbColor={value ? COLORS.primary : COLORS.grey500} />
  </View>
);

interface ResourceLinkItemProps { icon: string; title: string; description: string; onPress: () => void; }
const ResourceLinkItem: React.FC<ResourceLinkItemProps> = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.resourceItem} onPress={onPress}>
    <Icon name={icon} type="material-community" size={24} color={COLORS.primary} containerStyle={styles.resourceIcon} />
    <View style={styles.resourceContent}><Text style={styles.resourceTitle}>{title}</Text><Text style={styles.resourceDescription}>{description}</Text></View>
    <Icon name="chevron-right" type="material" size={24} color={COLORS.grey400} />
  </TouchableOpacity>
);

// Styles (condensed)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: SPACING.large },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.medium, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.grey200, marginBottom: SPACING.medium },
  headerTitle: { ...TYPOGRAPHY.h1, color: COLORS.text, marginLeft: SPACING.small },
  sectionCard: { backgroundColor: COLORS.white, borderRadius: 10, padding: SPACING.medium, marginBottom: SPACING.medium, elevation: 1, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1 },
  sectionTitle: { ...TYPOGRAPHY.h2, color: COLORS.textEmphasis, marginBottom: SPACING.medium },
  switchItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.small },
  switchInfo: { flex: 1, marginRight: SPACING.medium },
  switchLabel: { ...TYPOGRAPHY.subtitle, color: COLORS.text },
  switchDescription: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: SPACING.xsmall },
  divider: { marginVertical: SPACING.small },
  saveButton: { backgroundColor: COLORS.primary, borderRadius: 8, marginTop: SPACING.medium, paddingVertical: SPACING.xsmall },
  blockedUserItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.small },
  blockedUserInfo: { flex: 1 },
  blockedUserName: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
  blockedDate: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  unblockButton: { borderColor: COLORS.error, borderWidth: 1, paddingHorizontal: SPACING.small, paddingVertical: SPACING.xsmall / 2, borderRadius: 5 },
  unblockButtonText: { ...TYPOGRAPHY.caption, color: COLORS.error, fontWeight: 'bold' },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SPACING.medium, fontStyle: 'italic' },
  resourceItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.medium },
  resourceIcon: { marginRight: SPACING.medium, width: 30, alignItems: 'center' },
  resourceContent: { flex: 1 },
  resourceTitle: { ...TYPOGRAPHY.subtitle, color: COLORS.text },
  resourceDescription: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: SPACING.medium },
  // Fallbacks for missing COLORS properties
  grey300: COLORS.grey300 || '#D1D5DB', grey500: COLORS.grey500 || '#6B7280', primaryLight: COLORS.primaryLight || COLORS.lightPrimary,
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, h2: { fontSize: 20, fontWeight: 'bold' },
  subtitle: { fontSize: 16, fontWeight: '600' }, body: { fontSize: 14 }, caption: { fontSize: 12 },
  button: { fontSize: 16, fontWeight: 'bold', color: COLORS.white || '#FFF' },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', white: '#FFFFFF', black: '#000000', text: '#333333', textEmphasis: '#111111',
  textSecondary: '#555555', error: '#D32F2F', background: '#F4F6F8',
  grey200: '#E5E7EB', grey300: '#D1D5DB', grey400: '#9CA3AF', grey500: '#6B7280',
  lightPrimary: '#E0E7FF', primaryLight: '#A8C5FF',
  ...COLORS,
};

export default SafetyScreen;
