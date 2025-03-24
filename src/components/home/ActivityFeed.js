// src/components/home/ActivityFeed.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { getActivities } from '../../store/actions/activityActions';
import { COLORS } from '../../styles/colors';

const ActivityCard = ({ activity, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image 
        source={{ uri: activity.image }} 
        style={styles.activityImage}
      />
      
      <View style={styles.cardContent}>
        <Text style={styles.activityName}>{activity.name}</Text>
        
        <View style={styles.detailRow}>
          <Icon name="calendar" type="feather" size={16} color="#888" />
          <Text style={styles.detailText}>{activity.date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="map-pin" type="feather" size={16} color="#888" />
          <Text style={styles.detailText}>{activity.location}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Icon name="users" type="feather" size={16} color="#888" />
          <Text style={styles.detailText}>{activity.participants} participants</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Image 
            source={{ uri: activity.creator.avatar }} 
            style={styles.userAvatar}
          />
          <Text style={styles.userName}>Organized by {activity.creator.name}</Text>
        </View>
      </View>
      
      <Button
        title="Join"
        buttonStyle={styles.joinButton}
        titleStyle={styles.joinButtonText}
      />
    </TouchableOpacity>
  );
};

const ActivityFeed = ({ navigation }) => {
  const dispatch = useDispatch();
  // In a real app, this would come from Redux
  const [activities, setActivities] = useState([
    {
      id: '1',
      name: 'Morning Hike at Sunset Trail',
      date: 'Tomorrow, 8:00 AM',
      location: 'Sunset Park',
      participants: 3,
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306',
      creator: {
        name: 'Sarah',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg'
      }
    },
    {
      id: '2',
      name: 'Beginner Yoga Class',
      date: 'Friday, 6:30 PM',
      location: 'Community Center',
      participants: 5,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
      creator: {
        name: 'Mike',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
      }
    },
    {
      id: '3',
      name: 'Weekend Bike Ride',
      date: 'Saturday, 10:00 AM',
      location: 'Riverfront Trail',
      participants: 2,
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
      creator: {
        name: 'Alex',
        avatar: 'https://randomuser.me/api/portraits/women/45.jpg'
      }
    }
  ]);
  
  useEffect(() => {
    // In a real app, dispatch an action to fetch activities
    // dispatch(getActivities());
  }, []);
  
  const renderActivityCard = ({ item }) => (
    <ActivityCard 
      activity={item} 
      onPress={() => navigation.navigate('ActivityDetail', { activityId: item.id })}
    />
  );
  
  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivityCard}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  activityImage: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    color: '#555',
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ActivityFeed;