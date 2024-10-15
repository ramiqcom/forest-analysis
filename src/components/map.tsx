import { getDataValue } from '@/module/layer';
import { Context } from '@/module/store';
import { bbox, buffer as bufferData, dissolve, flatten } from '@turf/turf';
import { FeatureCollection } from 'geojson';
import { LngLatBoundsLike, Map, MapMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useContext, useEffect, useState } from 'react';

export default function MapCanvas() {
  const {
    map,
    setMap,
    setStatus,
    defaultLayer,
    geojson,
    roiId,
    rasterId,
    defaultInfo,
    showLayer,
    buffer,
    onlyBuffer,
    indice,
    threshold,
    satellite,
    year,
    defYearStart,
    defYearEnd,
    analysis,
    borderId,
    defaultBorderUrl,
    showRoi,
    showBorder,
  } = useContext(Context);

  const divId = 'map';

  // State to help detect if the map already loaded
  const [mapLoaded, setMapLoaded] = useState(false);

  // Function to identify value on the layer
  async function onClickMap(e: MapMouseEvent) {
    try {
      setStatus({ type: 'process', message: 'Identify...' });
      const coords = e.lngLat.toArray();
      const geojsonData = dissolve(flatten(geojson as FeatureCollection));
      const info = await getDataValue(analysis.value, coords, {
        threshold,
        geojson: geojsonData,
        year: year.value,
        buffer,
        onlyBuffer,
        indice: indice.value,
        satellite: satellite.value,
        yearEnd: defYearEnd.value,
        yearStart: defYearStart.value,
      });
      setStatus({ type: 'success', message: info });
    } catch ({ message }) {
      setStatus({ type: 'failed', message });
    }
  }

  // Add map to web first time
  useEffect(() => {
    try {
      setStatus({ type: 'process', message: 'Loading map...' });

      // Bounds for map
      const bounds = bbox(bufferData(geojson, 10));

      const map = new Map({
        container: divId,
        bounds: bounds as LngLatBoundsLike,
        minZoom: 3,
        maxZoom: 15,
        style: {
          version: 8,
          sources: {
            basemap: {
              type: 'raster',
              tiles: ['https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}'],
              tileSize: 256,
            },
            [rasterId]: {
              type: 'raster',
              tiles: [defaultLayer],
              tileSize: 256,
            },
            [borderId]: {
              type: 'raster',
              tiles: [defaultBorderUrl],
              tileSize: 256,
            },
            [roiId]: {
              type: 'geojson',
              data: geojson,
            },
          },
          layers: [
            {
              id: 'basemap',
              source: 'basemap',
              type: 'raster',
            },
            {
              id: rasterId,
              layout: { visibility: showLayer ? 'visible' : 'none' },
              source: rasterId,
              type: 'raster',
            },
            {
              id: borderId,
              layout: { visibility: showBorder ? 'visible' : 'none' },
              source: borderId,
              type: 'raster',
            },
            {
              id: roiId,
              source: roiId,
              layout: { visibility: showRoi ? 'visible' : 'none' },
              type: 'line',
              paint: {
                'line-color': 'white',
                'line-width': 2,
              },
            },
          ],
        },
      });
      setMap(map);
      setMapLoaded(true);
      setStatus({ type: 'success', message: defaultInfo });
    } catch ({ message }) {
      setStatus({ type: 'failed', message });
    }
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      map.on('click', onClickMap);
      return () => {
        map.off('click', onClickMap);
      };
    }
  }, [
    mapLoaded,
    analysis,
    threshold,
    geojson,
    year,
    buffer,
    onlyBuffer,
    indice,
    satellite,
    defYearEnd,
    defYearStart,
  ]);

  return <div id={divId} style={{ width: '100%', height: '100%' }}></div>;
}
