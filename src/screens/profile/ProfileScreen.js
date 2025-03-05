// src/screens/profile/ProfileScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Switch
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { Icon, Button, Divider } from 'react-native-elements';
import * as ImagePicker from 'react-native-image-picker';
import { 
  fetchUserProfile, 
  updateUserProfile,
  uploadProfileImage
} from '../../store/actions/profileActions';
import { logout } from '../../store/actions/authActions';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { profile, loading } = useSelector(state => state.profile);
  const [imageUploading, setImageUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      await dispatch(fetchUserProfile());
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile information.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logout());
              // Navigation will happen automatically due to auth state change
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { profile });
  };

  const handleEditPreferences = () => {
    navigation.navigate('Preferences');
  };

  const handlePickImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
      quality: 0.7,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        console.error('ImagePicker Error:', response.errorMessage);
        Alert.alert('Error', 'Failed to select image');
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        
        // Upload the image
        try {
          setImageUploading(true);
          
          const imageData = {
            uri: selectedImage.uri,
            type: selectedImage.type,
            name: selectedImage.fileName || 'profile-image.jpg',
          };
          
          await dispatch(uploadProfileImage(imageData));
          
          // Refresh profile to show new image
          await dispatch(fetchUserProfile());
          
          setImageUploading(false);
        } catch (error) {
          setImageUploading(false);
          console.error('Error uploading image:', error);
          Alert.alert('Error', 'Failed to upload profile image. Please try again.');
        }
      }
    });
  };

  const handleViewBadges = () => {
    navigation.navigate('Badges');
  };

  const handleViewPrivacy = () => {
    navigation.navigate('Privacy');
  };

  const handleViewSafety = () => {
    navigation.navigate('Safety');
  };

  const handleSubscription = () => {
    navigation.navigate('Subscription');
  };

  const handleContactSupport = () => {
    // Open support page or contact form
    navigation.navigate('Support');
  };

  const getProfileCompletionPercentage = () => {
    if (!profile) return 0;
    
    // Define required fields and their weights
    const fields = [
      { name: 'first_name', weight: 10, completed: !!user?.first_name },
      { name: 'last_name', weight: 10, completed: !!user?.last_name },
      { name: 'email', weight: 10, completed: !!user?.email },
      { name: 'avatar', weight: 10, completed: !!profile.avatar },
      { name: 'bio', weight: 15, completed: !!profile.bio },
      { name: 'birth_date', weight: 10, completed: !!profile.birth_date },
      { name: 'gender', weight: 5, completed: !!profile.gender },
      { name: 'location', weight: 10, completed: !!profile.location },
      { name: 'interests', weight: 15, completed: profile.interests && profile.interests.length > 0 },
      { name: 'availability', weight: 15, completed: profile.availabilities && profile.availabilities.length > 0 },
    ];
    
    // Calculate total percentage
    const totalWeight = fields.reduce((sum, field) => sum + field.weight, 0);
    const completedWeight = fields.reduce((sum, field) => sum + (field.completed ? field.weight : 0), 0);
    
    return Math.round((completedWeight / totalWeight) * 100);
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </SafeAreaView>
    );
  }

  const completionPercentage = getProfileCompletionPercentage();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          {imageUploading ? (
            <View style={styles.avatarContainer}>
              <ActivityIndicator size="large" color={colors.white} />
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={handlePickImage}
            >
              <Image
                source={profile?.avatar ? { uri: profile.avatar } : require('../../assets/images/default-avatar.png')}
                style={styles.avatar}
              />
              <View style={styles.avatarEditButton}>
                <Icon name="camera-alt" type="material" size={18} color={colors.white} />
              </View>
            </TouchableOpacity>
          )}
          
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
          
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <Button
            title="Edit Profile"
            buttonStyle={styles.editButton}
            titleStyle={styles.editButtonText}
            onPress={handleEditProfile}
            icon={
              <Icon 
                name="edit" 
                type="material" 
                size={16} 
                color={colors.white} 
                style={{ marginRight: 8 }}
              />
            }
          />
        </View>

        {/* Profile Completion */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Completion</Text>
            <Text style={styles.completionPercentage}>{completionPercentage}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.completionText}>
            {completionPercentage < 100 
              ? "Complete your profile to improve your matches!" 
              : "Great job! Your profile is complete."}
          </Text>
          
          {completionPercentage < 100 && (
            <Button
              title="Complete Profile"
              buttonStyle={styles.completeButton}
              titleStyle={styles.buttonText}
              onPress={handleEditProfile}
            />
          )}
        </View>

        {/* Preferences */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Preferences</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleEditPreferences}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="tune" type="material" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Match Preferences</Text>
              <Text style={styles.menuDescription}>
                Update your matching criteria & filters
              </Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.grey600} />
          </TouchableOpacity>
        </View>

        {/* Account Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleViewPrivacy}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="security" type="material" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Privacy Settings</Text>
              <Text style={styles.menuDescription}>
                Manage your data & privacy settings
              </Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.grey600} />
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleViewSafety}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="shield" type="material" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Safety & Blocking</Text>
              <Text style={styles.menuDescription}>
                Manage blocked users & safety features
              </Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.grey600} />
          </TouchableOpacity>
          
          <Divider style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleViewBadges}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="emoji-events" type="material" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Achievements & Badges</Text>
              <Text style={styles.menuDescription}>
                View your badges and accomplishments
              </Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.grey600} />
          </TouchableOpacity>
        </View>

        {/* Subscription */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Premium Membership</Text>
            {profile?.is_premium && (
              <Badge
                value="Premium"
                badgeStyle={styles.premiumBadge}
                textStyle={styles.premiumBadgeText}
              />
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleSubscription}
          >
            <View style={styles.menuIconContainer}>
              <Icon 
                name="star" 
                type="material" 
                size={24} 
                color={profile?.is_premium ? colors.gold : colors.primary} 
              />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                {profile?.is_premium ? "Manage Subscription" : "Upgrade to Premium"}
              </Text>
              <Text style={styles.menuDescription}>
                {profile?.is_premium 
                  ? `Your subscription renews on ${new Date(profile.subscription_end_date).toLocaleDateString()}`
                  : "Unlock unlimited matches & premium features"}
              </Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.grey600} />
          </TouchableOpacity>
        </View>

        {/* Help and Support */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Help & Support</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleContactSupport}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="help-outline" type="material" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Contact Support</Text>
              <Text style={styles.menuDescription}>
                Get help with your account & app issues
              </Text>
            </View>
            <Icon name="chevron-right" type="material" size={24} color={colors.grey600} />
          </TouchableOpacity>
        </View>

        <Button
          title="Log Out"
          buttonStyle={styles.logoutButton}
          titleStyle={styles.logoutButtonText}
          onPress={handleLogout}
          icon={
            <Icon 
              name="logout" 
              type="material" 
              size={16} 
              color={colors.error} 
              style={{ marginRight: 8 }}
            />
          }
        />
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.large,
    backgroundColor: colors.primary,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.grey400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: spacing.standard,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  userEmail: {
    ...typography.body,
    color: colors.lightGrey,
    marginBottom: spacing.standard,
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.standard,
  },
  editButtonText: {
    ...typography.button,
    color: colors.white,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginHorizontal: spacing.standard,
    marginBottom: spacing.standard,
    padding: spacing.standard,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
  },
  completionPercentage: {
    ...typography.h3,
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.lightGrey,
    borderRadius: 4,
    marginBottom: spacing.small,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  completionText: {
    ...typography.body,
    color: colors.grey700,
    marginBottom: spacing.standard,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 25,
  },
  buttonText: {
    ...typography.button,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.lightPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.standard,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  menuDescription: {
    ...typography.caption,
    color: colors.grey600,
  },
  divider: {
    marginVertical: spacing.small,
  },
  premiumBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.small,
    borderRadius: 4,
  },
  premiumBadgeText: {
    ...typography.caption,
    color: colors.white,
  },
  logoutButton: {
    backgroundColor: colors.white,
    borderRadius: 25,
    marginHorizontal: spacing.standard,
    marginVertical: spacing.large,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.error,
  },
  versionText: {
    ...typography.caption,
    color: colors.grey600,
    textAlign: 'center',
    marginBottom: spacing.extraLarge,
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

export default ProfileScreen;