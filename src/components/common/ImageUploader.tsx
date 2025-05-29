import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Icon } from 'react-native-elements';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
  Asset,
  CameraOptions,
  ImageLibraryOptions,
} from 'react-native-image-picker';
import { COLORS } from '../../styles/colors'; // Assuming COLORS are defined and typed

// Interface for individual image objects
export interface ImageObject {
  uri: string;
  // Potentially other properties like id, fileType, etc. if needed
}

// Interface for the component's props
export interface ImageUploaderProps {
  images?: ImageObject[];
  onImagesChanged: (images: ImageObject[]) => void;
  maxImages?: number;
  title?: string;
  instructions?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images = [],
  onImagesChanged,
  maxImages = 5,
  title,
  instructions,
}) => {
  const handleAddImage = async (method: 'camera' | 'gallery') => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload a maximum of ${maxImages} images.`);
      return;
    }

    const options: CameraOptions | ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false, // Base64 can be large and is often not needed if uploading directly
      saveToPhotos: method === 'camera', // Save to gallery if taken with camera
    };

    try {
      const response: ImagePickerResponse = await (method === 'camera'
        ? launchCamera(options)
        : launchImageLibrary(options));

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error', `ImagePicker Error: ${response.errorMessage || 'Unknown error'}`);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const newImages: ImageObject[] = response.assets
          .filter((asset): asset is Asset & { uri: string } => asset.uri != null) // Type guard for uri
          .map((asset) => ({ uri: asset.uri! })); // asset.uri will be defined due to filter
        onImagesChanged([...images, ...newImages].slice(0, maxImages)); // Ensure not to exceed maxImages
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'An error occurred while selecting the image.');
    }
  };

  const handleRemoveImage = (index: number) => {
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
          <View key={index.toString()} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
              accessible={true}
              accessibilityLabel="Remove image"
              accessibilityRole="button"
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
              accessible={true}
              accessibilityLabel="Add image from gallery"
              accessibilityRole="button"
            >
              <Icon name="photo-library" type="material" size={24} color={COLORS.primary} />
              <Text style={styles.addButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddImage('camera')}
              accessible={true}
              accessibilityLabel="Take photo with camera"
              accessibilityRole="button"
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
    color: COLORS.text, // Assuming COLORS.text exists
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
    flexDirection: 'row', // Changed to row to place buttons side-by-side if space allows or wrap
    justifyContent: 'flex-start', // Align to start
    alignItems: 'center', // Center items vertically
    height: 100, // Keep height for consistency
    paddingLeft: 5, // Add some padding if needed
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80, // Adjusted width for better text fit
    height: 80, // Adjusted height
    borderWidth: 1,
    borderColor: COLORS.primary, // Assuming COLORS.primary exists
    borderRadius: 8,
    borderStyle: 'dashed',
    marginHorizontal: 5, // Add margin between buttons
  },
  addButtonText: {
    fontSize: 12,
    color: COLORS.primary, // Assuming COLORS.primary exists
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ImageUploader;
