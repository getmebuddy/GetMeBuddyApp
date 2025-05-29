import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Alert, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, RouteProp } from '@react-navigation/native'; // RouteProp for navigation params
import { StackScreenProps } from '@react-navigation/stack';
import { Icon, Button, Divider } from 'react-native-elements'; // Button is not used, can remove

import { fetchBadges, fetchAchievements } from '../../store/actions/engagementActions'; // Assume typed
import { COLORS } from '../../styles/colors';
import { SPACING } from '../../styles/spacing';
import { TYPOGRAPHY } from '../../styles/typography';

import { AppDispatch, RootState } from '../../store';
// Assuming ProfileStackParamList if this screen is part of a ProfileStack, or AppStackParamList
import { AppStackParamList } from '../../navigation'; 

// Types
export interface BadgeType {
  id: string | number;
  name: string;
  description: string;
  icon?: string; // URL
  earned_at: string; // ISO date string
}

export interface AchievementDetails { // Nested achievement info
  id: string | number;
  name: string;
  description: string;
  points: number;
  icon?: string; // URL for the achievement definition itself
}

export interface UserAchievement {
  id: string | number; // ID of the user's specific achievement instance
  achievement: AchievementDetails;
  completed: boolean;
  progress: number; // Percentage, 0-100
  completed_at?: string | null; // ISO date string
  // 'icon' was on the root of UserAchievement in JS, but makes more sense in AchievementDetails
  // If API sends icon on UserAchievement root, adjust type: icon?: string; 
}

type ActiveTab = 'badges' | 'achievements';

// Navigation props
// Assuming BadgesScreen is part of AppStackParamList directly or nested within a ProfileStack that's part of AppStack
type BadgesScreenProps = StackScreenProps<AppStackParamList, 'BadgesScreen'>; // Use correct screen name

const BadgesScreen: React.FC<BadgesScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { badges, achievements, loading } = useSelector((state: RootState) => state.engagement as {
    badges: BadgeType[] | null;
    achievements: UserAchievement[] | null;
    loading: boolean;
  });
  const [activeTab, setActiveTab] = useState<ActiveTab>('badges');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchBadges()),
        dispatch(fetchAchievements()),
      ]);
    } catch (error) {
      console.error('Error loading badges and achievements:', error);
      Alert.alert('Error', 'Failed to load your progress. Please try again.');
    }
  };

  const renderBadgesGrid = () => {
    if (!badges || badges.length === 0) {
      return (
        <View style={styles.emptyContentContainer}>
          <Icon name="shield-star-outline" type="material-community" size={60} color={COLORS.grey400} />
          <Text style={styles.emptyTitle}>No Badges Yet</Text>
          <Text style={styles.emptyText}>Engage with the community and complete activities to earn badges!</Text>
        </View>
      );
    }
    return (
      <View style={styles.gridContainer}>
        {badges.map((badge) => (
          <TouchableOpacity key={badge.id.toString()} style={styles.badgeContainer} onPress={() => Alert.alert(badge.name, badge.description)}>
            <View style={styles.badgeImageContainer}>
              {badge.icon ? <Image source={{ uri: badge.icon }} style={styles.badgeImage} />
                : <Icon name="shield-star" type="material-community" size={40} color={COLORS.gold || '#FFD700'} />}
            </View>
            <Text style={styles.badgeName} numberOfLines={1}>{badge.name}</Text>
            <Text style={styles.badgeDate}>Earned: {new Date(badge.earned_at).toLocaleDateString()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAchievementsList = () => {
    if (!achievements || achievements.length === 0) {
      return (
        <View style={styles.emptyContentContainer}>
          <Icon name="trophy-variant-outline" type="material-community" size={60} color={COLORS.grey400} />
          <Text style={styles.emptyTitle}>No Achievements Yet</Text>
          <Text style={styles.emptyText}>Keep exploring and completing tasks to unlock achievements!</Text>
        </View>
      );
    }
    const completed = achievements.filter(a => a.completed);
    const inProgress = achievements.filter(a => !a.completed);

    return (
      <View>
        {completed.length > 0 && (<><Text style={styles.achievementSectionTitle}>Completed</Text>
          {completed.map((ua) => <AchievementItem key={ua.id.toString()} userAchievement={ua} />)}</>
        )}
        {inProgress.length > 0 && (<><Text style={styles.achievementSectionTitle}>In Progress</Text>
          {inProgress.map((ua) => <AchievementItem key={ua.id.toString()} userAchievement={ua} />)}</>
        )}
      </View>
    );
  };
  
  interface AchievementItemProps { userAchievement: UserAchievement; }
  const AchievementItem: React.FC<AchievementItemProps> = ({ userAchievement: ua }) => (
    <View style={styles.achievementContainer}>
      <View style={[styles.achievementIconContainer, !ua.completed && styles.inProgressIconContainer]}>
        {ua.achievement.icon ? <Image source={{ uri: ua.achievement.icon }} style={[styles.achievementIcon, !ua.completed && styles.inProgressIcon]} />
          : <Icon name={ua.completed ? "trophy-variant" : "progress-star"} type="material-community" size={30} color={ua.completed ? COLORS.primary : COLORS.grey500} />}
      </View>
      <View style={styles.achievementDetails}>
        <Text style={styles.achievementName}>{ua.achievement.name}</Text>
        <Text style={styles.achievementDescription} numberOfLines={2}>{ua.achievement.description}</Text>
        {!ua.completed && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBarContainer}><View style={[styles.progressBar, { width: `${ua.progress}%` }]} /></View>
            <Text style={styles.progressText}>{ua.progress}%</Text>
          </View>
        )}
        {ua.completed_at && <Text style={styles.achievementDate}>Completed: {new Date(ua.completed_at).toLocaleDateString()}</Text>}
      </View>
      <View style={styles.pointsContainer}>
        <Text style={[styles.pointsText, !ua.completed && styles.inProgressPointsText]}>{ua.achievement.points}</Text>
        <Text style={[styles.pointsLabel, !ua.completed && styles.inProgressPointsText]}>pts</Text>
      </View>
    </View>
  );


  if (loading && (!badges || badges.length === 0) && (!achievements || achievements.length === 0)) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Your Progress...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Your Progress</Text></View>
      <View style={styles.tabs}>
        {(['badges', 'achievements'] as ActiveTab[]).map(tabName => (
          <TouchableOpacity key={tabName} style={[styles.tab, activeTab === tabName && styles.activeTab]} onPress={() => setActiveTab(tabName)}>
            <Text style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>{tabName.charAt(0).toUpperCase() + tabName.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.contentScrollView}>
        <View style={styles.infoCard}>
          <Icon name={activeTab === 'badges' ? 'shield-star' : 'trophy-variant'} type="material-community" size={24} color={COLORS.primary} />
          <Text style={styles.infoText}>
            {activeTab === 'badges' ? 'Badges are awarded for special milestones and contributions.' : 'Achievements track your progress towards various goals.'}
          </Text>
        </View>
        {activeTab === 'badges' ? renderBadgesGrid() : renderAchievementsList()}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}><Text style={styles.statValue}>{badges?.length || 0}</Text><Text style={styles.statLabel}>Badges</Text></View>
            <Divider orientation="vertical" style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statValue}>{achievements?.filter(a => a.completed)?.length || 0}</Text><Text style={styles.statLabel}>Completed</Text></View>
            <Divider orientation="vertical" style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statValue}>{achievements?.reduce((total, a) => total + (a.completed ? a.achievement.points : 0), 0) || 0}</Text><Text style={styles.statLabel}>Points</Text></View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.medium, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.grey200 },
  headerTitle: { ...TYPOGRAPHY.h1, color: COLORS.text },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.grey200 },
  tab: { flex: 1, paddingVertical: SPACING.medium, alignItems: 'center' },
  activeTab: { borderBottomWidth: 3, borderBottomColor: COLORS.primary },
  tabText: { ...TYPOGRAPHY.subtitle, color: COLORS.grey600 },
  activeTabText: { color: COLORS.primary, fontWeight: 'bold' },
  contentScrollView: { flex: 1, padding: SPACING.medium },
  infoCard: { backgroundColor: COLORS.lightPrimaryBackground || '#E0E7FF', flexDirection: 'row', padding: SPACING.medium, borderRadius: 10, alignItems: 'center', marginBottom: SPACING.medium },
  infoText: { ...TYPOGRAPHY.body, color: COLORS.primary, marginLeft: SPACING.small, flex: 1 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.medium },
  badgeContainer: { width: '48%', backgroundColor: COLORS.white, borderRadius: 10, padding: SPACING.medium, marginBottom: SPACING.medium, alignItems: 'center', elevation: 2, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  badgeImageContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.lightGrey, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.small },
  badgeImage: { width: 50, height: 50, borderRadius: 25 },
  badgeName: { ...TYPOGRAPHY.subtitle, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xsmall },
  badgeDate: { ...TYPOGRAPHY.caption, color: COLORS.grey600, textAlign: 'center', fontSize: 10 },
  achievementSectionTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.medium, marginBottom: SPACING.small, borderBottomWidth:1, borderBottomColor: COLORS.grey200, paddingBottom: SPACING.xsmall },
  achievementContainer: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 10, padding: SPACING.medium, marginBottom: SPACING.small, elevation: 2, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, alignItems: 'center' },
  achievementIconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.lightPrimary, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.medium },
  inProgressIconContainer: { backgroundColor: COLORS.lightGrey },
  achievementIcon: { width: 30, height: 30 }, // Adjusted size
  inProgressIcon: { opacity: 0.6 },
  achievementDetails: { flex: 1 },
  achievementName: { ...TYPOGRAPHY.subtitle, color: COLORS.text, marginBottom: SPACING.xsmall },
  achievementDescription: { ...TYPOGRAPHY.caption, color: COLORS.grey700, marginBottom: SPACING.xsmall },
  achievementDate: { ...TYPOGRAPHY.caption, color: COLORS.grey600, fontSize: 10 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xsmall },
  progressBarContainer: { flex: 1, height: 8, backgroundColor: COLORS.grey200, borderRadius: 4, marginRight: SPACING.small, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  progressText: { ...TYPOGRAPHY.caption, color: COLORS.primary, width: 35, fontSize: 10, textAlign: 'right' },
  pointsContainer: { justifyContent: 'center', alignItems: 'center', width: 40, marginLeft: SPACING.small },
  pointsText: { ...TYPOGRAPHY.h3, color: COLORS.primary, fontWeight: 'bold' },
  pointsLabel: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontSize: 10 },
  inProgressPointsText: { color: COLORS.grey500 },
  emptyContentContainer: { alignItems: 'center', justifyContent: 'center', padding: SPACING.extraLarge, minHeight: 200 },
  emptyTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginTop: SPACING.medium, marginBottom: SPACING.small, textAlign: 'center' },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.grey600, textAlign: 'center' },
  statsCard: { backgroundColor: COLORS.white, borderRadius: 10, padding: SPACING.medium, marginVertical: SPACING.medium, elevation: 2, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  statsTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.medium, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { ...TYPOGRAPHY.h1, color: COLORS.primary, fontWeight: 'bold' },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.grey700, marginTop: SPACING.xsmall },
  statDivider: { height: '60%', width: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { ...TYPOGRAPHY.body, color: COLORS.grey700, marginTop: SPACING.medium },
});

// Fallback style definitions
const TYPOGRAPHY = {
  h1: { fontSize: 24, fontWeight: 'bold' }, h2: { fontSize: 20, fontWeight: 'bold' }, h3: { fontSize: 16, fontWeight: '600'},
  subtitle: { fontSize: 16 }, body: { fontSize: 14 }, caption: { fontSize: 12 },
  ...TYPOGRAPHY,
};
const SPACING = {
  xsmall: 4, small: 8, medium: 16, large: 24, extraLarge: 32,
  ...SPACING,
};
const COLORS = {
  primary: '#4A80F0', white: '#FFFFFF', black: '#000000', text: '#333333',
  grey200: '#E5E7EB', grey300: '#D1D5DB', grey400: '#9CA3AF', grey500: '#6B7280',
  grey600: '#4B5563', grey700: '#374151', background: '#F4F6F8',
  lightGrey: '#F3F4F6', lightPrimary: '#E0E7FF', gold: '#FFD700',
  lightPrimaryBackground: '#E0E7FF',
  ...COLORS,
};

export default BadgesScreen;
