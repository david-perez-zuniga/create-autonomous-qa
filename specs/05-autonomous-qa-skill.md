# 05 — Skill Autonomous QA

## 5.1 Propósito

Cada proyecto generado debe incluir una skill de IA especializada que permita a un agente ejecutar el ciclo completo de QA autónomo sobre una aplicación bajo prueba (AUT), produciendo artefactos verificables.

La skill **no ejecuta código por sí misma**: define instrucciones, rutas, convenciones y criterios para que un agente (OpenCode u otro compatible) opere el proyecto generado.

## 5.2 Ubicación y formato

```text
<project>/.opencode/skills/autonomous-qa/skill.md
```

### Frontmatter obligatorio

```markdown
---
name: autonomous-qa
description: Autonomous QA workflow for discovering, generating, executing, and reporting Playwright tests with evidence capture and defect classification.
---
```

### Reglas

- `name` debe ser `autonomous-qa`.
- `description` debe describir cuándo usar la skill.
- El archivo debe ser UTF-8, sin BOM.
- No debe contener placeholders sin reemplazar.
- Debe incluir el nombre del proyecto generado en el cuerpo.

## 5.3 Alcance de la skill

### Incluido

- Descubrimiento funcional de la aplicación.
- Detección de reglas de negocio.
- Generación de escenarios.
- Generación de casos de prueba.
- Generación de código Playwright.
- Ejecución de pruebas.
- Captura de evidencias.
- Clasificación de defectos.
- Generación de reportes.

### Fuera de alcance

- Modificar la aplicación bajo prueba.
- Desplegar infraestructura.
- Acceder a datos de producción.
- Ejecutar pruebas de carga o seguridad ofensiva.
- Tomar decisiones de negocio no documentadas.

## 5.4 Flujo de trabajo

```text
┌─────────────────────────────┐
│ 1. Functional Discovery     │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 2. Business Rules Detection │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 3. Scenario Generation      │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 4. Test Case Generation     │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 5. Playwright Generation    │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 6. Automatic Execution      │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 7. Evidence Capture         │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 8. Defect Classification    │
└──────────────┬──────────────┘
               ▼
┌─────────────────────────────┐
│ 9. Artifact Generation      │
└─────────────────────────────┘
```

## 5.5 Fase 1 — Descubrimiento funcional

### Objetivo
Construir un inventario de funcionalidades, rutas, formularios, roles y flujos observables.

### Entradas
- `BASE_URL` del entorno bajo prueba.
- Credenciales en `.env` (si aplica).
- Documentación disponible del producto.
- Acceso de navegación con Playwright.

### Actividades
1. Navegar la página principal.
2. Identificar enlaces, menús y rutas.
3. Identificar formularios y campos.
4. Identificar autenticación y roles.
5. Identificar flujos críticos (happy paths).
6. Identificar estados de error visibles.
7. Registrar observaciones.

### Salidas
- `qa-results/analytics/discovery.md`
- `qa-results/analytics/features.json`

### Esquema `features.json`
```json
{
  "project": "{{PROJECT_NAME}}",
  "baseUrl": "http://localhost:3000",
  "discoveredAt": "2026-10-20T00:00:00.000Z",
  "features": [
    {
      "id": "FEAT-001",
      "name": "User login",
      "path": "/login",
      "type": "form",
      "criticality": "high",
      "roles": ["anonymous", "user"],
      "observations": ["Email and password fields", "Forgot password link"]
    }
  ]
}
```

### Criterios de salida
- Al menos una funcionalidad por ruta principal accesible.
- Cada funcionalidad tiene `id`, `name`, `path` y `criticality`.
- No se inventan funcionalidades no observadas.

## 5.6 Fase 2 — Detección de reglas de negocio

### Objetivo
Derivar reglas verificables a partir de la observación y la documentación.

### Tipos de reglas
| Tipo | Ejemplo |
|---|---|
| Validación | El email debe tener formato válido |
| Autorización | Un usuario anónimo no accede a `/admin` |
| Límites | El monto mínimo de transferencia es 1.00 |
| Formato | El teléfono debe tener 10 dígitos |
| Estado | Un pedido cancelado no se puede pagar |
| Consistencia | El total es la suma de ítems + impuestos |

### Salidas
- `qa-results/analytics/business-rules.md`
- `qa-results/analytics/business-rules.json`

### Esquema
```json
{
  "rules": [
    {
      "id": "BR-001",
      "featureId": "FEAT-001",
      "description": "Passwords must have at least 8 characters",
      "source": "observed | documented | inferred",
      "confidence": "high | medium | low",
      "examples": ["short", "long enough"]
    }
  ]
}
```

### Reglas
- Toda regla debe citar su fuente.
- Las reglas inferidas con baja confianza deben marcarse para revisión.
- No se deben usar reglas para justificar datos de producción.

## 5.7 Fase 3 — Generación de escenarios

### Objetivo
Transformar funcionalidades y reglas en escenarios de prueba.

### Formato
```gherkin
Scenario: Successful login with valid credentials
  Given a registered user
  When the user submits valid credentials
  Then the dashboard is displayed
```

### Cobertura mínima por funcionalidad
- Happy path.
- Validación de campos obligatorios.
- Valores límite.
- Valores inválidos.
- Autorización (si aplica).
- Persistencia / estado (si aplica).

### Salidas
- `qa-results/analytics/scenarios.md`
- `qa-results/analytics/scenarios.json`

### Esquema
```json
{
  "scenarios": [
    {
      "id": "SCN-001",
      "featureId": "FEAT-001",
      "title": "Successful login with valid credentials",
      "type": "happy-path | negative | boundary | authorization",
      "priority": "P0 | P1 | P2",
      "rules": ["BR-001"],
      "steps": ["..."],
      "expected": "..."
    }
  ]
}
```

## 5.8 Fase 4 — Generación de casos de prueba

### Objetivo
Convertir escenarios en casos ejecutables con datos concretos.

### Cada caso debe incluir
- ID (`TC-001`).
- Escenario asociado.
- Precondiciones.
- Datos de entrada.
- Pasos.
- Resultado esperado.
- Prioridad.
- Tags (`@smoke`, `@regression`, `@auth`).

### Salidas
- `qa-results/analytics/test-cases.md`
- `qa-results/analytics/test-cases.json`

### Reglas
- Un caso = un comportamiento verificable.
- No compartir estado mutable entre casos.
- Datos sensibles solo desde variables de entorno.
- Casos deterministas: sin esperas arbitrarias.

## 5.9 Fase 5 — Generación Playwright

### Objetivo
Generar código TypeScript ejecutable con `@playwright/test`.

### Convenciones

| Elemento | Convención |
|---|---|
| Archivo | `tests/<feature>.spec.ts` |
| Describe | Nombre de la funcionalidad |
| Test | Título del caso |
| Page object | `pages/<feature>.page.ts` |
| Fixture | `fixtures/<name>.fixture.ts` |
| Selector | `getByRole`, `getByLabel`, `getByText`; evitar CSS/XPath frágiles |
| Espera | Aserciones auto-retry de Playwright; evitar `waitForTimeout` |
| Datos | Variables de entorno o fixtures |
| Tags | `test.describe` / `test` con `tag` |

### Estructura de ejemplo
```typescript
import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("successful login with valid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(process.env.QA_USER!);
    await page.getByLabel("Password").fill(process.env.QA_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });
});
```

### Reglas
- No hardcodear credenciales.
- No usar `page.waitForTimeout`.
- No usar selectores basados en posiciones.
- Cada test debe poder ejecutarse aislado.
- Los tests deben fallar con mensajes claros.
- El código generado debe compilar con TypeScript.

### Salidas
- Archivos en `tests/`.
- Page objects en `pages/`.
- Fixtures en `fixtures/`.

## 5.10 Fase 6 — Ejecución automática

### Objetivo
Ejecutar la suite generada y recopilar resultados.

### Comandos
```bash
pnpm test          # o bun test
pnpm exec playwright test --reporter=json
```

### Salidas
- `qa-results/playwright/results.json`
- `qa-results/playwright/html/`
- `qa-results/evidence/`

### Reglas
- Registrar comando, fecha, commit (si existe) y entorno.
- No reintentar más de 2 veces en CI.
- Distinguir fallo de test, error de infraestructura y error de aplicación.
- Si la aplicación no está disponible, abortar con diagnóstico claro.

### Artefacto de ejecución
```json
{
  "runId": "run-20261020-120000",
  "startedAt": "2026-10-20T12:00:00.000Z",
  "finishedAt": "2026-10-20T12:03:00.000Z",
  "environment": "local",
  "command": "pnpm test",
  "total": 12,
  "passed": 10,
  "failed": 1,
  "skipped": 1,
  "flaky": 0
}
```

## 5.11 Fase 7 — Captura de evidencias

### Objetivo
Adjuntar evidencia verificable a cada resultado.

### Tipos
| Tipo | Cuándo | Ruta |
|---|---|---|
| Screenshot | Fallo o paso crítico | `qa-results/evidence/<runId>/<testId>/screenshot.png` |
| Video | Fallo (si habilitado) | `qa-results/evidence/<runId>/<testId>/video.webm` |
| Trace | Fallo | `qa-results/evidence/<runId>/<testId>/trace.zip` |
| Log | Siempre | `qa-results/evidence/<runId>/<testId>/log.txt` |
| Attachment | Adjuntos del test | `qa-results/evidence/<runId>/<testId>/attachments/` |

### Convención de nombres
```text
<runId>/<testId>/<artifact>
```

- `runId`: `run-YYYYMMDD-HHmmss`.
- `testId`: slug del título + hash corto para evitar colisiones.
- Sin espacios.
- UTF-8 para logs.

### Reglas
- No capturar datos sensibles en screenshots (enmascarar si es posible).
- Limitar tamaño de adjuntos (por ejemplo, 50 MB por test).
- Documentar la ruta en el reporte.

## 5.12 Fase 8 — Clasificación de defectos

### Objetivo
Convertir fallos en defectos accionables.

### Taxonomía

| Categoría | Descripción |
|---|---|
| `functional` | Comportamiento incorrecto respecto a la regla |
| `validation` | Validación de entrada ausente o incorrecta |
| `authorization` | Acceso indebido o denegación incorrecta |
| `ui` | Problema visual o de accesibilidad |
| `data` | Inconsistencia de datos |
| `performance` | Lentitud o timeout |
| `infrastructure` | Entorno, red, dependencias |
| `test` | Defecto en el test generado |
| `flaky` | Resultado no determinista |

### Severidad

| Severidad | Criterio |
|---|---|
| `critical` | Bloquea flujo principal o expone datos |
| `high` | Impide una función importante sin workaround |
| `medium` | Función degradada con workaround |
| `low` | Cosmético o menor |

### Prioridad

| Prioridad | Criterio |
|---|---|
| `P0` | Corregir antes de continuar |
| `P1` | Corregir en el ciclo actual |
| `P2` | Backlog |

### Salida por defecto
`qa-results/defects/DEF-001.md`

```markdown
# DEF-001 — Login accepts empty password

| Field | Value |
|---|---|
| Severity | high |
| Category | validation |
| Priority | P1 |
| Test | tests/login.spec.ts:12 |
| Run | run-20261020-120000 |
| Status | open |

## Steps to reproduce
1. Go to /login
2. Enter a valid email
3. Leave password empty
4. Click "Sign in"

## Expected
The form shows "Password is required".

## Actual
The user is logged in.

## Evidence
- qa-results/evidence/run-20261020-120000/login-empty-password/screenshot.png
- qa-results/evidence/run-20261020-120000/login-empty-password/trace.zip

## Business rule
BR-001

## Notes
Observed in Chromium.
```

### Reglas
- Un defecto por causa raíz.
- No duplicar defectos entre runs: enlazar con `related`.
- Distinguir defecto de producto vs defecto de test.
- Todo defecto debe tener evidencia o pasos reproducibles.
- No cerrar defectos automáticamente sin verificación.

### Índice
`qa-results/defects/index.json`
```json
{
  "defects": [
    {
      "id": "DEF-001",
      "title": "Login accepts empty password",
      "severity": "high",
      "category": "validation",
      "priority": "P1",
      "status": "open",
      "test": "tests/login.spec.ts:12",
      "run": "run-20261020-120000"
    }
  ]
}
```

## 5.13 Fase 9 — Generación de artefactos

### Objetivo
Producir un reporte consolidado y métricas.

### Artefactos

| Artefacto | Ruta |
|---|---|
| Reporte ejecutivo | `qa-results/analytics/report.md` |
| Métricas | `qa-results/analytics/metrics.json` |
| Cobertura funcional | `qa-results/analytics/coverage.md` |
| Defectos | `qa-results/defects/` |
| Evidencias | `qa-results/evidence/` |
| Resultados Playwright | `qa-results/playwright/` |

### Reporte ejecutivo (estructura)
```markdown
# QA Report — {{PROJECT_NAME}}

Date: {{DATE}}
Run: run-20261020-120000

## Summary
- Features discovered: 8
- Scenarios: 24
- Test cases: 31
- Executed: 31
- Passed: 27
- Failed: 3
- Skipped: 1

## Coverage
| Feature | Scenarios | Passed | Failed |
|---|---|---|---|

## Defects
| ID | Title | Severity | Status |
|---|---|---|---|

## Risks
- ...

## Next actions
- ...
```

### Métricas
```json
{
  "runId": "run-20261020-120000",
  "features": 8,
  "scenarios": 24,
  "testCases": 31,
  "executed": 31,
  "passed": 27,
  "failed": 3,
  "skipped": 1,
  "passRate": 0.871,
  "defects": { "critical": 0, "high": 2, "medium": 1, "low": 0 },
  "durationMs": 180000
}
```

## 5.14 Guardrails

1. **No inventar resultados.** Toda afirmación debe tener evidencia o ejecución.
2. **No modificar la aplicación bajo prueba.**
3. **No usar datos de producción.** Usar entornos y datos de prueba.
4. **No exponer secretos** en reportes, logs, screenshots o commits.
5. **No ejecutar acciones destructivas** sin confirmación explícita.
6. **No desactivar tests** para hacer pasar la suite.
7. **No usar `waitForTimeout`** como solución a flakiness.
8. **No cerrar defectos** sin re-ejecución y verificación.
9. **Respetar el alcance** del entorno autorizado.
10. **Documentar supuestos** y preguntas abiertas.

## 5.15 Integración con OpenCode

- La skill se descubre automáticamente en `.opencode/skills/`.
- El agente debe cargarla cuando la tarea involucre QA, tests o Playwright.
- La skill debe ser autocontenida: no depender de rutas fuera del proyecto generado.
- Los comandos deben usar el package manager configurado.
- El agente debe leer `.env.example` y nunca asumir credenciales.

## 5.16 Criterios de aceptación de la skill

| ID | Criterio |
|---|---|
| SK-01 | `skill.md` existe en la ruta correcta |
| SK-02 | Tiene frontmatter válido (`name`, `description`) |
| SK-03 | Contiene el nombre del proyecto generado |
| SK-04 | Describe las 9 fases |
| SK-05 | Define rutas de artefactos |
| SK-06 | Define taxonomía de defectos |
| SK-07 | Define guardrails |
| SK-08 | No contiene placeholders sin reemplazar |
| SK-09 | Es UTF-8 sin BOM |
| SK-10 | Es idempotente al reinstalarse |

## 5.17 Plantilla de skill (referencia)

```markdown
---
name: autonomous-qa
description: Autonomous QA workflow for discovering, generating, executing, and reporting Playwright tests with evidence capture and defect classification.
---

# Autonomous QA — {{PROJECT_NAME}}

This project uses Playwright + TypeScript for autonomous QA.

## When to use this skill

Use this skill when the task involves:
- discovering application functionality
- generating test scenarios or test cases
- writing or fixing Playwright tests
- executing tests and capturing evidence
- classifying defects
- producing QA reports

## Workflow

1. **Functional discovery** — map routes, forms, roles, and critical flows.
   Output: `qa-results/analytics/features.json`.
2. **Business rules** — derive verifiable rules with sources.
   Output: `qa-results/analytics/business-rules.json`.
3. **Scenarios** — write Gherkin-style scenarios with priority and type.
   Output: `qa-results/analytics/scenarios.json`.
4. **Test cases** — add preconditions, data, steps, expected results, tags.
   Output: `qa-results/analytics/test-cases.json`.
5. **Playwright** — implement tests in `tests/`, page objects in `pages/`,
   fixtures in `fixtures/`. Use role/label selectors and auto-retrying assertions.
6. **Execution** — run `{{TEST_COMMAND}}`; never use `waitForTimeout`.
7. **Evidence** — save screenshots, videos, traces, and logs under
   `qa-results/evidence/<runId>/<testId>/`.
8. **Defects** — create one file per root cause in `qa-results/defects/`,
   with severity, category, priority, steps, expected/actual, and evidence.
9. **Reports** — update `qa-results/analytics/report.md` and `metrics.json`.

## Conventions

- Base URL: `process.env.BASE_URL`.
- Credentials: environment variables only.
- Selectors: `getByRole`, `getByLabel`, `getByText`.
- No hardcoded secrets, no production data, no destructive actions.
- Tests must be independent and deterministic.

## Artifacts

| Artifact | Path |
|---|---|
| Discovery | `qa-results/analytics/features.json` |
| Business rules | `qa-results/analytics/business-rules.json` |
| Scenarios | `qa-results/analytics/scenarios.json` |
| Test cases | `qa-results/analytics/test-cases.json` |
| Evidence | `qa-results/evidence/<runId>/<testId>/` |
| Defects | `qa-results/defects/DEF-###.md` |
| Report | `qa-results/analytics/report.md` |
| Metrics | `qa-results/analytics/metrics.json` |
| Playwright output | `qa-results/playwright/` |
```

> Esta plantilla es la base mínima; el `skill.md` final puede ampliarse, pero debe cumplir SK-01…SK-10.
EOF
