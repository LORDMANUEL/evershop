import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  key: 'auto-vin',
  name: 'Auto VIN integration',
  description: 'Decodificación de VIN mediante la API de vPIC para precargar compatibilidades.',
  routes: [path.resolve(__dirname, './dist/api')]
};
