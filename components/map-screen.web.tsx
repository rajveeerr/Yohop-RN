import { WebMapPlaceholder } from '@/components/web-map-placeholder';

export default function MapScreenWeb() {
  return (
    <WebMapPlaceholder
      title="Map experience is native-only"
      description="The interactive map relies on a native map view. On web, use Hot Spots or Explore to browse nearby places and activity."
      primaryHref="/hotspots"
      primaryLabel="Open Hot Spots"
      secondaryHref="/explore"
      secondaryLabel="Go to Explore"
    />
  );
}