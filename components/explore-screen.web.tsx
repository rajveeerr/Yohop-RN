import { WebMapPlaceholder } from '@/components/web-map-placeholder';

export default function ExploreScreenWeb() {
  return (
    <WebMapPlaceholder
      title="Explore is optimized for native maps"
      description="The live map and markers are available on iOS and Android. On web, jump into Hot Spots or open Friends to continue browsing."
      primaryHref="/hotspots"
      primaryLabel="Open Hot Spots"
      secondaryHref="/friends"
      secondaryLabel="View Friends"
    />
  );
}