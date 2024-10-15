import { Context } from '@/module/store';
import { useContext } from 'react';
import Analysis from './analysis';

export default function Panel() {
  const { status } = useContext(Context);

  return (
    <div
      style={{
        width: '25%',
        maxHeight: '100vh',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '2vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '1vh',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 'x-large' }}>Forest Analysis Application</div>
        <div
          style={{
            width: '100%',
            backgroundColor: 'white',
            height: '0.1px',
            marginTop: '2vh',
            marginBottom: '2vh',
          }}
        />

        <Analysis />

        <div
          style={{
            width: '100%',
            backgroundColor: 'white',
            height: '0.1px',
            marginTop: '2vh',
            marginBottom: '2vh',
          }}
        />

        <div
          style={{
            fontWeight: 'bold',
            color:
              status.type == 'process'
                ? 'lightskyblue'
                : status.type == 'success'
                  ? 'lightgreen'
                  : 'lightcoral',
          }}
        >
          {status.message}
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

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          Created by Ramadhan
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1vh' }}>
            <a
              style={{ color: 'lightskyblue', fontWeight: 'bold' }}
              target='_blank'
              href='https://linkedin.com/in/ramiqcom'
            >
              LinkedIn
            </a>
            <a
              style={{ color: 'lightskyblue', fontWeight: 'bold' }}
              target='_blank'
              href='https://github/ramiqcom'
            >
              GitHub
            </a>
            <a
              style={{ color: 'lightskyblue', fontWeight: 'bold' }}
              target='_blank'
              href='https://youtube.com/@ramiqcom'
            >
              YouTube
            </a>
            <a
              style={{ color: 'lightskyblue', fontWeight: 'bold' }}
              target='_blank'
              href='mailto:ramiqcom@gmail.com'
            >
              Email
            </a>
          </div>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1vh' }}>
          {'Data Source'}
          <a
            href='https://developers.google.com/earth-engine/datasets/catalog/UMD_hansen_global_forest_change_2023_v1_11'
            style={{ color: 'lightskyblue', fontWeight: 'bold' }}
            target='_blank'
          >
            Hansen Forest Cover
          </a>

          <a
            href='https://gee-community-catalog.org/projects/cci_agb/?h=esa+cc'
            style={{ color: 'lightskyblue', fontWeight: 'bold' }}
            target='_blank'
          >
            awesome-gee-community-catalog ESA CCI Global Forest Above Ground Biomass
          </a>

          <a
            href='https://developers.google.com/earth-engine/datasets/catalog/NASA_HLS_HLSL30_v002'
            style={{ color: 'lightskyblue', fontWeight: 'bold' }}
            target='_blank'
          >
            Harmonized Landsat
          </a>

          <a
            href='https://developers.google.com/earth-engine/datasets/catalog/COPERNICUS_S2_SR_HARMONIZED'
            style={{ color: 'lightskyblue', fontWeight: 'bold' }}
            target='_blank'
          >
            Harmonized Sentinel-2
          </a>
        </div>
      </div>
    </div>
  );
}
