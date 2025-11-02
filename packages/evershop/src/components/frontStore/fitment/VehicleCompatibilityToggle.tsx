import React, { useEffect, useMemo, useState } from 'react';
import { _ } from '@evershop/evershop/lib/locale/translate/_';
import { useVehicleFitment } from './VehicleContext.js';
import { ProductFilterRenderProps } from '../catalog/ProductFilter.js';

interface Props {
  renderProps: ProductFilterRenderProps;
}

export const VehicleCompatibilityToggle: React.FC<Props> = ({ renderProps }) => {
  const { selectedVehicle } = useVehicleFitment();
  const [isActive, setIsActive] = useState<boolean>(() =>
    renderProps.hasFilter('fitment_vehicle')
  );

  const currentFilterValue = renderProps.getFilterValue('fitment_vehicle');

  useEffect(() => {
    setIsActive(renderProps.hasFilter('fitment_vehicle'));
  }, [renderProps]);

  useEffect(() => {
    if (!selectedVehicle && isActive) {
      renderProps.removeFilter('fitment_vehicle');
      setIsActive(false);
      return;
    }
    if (selectedVehicle && isActive) {
      const vehicleId = selectedVehicle.vehicleId?.toString();
      if (vehicleId && currentFilterValue !== vehicleId) {
        const otherFilters = renderProps.currentFilters.filter(
          (filter) => filter.key !== 'fitment_vehicle'
        );
        renderProps.updateFilter([
          ...otherFilters,
          { key: 'fitment_vehicle', operation: 'eq', value: vehicleId }
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle?.vehicleId]);

  const handleToggle = () => {
    if (!selectedVehicle?.vehicleId) {
      return;
    }
    renderProps.toggleFilter(
      'fitment_vehicle',
      'eq',
      selectedVehicle.vehicleId.toString()
    );
    setIsActive(!isActive);
  };

  const description = useMemo(() => {
    if (!selectedVehicle) {
      return _('Selecciona un vehículo para habilitar el filtro de compatibilidad.');
    }
    return _(
      'Filtrar solo autopartes compatibles con ${vehicle}',
      {
        vehicle: [
          selectedVehicle.year,
          selectedVehicle.make,
          selectedVehicle.model,
          selectedVehicle.submodel
        ]
          .filter(Boolean)
          .join(' · ')
      }
    );
  }, [selectedVehicle]);

  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-3 mb-4 text-sm">
      <div className="flex items-start gap-3">
        <button
          type="button"
          className={`w-10 h-6 flex items-center rounded-full transition-colors duration-200 focus:outline-none ${
            isActive ? 'bg-blue-600' : 'bg-gray-300'
          } ${!selectedVehicle ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={handleToggle}
          disabled={!selectedVehicle}
          aria-pressed={isActive}
        >
          <span
            className={`h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
              isActive ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex-1">
          <p className="font-medium text-blue-900">{_('Solo partes compatibles')}</p>
          <p className="text-xs text-blue-800 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
};
