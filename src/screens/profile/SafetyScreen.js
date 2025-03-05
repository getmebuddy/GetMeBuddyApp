// src/screens/profile/SafetyScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Icon, Button, Divider } from 'react-native-elements';
import { 
  fetchSafetySettings, 
  updateSafetySettings,
  fetchBlockedUsers,
  unblockUser
} from '../../store/actions/safetyActions';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const SafetyScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { safetySettings, blockedUsers, loading } = useSelector(state => state.safety);
  
  // Settings state
  const [hideLocation, setHideLocation] = useState(false);
  const [onlyVerifiedMatches, setOnlyVerifiedMatches] = useState(false);
  const [incognitoMode, setIncognitoMode] = useState(false);
  
  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  // Initialize state with loaded settings
  useEffect(() => {
    if (safetySettings) {
      setHideLocation(safetySettings.hide_location || false);
      setOnlyVerifiedMatches(safetySettings.only_verified_matches || false);
      setIncognitoMode(safetySettings.incognito_mode || false);
      
      // Reset changes flag
      setHasChanges(false);
    }
  }, [safetySettings]);

  // Track changes to settings
  useEffect(() => {
    if (!safetySettings) return;
    
    const isChanged = 
      hideLocation !== safetySettings.hide_location ||
      onlyVerifiedMatches !== safetySettings.only_verified_matches ||
      incognitoMode !== safetySettings.incognito_mode;
    
    setHasChanges(isChanged);
  }, [hideLocation, onlyVerifiedMatches, incognitoMode, safetySettings]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchSafetySettings()),
        dispatch(fetchBlockedUsers())
      ]);
    } catch (error) {
      console.error('Error loading safety data:', error);
      Alert.alert('Error', 'Failed to load safety settings. Please try again.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const updatedSettings = {
        hide_location: hideLocation,
        only_verified_matches: onlyVerifiedMatches,
        incognito_mode: incognitoMode
      };
      
      await dispatch(updateSafetySettings(updatedSettings));
      setHasChanges(false);
      
      Alert.alert(
        'Success',
        'Your safety settings have been updated!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating safety settings:', error);
      Alert.alert('Error', 'Failed to update safety settings. Please try again.');
    }
  };

  const handleUnblock = (userId) => {
    Alert.alert(
      'Unblock User',
      'Are you sure you want to unblock this user? They will be able to see your profile and send you match requests.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unblock', 
          onPress: async () => {
            try {
              await dispatch(unblockUser(userId));
              // Refresh blocked users list
              dispatch(fetchBlockedUsers());
            } catch (error) {
              console.error('Error unblocking user:', error);
              Alert.alert('Error', 'Failed to unblock user. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleReportConcern = () => {
    // Navigate to report screen
    navigation.navigate('ReportConcern');
  };

  const renderBlockedUser = ({ item }) => (
    <View style={styles.blockedUserItem}>
      <View style={styles.blockedUserInfo}>
        <Text style={styles.blockedUserName}>{item.blocked_user_name}</Text>
        <Text style={styles.blockedDate}>
          Blocked on {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item.blocked_user_id)}
      >
        <Text style={styles.unblockButtonText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !safetySettings) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading safety settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="shield" type="material" size={24} color={colors.primary} />
          <Text style={styles.infoText}>
            Your safety is our top priority. Use these settings to control your
            privacy and who can see your profile.
          </Text>
        </View>
        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.switchItem}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Hide Precise Location</Text>
              <Text style={styles.switchDescription}>
                Only show approximate location to other users
              </Text>
            </View>
            <Switch
              value={hideLocation}
              onValueChange={setHideLocation}
              trackColor={{ false: colors.grey300, true: colors.lightPrimary }}
              thumbColor={hideLocation ? colors.primary : colors.grey500}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.switchItem}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Verified Users Only</Text>
              <Text style={styles.switchDescription}>
                Only show verified users in your match results
              </Text>
            </View>
            <Switch
              value={onlyVerifiedMatches}
              onValueChange={setOnlyVerifiedMatches}
              trackColor={{ false: colors.grey300, true: colors.lightPrimary }}
              thumbColor={onlyVerifiedMatches ? colors.primary : colors.grey500}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.switchItem}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Incognito Mode</Text>
              <Text style={styles.switchDescription}>
                Your profile won't appear in search results, but you can still view and match with others
              </Text>
            </View>
            <Switch
              value={incognitoMode}
              onValueChange={setIncognitoMode}
              trackColor={{ false: colors.grey300, true: colors.lightPrimary }}
              thumbColor={incognitoMode ? colors.primary : colors.grey500}
            />
          </View>
          
          {hasChanges && (
            <Button
              title="Save Settings"
              buttonStyle={styles.saveButton}
              titleStyle={styles.buttonText}
              onPress={handleSaveSettings}
              disabled={loading}
              loading={loading}
            />
          )}
        </View>
        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Blocked Users</Text>
          
          {blockedUsers && blockedUsers.length > 0 ? (
            <FlatList
              data={blockedUsers}
              renderItem={renderBlockedUser}
              keyExtractor={(item) => item.id.toString()}
              ItemSeparatorComponent={() => <Divider style={styles.divider} />}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>
              You haven't blocked any users yet.
            </Text>
          )}
        </View>
        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Report a Concern</Text>
          <Text style={styles.reportText}>
            If you're experiencing harassment or inappropriate behavior from another user,
            please report it to us.
          </Text>
          
          <Button
            title="Report a Concern"
            icon={
              <Icon
                name="flag"
                type="material"
                size={18}
                color={colors.white}
                containerStyle={{ marginRight: 8 }}
              />
            }
            buttonStyle={styles.reportButton}
            titleStyle={styles.buttonText}
            onPress={handleReportConcern}
          />
        </View>
        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Safety Resources</Text>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Icon
              name="security"
              type="material"
              size={24}
              color={colors.primary}
              containerStyle={styles.resourceIcon}
            />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Safety Tips</Text>
              <Text style={styles.resourceDescription}>
                Best practices for meeting activity buddies safely
              </Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.grey600} />
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity style={styles.resourceItem}>
            <Icon
              name="verified-user"
              type="material"
              size={24}
              color={colors.primary}
              containerStyle={styles.resourceIcon}
            />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Verification Process</Text>
              <Text style={styles.resourceDescription}>
                Learn how to verify your account for greater trust
              </Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.grey600} />
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity style={styles.resourceItem}>
            <Icon
              name="policy"
              type="material"
              size={24}
              color={colors.primary}
              containerStyle={styles.resourceIcon}
            />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Community Guidelines</Text>
              <Text style={styles.resourceDescription}>
                Our rules for creating a safe community
              </Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.grey600} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.standard,
  },
  infoCard: {
    backgroundColor: colors.lightPrimary,
    flexDirection: 'row',
    padding: spacing.standard,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: spacing.standard,
  },
  infoText: {
    ...typography.body,
    color: colors.primary,
    marginLeft: spacing.small,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.standard,
    marginBottom: spacing.standard,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.standard,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.standard,
  },
  switchLabel: {
    ...typography.subtitle,
    color: colors.text,
  },
  switchDescription: {
    ...typography.caption,
    color: colors.grey600,
    marginTop: spacing.xs,
  },
  divider: {
    marginVertical: spacing.small,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    marginTop: spacing.standard,
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  blockedUserItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  blockedUserInfo: {
    flex: 1,
  },
  blockedUserName: {
    ...typography.subtitle,
    color: colors.text,
  },
  blockedDate: {
    ...typography.caption,
    color: colors.grey600,
  },
  unblockButton: {
    backgroundColor: colors.lightGrey,
    paddingHorizontal: spacing.standard,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  unblockButtonText: {
    ...typography.caption,
    color: colors.error,
  },
  emptyText: {
    ...typography.body,
    color: colors.grey600,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.standard,
  },
  reportText: {
    ...typography.body,
    color: colors.grey700,
    marginBottom: spacing.standard,
  },
  reportButton: {
    backgroundColor: colors.error,
    borderRadius: 25,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  resourceIcon: {
    marginRight: spacing.small,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  resourceDescription: {
    ...typography.caption,
    color: colors.grey600,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.grey700,
    marginTop: spacing.standard,
  },
});

export default SafetyScreen;