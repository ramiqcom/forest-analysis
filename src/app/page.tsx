export const dynamic = 'force-dynamic';

import Main from '@/components/main';
import { getForestLayer, getVector } from '@/module/layer';

export default async function Home() {
  // Load the default parameter
  const defaultAnalysis = 'forest';
  const defaultYear = 2023;
  const firstUrl = 'users/oliverlevers/orbify_assessment';
  const firstThreshold = 50;
  const firstBuffer = 5000;
  const firstOnlyBuffer = true;
  const [firstLayer, geeVector] = await Promise.all([
    getForestLayer(defaultYear, firstUrl, firstThreshold, firstBuffer, firstOnlyBuffer),
    getVector(firstUrl),
  ]);

  return (
    <>
      <Main
        defaultStates={{
          defaultLayer: firstLayer.url,
          defaultInfo: firstLayer.info,
          defaultVectorUrl: firstUrl,
          defaultGeojson: geeVector,
          defaultAnalysis,
          defaultYear,
          defaultThreshold: firstThreshold,
          defaultBuffer: firstBuffer,
          defaultOnlyBuffer: firstOnlyBuffer,
        }}
      />
    </>
  );
}
