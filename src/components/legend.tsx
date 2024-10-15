import { Context } from '@/module/store';
import { useContext } from 'react';

export default function Legend() {
  const {
    analysis,
    defYearStart,
    year,
    defYearEnd,
    showLayer,
    setShowLayer,
    map,
    rasterId,
    status,
    indice
  } = useContext(Context);

  const forestLegend = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1vh', width: '15vh' }}>
      <div
        style={{
          height: '2vh',
          width: '20%',
          backgroundColor: analysis?.palette as string,
          border: 'thin solid white',
        }}
      />
      Forest cover {year.value}
    </div>
  );

  const forestLossLegend = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1vh',
        width: '15vh',
      }}
    >
      Forest loss year
      <div>{defYearEnd?.value}</div>
      <div
        style={{
          height: '10vh',
          width: '20%',
          backgroundImage: `linear-gradient(to top, ${(analysis?.palette as string[]).join(', ')})`,
          border: 'thin solid white',
        }}
      />
      <div>{defYearStart?.value}</div>
    </div>
  );

  const agbIndexLegend = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1vh',
        width: '15vh',
      }}
    >
      {analysis.value == 'agb' ? 'AGB (C Ton/Ha)' : indice.label}
      <div>{analysis?.max}</div>
      <div
        style={{
          height: '10vh',
          width: '20%',
          backgroundImage: `linear-gradient(to top, ${(analysis?.palette as string[]).join(', ')})`,
          border: 'thin solid white',
        }}
      />
      <div>{analysis?.min}</div>
    </div>
  );

  return (
    <div style={{ position: 'absolute', top: '2vh', left: '2vh', zIndex: 9999999 }}>
      <div
        style={{
          backgroundColor: 'rgb(19, 19, 19)',
          padding: '1vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1vh',
        }}
      >
        <div style={{ fontSize: 'medium' }}>Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vh', width: '15vh' }}>
          <div style={{ height: '0.5px', width: '20%', backgroundColor: 'orange' }} />
          Uploaded ROI
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1vh', width: '15vh' }}>
          <div style={{ height: '0.5px', width: '20%', backgroundColor: 'red' }} />
          Analysis ROI
        </div>

        <div style={{ display: 'flex', gap: '1vh' }}>
          <input
            type='checkbox'
            checked={showLayer}
            disabled={status.type == 'process'}
            onChange={(e) => {
              const checked = e.target.checked;
              setShowLayer(checked);
              map.setLayoutProperty(rasterId, 'visibility', checked ? 'visible' : 'none');
            }}
          />
          <div>
            {analysis.value == 'forest' ? forestLegend : null}
            {analysis.value == 'forest_loss' ? forestLossLegend : null}
            {analysis.value == 'agb' || analysis.value == 'indices' ? agbIndexLegend : null}
          </div>
        </div>
      </div>
    </div>
  );
}
