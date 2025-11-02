import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { useVehicleFitment } from './VehicleContext.js';

interface OptionWithLabel {
  value: string;
  label: string;
}

const buildOptions = (values: Array<string | number | null | undefined>): OptionWithLabel[] =>
  values
    .filter((value): value is string | number => value !== null && value !== undefined)
    .map((value) => ({
      value: value.toString(),
      label: value.toString()
    }));

interface SelectionState {
  year?: string;
  make?: string;
  model?: string;
  submodel?: string;
  engineCode?: string;
  engineName?: string;
}

export const VehicleSelector: React.FC = () => {
  const { selectedVehicle, setSelectedVehicle, decodeVin, loadOptions, isLoading } =
    useVehicleFitment();
  const [options, setOptions] = useState({
    years: [] as OptionWithLabel[],
    makes: [] as OptionWithLabel[],
    models: [] as OptionWithLabel[],
    submodels: [] as OptionWithLabel[],
    engines: [] as OptionWithLabel[]
  });
  const [selection, setSelection] = useState<SelectionState>({});
  const [vin, setVin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVinDecoding, setIsVinDecoding] = useState(false);

  const fetchOptions = useCallback(
    async (filters: SelectionState) => {
      const result = await loadOptions({
        year: filters.year ? parseInt(filters.year, 10) : undefined,
        make: filters.make,
        model: filters.model,
        submodel: filters.submodel,
        engineCode: filters.engineCode,
        engineName: filters.engineName
      });
      if (!result) {
        return null;
      }
      setOptions({
        years: buildOptions(result.years),
        makes: buildOptions(result.makes),
        models: buildOptions(result.models),
        submodels: buildOptions(result.submodels),
        engines: result.engines.map((engine) => ({
          value: engine.code || engine.name || '',
          label: engine.name || engine.code || _('Motor desconocido')
        }))
      });
      return result;
    },
    [loadOptions]
  );

  useEffect(() => {
    fetchOptions({}).then((result) => {
      if (result?.vehicle) {
        setSelectedVehicle(result.vehicle);
      }
    });
  }, [fetchOptions, setSelectedVehicle]);

  useEffect(() => {
    if (selectedVehicle) {
      setSelection({
        year: selectedVehicle.year?.toString(),
        make: selectedVehicle.make || undefined,
        model: selectedVehicle.model || undefined,
        submodel: selectedVehicle.submodel || undefined,
        engineCode: selectedVehicle.engineCode || undefined,
        engineName: selectedVehicle.engineName || undefined
      });
    }
  }, [selectedVehicle]);

  const handleSelectionChange = useCallback(
    async (field: keyof SelectionState, value: string) => {
      setError(null);
      setSelection((prev) => {
        const next: SelectionState = { ...prev, [field]: value || undefined };
        if (field === 'year') {
          next.make = undefined;
          next.model = undefined;
          next.submodel = undefined;
          next.engineCode = undefined;
          next.engineName = undefined;
        } else if (field === 'make') {
          next.model = undefined;
          next.submodel = undefined;
          next.engineCode = undefined;
          next.engineName = undefined;
        } else if (field === 'model') {
          next.submodel = undefined;
          next.engineCode = undefined;
          next.engineName = undefined;
        } else if (field === 'submodel') {
          next.engineCode = undefined;
          next.engineName = undefined;
        }
        return next;
      });
    },
    []
  );

  useEffect(() => {
    const run = async () => {
      const result = await fetchOptions(selection);
      if (result?.vehicle) {
        setSelectedVehicle(result.vehicle);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.year, selection.make, selection.model, selection.submodel, selection.engineCode, selection.engineName]);

  const handleVinDecode = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!vin) {
        setError(_('Ingresa un VIN válido.'));
        return;
      }
      setIsVinDecoding(true);
      setError(null);
      try {
        const vehicle = await decodeVin(vin);
        if (vehicle) {
          setSelection({
            year: vehicle.year?.toString(),
            make: vehicle.make || undefined,
            model: vehicle.model || undefined,
            submodel: vehicle.submodel || undefined,
            engineCode: vehicle.engineCode || undefined,
            engineName: vehicle.engineName || undefined
          });
          await fetchOptions({
            year: vehicle.year?.toString(),
            make: vehicle.make || undefined,
            model: vehicle.model || undefined,
            submodel: vehicle.submodel || undefined,
            engineCode: vehicle.engineCode || undefined,
            engineName: vehicle.engineName || undefined
          });
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : _('No fue posible decodificar el VIN. Verifica el número e inténtalo nuevamente.')
        );
      } finally {
        setIsVinDecoding(false);
      }
    },
    [vin, decodeVin, fetchOptions]
  );

  const renderSelect = useCallback(
    (
      label: string,
      field: keyof SelectionState,
      optionsList: OptionWithLabel[],
      placeholder: string
    ) => (
      <label className="flex flex-col text-xs text-gray-700 gap-1">
        <span className="font-medium">{label}</span>
        <select
          value={selection[field] || ''}
          onChange={(event) => handleSelectionChange(field, event.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        >
          <option value="">{placeholder}</option>
          {optionsList.map((option) => (
            <option key={`${field}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    ),
    [handleSelectionChange, selection]
  );

  const summary = useMemo(() => {
    if (!selectedVehicle) {
      return _('Ningún vehículo seleccionado');
    }
    return [
      selectedVehicle.year,
      selectedVehicle.make,
      selectedVehicle.model,
      selectedVehicle.submodel
    ]
      .filter(Boolean)
      .join(' · ');
  }, [selectedVehicle]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white shadow-md rounded-lg p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-800">
            {_('Selecciona tu vehículo')}
          </h2>
          <span className="text-xs text-gray-500">{summary}</span>
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
          {renderSelect(_('Año'), 'year', options.years, _('Selecciona año'))}
          {renderSelect(_('Marca'), 'make', options.makes, _('Selecciona marca'))}
          {renderSelect(_('Modelo'), 'model', options.models, _('Selecciona modelo'))}
          {renderSelect(_('Versión'), 'submodel', options.submodels, _('Opcional'))}
          {renderSelect(_('Motor'), 'engineCode', options.engines, _('Opcional'))}
        </div>
        <form onSubmit={handleVinDecode} className="flex items-center gap-2 text-sm">
          <input
            type="text"
            value={vin}
            onChange={(event) => setVin(event.target.value.toUpperCase())}
            placeholder={_('Ingresa VIN')}
            maxLength={20}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={isVinDecoding || !vin}
            className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
          >
            {isVinDecoding ? _('Decodificando...') : _('Decodificar VIN')}
          </button>
        </form>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {selectedVehicle
              ? _('Aplicando filtros de compatibilidad...')
              : _('Selecciona un vehículo o decodifica un VIN para filtrar resultados.')}
          </span>
          {isLoading && <span>{_('Sincronizando compatibilidades...')}</span>}
        </div>
      </div>
    </div>
  );
};
