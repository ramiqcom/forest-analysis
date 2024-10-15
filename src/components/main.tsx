'use client';

import MapCanvas from '@/components/map';
import indices from '@/data/indices.json';
import layers from '@/data/layers.json';
import satellites from '@/data/satellites.json';
import { Context } from '@/module/store';
import { Option, Status } from '@/module/type';
import { FeatureCollection } from 'geojson';
import { Map } from 'maplibre-gl';
import { useState } from 'react';
import Legend from './legend';
import Panel from './panel';

export default function Main({
  defaultStates: {
    defaultLayer,
    defaultInfo,
    defaultGeojson,
    defaultVectorUrl,
    defaultAnalysis,
    defaultYear,
    defaultThreshold,
    defaultBuffer,
    defaultOnlyBuffer,
    defaultBorderUrl,
  },
}: {
  defaultStates: {
    defaultLayer: string;
    defaultInfo: string;
    defaultBorderUrl: string;
    defaultGeojson: FeatureCollection<any>;
    defaultVectorUrl: string;
    defaultAnalysis: string;
    defaultYear: number;
    defaultThreshold: number;
    defaultBuffer: number;
    defaultOnlyBuffer: boolean;
  };
}) {
  // All the states needed
  const [map, setMap] = useState<Map>();
  const [status, setStatus] = useState<Status>({ message: 'Loading app...', type: 'process' });
  const [geojson, setGeojson] = useState<FeatureCollection<any>>(defaultGeojson);

  const [analysis, setAnalysis] = useState<Option>(
    layers.filter((x) => x.value == defaultAnalysis)[0],
  );
  const [years, setYears] = useState(
    analysis?.years?.map((year) => new Object({ value: year, label: String(year) }) as Option),
  );
  const [year, setYear] = useState(years.filter((x) => x.value == defaultYear)[0]);

  const forestlossYears = layers.filter((x) => x.value == 'forest_loss')[0];
  const [forestLossStart, setForestLossStart] = useState(
    forestlossYears.years1.map((num) => new Object({ value: num, label: String(num) }) as Option),
  );
  const [forestLossEnd, setForestLossEnd] = useState(
    forestlossYears.years2.map((num) => new Object({ value: num, label: String(num) }) as Option),
  );
  const [defYearStart, setDefYearStart] = useState(forestLossStart.at(0));
  const [defYearEnd, setDefYearEnd] = useState(forestLossEnd.at(-1));

  const [indice, setIndice] = useState(indices.at(0) as Option);
  const [satellite, setSatellite] = useState(satellites[0] as Option);

  const [buffer, setBuffer] = useState(defaultBuffer);
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [onlyBuffer, setOnlyBuffer] = useState(defaultOnlyBuffer);

  const [showLayer, setShowLayer] = useState(true);
  const [showRoi, setShowRoi] = useState(true);
  const [showBorder, setShowBorder] = useState(true);

  const roiId = 'roi';
  const borderId = 'border';
  const rasterId = 'raster';

  // Convert to object as context
  const states = {
    roiId,
    rasterId,
    borderId,
    showRoi,
    setShowRoi,
    showBorder,
    setShowBorder,
    defaultVectorUrl,
    defaultBorderUrl,
    defaultLayer,
    years,
    setYears,
    year,
    setYear,
    map,
    setMap,
    status,
    setStatus,
    geojson,
    setGeojson,
    analysis,
    setAnalysis,
    analysisOptions: layers,
    forestLossStart,
    forestLossEnd,
    defYearStart,
    setDefYearStart,
    defYearEnd,
    setDefYearEnd,
    setForestLossStart,
    setForestLossEnd,
    forestlossYears,
    indice,
    setIndice,
    satellite,
    setSatellite,
    buffer,
    setBuffer,
    threshold,
    setThreshold,
    onlyBuffer,
    setOnlyBuffer,
    defaultInfo,
    showLayer,
    setShowLayer,
  };

  return (
    <Context.Provider value={states}>
      <Legend />
      <MapCanvas />
      <Panel />
    </Context.Provider>
  );
}
