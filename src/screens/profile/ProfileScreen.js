// src/screens/profile/ProfileScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import VerificationBadges from '../../components/profile/VerificationBadges';
import { COLORS } from '../../styles/colors';

const ProfileSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const ProfileTag = ({ label }) => (
  <View style={styles.tag}>
    <Text style={styles.tagText}>{label}</Text>
  </View>
);

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { profile, userType } = useSelector(state => state.profile);
  const { verificationStatus } = useSelector(state => state.verification);
  
  const isActivityType = userType === 'activity' || userType === 'both';
  const isCompanionType = userType === 'companion' || userType === 'both';
  
  // This would come from the actual profile, but we'll mock it for now
  const mockProfile = {
    name: 'Alex Johnson',
    photos: ['https://randomuser.me/api/portraits/people/22.jpg'],
    bio: 'Outdoor enthusiast and adventure seeker. Love hiking, kayaking, and meeting new people!',
    activityPreferences: {
      categories: ['Hiking', 'Kayaking', 'Board Games', 'Concerts'],
      availability: 'Weekends and evenings',
    },
    companionshipDetails: {
      companionshipTypes: ['Outdoor', 'City Guide', 'Events'],
      personalityTraits: ['Adventurous', 'Outgoing', 'Relaxed'],
    }
  };
  
  const navigateToEditProfile = () => {
    navigation.navigate('EditProfile');
  };
  
  const navigateToVerification = () => {
    navigation.navigate('Verification');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image 
            source={{ uri: mockProfile.photos[0] }} 
            style={styles.profileImage}
          />
          
          <Text style={styles.name}>{mockProfile.name}</Text>
          
          <VerificationBadges verificationStatus={verificationStatus} />
          
          <View style={styles.buttonContainer}>
            <Button
              title="Edit Profile"
              icon={<Icon name="edit" type="material" size={18} color="#fff" style={{ marginRight: 5 }} />}
              buttonStyle={styles.editButton}
              onPress={navigateToEditProfile}
            />
            
            <Button
              title="Verification"
              icon={<Icon name="verified-user" type="material" size={18} color="#fff" style={{ marginRight: 5 }} />}
              buttonStyle={styles.verificationButton}
              onPress={navigateToVerification}
            />
          </View>
        </View>
        
        <View style={styles.content}>
          <ProfileSection title="About Me">
            <Text style={styles.bioText}>{mockProfile.bio}</Text>
          </ProfileSection>
          
          {isActivityType && (
            <ProfileSection title="Activity Preferences">
              <View style={styles.tagContainer}>
                {mockProfile.activityPreferences.categories.map((category, index) => (
                  <ProfileTag key={index} label={category} />
                ))}
              </View>
              
              <View style={styles.detailRow}>
                <Icon name="schedule" type="material" size={16} color="#888" />
                <Text style={styles.detailText}>
                  Available: {mockProfile.activityPreferences.availability}
                </Text>
              </View>
            </ProfileSection>
          )}
          
          {isCompanionType && (
            <ProfileSection title="Companionship">
              <Text style={styles.sectionSubtitle}>Companionship Types</Text>
              <View style={styles.tagContainer}>
                {mockProfile.companionshipDetails.companionshipTypes.map((type, index) => (
                  <ProfileTag key={index} label={type} />
                ))}
              </View>
              
              <Text style={styles.sectionSubtitle}>Personality Traits</Text>
              <View style={styles.tagContainer}>
                {mockProfile.companionshipDetails.personalityTraits.map((trait, index) => (
                  <ProfileTag key={index} label={trait} />
                ))}
              </View>
            </ProfileSection>
          )}
          
          <ProfileSection title="Account Settings">
            <TouchableOpacity style={styles.settingRow}>
              <Icon name="notifications" type="material" size={20} color="#555" />
              <Text style={styles.settingText}>Notification Preferences</Text>
              <Icon name="chevron-right" type="material" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow}>
              <Icon name="lock" type="material" size={20} color="#555" />
              <Text style={styles.settingText}>Privacy Settings</Text>
              <Icon name="chevron-right" type="material" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingRow}>
              <Icon name="help" type="material" size={20} color="#555" />
              <Text style={styles.settingText}>Help & Support</Text>
              <Icon name="chevron-right" type="material" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingRow, styles.logoutRow]}>
              <Icon name="logout" type="material" size={20} color={COLORS.danger} />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </ProfileSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginRight: 10,
  },
  verificationButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 10,
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#555',
  },
  logoutRow: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: COLORS.danger,
  },
});

export default ProfileScreen;