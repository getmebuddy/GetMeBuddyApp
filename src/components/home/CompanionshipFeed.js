// src/components/home/CompanionshipFeed.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { useDispatch, useSelector } from 'react-redux';
import { getCompanions } from '../../store/actions/companionshipActions';
import { COLORS } from '../../styles/colors';

const CompanionCard = ({ companion, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: companion.avatar }} 
          style={styles.avatar}
        />
        
        <View style={styles.verificationBadge}>
          <Icon name="verified-user" type="material" size={14} color="#fff" />
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{companion.name}, {companion.age}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" type="material" size={16} color={COLORS.warning} />
            <Text style={styles.rating}>{companion.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.bio} numberOfLines={2}>{companion.bio}</Text>
        
        <View style={styles.typeContainer}>
          {companion.types.map((type, index) => (
            <View key={index} style={styles.typeTag}>
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="schedule" type="material" size={16} color="#888" />
            <Text style={styles.statText}>{companion.responseTime}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="favorite" type="material" size={16} color="#888" />
            <Text style={styles.statText}>{companion.likes} likes</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="history" type="material" size={16} color="#888" />
            <Text style={styles.statText}>{companion.meetups} meetups</Text>
          </View>
        </View>
      </View>
      
      <Button
        title="Connect"
        buttonStyle={styles.connectButton}
        titleStyle={styles.connectButtonText}
      />
    </TouchableOpacity>
  );
};

const CompanionshipFeed = ({ navigation }) => {
  const dispatch = useDispatch();
  // In a real app, this would come from Redux
  const [companions, setCompanions] = useState([
    {
      id: '1',
      name: 'Emma',
      age: 28,
      bio: 'Native New Yorker, happy to show you around the city or just grab coffee and chat.',
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      rating: 4.9,
      responseTime: '< 1 hour',
      likes: 56,
      meetups: 24,
      types: ['City Guide', 'Conversation']
    },
    {
      id: '2',
      name: 'David',
      age: 32,
      bio: 'Museum enthusiast and foodie. Perfect companion for cultural events or trying new restaurants.',
      avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
      rating: 4.7,
      responseTime: '~2 hours',
      likes: 43,
      meetups: 19,
      types: ['Events', 'Dining']
    },
    {
      id: '3',
      name: 'Sophia',
      age: 26,
      bio: 'Outdoor adventure lover. Hiking, kayaking, or just exploring parks - I know all the best spots!',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      rating: 4.8,
      responseTime: '< 1 hour',
      likes: 61,
      meetups: 27,
      types: ['Outdoor', 'City Guide']
    }
  ]);
  
  useEffect(() => {
    // In a real app, dispatch an action to fetch companions
    // dispatch(getCompanions());
  }, []);
  
  const renderCompanionCard = ({ item }) => (
    <CompanionCard 
      companion={item} 
      onPress={() => navigation.navigate('CompanionDetail', { companionId: item.id })}
    />
  );
  
  return (
    <View style={styles.container}>
      <FlatList
        data={companions}
        renderItem={renderCompanionCard}
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
  cardHeader: {
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: 200,
  },
  verificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 15,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  bio: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  typeTag: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#888',
  },
  connectButton: {
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CompanionshipFeed;