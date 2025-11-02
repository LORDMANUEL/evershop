import { importFitmentBatch } from './fitmentRepository.js';

const parseCsvContent = (content) => {
  if (!content) {
    return [];
  }
  const rows = [];
  let current = '';
  let inQuotes = false;
  const normalized = content.replace(/\r\n/g, '\n');
  const pushValue = (buffer, row) => {
    row.push(buffer.trim());
  };
  let row = [];

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i];
    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      pushValue(current, row);
      current = '';
    } else if (char === '\n') {
      pushValue(current, row);
      current = '';
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
    } else {
      current += char;
    }
  }

  if (current.length > 0 || row.length > 0) {
    pushValue(current, row);
    if (row.some((value) => value.length > 0)) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      const value = values[index] !== undefined ? values[index] : '';
      record[header] = value.trim();
    });
    return record;
  });
};

const castBoolean = (value) => {
  if (value === undefined || value === null) {
    return false;
  }
  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'y'].includes(normalized);
};

export const importFitmentFromCsv = async ({
  vehiclesCsv,
  linksCsv,
  crossReferencesCsv,
  dryRun
}) => {
  const vehicles = parseCsvContent(vehiclesCsv);
  const links = parseCsvContent(linksCsv);
  const references = parseCsvContent(crossReferencesCsv);

  if (castBoolean(dryRun)) {
    return {
      vehiclesImported: vehicles.length,
      linksImported: links.length,
      crossReferencesImported: references.length,
      errors: []
    };
  }

  return importFitmentBatch({
    vehicles,
    links,
    crossReferences: references
  });
};
