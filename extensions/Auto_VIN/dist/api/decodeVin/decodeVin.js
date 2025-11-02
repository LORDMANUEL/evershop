import { OK, INVALID_PAYLOAD } from '@evershop/evershop/lib/util/httpStatus.js';
import { getConfig } from '@evershop/evershop/lib/util/getConfig.js';
import { format as formatUrl } from 'url';

const cache = new Map();
const DEFAULT_CACHE_TTL = 1000 * 60 * 10; // 10 minutes

const mapVinRecordToVehicle = (record) => {
  if (!record) {
    return null;
  }
  const vehicle = {
    year: record.ModelYear ? parseInt(record.ModelYear, 10) : null,
    make: record.Make || null,
    model: record.Model || null,
    submodel: record.Series || record.Trim || null,
    engineCode: record.EngineModel || record.EngineConfiguration || null,
    engineName: record.EngineCylinders
      ? `${record.EngineCylinders} cyl ${record.EngineManufacturer || ''}`.trim()
      : record.EngineConfiguration || null,
    body: record.BodyClass || null
  };
  return vehicle;
};

const buildApiUrl = (vin, format = 'json') => {
  return formatUrl({
    protocol: 'https',
    host: 'vpic.nhtsa.dot.gov',
    pathname: `/api/vehicles/decodevinvaluesextended/${encodeURIComponent(vin)}`,
    query: { format }
  });
};

const getCacheKey = (vin) => vin.trim().toUpperCase();

const setCachedValue = (vin, value, ttl = DEFAULT_CACHE_TTL) => {
  cache.set(getCacheKey(vin), {
    value,
    expiresAt: Date.now() + ttl
  });
};

const getCachedValue = (vin) => {
  const cached = cache.get(getCacheKey(vin));
  if (!cached) {
    return null;
  }
  if (cached.expiresAt < Date.now()) {
    cache.delete(getCacheKey(vin));
    return null;
  }
  return cached.value;
};

const ensureVehicleInFitment = async (vehicle) => {
  try {
    const modulePath = new URL(
      '../../../../Auto_Fitment/dist/services/fitmentRepository.js',
      import.meta.url
    ).pathname;
    const repository = await import(modulePath);
    if (repository?.ensureVehicle) {
      const record = await repository.ensureVehicle(vehicle);
      return record;
    }
  } catch (error) {
    // Silently ignore if Auto_Fitment is not available.
  }
  return null;
};

export default async (request, response) => {
  const vin = request.body?.vin?.trim();
  if (!vin || vin.length < 11) {
    response.status(INVALID_PAYLOAD);
    response.json({
      error: {
        status: INVALID_PAYLOAD,
        message: 'VIN inválido o incompleto'
      }
    });
    return;
  }

  const cached = getCachedValue(vin);
  if (cached) {
    response.status(OK);
    response.json({ data: cached });
    return;
  }

  const endpoint = getConfig(
    'autoVin.endpoint',
    buildApiUrl(vin, 'json')
  );

  try {
    const fetchResponse = await fetch(endpoint, { method: 'GET' });
    if (!fetchResponse.ok) {
      throw new Error(`VIN service responded with ${fetchResponse.status}`);
    }
    const payload = await fetchResponse.json();
    const record = payload?.Results?.[0];
    const vehicle = mapVinRecordToVehicle(record);
    if (!vehicle || !vehicle.year || !vehicle.make || !vehicle.model) {
      throw new Error('La respuesta de vPIC no contiene datos suficientes.');
    }

    const fitmentRecord = await ensureVehicleInFitment(vehicle);
    const enriched = {
      vehicle,
      fitment: fitmentRecord
    };
    setCachedValue(vin, enriched);

    response.status(OK);
    response.json({ data: enriched });
  } catch (error) {
    response.status(INVALID_PAYLOAD);
    response.json({
      error: {
        status: INVALID_PAYLOAD,
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible decodificar el VIN. Intenta de nuevo más tarde.'
      }
    });
  }
};
