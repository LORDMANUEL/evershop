<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
<p align="center">
<img width="60" height="68" alt="EverShop Logo" src="https://raw.githubusercontent.com/evershopcommerce/evershop/dev/.github/images/logo-green.png"/>
</p>
<p align="center">
  <h1 align="center">EverShop &rarr; AutoParts Edition</h1>
</p>
<h4 align="center">
    <a href="https://evershop.io/docs/development/getting-started/introduction">Documentation</a> |
    <a href="https://demo.evershop.io/">Demo</a>
</h4>

<p align="center">
  <img src="https://github.com/evershopcommerce/evershop/actions/workflows/build_test.yml/badge.svg" alt="Github Action">
  <a href="https://twitter.com/evershopjs">
    <img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/evershopjs?style=social">
  </a>
  <a href="https://discord.gg/GSzt7dt7RM">
    <img src="https://img.shields.io/discord/757179260417867879?label=discord" alt="Discord">
  </a>
  <a href="https://opensource.org/licenses/GPL-3.0">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg" alt="License">
  </a>
</p>

<p align="center">
<img alt="EverShop" width="950" src="https://raw.githubusercontent.com/evershopcommerce/evershop/dev/.github/images/banner.png"/>
</p>

## Introduction

EverShop is a modern, TypeScript-first eCommerce platform built with GraphQL and React. Designed for developers, it offers essential commerce features in a modular, fully customizable architecture—perfect for building tailored shopping experiences with confidence and speed.

> 🙌 **Agradecimiento especial**: este proyecto parte del excelente trabajo de la comunidad de [EverShop](https://github.com/evershopcommerce/evershop). Nuestro objetivo es extenderlo respetuosamente para servir a un vertical especializado de autopartes.

## Autoparts vertical (fork status)

Este fork reimagina EverShop como una tienda especializada en repuestos automotrices. El enfoque principal es garantizar que cada producto se relacione con vehículos compatibles, simplificando la búsqueda para el cliente final y agilizando la gestión del catálogo para el equipo comercial.

### Funcionalidades clave

**Disponibles en el fork**

- **Compatibilidad (Fitment) inteligente**: tablas, servicios y resolvers GraphQL desde `extensions/Auto_Fitment` para asociar productos con Año/Marca/Modelo/Versión/Motor específicos.
- **Selector de vehículo + VIN decoding**: widget persistente en el storefront y endpoint `POST /api/fitment/decode-vin` contra la API NHTSA vPIC (`extensions/Auto_VIN`), con almacenamiento en el "Garage" del usuario (localStorage).
- **Filtro "Sólo partes compatibles"**: integración del selector con las páginas de listado para aplicar filtros dinámicos sobre el catálogo.
- **Importadores CSV**: página de administración `/fitment/import` para cargar vehículos, compatibilidades y referencias cruzadas en bloque, con soporte de simulación (dry-run).

**En desarrollo**

- **Atributos específicos de autoparte** (OE/MPN, posición, lado, torque, core charge, garantía) visibles en admin y storefront.
- **Logística adaptada**: reglas de envío por zona, peso y dimensiones desde `extensions/Shipping_Rules`.
- **Pagos locales y multi-moneda** mediante `extensions/Payments_Local` siguiendo el patrón de Stripe.
- **Búsqueda especializada** con Meilisearch/Typesense (`extensions/Auto_Search`) para búsquedas por OE, sinónimos y boosting por compatibilidad.

Consulta `docs/status-and-roadmap.md` para conocer el avance de cada frente y el plan detallado por fases (MVP, escalamiento y optimización).

### Próximos pasos inmediatos

1. Levantar la infraestructura local (Postgres + EverShop) con Docker y ejecutar `npm run setup` seguido de las migraciones de `Auto_Fitment`.
2. Poblar datos de prueba usando el importador CSV y validar la experiencia de selección de vehículo y filtro de compatibilidad en un entorno real.
3. Resolver el fallo actual de ESLint para habilitar el linting del monorepo y cubrir los servicios/componentes con pruebas automatizadas.
4. Priorizar la implementación de atributos específicos, reglas de envío y pasarela local para completar el MVP de autopartes.

## Installation Using Docker


You can get started with EverShop in minutes by using the Docker image. The Docker image is a great way to get started with EverShop without having to worry about installing dependencies or configuring your environment.

```bash
curl -sSL https://raw.githubusercontent.com/evershopcommerce/evershop/main/docker-compose.yml > docker-compose.yml
docker-compose up -d
```

For the full installation guide, please refer to our [Installation guide](https://evershop.io/docs/development/getting-started/installation-guide).

## Documentation

- [Installation guide](https://evershop.io/docs/development/getting-started/installation-guide).

- [Extension development](https://evershop.io/docs/development/module/create-your-first-extension).

- [Theme development](https://evershop.io/docs/development/theme/theme-overview).


## Demo

Explore our demo store.

<p align="left">
  <a href="https://demo.evershop.io/admin" target="_blank">
    <img alt="evershop-backend-demo" height="35" alt="EverShop Admin Demo" src="https://raw.githubusercontent.com/evershopcommerce/evershop/dev/.github/images/evershop-demo-back.png"/>
  </a>
  <a href="https://demo.evershop.io/" target="_blank">
    <img alt="evershop-store-demo" height="35" alt="EverShop Store Demo" src="https://raw.githubusercontent.com/evershopcommerce/evershop/dev/.github/images/evershop-demo-front.png"/>
  </a>
</p>
<b>Demo user:</b>

Email: demo@evershop.io<br/>
Password: 123456

## Support

If you like my work, feel free to:

- ⭐ this repository. It helps.
- [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)][tweet] about EverShop. Thank you!

[tweet]: https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fevershopcommerce%2Fevershop&text=Awesome%20React%20Ecommerce%20Project&hashtags=react,ecommerce,expressjs,graphql

## Contributing

EverShop is an open-source project. We are committed to a fully transparent development process and appreciate highly any contributions. Whether you are helping us fix bugs, proposing new features, improving our documentation or spreading the word - we would love to have you as part of the EverShop community.

### Ask a question about EverShop

You can ask questions, and participate in discussions about EverShop-related topics in the EverShop Discord channel.

<a href="https://discord.gg/GSzt7dt7RM"><img src="https://raw.githubusercontent.com/evershopcommerce/evershop/dev/.github/images/discord_banner_github.svg" /></a>

### Create a bug report

If you see an error message or run into an issue, please [create bug report](https://github.com/evershopcommerce/evershop/issues/new). This effort is valued and it will help all EverShop users.


### Submit a feature request

If you have an idea, or you're missing a capability that would make development easier and more robust, please [Submit feature request](https://github.com/evershopcommerce/evershop/issues/new).

If a similar feature request already exists, don't forget to leave a "+1".
If you add some more information such as your thoughts and vision about the feature, your comments will be embraced warmly :)


Please refer to our [Contribution Guidelines](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

[GPL-3.0 License](https://github.com/evershopcommerce/evershop/blob/main/LICENSE)
