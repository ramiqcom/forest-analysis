import { Context } from '@/module/store';
import { bbox, buffer } from '@turf/turf';
import { LngLatBoundsLike, Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useContext, useEffect } from 'react';

export default function MapCanvas() {
  const { setMap, setStatus, defaultLayer, geojson, roiId, rasterId, defaultInfo, showLayer } =
    useContext(Context);

  const divId = 'map';

  // Add map to web first time
  useEffect(() => {
    try {
      setStatus({ type: 'process', message: 'Loading map...' });

      // Bounds for map
      const bounds = bbox(buffer(geojson, 10));

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
              tiles: ['https://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}'],
              tileSize: 256,
            },
            [rasterId]: {
              type: 'raster',
              tiles: [defaultLayer],
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
              id: roiId,
              source: roiId,
              type: 'line',
              paint: {
                'line-color': 'orange',
                'line-width': 2,
              },
            },
          ],
        },
      });
      setMap(map);

      map.on('click', async (e) => {
        try {
          setStatus({ type: 'process', message: 'Identify...' });
          const coords = e.lngLat.toArray();
          // const { landcover, agbMin, agbMax } = await identify(year.value, coords);
          // const message = `Land cover: ${landcover}; AGB: ${agbMin} - ${agbMax} C Ton/Ha`;
          setStatus({ type: 'success', message: '' });
        } catch ({ message }) {
          setStatus({ type: 'failed', message });
        }
      });

      setStatus({ type: 'success', message: defaultInfo });
    } catch ({ message }) {
      setStatus({ type: 'failed', message });
    }
  }, []);

  return <div id={divId} style={{ width: '100%', height: '100%' }}></div>;
}
