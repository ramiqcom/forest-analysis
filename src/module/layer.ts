'use server';

import indices from '@/data/indices.json';
import layers from '@/data/layers.json';
import satellites from '@/data/satellites.json';
import ee from '@google/earthengine';
import { FeatureCollection } from 'geojson';
import { authenticate, evaluate, getMapId } from './ee';

// Function to convert ee.FeatureCollection to feature collection geojson
export async function getVector(id: string) {
  await authenticate();
  const features = ee.FeatureCollection(id);
  const evaluated = await evaluate(features);
  return evaluated;
}

// Function to get geometry
function geometryData(
  features: FeatureCollection<any> | string,
  buffer: number = 0,
  onlyBuffer: boolean = false,
) {
  let roi = ee.FeatureCollection(features).geometry();
  const bufferRoi = roi.buffer(buffer);

  if (onlyBuffer) {
    roi = bufferRoi.difference(roi);
  }

  const border = ee.Image().paint(roi, 0, 2).visualize({ palette: 'red ' });

  return { roi, border };
}

// Get forest cover data
function getForestCover(year: number, roi: ee.FeatureCollection, threshold: number) {
  const forest = ee.Image('UMD/hansen/global_forest_change_2023_v1_11').clip(roi);
  const forestLoss = forest.select('lossyear').lte(year - 2000);
  const treecover = forest.select('treecover2000').gte(threshold).where(forestLoss, 0).selfMask();
  return treecover;
}

// Get forest data layer
export async function getForestLayer(
  year: number,
  features: FeatureCollection<any> | string,
  threshold: number,
  buffer: number = 0,
  onlyBuffer: boolean = false,
) {
  await authenticate();
  const { roi, border } = geometryData(features, buffer, onlyBuffer);
  const image = getForestCover(year, roi, threshold);
  const areaImage = ee.Image.pixelArea().multiply(1e-4);
  const forestReduce = areaImage
    .updateMask(image)
    .rename('forest_area')
    .addBands(areaImage)
    .reduceRegion({
      scale: 100,
      maxPixels: 1e13,
      geometry: roi,
      reducer: ee.Reducer.sum(),
    });

  const [area, mapid] = await Promise.all([
    evaluate(forestReduce),
    getMapId(
      image
        .visualize({ palette: layers.filter((x) => x.value == 'forest')[0].palette })
        .blend(border),
      {},
    ),
  ]);

  return {
    info: `Forest area: ${Math.round(area.forest_area)} Ha; Analysis area: ${Math.round(area.area)} Ha`,
    url: mapid.urlFormat,
  };
}

// Get forest loss data
function forestLossData(yearStart: number, yearEnd: number, roi: ee.Geometry, threshold: number) {
  const forest = ee.Image('UMD/hansen/global_forest_change_2023_v1_11').clip(roi);
  const forestCover = getForestCover(yearStart, roi, threshold);
  let forestLoss = forest.select('lossyear');
  forestLoss = forestLoss.updateMask(
    forestLoss
      .gte(yearStart - 2000)
      .and(forestLoss.lte(yearEnd - 2000))
      .and(forestCover),
  );
  return forestLoss;
}

// Get forest loss layer
export async function getForestLossLayer(
  yearStart: number,
  yearEnd: number,
  features: FeatureCollection<any> | string,
  threshold: number,
  buffer: number = 0,
  onlyBuffer: boolean = false,
) {
  await authenticate();

  const { roi, border } = geometryData(features, buffer, onlyBuffer);
  const forestLoss = forestLossData(yearStart, yearEnd, roi, threshold);

  const areaImage = ee.Image.pixelArea().multiply(1e-4);
  const forestReduce = areaImage
    .updateMask(forestLoss)
    .rename('forest_loss')
    .addBands(areaImage)
    .reduceRegion({
      scale: 100,
      maxPixels: 1e13,
      geometry: roi,
      reducer: ee.Reducer.sum(),
    });

  const [area, mapid] = await Promise.all([
    evaluate(forestReduce),
    getMapId(
      forestLoss
        .visualize({
          palette: layers.filter((x) => x.value == 'forest_loss')[0].palette,
          min: yearStart - 2000,
          max: yearEnd - 2000,
        })
        .blend(border),
      {},
    ),
  ]);

  return {
    info: `Forest loss ${yearStart} - ${yearEnd}: ${Math.round(area.forest_loss)} Ha; Analysis area: ${Math.round(area.area)} Ha`,
    url: mapid.urlFormat,
  };
}

// Function to get agb data
function getAgbData(year: number, roi: ee.Geometry) {
  const agb = ee
    .ImageCollection('projects/sat-io/open-datasets/ESA/ESA_CCI_AGB')
    .filter(ee.Filter.calendarRange(year, year, 'YEAR'))
    .first()
    .select('AGB')
    .unmask(0)
    .clip(roi);
  return agb;
}

// Function to get AGB layer
export default async function getAgbLayer(
  year: number,
  features: FeatureCollection<any> | string,
  buffer: number = 0,
  onlyBuffer: boolean = false,
) {
  await authenticate();
  const { roi, border } = geometryData(features, buffer, onlyBuffer);
  const agb = getAgbData(year, roi);

  const areaImage = ee.Image.pixelArea().multiply(1e-4);

  const agbValue = ee.Number(
    agb.multiply(areaImage).addBands(areaImage).reduceRegion({
      geometry: roi,
      scale: 100,
      maxPixels: 1e13,
      reducer: ee.Reducer.sum(),
    }),
  );

  const agbParam = layers.filter((x) => x.value == 'agb')[0];
  const [agbData, mapid] = await Promise.all([
    evaluate(agbValue),
    getMapId(
      agb
        .visualize({
          palette: agbParam.palette,
          min: agbParam.min,
          max: agbParam.max,
        })
        .blend(border),
      {},
    ),
  ]);

  return {
    info: `AGB: ${Math.round(agbData.AGB)} Ton; Analysis area: ${Math.round(agbData.area)} Ha`,
    url: mapid.urlFormat,
  };
}

// Function to generate the indices data
function indicesData(year: number, roi: ee.Geometry, satellite: string, indice: string) {
  const { collections, bands_label, bands_source } = satellites.filter(
    (x) => x.value == satellite,
  )[0];
  const { formula } = indices.filter((x) => x.value == indice)[0];
  const filter = ee.Filter.and(ee.Filter.bounds(roi), ee.Filter.calendarRange(year, year, 'YEAR'));
  let col = ee.ImageCollection(collections).filter(filter);
  if (satellite == 's2') {
    const cloudCol = ee.ImageCollection('GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED').filter(filter);
    col = col.linkCollection(cloudCol, 'cs').map(cloudMaskS2);
  } else {
    col = col.map(cloudMaskLandsat);
  }

  const image = col.select(bands_source, bands_label).median().clip(roi);

  const bandMap = {};
  bands_label.map((label) => (bandMap[label] = image.select(label)));

  const indexImage = image.expression(formula, bandMap);

  return indexImage;
}

// Function to generate landsat or sentinel indices layer
export async function generateIndicesLayer(
  year: number,
  features: FeatureCollection<any>,
  satellite: string,
  indice: string,
  buffer: number,
  onlyBuffer: boolean,
) {
  await authenticate();
  const { roi, border } = geometryData(features, buffer, onlyBuffer);
  const { min, max, palette } = layers.filter((x) => x.value == 'indices')[0];
  const indexImage = indicesData(year, roi, satellite, indice);

  const reduce = ee
    .Number(
      ee.Image.pixelArea()
        .multiply(1e-4)
        .reduceRegion({
          scale: 100,
          maxPixels: 1e13,
          geometry: roi,
          reducer: ee.Reducer.sum(),
        })
        .get('area'),
    )
    .toInt();

  const [area, mapid] = await Promise.all([
    evaluate(reduce),
    getMapId(
      indexImage
        .visualize({
          palette: palette,
          min: min,
          max: max,
        })
        .blend(border),
      {},
    ),
  ]);

  return { info: `Analysis area: ${area} Ha`, url: mapid.urlFormat };
}

// Cloud masking function landsat
function cloudMaskLandsat(image: ee.Image) {
  const qa = image.select('Fmask');
  const mask = ee
    .Image([1, 2, 3].map((x) => qa.bitwiseAnd(1 << x).eq(0)))
    .reduce(ee.Reducer.allNonZero());
  return image.select(['B.*']).updateMask(mask);
}

// Cloud masking function S2
function cloudMaskS2(image: ee.Image) {
  const mask = image.select('cs').gt(0.6);
  return image.select(['B.*']).updateMask(mask);
}

// Function to identify data value
export async function getDataValue(
  id: string,
  coords: number[],
  parameter: {
    threshold: number;
    geojson: FeatureCollection<any>;
    year: number;
    buffer: number;
    onlyBuffer: boolean;
    yearStart: number;
    yearEnd: number;
    satellite: string;
    indice: string;
  },
) {
  const { threshold, geojson, year, buffer, onlyBuffer, yearStart, yearEnd, satellite, indice } =
    parameter;

  await authenticate();

  const { roi } = geometryData(geojson, buffer, onlyBuffer);

  let image: ee.Image;

  switch (id) {
    case 'forest': {
      image = getForestCover(year, roi, threshold);
      break;
    }
    case 'forest_loss': {
      image = forestLossData(yearStart, yearEnd, roi, threshold);
      break;
    }
    case 'agb': {
      image = getAgbData(year, roi);
      break;
    }
    case 'indices': {
      image = indicesData(year, roi, satellite, indice);
      break;
    }
  }

  const result = image.rename('result').reduceRegion({
    scale: 100,
    maxPixels: 1e13,
    reducer: ee.Reducer.first(),
    geometry: ee.Geometry.Point(coords),
  });
}
