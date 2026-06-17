import { Platform } from 'react-native';

const MapScreen =
  Platform.OS === 'web'
    ? require('./map-screen.web').default
    : require('./map-screen.native').default;

export default MapScreen;