import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { Profile } from '../types';

/**
 * Parses a .clark configuration string.
 * Currently assumes it's a JSON string, but this can be adapted
 * to decrypt or parse custom proprietary formats.
 */
export const parseClarkConfig = (configString: string): any => {
  try {
    return JSON.parse(configString);
  } catch (error) {
    console.error('Failed to parse .clark config:', error);
    throw new Error('Invalid .clark configuration format');
  }
};

/**
 * Prompts the user to pick a .clark file and reads its content.
 */
export const importProfileFile = async (): Promise<Profile | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*', // In a real app, you can use custom mime types if registered
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const file = result.assets[0];
    
    // Verify extension
    if (!file.name.endsWith('.clark')) {
      throw new Error('Please select a valid .clark file');
    }

    const fileContent = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Validate if it parses
    parseClarkConfig(fileContent);

    const newProfile: Profile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name.replace('.clark', ''),
      configData: fileContent,
      isFavorite: false,
    };

    return newProfile;
  } catch (error) {
    console.error('Error importing profile:', error);
    throw error;
  }
};

/**
 * Exports a profile to a .clark file in the app's document directory.
 * (To share it externally, you'd use expo-sharing).
 */
export const exportProfileFile = async (profile: Profile): Promise<string> => {
  try {
    const fileUri = `${FileSystem.documentDirectory}${profile.name.replace(/\s+/g, '_')}.clark`;
    await FileSystem.writeAsStringAsync(fileUri, profile.configData, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return fileUri;
  } catch (error) {
    console.error('Error exporting profile:', error);
    throw error;
  }
};
