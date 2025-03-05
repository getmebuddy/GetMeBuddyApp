// src/screens/matches/MatchDetailsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Icon, Button, Divider } from 'react-native-elements';
import { fetchUserDetails, createMatch } from '../../store/actions/matchActions';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const MatchDetailsScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const dispatch = useDispatch();
  const { userDetails, loading } = useSelector(state => state.matches);
  const [requestSent, setRequestSent] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  // Fetch user details on mount
  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    try {
      await dispatch(fetchUserDetails(userId));
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert(
        'Error',
        'Failed to load user details. Please try again.',
        [{ 
          text: 'OK', 
          onPress: () => navigation.goBack() 
        }]
      );
    }
  };

  const handleSendRequest = async () => {
    Alert.alert(
      'Send Match Request',
      `Are you sure you want to send a match request to ${userDetails.first_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Request', 
          onPress: async () => {
            try {
                setSendingRequest(true);
                await dispatch(createMatch(userId));
                setRequestSent(true);
                setSendingRequest(false);
                
                Alert.alert(
                  'Success',
                  `Match request sent to ${userDetails.first_name}!`,
                  [{ 
                    text: 'OK', 
                    onPress: () => navigation.goBack() 
                  }]
                );
              } catch (error) {
                setSendingRequest(false);
                console.error('Error sending match request:', error);
                Alert.alert('Error', 'Failed to send match request. Please try again.');
              }
            }
          },
        ]
      );
    };
  
    if (loading && !userDetails) {
      return (
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading user profile...</Text>
        </SafeAreaView>
      );
    }
  
    if (!userDetails) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <Icon name="error" type="material" size={80} color={colors.error} />
          <Text style={styles.errorTitle}>User Not Found</Text>
          <Text style={styles.errorDescription}>
            We couldn't find this user. They may have deactivated their account.
          </Text>
          <Button
            title="Go Back"
            buttonStyle={styles.errorButton}
            titleStyle={styles.buttonText}
            onPress={() => navigation.goBack()}
          />
        </SafeAreaView>
      );
    }
  
    const formatInterests = (interests) => {
      if (!interests || interests.length === 0) return 'No interests specified';
      return interests.map(interest => interest.name).join(', ');
    };
  
    const formatAvailability = (availabilities) => {
      if (!availabilities || availabilities.length === 0) return 'Schedule not specified';
      
      // Group by day of week
      const dayGroups = {};
      availabilities.forEach(avail => {
        if (!dayGroups[avail.day]) {
          dayGroups[avail.day] = [];
        }
        dayGroups[avail.day].push(`${avail.start_time.slice(0, 5)} - ${avail.end_time.slice(0, 5)}`);
      });
      
      // Format into readable string
      return Object.entries(dayGroups)
        .map(([day, times]) => `${day}: ${times.join(', ')}`)
        .join(' • ');
    };
  
    const calculateAge = (birthDate) => {
      if (!birthDate) return 'Unknown age';
      
      const today = new Date();
      const dob = new Date(birthDate);
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      return age;
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Image
              source={userDetails.avatar ? { uri: userDetails.avatar } : require('../../assets/images/default-avatar.png')}
              style={styles.profileImage}
            />
            
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{userDetails.first_name} {userDetails.last_name}</Text>
              <Text style={styles.age}>{calculateAge(userDetails.birth_date)} years old</Text>
              
              <View style={styles.locationContainer}>
                <Icon name="place" type="material" size={16} color={colors.grey600} />
                <Text style={styles.location}>
                  {userDetails.location || 'Location unknown'}
                  {userDetails.distance && ` • ${userDetails.distance.toFixed(1)} km away`}
                </Text>
              </View>
            </View>
            
            {userDetails.is_verified && (
              <View style={styles.verifiedBadge}>
                <Icon name="verified" type="material" size={16} color={colors.white} />
              </View>
            )}
          </View>
          
          <View style={styles.aboutSection}>
            <Text style={styles.sectionTitle}>About Me</Text>
            <Text style={styles.bio}>
              {userDetails.bio || 'No bio provided.'}
            </Text>
          </View>
  
          <View style={styles.interestsSection}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestTags}>
              {userDetails.interests && userDetails.interests.length > 0 ? (
                userDetails.interests.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>{interest.name}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No interests specified</Text>
              )}
            </View>
          </View>
  
          <View style={styles.availabilitySection}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.availabilityContainer}>
              {userDetails.availabilities && userDetails.availabilities.length > 0 ? (
                userDetails.availabilities.map((avail, index) => (
                  <View key={index} style={styles.availabilityItem}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayText}>{avail.day.substring(0, 3)}</Text>
                    </View>
                    <Text style={styles.timeText}>
                      {avail.start_time.slice(0, 5)} - {avail.end_time.slice(0, 5)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No availability specified</Text>
              )}
            </View>
          </View>
  
          <View style={styles.matchScoreSection}>
            <Text style={styles.sectionTitle}>Match Score</Text>
            
            <View style={styles.scoreCard}>
              <View style={styles.totalScoreContainer}>
                <Text style={styles.totalScoreLabel}>Overall Match</Text>
                <View style={styles.totalScoreCircle}>
                  <Text style={styles.totalScoreText}>
                    {Math.round(userDetails.match_score * 100)}%
                  </Text>
                </View>
              </View>
              
              <Divider style={styles.scoreDivider} />
              
              <View style={styles.scoreBreakdownContainer}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Interests</Text>
                  <View style={styles.scoreBarContainer}>
                    <View 
                      style={[
                        styles.scoreBar, 
                        { width: `${Math.round(userDetails.interest_score * 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.scorePercentage}>
                    {Math.round(userDetails.interest_score * 100)}%
                  </Text>
                </View>
                
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Location</Text>
                  <View style={styles.scoreBarContainer}>
                    <View 
                      style={[
                        styles.scoreBar, 
                        { width: `${Math.round(userDetails.distance_score * 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.scorePercentage}>
                    {Math.round(userDetails.distance_score * 100)}%
                  </Text>
                </View>
                
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>Availability</Text>
                  <View style={styles.scoreBarContainer}>
                    <View 
                      style={[
                        styles.scoreBar, 
                        { width: `${Math.round(userDetails.availability_score * 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.scorePercentage}>
                    {Math.round(userDetails.availability_score * 100)}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              title={requestSent ? "Request Sent" : "Send Match Request"}
              buttonStyle={[
                styles.sendRequestButton,
                requestSent && styles.requestSentButton
              ]}
              titleStyle={styles.buttonText}
              onPress={handleSendRequest}
              disabled={requestSent || sendingRequest}
              loading={sendingRequest}
              icon={
                requestSent ? (
                  <Icon
                    name="check"
                    type="material"
                    size={20}
                    color={colors.white}
                    containerStyle={{ marginRight: 8 }}
                  />
                ) : (
                  <Icon
                    name="handshake"
                    type="font-awesome-5"
                    size={16}
                    color={colors.white}
                    containerStyle={{ marginRight: 8 }}
                  />
                )
              }
            />
            
            <Button
              title="Back to Search"
              type="outline"
              buttonStyle={styles.backButton}
              titleStyle={styles.backButtonText}
              onPress={() => navigation.goBack()}
            />
          </View>
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
      flexDirection: 'row',
      padding: spacing.standard,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.grey200,
      position: 'relative',
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginRight: spacing.standard,
    },
    nameContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    name: {
      ...typography.h1,
      color: colors.text,
    },
    age: {
      ...typography.h3,
      color: colors.grey700,
      marginBottom: spacing.xs,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    location: {
      ...typography.body,
      color: colors.grey600,
      marginLeft: spacing.xs,
    },
    verifiedBadge: {
      position: 'absolute',
      top: spacing.standard,
      right: spacing.standard,
      backgroundColor: colors.success,
      borderRadius: 12,
      padding: spacing.xs,
    },
    aboutSection: {
      padding: spacing.standard,
      backgroundColor: colors.white,
      marginBottom: spacing.small,
    },
    sectionTitle: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.small,
    },
    bio: {
      ...typography.body,
      color: colors.grey800,
    },
    interestsSection: {
      padding: spacing.standard,
      backgroundColor: colors.white,
      marginBottom: spacing.small,
    },
    interestTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    interestTag: {
      backgroundColor: colors.lightPrimary,
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.xs / 2,
      borderRadius: 16,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    interestTagText: {
      ...typography.caption,
      color: colors.primary,
    },
    availabilitySection: {
      padding: spacing.standard,
      backgroundColor: colors.white,
      marginBottom: spacing.small,
    },
    availabilityContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    availabilityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.lightGrey,
      borderRadius: 8,
      padding: spacing.xs,
      marginRight: spacing.small,
      marginBottom: spacing.small,
    },
    dayBadge: {
      backgroundColor: colors.primary,
      borderRadius: 4,
      paddingHorizontal: spacing.xs,
      marginRight: spacing.xs,
    },
    dayText: {
      ...typography.caption,
      color: colors.white,
      fontWeight: 'bold',
    },
    timeText: {
      ...typography.caption,
      color: colors.grey800,
    },
    noDataText: {
      ...typography.body,
      color: colors.grey600,
      fontStyle: 'italic',
    },
    matchScoreSection: {
      padding: spacing.standard,
      backgroundColor: colors.white,
      marginBottom: spacing.small,
    },
    scoreCard: {
      borderWidth: 1,
      borderColor: colors.grey200,
      borderRadius: 8,
      overflow: 'hidden',
    },
    totalScoreContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.standard,
      backgroundColor: colors.lightPrimary,
    },
    totalScoreLabel: {
      ...typography.h3,
      color: colors.primary,
    },
    totalScoreCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalScoreText: {
      ...typography.h2,
      color: colors.white,
      fontWeight: 'bold',
    },
    scoreDivider: {
      height: 1,
      backgroundColor: colors.grey200,
    },
    scoreBreakdownContainer: {
      padding: spacing.standard,
    },
    scoreItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.small,
    },
    scoreLabel: {
      ...typography.body,
      color: colors.grey800,
      width: 100,
    },
    scoreBarContainer: {
      flex: 1,
      height: 10,
      backgroundColor: colors.lightGrey,
      borderRadius: 5,
      marginRight: spacing.small,
      overflow: 'hidden',
    },
    scoreBar: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 5,
    },
    scorePercentage: {
      ...typography.body,
      color: colors.primary,
      width: 40,
      textAlign: 'right',
    },
    actionButtons: {
      padding: spacing.standard,
      marginBottom: spacing.extraLarge,
    },
    sendRequestButton: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      paddingVertical: spacing.small,
      marginBottom: spacing.standard,
    },
    requestSentButton: {
      backgroundColor: colors.success,
    },
    buttonText: {
      ...typography.button,
      color: colors.white,
    },
    backButton: {
      borderColor: colors.grey400,
      borderRadius: 25,
      paddingVertical: spacing.small,
    },
    backButtonText: {
      ...typography.button,
      color: colors.grey700,
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.large,
    },
    errorTitle: {
      ...typography.h1,
      color: colors.text,
      marginTop: spacing.standard,
      marginBottom: spacing.small,
    },
    errorDescription: {
      ...typography.body,
      color: colors.grey700,
      textAlign: 'center',
      marginBottom: spacing.large,
    },
    errorButton: {
      backgroundColor: colors.primary,
      borderRadius: 25,
      paddingVertical: spacing.small,
      paddingHorizontal: spacing.large,
    }
  });
  
  export default MatchDetailsScreen;