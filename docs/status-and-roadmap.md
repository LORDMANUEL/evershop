# Estado del Proyecto y Roadmap para Tienda de Autopartes

## Informe de cambios actuales

- Se añadieron las extensiones `Auto_Fitment`, `Auto_VIN`, `Auto_Search`, `Payments_Local` y `Shipping_Rules` como esqueletos documentados dentro de `extensions/`.
- Cada extensión incluye un `package.json`, un `index.js` placeholder y un `README.md` con los objetivos y siguientes pasos específicos.
- El repositorio mantiene la base estándar de EverShop: aún no hay migraciones ni componentes personalizados, pero el monorepo ya reconoce las nuevas carpetas para iterar rápidamente.
- La infraestructura prevista sigue apoyándose en `docker-compose.yml`, preparada para levantar EverShop y Postgres.

## Próximos pasos imprescindibles

1. **Provisionar el entorno**: Instalar Docker Engine + Docker Compose, ejecutar `docker-compose up -d`, y correr `npm run setup` para inicializar la base de datos y el usuario administrador.
2. **Inicializar extensiones**: Configurar scripts de compilación (TS/JS) y registrar cada extensión en los archivos de configuración de EverShop según corresponda (por ejemplo, rutas, hooks, jobs).
3. **Definir modelo de datos**: Generar migraciones para tablas de compatibilidad (`fitment_vehicle`, `fitment_link`) y referencias cruzadas (`cross_reference`).
4. **Extender GraphQL**: Añadir campos específicos a `Product` (OE, MPN, posiciones, lados) y exponer resolvers para compatibilidad.
5. **Construir selector de vehículo**: Implementar un widget persistente para Año/Marca/Modelo/VIN y consumir la API vPIC en la extensión `Auto_VIN`.
6. **Importadores masivos**: Desarrollar herramientas en el admin (`Auto_Fitment`) para cargar CSV/Excel de catálogo, compatibilidad y cross-reference con validación.
7. **Ajustar storefront y checkout**: Mostrar atributos clave de autopartes, manejar `coreCharge` y añadir filtros “Sólo compatibles”.
8. **Pagos y envíos locales**: Adaptar métodos de pago según la región objetivo (`Payments_Local`) y definir reglas de envío por zona/peso (`Shipping_Rules`).

## Roadmap por fases

### Fase 1 (MVP: 1–2 semanas)

- Configurar infraestructura local y workspaces de extensiones.
- Crear migraciones y modelos para compatibilidad y referencias cruzadas.
- Extender GraphQL y exponer resolvers de compatibilidad.
- Implementar selector de vehículo (Año/Marca/Modelo + VIN) y almacenamiento en localStorage.
- Construir importadores CSV básicos para catálogo y fitment.
- Ajustar el storefront con filtro “Sólo partes compatibles”.
- Configurar envíos básicos (tarifa plana por zona, retiro en tienda) y habilitar Stripe o pasarela local mínima.

### Fase 2 (Escalamiento: 3–4 semanas)

- Integrar Meilisearch/Typesense mediante `extensions/Auto_Search` con sinónimos y búsqueda por OE/MPN.
- Añadir reglas de envío avanzadas (peso, dimensiones, core charge) y soporte multi-almacén con ETA.
- Expandir la pasarela local para multi-moneda y fiscalidad por país.
- Mejorar admin con reportes de productos sin compatibilidad y dashboards de importaciones.
- Implementar manejo de `coreCharge` en checkout y lógica de devolución.
- Preparar integración con proveedores externos (TecDoc) para escalabilidad futura.

### Fase 3 (Optimización continua)

- Automatizar sincronización de catálogo e inventario desde fuentes externas.
- Añadir analítica avanzada y segmentación por vehículo/compatibilidad.
- Implementar pruebas automatizadas (unitarias y end-to-end) para las extensiones clave.
- Optimizar performance del storefront (lazy loading, caché de consultas GraphQL).
- Incorporar contenido SEO: páginas guía, datos estructurados `isAccessoryOrSparePartFor`.

## Requerimientos adicionales sugeridos

- Configurar pipelines CI/CD que ejecuten pruebas y desplieguen a entornos de staging/producción.
- Definir políticas de respaldo/restauración para la base de datos Postgres.
- Documentar procedimientos operativos (importaciones, gestión de sinónimos, mantenimiento de catálogos).
