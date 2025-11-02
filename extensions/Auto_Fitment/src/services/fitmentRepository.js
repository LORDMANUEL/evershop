import {
  select,
  insert,
  update,
  startTransaction,
  commit,
  rollback
} from '@evershop/postgres-query-builder';
import { pool, getConnection } from '@evershop/evershop/lib/postgres';
import { camelCase } from '@evershop/evershop/lib/util/camelCase';

const NORMALIZED_FIELDS = [
  'make',
  'model',
  'submodel',
  'engine_code',
  'engine_name',
  'body'
];

const normalizeValue = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
};

const sanitizeString = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toInteger = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatVehicleRow = (row) => {
  if (!row) {
    return null;
  }
  const data = camelCase(row);
  return {
    vehicleId: data.vehicleId,
    uuid: data.uuid,
    year: data.year,
    yearFrom: data.yearFrom,
    yearTo: data.yearTo,
    make: data.make,
    model: data.model,
    submodel: data.submodel,
    engineCode: data.engineCode,
    engineName: data.engineName,
    body: data.body,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
};

const applyVehicleFilters = (query, filters = {}) => {
  if (filters.vehicleId) {
    query.andWhere('fitment_vehicle.vehicle_id', '=', filters.vehicleId);
  }
  if (filters.year) {
    query.andWhere('fitment_vehicle.year', '=', filters.year);
  }
  if (filters.make) {
    query.andWhere('fitment_vehicle.make_normalized', '=', normalizeValue(filters.make));
  }
  if (filters.model) {
    query.andWhere(
      'fitment_vehicle.model_normalized',
      '=',
      normalizeValue(filters.model)
    );
  }
  if (filters.submodel) {
    query.andWhere(
      'fitment_vehicle.submodel_normalized',
      '=',
      normalizeValue(filters.submodel)
    );
  }
  if (filters.engineCode) {
    query.andWhere(
      'fitment_vehicle.engine_code_normalized',
      '=',
      normalizeValue(filters.engineCode)
    );
  }
  if (filters.engineName) {
    query.andWhere(
      'fitment_vehicle.engine_name_normalized',
      '=',
      normalizeValue(filters.engineName)
    );
  }
  if (filters.body) {
    query.andWhere(
      'fitment_vehicle.body_normalized',
      '=',
      normalizeValue(filters.body)
    );
  }
};

export const getFitmentOptions = async (filters = {}) => {
  const yearsQuery = select('DISTINCT fitment_vehicle.year', 'year')
    .from('fitment_vehicle')
    .orderBy('fitment_vehicle.year', 'DESC');
  const years = (await yearsQuery.execute(pool)).map((row) => Number(row.year));

  const makesQuery = select('DISTINCT fitment_vehicle.make', 'make')
    .from('fitment_vehicle')
    .orderBy('fitment_vehicle.make', 'ASC');
  if (filters.year) {
    makesQuery.andWhere('fitment_vehicle.year', '=', filters.year);
  }
  const makes = (await makesQuery.execute(pool)).map((row) => row.make);

  const modelsQuery = select('DISTINCT fitment_vehicle.model', 'model')
    .from('fitment_vehicle')
    .orderBy('fitment_vehicle.model', 'ASC');
  if (filters.year) {
    modelsQuery.andWhere('fitment_vehicle.year', '=', filters.year);
  }
  if (filters.make) {
    modelsQuery.andWhere(
      'fitment_vehicle.make_normalized',
      '=',
      normalizeValue(filters.make)
    );
  }
  const models = (await modelsQuery.execute(pool)).map((row) => row.model);

  const submodelsQuery = select('DISTINCT fitment_vehicle.submodel', 'submodel')
    .from('fitment_vehicle')
    .where('fitment_vehicle.submodel IS NOT NULL')
    .orderBy('fitment_vehicle.submodel', 'ASC');
  if (filters.year) {
    submodelsQuery.andWhere('fitment_vehicle.year', '=', filters.year);
  }
  if (filters.make) {
    submodelsQuery.andWhere(
      'fitment_vehicle.make_normalized',
      '=',
      normalizeValue(filters.make)
    );
  }
  if (filters.model) {
    submodelsQuery.andWhere(
      'fitment_vehicle.model_normalized',
      '=',
      normalizeValue(filters.model)
    );
  }
  const submodels = (await submodelsQuery.execute(pool))
    .map((row) => row.submodel)
    .filter(Boolean);

  const enginesQuery = select(
    'DISTINCT fitment_vehicle.engine_code',
    'engine_code'
  )
    .select('fitment_vehicle.engine_name', 'engine_name')
    .from('fitment_vehicle')
    .orderBy('fitment_vehicle.engine_name', 'ASC');
  if (filters.year) {
    enginesQuery.andWhere('fitment_vehicle.year', '=', filters.year);
  }
  if (filters.make) {
    enginesQuery.andWhere(
      'fitment_vehicle.make_normalized',
      '=',
      normalizeValue(filters.make)
    );
  }
  if (filters.model) {
    enginesQuery.andWhere(
      'fitment_vehicle.model_normalized',
      '=',
      normalizeValue(filters.model)
    );
  }
  if (filters.submodel) {
    enginesQuery.andWhere(
      'fitment_vehicle.submodel_normalized',
      '=',
      normalizeValue(filters.submodel)
    );
  }
  const engines = (await enginesQuery.execute(pool)).map((row) => ({
    code: row.engine_code || null,
    name: row.engine_name || row.engine_code || null
  }));

  const vehicleQuery = select()
    .from('fitment_vehicle')
    .limit(5)
    .orderBy('fitment_vehicle.vehicle_id', 'ASC');
  applyVehicleFilters(vehicleQuery, filters);
  const vehicleMatches = await vehicleQuery.execute(pool);
  const vehicle =
    vehicleMatches.length === 1 ? formatVehicleRow(vehicleMatches[0]) : null;

  return {
    years,
    makes,
    models,
    submodels,
    engines,
    vehicle
  };
};

export const findVehicle = async (filters = {}) => {
  const query = select().from('fitment_vehicle').limit(1);
  applyVehicleFilters(query, filters);
  const record = await query.load(pool);
  return formatVehicleRow(record);
};

export const ensureVehicle = async (payload, connectionArg) => {
  const connection = connectionArg || (await getConnection());
  const release = connectionArg ? () => Promise.resolve() : connection.release;

  const data = {
    year: toInteger(payload.year) || toInteger(payload.yearFrom) || null,
    year_from: toInteger(payload.yearFrom) || toInteger(payload.year) || null,
    year_to: toInteger(payload.yearTo) || toInteger(payload.year) || null,
    make: sanitizeString(payload.make),
    model: sanitizeString(payload.model),
    submodel: sanitizeString(payload.submodel),
    engine_code: sanitizeString(payload.engineCode),
    engine_name: sanitizeString(payload.engineName),
    body: sanitizeString(payload.body)
  };

  NORMALIZED_FIELDS.forEach((field) => {
    data[`${field}_normalized`] = normalizeValue(payload[field] || data[field]);
  });

  const existingQuery = select()
    .from('fitment_vehicle')
    .limit(1)
    .where('year', '=', data.year);
  NORMALIZED_FIELDS.forEach((field) => {
    existingQuery.andWhere(
      `${field}_normalized`,
      '=',
      data[`${field}_normalized`] || null
    );
  });
  const existing = await existingQuery.load(connection);

  let vehicleId;
  if (existing) {
    await update('fitment_vehicle')
      .given({
        ...data,
        updated_at: new Date()
      })
      .where('vehicle_id', '=', existing.vehicle_id)
      .execute(connection, false);
    vehicleId = existing.vehicle_id;
  } else {
    const inserted = await insert('fitment_vehicle')
      .given({ ...data })
      .execute(connection, false);
    vehicleId = inserted.insertId;
  }

  if (!connectionArg) {
    await release.call(connection);
  }

  return findVehicle({ vehicleId });
};

const resolveProductIdBySku = async (sku, connection) => {
  const record = await select('product_id')
    .from('product')
    .where('sku', '=', sku)
    .load(connection);
  return record ? record.product_id : null;
};

export const ensureVehicleLink = async (payload, connectionArg) => {
  const connection = connectionArg || (await getConnection());
  const release = connectionArg ? () => Promise.resolve() : connection.release;
  try {
    let vehicleId = payload.vehicleId;
    if (!vehicleId && payload.vehicle) {
      const vehicle = await ensureVehicle(payload.vehicle, connection);
      vehicleId = vehicle?.vehicleId;
    }
    if (!vehicleId) {
      return null;
    }

    let productId = payload.productId;
    if (!productId && payload.productSku) {
      productId = await resolveProductIdBySku(payload.productSku, connection);
    }

    if (!productId) {
      return null;
    }

    const position = sanitizeString(payload.position) || null;
    const side = sanitizeString(payload.side) || null;

    const existing = await select('fitment_link_id')
      .from('fitment_link')
      .where('product_id', '=', productId)
      .andWhere('vehicle_id', '=', vehicleId)
      .andWhere('position', '=', position)
      .andWhere('side', '=', side)
      .load(connection);

    if (!existing) {
      await insert('fitment_link')
        .given({
          product_id: productId,
          vehicle_id: vehicleId,
          position,
          side,
          notes: sanitizeString(payload.notes)
        })
        .execute(connection, false);
    } else if (payload.notes) {
      await update('fitment_link')
        .given({ notes: sanitizeString(payload.notes) })
        .where('fitment_link_id', '=', existing.fitment_link_id)
        .execute(connection, false);
    }
    return true;
  } finally {
    if (!connectionArg) {
      await release.call(connection);
    }
  }
};

export const ensureCrossReference = async (payload, connectionArg) => {
  const connection = connectionArg || (await getConnection());
  const release = connectionArg ? () => Promise.resolve() : connection.release;
  try {
    let productId = payload.productId;
    if (!productId && payload.productSku) {
      productId = await resolveProductIdBySku(payload.productSku, connection);
    }
    if (!productId) {
      return null;
    }
    const referenceType = sanitizeString(payload.referenceType || payload.type);
    const referenceValue = sanitizeString(payload.referenceValue || payload.value);
    const referenceBrand = sanitizeString(payload.referenceBrand || payload.brand);
    if (!referenceType || !referenceValue) {
      return null;
    }

    const existing = await select('fitment_cross_reference_id')
      .from('fitment_cross_reference')
      .where('product_id', '=', productId)
      .andWhere('reference_type', '=', referenceType)
      .andWhere('reference_value', '=', referenceValue)
      .andWhere('reference_brand', '=', referenceBrand)
      .load(connection);

    if (!existing) {
      await insert('fitment_cross_reference')
        .given({
          product_id: productId,
          reference_type: referenceType,
          reference_value: referenceValue,
          reference_brand: referenceBrand,
          notes: sanitizeString(payload.notes)
        })
        .execute(connection, false);
    } else if (payload.notes) {
      await update('fitment_cross_reference')
        .given({ notes: sanitizeString(payload.notes) })
        .where(
          'fitment_cross_reference_id',
          '=',
          existing.fitment_cross_reference_id
        )
        .execute(connection, false);
    }
    return true;
  } finally {
    if (!connectionArg) {
      await release.call(connection);
    }
  }
};

export const getProductVehicles = async (productId) => {
  const rows = await select()
    .from('fitment_link')
    .leftJoin(
      'fitment_vehicle',
      'fitment_vehicle.vehicle_id',
      '=',
      'fitment_link.vehicle_id'
    )
    .where('fitment_link.product_id', '=', productId)
    .orderBy('fitment_vehicle.year', 'DESC')
    .execute(pool);
  return rows.map(formatVehicleRow).filter(Boolean);
};

export const productFitsVehicle = async (productId, vehicleId) => {
  const match = await select('fitment_link_id')
    .from('fitment_link')
    .where('product_id', '=', productId)
    .andWhere('vehicle_id', '=', vehicleId)
    .load(pool);
  return Boolean(match);
};

export const getCrossReferencesByType = async (productId, type) => {
  const rows = await select('reference_value')
    .from('fitment_cross_reference')
    .where('product_id', '=', productId)
    .andWhere('reference_type', '=', type)
    .orderBy('reference_value', 'ASC')
    .execute(pool);
  return rows.map((row) => row.reference_value);
};

export const getAllCrossReferences = async (productId) => {
  const rows = await select()
    .from('fitment_cross_reference')
    .where('product_id', '=', productId)
    .orderBy('reference_type', 'ASC')
    .orderBy('reference_value', 'ASC')
    .execute(pool);
  return rows.map((row) => camelCase(row));
};

export const importFitmentBatch = async ({
  vehicles = [],
  links = [],
  crossReferences = []
}) => {
  const connection = await getConnection();
  await startTransaction(connection);
  const result = {
    vehiclesImported: 0,
    linksImported: 0,
    crossReferencesImported: 0,
    errors: []
  };

  try {
    for (const vehicle of vehicles) {
      const persisted = await ensureVehicle(vehicle, connection);
      if (persisted) {
        result.vehiclesImported += 1;
      }
    }

    for (const link of links) {
      try {
        const success = await ensureVehicleLink(link, connection);
        if (success) {
          result.linksImported += 1;
        }
      } catch (error) {
        result.errors.push(
          `Failed to link product ${link.productSku || link.productId} -> vehicle: ${
            error.message
          }`
        );
      }
    }

    for (const reference of crossReferences) {
      try {
        const success = await ensureCrossReference(reference, connection);
        if (success) {
          result.crossReferencesImported += 1;
        }
      } catch (error) {
        result.errors.push(
          `Failed to import reference ${reference.referenceValue || reference.value}: ${
            error.message
          }`
        );
      }
    }

    await commit(connection);
    return result;
  } catch (error) {
    await rollback(connection);
    result.errors.push(error.message);
    return result;
  } finally {
    connection.release();
  }
};
