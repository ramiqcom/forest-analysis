import indices from '@/data/indices.json';
import satellites from '@/data/satellites.json';
import { loadGeojson } from '@/module/geo';
import getAgbLayer, {
  generateIndicesLayer,
  getForestLayer,
  getForestLossLayer,
  getVector,
} from '@/module/layer';
import { Context } from '@/module/store';
import { Option } from '@/module/type';
import { bbox } from '@turf/turf';
import { FeatureCollection } from 'geojson';
import { GeoJSONSource, LngLatBoundsLike, RasterTileSource } from 'maplibre-gl';
import { useContext, useState } from 'react';
import { Select } from './input';

// Main analysis component
export default function Analysis() {
  const {
    analysisOptions,
    analysis,
    setAnalysis,
    years,
    setYears,
    year,
    setYear,
    forestLossEnd,
    forestLossStart,
    defYearStart,
    defYearEnd,
    setForestLossEnd,
    setForestLossStart,
    setDefYearStart,
    setDefYearEnd,
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
    geojson,
    map,
    setStatus,
    rasterId,
    status,
  } = useContext(Context);

  // Make options for forest loss
  const defaultStartYears = forestlossYears.years1.map(
    (x) => new Object({ value: x, label: String(x) }) as Option,
  );

  // Make options for forest loss
  const defaultEndYears = forestlossYears.years2.map(
    (x) => new Object({ value: x, label: String(x) }) as Option,
  );

  // Id of layer for conditional
  const idLayer = analysis.value;

  // Years component
  let yearsDiv: JSX.Element;
  if (idLayer == 'forest_loss') {
    yearsDiv = (
      <>
        <Select
          options={forestLossStart}
          value={defYearStart}
          disabled={status.type == 'process'}
          onChange={(value) => {
            setDefYearStart(value);

            const newForestEnd = defaultEndYears.filter((x) => x.value > value.value);
            setForestLossEnd(newForestEnd);
          }}
        />
        <Select
          options={forestLossEnd}
          value={defYearEnd}
          disabled={status.type == 'process'}
          onChange={(value) => {
            setDefYearEnd(value);

            const newForestStart = defaultStartYears.filter((x) => x.value < value.value);
            setForestLossStart(newForestStart);
          }}
        />
      </>
    );
  } else {
    yearsDiv = (
      <Select
        options={years}
        value={year}
        disabled={status.type == 'process'}
        onChange={(value) => {
          setYear(value);
        }}
      />
    );
  }

  // For vegetation indices, select the index
  const IndicesSelect = (
    <>
      <Select
        options={indices}
        value={indice}
        onChange={(value) => setIndice(value)}
        disabled={status.type == 'process'}
      />
      <Select
        options={satellites}
        value={satellite}
        onChange={(value) => setSatellite(value)}
        disabled={status.type == 'process'}
      />
    </>
  );

  // For forest cover, component to mask the treecover
  const thresholdLevel = (
    <div style={{ display: 'flex', gap: '1vh', alignItems: 'center' }}>
      <div style={{ width: '20%', textAlign: 'left' }}>{'Forest >'}</div>
      <input
        type='number'
        value={threshold}
        disabled={status.type == 'process'}
        onChange={(e) => setThreshold(Number(e.target.value))}
      />
      {'Tree cover %'}
    </div>
  );

  return (
    <div
      style={{
        flexDirection: 'column',
        gap: '1vh',
        display: 'flex',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh' }}>
        <Upload />
      </div>
      <div
        style={{
          width: '100%',
          backgroundColor: 'white',
          height: '0.1px',
          marginTop: '2vh',
          marginBottom: '2vh',
        }}
      />
      <div style={{ fontSize: 'medium' }}> Select parameter for analysis</div>
      <Select
        options={analysisOptions}
        value={analysis}
        disabled={status.type == 'process'}
        onChange={(value) => {
          setAnalysis(value);

          if (value.value != 'forest_loss') {
            const years = value.years.map(
              (x) => new Object({ value: x, label: String(x) }) as Option,
            );
            setYears(years);

            if (!years.filter((x) => x.value == year.value).length) {
              setYear(years.at(-1));
            }
          }
        }}
      />
      {yearsDiv}
      {analysis.value == 'forest' ? thresholdLevel : null}
      {analysis.value == 'indices' ? IndicesSelect : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1vh' }}>
        <div style={{ width: '20%', textAlign: 'left' }}>Buffer</div>
        <input
          disabled={status.type == 'process'}
          value={buffer}
          onChange={(e) => setBuffer(Number(e.target.value))}
          type='number'
        />
        meter
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1vh' }}>
        <input
          disabled={status.type == 'process'}
          checked={onlyBuffer}
          onChange={(e) => setOnlyBuffer(e.target.checked)}
          type='checkbox'
        />
        Only buffer
      </div>

      <button
        disabled={status.type == 'process'}
        onClick={async () => {
          // Load layer based on the parameter

          try {
            setStatus({ type: 'process', message: 'Processing layer...' });

            let url: string;
            let info: string;

            switch (idLayer) {
              case 'forest': {
                const result = await getForestLayer(
                  year.value,
                  geojson,
                  threshold,
                  buffer,
                  onlyBuffer,
                );
                url = result.url;
                info = result.info;
                break;
              }
              case 'forest_loss': {
                const result = await getForestLossLayer(
                  defYearStart.value,
                  defYearEnd.value,
                  geojson,
                  threshold,
                  buffer,
                  onlyBuffer,
                );
                url = result.url;
                info = result.info;
                break;
              }
              case 'agb': {
                const result = await getAgbLayer(year.value, geojson, buffer, onlyBuffer);
                url = result.url;
                info = result.info;
                break;
              }
              case 'indices': {
                const result = await generateIndicesLayer(
                  year.value,
                  geojson,
                  satellite.value,
                  indice.value,
                  buffer,
                  onlyBuffer,
                );
                url = result.url;
                info = result.info;
              }
            }

            const source = map.getSource(rasterId) as RasterTileSource;
            source.setTiles([url]);

            setStatus({ type: 'success', message: info });
          } catch ({ message }) {
            setStatus({ type: 'failed', message });
          }
        }}
      >
        Run Analysis
      </button>
    </div>
  );
}

// Component to load geojson
function Upload() {
  const { setStatus, setGeojson, map, roiId, defaultVectorUrl, status } = useContext(Context);

  // Name of the choice to load geojson
  const [fileChoice, setFileChoice] = useState('gee');

  // Url or id if using gee asset id
  const [assetId, setAssetId] = useState(defaultVectorUrl);

  // Select button to upload the data
  const fileUploadChoice = [
    { label: 'Upload', value: 'upload' },
    { label: 'GEE Asset', value: 'gee' },
  ].map((dict, key) => (
    <button
      key={key}
      className='select-button'
      onClick={() => setFileChoice(dict.value)}
      disabled={fileChoice == dict.value}
    >
      {dict.label}
    </button>
  ));

  // Function to add geojson to map and zoom to it
  function loadGeojsonToMap(geojson: FeatureCollection<any>) {
    const source = map.getSource(roiId) as GeoJSONSource;
    source.setData(geojson);
    const bounds = bbox(geojson);
    map.fitBounds(bounds as LngLatBoundsLike, { padding: 100 });
  }

  const uploadFile = (
    <input
      type='file'
      disabled={status.type == 'process'}
      accept='.zip,.kml,.kmz,.geojson,.json'
      onChange={async (e) => {
        // Process file into a geojson
        try {
          setStatus({ type: 'process', message: 'Processing region...' });
          const file = e.target.files[0];
          const geojson = await loadGeojson(file);
          setGeojson(geojson);
          loadGeojsonToMap(geojson);
          setStatus({ type: 'success', message: 'Region loaded' });
        } catch ({ message }) {
          setGeojson(undefined);
          setStatus({ type: 'failed', message });
        }
      }}
    />
  );

  // Component to upload using assetId gee
  const assetIdUpload = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh' }}>
      <input
        placeholder='Geospatial data url or GEE asset'
        value={assetId}
        onChange={(e) => setAssetId(e.target.value)}
      />
      <button
        disabled={assetId && !(status.type == 'process') ? false : true}
        onClick={async () => {
          // Load geojson from earth engine asset id
          try {
            setStatus({ type: 'process', message: 'Processing region...' });
            const geojson = await getVector(assetId);
            setGeojson(geojson);
            loadGeojsonToMap(geojson);
            setStatus({ type: 'success', message: 'Region loaded' });
          } catch ({ message }) {
            setGeojson(undefined);
            setStatus({ type: 'failed', message });
          }
        }}
      >
        Load
      </button>
    </div>
  );

  return (
    <div
      style={{
        flexDirection: 'column',
        gap: '1vh',
        textAlign: 'left',
        display: 'flex',
      }}
    >
      <div
        style={{
          fontSize: 'small',
        }}
      >
        Upload shapefile (zip), geojson, or kml or GEE asset id
      </div>

      <div style={{ display: 'flex', alignContent: 'space-between' }}>{fileUploadChoice}</div>

      {fileChoice == 'upload' ? uploadFile : assetIdUpload}
    </div>
  );
}
