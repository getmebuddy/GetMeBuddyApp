// src/components/common/ImageUploader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { COLORS } from '../../styles/colors';

const ImageUploader = ({ images = [], onImagesChanged, maxImages = 5, title, instructions }) => {
  const handleAddImage = async (method) => {
    if (images.length >= maxImages) {
      alert(`You can only upload a maximum of ${maxImages} images.`);
      return;
    }
    
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };
    
    try {
      const response = method === 'camera' 
        ? await launchCamera(options)
        : await launchImageLibrary(options);
      
      if (response.didCancel) {
        return;
      }
      
      if (response.errorCode) {
        alert(`ImagePicker Error: ${response.errorMessage}`);
        return;
      }
      
      if (response.assets && response.assets.length > 0) {
        const newImage = response.assets[0];
        onImagesChanged([...images, { uri: newImage.uri }]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('An error occurred while selecting the image.');
    }
  };
  
  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    onImagesChanged(updatedImages);
  };
  
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {instructions && <Text style={styles.instructions}>{instructions}</Text>}
      
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Icon name="close" type="material" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        
        {images.length < maxImages && (
          <View style={styles.addButtonsContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddImage('gallery')}
            >
              <Icon name="photo-library" type="material" size={24} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddImage('camera')}
            >
              <Icon name="camera-alt" type="material" size={24} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.text,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    height: 100,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
});

export default ImageUploader;