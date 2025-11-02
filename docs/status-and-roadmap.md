# Estado del Proyecto y Roadmap para Tienda de Autopartes

## Informe de cambios actuales

- Se activaron las extensiones `Auto_Fitment`, `Auto_VIN`, `Shipping_Rules` y `Payments_Local` en `config/default.json`, con parámetros regionales por defecto.
- `Auto_Fitment` incluye migraciones, servicios y resolvers GraphQL para manejar vehículos, vínculos de compatibilidad y referencias cruzadas; además se añadió un importador CSV en el panel de administración (`/fitment/import`).
- `Auto_VIN` expone el endpoint `POST /api/fitment/decode-vin` con caché en memoria y normalización vía vPIC, reutilizando los servicios de `Auto_Fitment` cuando están disponibles.
- El storefront incorpora un proveedor de contexto de vehículo, selector persistente en el encabezado, decodificador de VIN y un interruptor "Solo partes compatibles" para filtrar listados.
- `Shipping_Rules` siembra zonas logísticas para Centroamérica, Panamá, EE. UU. y Canadá, con costo plano y retiro en tienda personalizable vía configuración.
- `Payments_Local` registra métodos de transferencia bancaria y pago contra entrega habilitados por configuración y validados por moneda.
- La configuración de linting y pruebas se estabilizó (`npm run lint`, `npm run test`) para soportar QA básico antes de avanzar a la siguiente fase.

## Próximos pasos imprescindibles

1. **Validación en entorno real**: Ejecutar `docker-compose up -d` y `npm run setup` contra Postgres para confirmar que las migraciones de fitment y envío se aplican correctamente.
2. **Cobertura de QA**: Incorporar suites de pruebas unitarias/integración para servicios clave (`fitmentRepository`, `decodeVin`, pagos/envíos) y automatizarlas en CI.
3. **Ampliar atributos de producto**: Añadir campos OE/MPN, `coreCharge`, posición/lado y garantías en admin + storefront.
4. **Preparar fase de búsqueda y logística avanzada**: Definir la integración con `Auto_Search` (Meilisearch/Typesense) y las reglas de envío por peso/dimensiones.

## Roadmap por fases

### Fase 1 (MVP: 1–2 semanas) ✅

- [x] Configurar infraestructura local y workspaces de extensiones.
- [x] Crear migraciones y modelos para compatibilidad y referencias cruzadas.
- [x] Extender GraphQL y exponer resolvers de compatibilidad.
- [x] Implementar selector de vehículo (Año/Marca/Modelo + VIN) y almacenamiento en localStorage.
- [x] Construir importadores CSV básicos para catálogo y fitment.
- [x] Ajustar el storefront con filtro “Sólo partes compatibles”.
- [x] Configurar envíos básicos (tarifa plana por zona, retiro en tienda) y habilitar pasarela local mínima.

### Fase 2 (Escalamiento: 3–4 semanas)

- Integrar Meilisearch/Typesense mediante `extensions/Auto_Search` con sinónimos y búsqueda por OE/MPN/brand.
- Añadir reglas de envío avanzadas (peso, dimensiones, core charge) y soporte multi-almacén con ETA.
- Expandir la pasarela local para multi-moneda, impuestos por país y conciliación automática.
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
