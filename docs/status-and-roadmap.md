# Estado del Proyecto y Roadmap para Tienda de Autopartes

## Informe de cambios actuales

- Se activaron las extensiones `Auto_Fitment` y `Auto_VIN` en `config/default.json`, con credenciales locales por defecto.
- `Auto_Fitment` ahora incluye migraciones, servicios y resolvers GraphQL para manejar vehículos, vínculos de compatibilidad y referencias cruzadas; además se añadió un importador CSV en el panel de administración (`/fitment/import`).
- `Auto_VIN` expone el endpoint `POST /api/fitment/decode-vin` con caché en memoria y normalización vía vPIC, reutilizando los servicios de `Auto_Fitment` cuando están disponibles.
- El storefront incorpora un proveedor de contexto de vehículo, selector persistente en el encabezado, decodificador de VIN y un interruptor "Solo partes compatibles" para filtrar listados.
- `.gitignore` y el árbol del monorepo se ajustaron para permitir versionar las carpetas `dist` de las extensiones mientras se define un build oficial.

## Próximos pasos imprescindibles

1. **Provisionar y probar end-to-end**: Levantar la infraestructura local (`docker-compose up -d`, `npm run setup`) y ejecutar las migraciones de `Auto_Fitment` para validar selector, filtro y VIN en un entorno real.
2. **Resolver linting y pruebas**: Investigar el fallo global de ESLint (`defaultMeta`) para restablecer `npm run lint` y definir cobertura mínima (servicios de fitment, API VIN, componentes de storefront).
3. **Ampliar catálogo de datos**: Añadir campos de autopartes (OE/MPN, posición, lado, core charge) y exponerlos en admin + storefront, reutilizando los servicios existentes.
4. **Logística y pagos**: Implementar reglas de envío básicas en `Shipping_Rules` y la pasarela local inicial en `Payments_Local` para cerrar el flujo de checkout.
5. **Búsqueda y performance**: Planificar la indexación en `Auto_Search` (Meilisearch/Typesense) y estrategias de caché para mejorar la experiencia de navegación.

## Roadmap por fases

### Fase 1 (MVP: 1–2 semanas)

- [x] Configurar infraestructura local y workspaces de extensiones.
- [x] Crear migraciones y modelos para compatibilidad y referencias cruzadas.
- [x] Extender GraphQL y exponer resolvers de compatibilidad.
- [x] Implementar selector de vehículo (Año/Marca/Modelo + VIN) y almacenamiento en localStorage.
- [x] Construir importadores CSV básicos para catálogo y fitment.
- [x] Ajustar el storefront con filtro “Sólo partes compatibles”.
- [ ] Configurar envíos básicos (tarifa plana por zona, retiro en tienda) y habilitar Stripe o pasarela local mínima.

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
