import { setPageMetaInfo } from '@evershop/evershop/modules/cms/services/pageMetaInfo.js';

export default (request, response) => {
  setPageMetaInfo(request, {
    title: 'Importador de compatibilidad',
    description: 'Carga masiva de fitment y referencias para autopartes'
  });
};
