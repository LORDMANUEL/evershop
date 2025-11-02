# AutoParts Commerce

![Arquitectura principal](docs/images/system-overview.svg)

AutoParts Commerce es una plataforma eCommerce especializada en repuestos automotrices. El proyecto proporciona un catálogo centrado en compatibilidad (fitment), un selector de vehículo orientado a VIN y flujos de importación masiva para mantener la información actualizada sin procesos manuales complejos.

> 🤝 **Créditos**: este desarrollo evoluciona el código abierto de EverShop y reconoce el trabajo de su comunidad original.

## Características clave

- **Compatibilidad vehículo-producto** mediante la extensión `Auto_Fitment`, con GraphQL y servicios dedicados para Año/Marca/Modelo/Versión/Motor.
- **Selector de vehículo + VIN** en el storefront, respaldado por la extensión `Auto_VIN` y la API pública de vPIC.
- **Importadores CSV** para catálogo, compatibilidad y referencias cruzadas que permiten poblar el sistema de forma masiva.
- **Arquitectura modular** basada en extensiones (`extensions/*`) que encapsulan pagos locales, reglas de envío y búsqueda especializada.

## Guía rápida de entorno

1. Copia el archivo `.env.example` si es necesario y ajusta credenciales.
2. Levanta los servicios de infraestructura:
   ```bash
   docker-compose up -d
   ```
3. Inicializa la base de datos y crea el usuario administrador:
   ```bash
   npm install
   npm run setup
   ```
4. Ejecuta el entorno de desarrollo:
   ```bash
   npm run dev
   ```

## Fases del proyecto

![Mapa de fases](docs/images/roadmap-phases.svg)

| Fase | Objetivo | Entregables principales |
|------|----------|-------------------------|
| **Fase 1. MVP operativo** | Poner en marcha la tienda con compatibilidad básica. | Infraestructura Docker, migraciones fitment, selector VIN, importadores CSV, filtro de compatibilidad en storefront. |
| **Fase 2. Escalamiento** | Robustecer búsqueda, logística y pagos. | Integración Meilisearch/Typesense, reglas de envío avanzadas, pagos locales multi-moneda, dashboards de compatibilidad. |
| **Fase 3. Optimización** | Preparar crecimiento sostenido. | Automatización de catálogo, analítica avanzada, pruebas automatizadas, integraciones premium (TecDoc). |

## Estado actual

- **Fase completada:** Fase 1 · MVP operativo ✅
- **Entregables Fase 1:**
  - Migraciones y servicios de `Auto_Fitment` con importadores CSV para catálogo/fitment.
  - Selector de vehículo persistente con decodificación VIN y filtro "Solo partes compatibles" en el storefront.
  - Reglas de envío iniciales (`Shipping_Rules`) con tarifa plana por país y retiro en tienda.
  - Métodos de pago locales (`Payments_Local`) para transferencia bancaria y contra entrega.
- **Fase activa:** Preparación de Fase 2 · Escalamiento.
- **Checklist previa a Fase 2:**
  - Ejecutar QA continuo: `npm run lint` y `npm run test` (se ejecutan sin errores, actualmente sin suites definidas).
  - Validar migraciones y seeds en un entorno Docker real (`docker-compose up -d`, `npm run setup`).
  - Documentar ajustes de configuración regional (monedas, costos por país) antes de desplegar.

> 📋 Consulta el reporte de QA de la fase en `docs/qa/phase-1.md`.

## Ruta recomendada (roadmap de alto nivel)

1. **Infraestructura**: automatizar despliegue local (Docker, seeds), preparar pipelines CI/CD y monitoreo básico.
2. **Dominio autopartes**: ampliar atributos de producto, lógica de core charge y reportes de compatibilidad.
3. **Experiencia de compra**: refinar checkout con envíos regionales avanzados, pagos multi-moneda y búsqueda mejorada.
4. **Escalamiento y analítica**: habilitar multi-almacén, métricas de compatibilidad y contenido SEO específico.

## Licencia

El proyecto mantiene la licencia [GPL-3.0](LICENSE) del código base.
