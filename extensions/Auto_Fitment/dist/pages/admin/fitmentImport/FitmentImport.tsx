import Area from '@components/common/Area.js';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { _ } from '@evershop/evershop/lib/locale/translate/_';

interface UploadState {
  vehicles?: string;
  links?: string;
  crossReferences?: string;
}

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

const IMPORT_MUTATION = `
  mutation ImportFitment($payload: FitmentImportPayload!) {
    importFitmentCsv(payload: $payload) {
      vehiclesImported
      linksImported
      crossReferencesImported
      errors
    }
  }
`;

interface FitmentImportProps {
  graphqlEndpoint: string;
}

const UploadInput: React.FC<{
  label: string;
  name: keyof UploadState;
  onChange: (name: keyof UploadState, value: string | undefined) => void;
}> = ({ label, name, onChange }) => {
  const [fileName, setFileName] = useState<string>('');

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        onChange(name, undefined);
        setFileName('');
        return;
      }
      try {
        const content = await readFile(file);
        onChange(name, content);
        setFileName(file.name);
      } catch (error) {
        toast.error(_('No fue posible leer el archivo seleccionado'));
      }
    },
    [name, onChange]
  );

  return (
    <label className="block">
      <span className="font-medium text-sm text-gray-700 mb-2 block">{label}</span>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={handleChange}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {fileName && (
        <span className="text-xs text-gray-500 mt-1 block">{fileName}</span>
      )}
    </label>
  );
};

const FitmentImportForm: React.FC<FitmentImportProps> = ({ graphqlEndpoint }) => {
  const [payload, setPayload] = useState<UploadState>({});
  const [dryRun, setDryRun] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<null | {
    vehiclesImported: number;
    linksImported: number;
    crossReferencesImported: number;
    errors: string[];
  }>(null);

  const updatePayload = useCallback((name: keyof UploadState, value?: string) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  }, []);

  const canSubmit = useMemo(() => {
    return Boolean(payload.vehicles || payload.links || payload.crossReferences);
  }, [payload]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!canSubmit) {
        toast.error(_('Agrega al menos un archivo CSV.'));
        return;
      }
      setIsSubmitting(true);
      try {
        const response = await fetch(graphqlEndpoint || '/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: IMPORT_MUTATION,
            variables: {
              payload: {
                vehiclesCsv: payload.vehicles,
                linksCsv: payload.links,
                crossReferencesCsv: payload.crossReferences,
                dryRun
              }
            }
          })
        });
        const json = await response.json();
        const data = json?.data?.importFitmentCsv;
        if (!response.ok || json.errors) {
          throw new Error(json.errors?.[0]?.message || _('Error importando CSV'));
        }
        setResult(data);
        if (data.errors?.length) {
          data.errors.forEach((message: string) => toast.warn(message));
        } else if (dryRun) {
          toast.info(_('Simulación completada, revisa el resumen antes de confirmar.'));
        } else {
          toast.success(_('Importación completada correctamente.'));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : _('Error inesperado al importar.'));
      } finally {
        setIsSubmitting(false);
      }
    },
    [canSubmit, graphqlEndpoint, payload, dryRun]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Area id="fitmentImportFormTop" noOuter />
      <UploadInput
        label={_('Vehículos (CSV) – columnas: year,make,model,submodel,engineCode,engineName,body,yearFrom,yearTo')}
        name="vehicles"
        onChange={updatePayload}
      />
      <UploadInput
        label={_('Compatibilidades (CSV) – columnas: productSku,vehicleId,year,make,model,submodel,engineCode,position,side,notes')}
        name="links"
        onChange={updatePayload}
      />
      <UploadInput
        label={_('Referencias cruzadas (CSV) – columnas: productSku,referenceType,referenceValue,referenceBrand,notes')}
        name="crossReferences"
        onChange={updatePayload}
      />
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={dryRun}
          onChange={(event) => setDryRun(event.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <span className="text-sm text-gray-700">
          {_('Ejecutar como simulación (dry-run) antes de aplicar cambios definitivos')}
        </span>
      </label>
      <div className="flex items-center space-x-3">
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
        >
          {isSubmitting ? _('Procesando...') : dryRun ? _('Simular importación') : _('Importar datos')}
        </button>
        {!dryRun && (
          <button
            type="button"
            className="px-4 py-2 rounded-md border border-gray-300"
            onClick={() => setDryRun(true)}
          >
            {_('Cambiar a simulación')}
          </button>
        )}
      </div>
      {result && (
        <div className="rounded-md border border-gray-200 p-4 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">
            {_('Resumen de importación')}
          </h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>{_('Vehículos procesados: ${count}', { count: result.vehiclesImported.toString() })}</li>
            <li>{_('Compatibilidades procesadas: ${count}', { count: result.linksImported.toString() })}</li>
            <li>
              {_('Referencias cruzadas procesadas: ${count}', {
                count: result.crossReferencesImported.toString()
              })}
            </li>
          </ul>
          {result.errors?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-600">
                {_('Errores detectados')}:
              </p>
              <ul className="list-disc list-inside text-xs text-red-500 space-y-1">
                {result.errors.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
};

const FitmentImportPage: React.FC<FitmentImportProps> = ({ graphqlEndpoint }) => {
  return (
    <div className="space-y-6">
      <header className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          {_('Importador de compatibilidades de autopartes')}
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {_('Carga archivos CSV para poblar vehículos, vínculos de compatibilidad y referencias cruzadas en bloque.')}
        </p>
      </header>
      <FitmentImportForm graphqlEndpoint={graphqlEndpoint} />
    </div>
  );
};

export default FitmentImportPage;

export const layout = {
  areaId: 'content',
  sortOrder: 20
};

export const query = `
  query FitmentImportQuery {
  }
`;
