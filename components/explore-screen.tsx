import { Platform } from 'react-native';

const ExploreScreen =
  Platform.OS === 'web'
    ? require('./explore-screen.web').default
    : require('./explore-screen.native').default;

export default ExploreScreen;