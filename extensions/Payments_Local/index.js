import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  key: 'payments-local',
  name: 'Pagos Locales',
  description:
    'Registra métodos de pago offline para Centroamérica (transferencias bancarias y pago contra entrega).',
  bootstrap: path.resolve(__dirname, './dist/bootstrap.js')
};
