import { addProcessor } from '@evershop/evershop/lib/util/registry.js';

const ensureFitmentFilter = (filters = []) => {
  const hasFilter = filters.some((filter) => filter.key === 'fitment_vehicle');
  if (hasFilter) {
    return filters;
  }

  return [
    ...filters,
    {
      key: 'fitment_vehicle',
      operation: ['eq'],
      callback(query, operation, value, currentFilters) {
        if (!value) {
          return;
        }

        const vehicleId = Number.parseInt(value, 10);
        if (Number.isNaN(vehicleId)) {
          return;
        }

        query
          .leftJoin(
            'fitment_link',
            'fitment_link.product_id',
            '=',
            'product.product_id'
          )
          .andWhere('fitment_link.vehicle_id', '=', vehicleId);

        currentFilters.push({
          key: 'fitment_vehicle',
          operation,
          value: vehicleId.toString()
        });
      }
    }
  ];
};

export default () => {
  addProcessor('productCollectionFilters', ensureFitmentFilter, 5);
};
