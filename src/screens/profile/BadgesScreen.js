// src/screens/profile/BadgesScreen.js
import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { Icon, Button, Divider } from 'react-native-elements';
import { 
  fetchBadges, 
  fetchAchievements
} from '../../store/actions/engagementActions';
import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import typography from '../../styles/typography';

const BadgesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { badges, achievements, loading } = useSelector(state => state.engagement);
  const [activeTab, setActiveTab] = useState('badges');

  useFocusEffect(
    useCallback(() => {
      loadData();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchBadges()),
        dispatch(fetchAchievements())
      ]);
    } catch (error) {
      console.error('Error loading badges and achievements:', error);
      Alert.alert('Error', 'Failed to load badges and achievements. Please try again.');
    }
  };

  const renderBadges = () => {
    if (!badges || badges.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="emoji-events" type="material" size={60} color={colors.grey400} />
          <Text style={styles.emptyTitle}>No Badges Yet</Text>
          <Text style={styles.emptyText}>
            Start using the app and interacting with buddies to earn badges!
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.gridContainer}>
        {badges.map((badge) => (
          <TouchableOpacity 
            key={badge.id} 
            style={styles.badgeContainer}
            onPress={() => Alert.alert(badge.name, badge.description)}
          >
            <View style={styles.badgeImageContainer}>
              {badge.icon ? (
                <Image source={{ uri: badge.icon }} style={styles.badgeImage} />
              ) : (
                <Icon name="emoji-events" type="material" size={40} color={colors.gold} />
              )}
            </View>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDate}>
              Earned: {new Date(badge.earned_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAchievements = () => {
    if (!achievements || achievements.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="stars" type="material" size={60} color={colors.grey400} />
          <Text style={styles.emptyTitle}>No Achievements Yet</Text>
          <Text style={styles.emptyText}>
            Complete actions on the app to unlock achievements!
          </Text>
        </View>
      );
    }

    // Group achievements by status (completed or in progress)
    const completedAchievements = achievements.filter(a => a.completed);
    const inProgressAchievements = achievements.filter(a => !a.completed);

    return (
      <View>
        {completedAchievements.length > 0 && (
          <>
            <Text style={styles.achievementSectionTitle}>Completed</Text>
            {completedAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementContainer}>
                <View style={styles.achievementIconContainer}>
                  {achievement.icon ? (
                    <Image source={{ uri: achievement.icon }} style={styles.achievementIcon} />
                  ) : (
                    <Icon name="stars" type="material" size={30} color={colors.primary} />
                  )}
                </View>
                <View style={styles.achievementDetails}>
                  <Text style={styles.achievementName}>{achievement.achievement.name}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.achievement.description}
                  </Text>
                  {achievement.completed_at && (
                    <Text style={styles.achievementDate}>
                      Completed on {new Date(achievement.completed_at).toLocaleDateString()}
                    </Text>
                  )}
                </View>
                <View style={styles.pointsContainer}>
                  <Text style={styles.pointsText}>{achievement.achievement.points}</Text>
                  <Text style={styles.pointsLabel}>pts</Text>
                </View>
              </View>
            ))}
          </>
        )}
        
        {inProgressAchievements.length > 0 && (
          <>
            <Text style={styles.achievementSectionTitle}>In Progress</Text>
            {inProgressAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementContainer}>
                <View style={[styles.achievementIconContainer, styles.inProgressIcon]}>
                  {achievement.icon ? (
                    <Image 
                      source={{ uri: achievement.icon }} 
                      style={[styles.achievementIcon, { opacity: 0.5 }]} 
                    />
                  ) : (
                    <Icon name="stars" type="material" size={30} color={colors.grey500} />
                  )}
                </View>
                <View style={styles.achievementDetails}>
                  <Text style={styles.achievementName}>{achievement.achievement.name}</Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.achievement.description}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarContainer}>
                      <View 
                        style={[
                          styles.progressBar, 
                          { width: `${achievement.progress}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>{achievement.progress}%</Text>
                  </View>
                </View>
                <View style={styles.pointsContainer}>
                  <Text style={[styles.pointsText, styles.inProgressPoints]}>
                    {achievement.achievement.points}
                  </Text>
                  <Text style={[styles.pointsLabel, styles.inProgressPoints]}>pts</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    );
  };

  if (loading && !badges && !achievements) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'badges' && styles.activeTab]} 
          onPress={() => setActiveTab('badges')}
        >
          <Text style={[styles.tabText, activeTab === 'badges' && styles.activeTabText]}>
            Badges
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]} 
          onPress={() => setActiveTab('achievements')}
        >
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
            Achievements
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Icon 
            name={activeTab === 'badges' ? 'emoji-events' : 'stars'} 
            type="material" 
            size={24} 
            color={colors.primary} 
          />
          <Text style={styles.infoText}>
            {activeTab === 'badges' 
              ? 'Collect badges by participating in the community and meeting buddies.'
              : 'Complete achievements through your activities to unlock rewards and badges.'}
          </Text>
        </View>
        
        {activeTab === 'badges' ? renderBadges() : renderAchievements()}
        
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{badges?.length || 0}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            
            <Divider orientation="vertical" style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {achievements?.filter(a => a.completed)?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            
            <Divider orientation="vertical" style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {achievements?.reduce((total, a) => total + (a.completed ? a.achievement.points : 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.grey200,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.small,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.subtitle,
    color: colors.grey600,
  },
  activeTabText: {
    color: colors.primary,
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.standard,
  },
  badgeContainer: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.standard,
    marginBottom: spacing.standard,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badgeImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  badgeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  badgeName: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  badgeDate: {
    ...typography.caption,
    color: colors.grey600,
    textAlign: 'center',
  },
  achievementSectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.standard,
    marginBottom: spacing.small,
  },
  achievementContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.standard,
    marginBottom: spacing.small,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  achievementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.lightPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.standard,
  },
  inProgressIcon: {
    backgroundColor: colors.lightGrey,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  achievementDetails: {
    flex: 1,
  },
  achievementName: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  achievementDescription: {
    ...typography.caption,
    color: colors.grey700,
    marginBottom: spacing.xs,
  },
  achievementDate: {
    ...typography.caption,
    color: colors.grey600,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.lightGrey,
    borderRadius: 3,
    marginRight: spacing.small,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.primary,
    width: 40,
  },
  pointsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  pointsText: {
    ...typography.h3,
    color: colors.primary,
  },
  pointsLabel: {
    ...typography.caption,
    color: colors.primary,
  },
  inProgressPoints: {
    color: colors.grey500,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.extraLarge,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.standard,
    marginBottom: spacing.small,
  },
  emptyText: {
    ...typography.body,
    color: colors.grey600,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.standard,
    marginVertical: spacing.standard,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.standard,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h1,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.grey700,
  },
  statDivider: {
    height: '70%',
    width: 1,
    backgroundColor: colors.grey300,
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

export default BadgesScreen;