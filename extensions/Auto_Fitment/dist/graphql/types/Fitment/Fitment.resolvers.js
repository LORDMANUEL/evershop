import {
  getFitmentOptions,
  getProductVehicles,
  productFitsVehicle,
  getCrossReferencesByType,
  getAllCrossReferences
} from '../../services/fitmentRepository.js';

export default {
  Query: {
    fitmentOptions: async (_, args) => {
      return getFitmentOptions(args);
    }
  },
  Mutation: {
    importFitmentCsv: async (_, { payload }) => {
      const { importFitmentFromCsv } = await import(
        '../../services/importer.js'
      );
      return importFitmentFromCsv(payload || {});
    }
  },
  Product: {
    fitmentVehicles: async (product) => {
      if (!product?.productId) {
        return [];
      }
      return getProductVehicles(product.productId);
    },
    fits: async (product, args) => {
      if (!product?.productId || !args?.vehicleId) {
        return false;
      }
      return productFitsVehicle(product.productId, args.vehicleId, args.vin);
    },
    oeNumbers: async (product) => {
      if (!product?.productId) {
        return [];
      }
      return getCrossReferencesByType(product.productId, 'OE');
    },
    mpnNumbers: async (product) => {
      if (!product?.productId) {
        return [];
      }
      return getCrossReferencesByType(product.productId, 'MPN');
    },
    crossReferences: async (product) => {
      if (!product?.productId) {
        return [];
      }
      return getAllCrossReferences(product.productId);
    }
  }
};
