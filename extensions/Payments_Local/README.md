# Payments_Local

Esta extensión alojará la pasarela de pago regional (BAC/Credomatic, Tigo Money, etc.) basada en los hooks de Stripe.

Próximos pasos:

- Implementar `getPaymentMethods` para exponer métodos disponibles según país/moneda.
- Crear endpoint equivalente a `createPaymentIntent` con lógica de autenticación y captura.
- Manejar multi-moneda (HNL, GTQ, USD) y cálculos de impuestos locales.

> _Estado actual_: placeholder documentado para iniciar el desarrollo.
