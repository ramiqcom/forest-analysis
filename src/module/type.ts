import { FeatureCollection } from 'geojson';
import { Map } from 'maplibre-gl';
import { Dispatch, SetStateAction } from 'react';

export type VisObject = {
  bands?: Array<string> | string;
  min?: Array<number> | number;
  max?: Array<number> | number;
  palette?: Array<string> | string;
  color?: string;
};

export type MapId = {
  mapid: string;
  urlFormat: string;
  image: Record<string, any>;
};

export type Status = {
  message: string;
  type: 'process' | 'failed' | 'success';
};

export type Option = {
  label: string;
  value: any;
  years?: number[];
  years1?: number[];
  years2?: number[];
  palette?: string[] | string;
  min?: number[] | number | string[] | string;
  max?: number[] | number | string[] | string;
};

export type Options = Array<Option>;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type GlobalContext = {
  defaultLayer: string;
  year: Option;
  setYear: SetState<Option>;
  years: Options;
  setYears: SetState<Options>;
  map: Map;
  setMap: SetState<Map>;
  status: Status;
  setStatus: SetState<Status>;
  geojson: FeatureCollection<any>;
  setGeojson: SetState<FeatureCollection<any>>;
  roiId: string;
  rasterId: string;
  analysis: Option;
  setAnalysis: SetState<Option>;
  analysisOptions: Options;
  forestLossStart: Options;
  forestLossEnd: Options;
  defYearStart: Option;
  setDefYearStart: SetState<Option>;
  defYearEnd: Option;
  setDefYearEnd: SetState<Option>;
  setForestLossStart: SetState<Options>;
  setForestLossEnd: SetState<Options>;
  forestlossYears: Option;
  indice: Option;
  setIndice: SetState<Option>;
  satellite: Option;
  setSatellite: SetState<Option>;
  defaultVectorUrl: string;
  buffer: number;
  setBuffer: SetState<number>;
  threshold: number;
  setThreshold: SetState<number>;
  onlyBuffer: boolean;
  setOnlyBuffer: SetState<boolean>;
  defaultInfo: string;
  showLayer: boolean;
  setShowLayer: SetState<boolean>;
  defaultBorderUrl: string;
  borderId: string;
  showRoi: boolean;
  setShowRoi: SetState<boolean>;
  showBorder: boolean;
  setShowBorder: SetState<boolean>;
};

export type Urls = {
  lc: string;
  agb: string;
};
