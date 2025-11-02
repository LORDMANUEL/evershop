import { insert, select, update } from '@evershop/postgres-query-builder';
import { getConfig } from '@evershop/evershop/lib/util/getConfig.js';

const DEFAULT_FLAT_RATE_METHOD = {
  uuid: '11111111-2222-3333-4444-555555555555',
  name: 'Envío estándar (tarifa plana)',
  cost: 12.5
};

const DEFAULT_PICKUP_METHOD = {
  uuid: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
  name: 'Retiro en tienda',
  cost: 0
};

const DEFAULT_COUNTRY_RULES = [
  { code: 'HN', label: 'Honduras', flatRateCost: 8.5 },
  { code: 'GT', label: 'Guatemala', flatRateCost: 9.5 },
  { code: 'SV', label: 'El Salvador', flatRateCost: 10.5 },
  { code: 'NI', label: 'Nicaragua', flatRateCost: 11.5 },
  { code: 'CR', label: 'Costa Rica', flatRateCost: 14.5 },
  { code: 'PA', label: 'Panamá', flatRateCost: 16 },
  { code: 'US', label: 'Estados Unidos', flatRateCost: 25 },
  { code: 'CA', label: 'Canadá', flatRateCost: 28 }
];

const toDecimalString = (value) => {
  const numeric = Number.parseFloat(value ?? 0);
  if (Number.isNaN(numeric)) {
    return '0.00';
  }
  return numeric.toFixed(2);
};

const ensureShippingMethod = async (connection, { uuid, name }) => {
  let method = await select()
    .from('shipping_method')
    .where('uuid', '=', uuid)
    .load(connection);

  if (!method) {
    method = await select()
      .from('shipping_method')
      .where('name', '=', name)
      .load(connection);
  }

  if (method) {
    await update('shipping_method')
      .given({ uuid, name })
      .where('shipping_method_id', '=', method.shipping_method_id)
      .execute(connection, false);
  } else {
    const inserted = await insert('shipping_method')
      .given({ uuid, name })
      .execute(connection, false);

    method = await select()
      .from('shipping_method')
      .where('shipping_method_id', '=', inserted.insertId)
      .load(connection);
  }

  return method;
};

const ensureShippingZone = async (connection, { code, label }) => {
  const zoneName = `Zona logística ${label}`;
  let zone = await select()
    .from('shipping_zone')
    .where('country', '=', code)
    .load(connection);

  if (zone) {
    if (zone.name !== zoneName) {
      await update('shipping_zone')
        .given({ name: zoneName })
        .where('shipping_zone_id', '=', zone.shipping_zone_id)
        .execute(connection, false);
      zone = await select()
        .from('shipping_zone')
        .where('shipping_zone_id', '=', zone.shipping_zone_id)
        .load(connection);
    }
    return zone;
  }

  const inserted = await insert('shipping_zone')
    .given({ name: zoneName, country: code })
    .execute(connection, false);

  zone = await select()
    .from('shipping_zone')
    .where('shipping_zone_id', '=', inserted.insertId)
    .load(connection);

  return zone;
};

const ensureZoneMethod = async (connection, zoneId, methodId, cost) => {
  const existing = await select()
    .from('shipping_zone_method')
    .where('zone_id', '=', zoneId)
    .andWhere('method_id', '=', methodId)
    .load(connection);

  const payload = {
    zone_id: zoneId,
    method_id: methodId,
    is_enabled: true,
    cost,
    calculate_api: null,
    condition_type: null,
    min: null,
    max: null
  };

  if (existing) {
    await update('shipping_zone_method')
      .given(payload)
      .where('shipping_zone_method_id', '=', existing.shipping_zone_method_id)
      .execute(connection, false);
  } else {
    await insert('shipping_zone_method')
      .given(payload)
      .execute(connection, false);
  }
};

export default async (connection) => {
  const configuredCountries = getConfig('shippingRules.countries', DEFAULT_COUNTRY_RULES);
  const countries = Array.isArray(configuredCountries) && configuredCountries.length
    ? configuredCountries
    : DEFAULT_COUNTRY_RULES;

  const flatRateConfig = getConfig('shippingRules.flatRate', {});
  const pickupConfig = getConfig('shippingRules.pickup', {});

  const flatRateMethod = await ensureShippingMethod(connection, {
    uuid: flatRateConfig.uuid || DEFAULT_FLAT_RATE_METHOD.uuid,
    name: flatRateConfig.name || DEFAULT_FLAT_RATE_METHOD.name
  });

  const pickupMethod = await ensureShippingMethod(connection, {
    uuid: pickupConfig.uuid || DEFAULT_PICKUP_METHOD.uuid,
    name: pickupConfig.name || DEFAULT_PICKUP_METHOD.name
  });

  for (const country of countries) {
    if (!country?.code || !country?.label) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const zone = await ensureShippingZone(connection, country);
    await ensureZoneMethod(
      connection,
      zone.shipping_zone_id,
      flatRateMethod.shipping_method_id,
      toDecimalString(country.flatRateCost ?? flatRateConfig.cost ?? DEFAULT_FLAT_RATE_METHOD.cost)
    );
    await ensureZoneMethod(
      connection,
      zone.shipping_zone_id,
      pickupMethod.shipping_method_id,
      toDecimalString(country.pickupCost ?? pickupConfig.cost ?? DEFAULT_PICKUP_METHOD.cost)
    );
  }
};
