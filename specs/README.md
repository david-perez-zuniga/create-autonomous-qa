# Create Autonomous QA — Especificaciones

Especificaciones técnicas de la CLI **Create Autonomous QA**, una herramienta open-source para generar proyectos de automatización QA con Playwright, TypeScript y agentes de IA mediante scaffolding automático.

## Índice

| # | Documento | Contenido |
|---|---|---|
| 01 | [Overview](./01-overview.md) | Problema, solución, personas, alcance, supuestos, métricas y glosario |
| 02 | [Requisitos funcionales](./02-requirements.md) | FR-001…FR-018, criterios de aceptación, errores, matriz de trazabilidad |
| 03 | [Arquitectura](./03-architecture.md) | Capas, módulos, interfaces, flujos, errores, rollback y extensibilidad |
| 04 | [Templates](./04-templates.md) | Estructura, placeholders, motor, especificación por archivo y validación |
| 05 | [Skill Autonomous QA](./05-autonomous-qa-skill.md) | Flujo de 9 fases, artefactos, defectos, guardrails y criterios |
| 06 | [Requisitos no funcionales](./06-non-functional.md) | Rendimiento, compatibilidad, seguridad, fiabilidad, distribución |
| 07 | [Roadmap](./07-roadmap.md) | v0.1.0 → v1.0.0, entregables, criterios de salida y riesgos |
| 08 | [Brechas de implementación](./08-implementation-gaps.md) | Estado actual vs. spec, brechas priorizadas y backlog |
| 09 | [Estrategia de pruebas](./09-test-strategy.md) | Pirámide, casos, snapshots, CI, cobertura, rendimiento y seguridad |
| 10 | [Referencia de CLI](./10-cli-reference.md) | Comandos, flags, salida, exit codes, errores y ejemplos |

## Orden de lectura recomendado

### Para entender el producto
1. `01-overview.md`
2. `02-requirements.md`
3. `10-cli-reference.md`

### Para implementar
1. `03-architecture.md`
2. `04-templates.md`
3. `05-autonomous-qa-skill.md`
4. `08-implementation-gaps.md`
5. `09-test-strategy.md`

### Para planificar
1. `07-roadmap.md`
2. `08-implementation-gaps.md`
3. `06-non-functional.md`

## Convenciones

- **FR**: requisito funcional.
- **AC**: criterio de aceptación.
- **CA**: caso alternativo / error.
- **TV**: regla de validación de template.
- **SK**: criterio de aceptación de skill.
- **G**: brecha de implementación.
- **UT / IT / E2E / SEC**: tipos de prueba.
- Prioridades MoSCoW: Must, Should, Could, Won't.

## Principios rectores

1. **Un comando, un proyecto listo.** La CLI genera, no ejecuta.
2. **Estructura predecible.** Carpetas y archivos canónicos para humanos y agentes.
3. **Separación de responsabilidades.** Generator orquesta; Services escriben.
4. **Multiplataforma por diseño.** `node:path`, sin shell, sin supuestos POSIX.
5. **Determinismo.** Mismo input + misma versión ⇒ mismo output.
6. **Errores accionables.** Código, mensaje y siguiente paso.
7. **Extensible.** Package managers, templates, skills y plugins.
8. **Calidad verificable.** Tests, CI y presupuesto de rendimiento.

## Estado del proyecto

| Versión | Estado | Notas |
|---|---|---|
| 0.1.0 | Implementado | CLI, generación completa, template, skill, validación y tests |
| 0.2.0 | Planificada | Skill real, variables avanzadas, rollback |
| 0.3.0 | Planificada | Instalación, validación, CI completo |
| 0.4.0 | Planificada | Templates múltiples, marketplace, plugins |
| 1.0.0 | Planificada | Framework estable |

> Las brechas de v0.1.0 fueron cerradas. El detalle histórico y el plan de cierre están en `08-implementation-gaps.md` y `../tasks/00-checklist.md`.

## Definición de terminado

Una funcionalidad está terminada cuando:

- [ ] Cumple su FR y AC.
- [ ] Tiene tests unitarios/integración/E2E según corresponda.
- [ ] Funciona en Linux, macOS y Windows.
- [ ] No rompe el contrato de salida.
- [ ] Está documentada.
- [ ] No introduce regresiones.
- [ ] Respeta los límites de rendimiento.

## Fuera de alcance

- Ejecutar pruebas o Playwright.
- Instalar dependencias o navegadores en v0.1.0.
- Servir una aplicación web.
- Gestionar CI/CD del proyecto generado.
- Ejecutar agentes de IA.
- Modificar proyectos ya generados.

## Mantenimiento de las specs

- Las specs son la fuente de verdad del comportamiento esperado.
- Un cambio de comportamiento debe actualizar la spec correspondiente en el mismo PR.
- Los cambios incompatibles deben reflejarse en el roadmap y el CHANGELOG.
- Las decisiones relevantes se registran como ADR en `03-architecture.md` § 3.13.

## Licencia

MIT.
EOF
