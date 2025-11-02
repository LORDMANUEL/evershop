import { getConfig } from '@evershop/evershop/lib/util/getConfig.js';
import { registerPaymentMethod } from '@evershop/evershop/checkout/services';

const DEFAULT_METHODS = [
  {
    code: 'local_transfer',
    name: 'Transferencia bancaria (BAC Credomatic)',
    currencies: ['HNL', 'USD']
  },
  {
    code: 'local_cash_on_delivery',
    name: 'Pago contra entrega',
    currencies: ['HNL']
  }
];

const normalizeMethods = (configured) => {
  if (!Array.isArray(configured) || configured.length === 0) {
    return DEFAULT_METHODS;
  }
  return configured
    .map((method, index) => ({
      code: method.code || `local_method_${index + 1}`,
      name: method.name || method.code || `Método local ${index + 1}`,
      currencies: Array.isArray(method.currencies) ? method.currencies : [],
      enabled: method.enabled !== false
    }))
    .filter((method) => method.enabled);
};

export default () => {
  const configuredMethods = getConfig('payments.local.methods', DEFAULT_METHODS);
  const methods = normalizeMethods(configuredMethods);
  const seen = new Set();

  methods.forEach((method, index) => {
    const uniqueCode = seen.has(method.code)
      ? `${method.code}_${index + 1}`
      : method.code;
    seen.add(uniqueCode);

    registerPaymentMethod({
      init: async () => ({
        code: uniqueCode,
        name: method.name
      }),
      validator: async () => {
        if (method.currencies.length === 0) {
          return true;
        }
        const currency = getConfig('shop.currency', 'USD');
        return method.currencies.includes(currency);
      }
    });
  });
};
