import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  key: 'auto-fitment',
  name: 'Auto Fitment',
  description:
    'Gestión de compatibilidad (fitment) de autopartes, importadores y extensiones GraphQL.',
  bootstrap: path.resolve(__dirname, './dist/bootstrap.js')
};
