# create-autonomous-qa

[![npm version](https://img.shields.io/npm/v/create-autonomous-qa.svg)](https://www.npmjs.com/package/create-autonomous-qa)
[![npm downloads](https://img.shields.io/npm/dm/create-autonomous-qa.svg)](https://www.npmjs.com/package/create-autonomous-qa)
[![CI](https://github.com/david-perez-zuniga/create-autonomous-qa/actions/workflows/ci.yml/badge.svg)](https://github.com/david-perez-zuniga/create-autonomous-qa/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D20-5FA04E.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.x-2ead33.svg)](https://playwright.dev/)

CLI para generar proyectos de QA autónomo con [Playwright](https://playwright.dev/), TypeScript y agentes de IA.

> 🌐 **Landing page**: [landing page/](./landing%20page/) — sitio estático en Astro con la documentación visual, comandos y features del proyecto.

## ¿Qué es?

`create-autonomous-qa` es una herramienta CLI que crea la estructura base de un proyecto de automatización de pruebas en cuestión de segundos. El proyecto generado incluye una estructura lista para usar con Playwright, carpetas para evidencias, reportes, defectos y una _skill_ de QA autónomo para agentes de IA.

> La CLI **solo genera el proyecto**, no instala dependencias ni ejecuta pruebas. Eso queda a cargo de ti después de la generación.

## Requisitos

- [Node.js](https://nodejs.org/) >= 20
- Un gestor de paquetes: [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/) o [Bun](https://bun.sh/)

## Instalación / Uso

No necesitas instalarlo globalmente. Puedes usarlo directamente con tu gestor de paquetes.

### Con npm

```bash
npm create autonomous-qa@latest my-project-qa
```

### Con pnpm

```bash
pnpm create autonomous-qa my-project-qa
```

### Con Bun

```bash
bun create autonomous-qa my-project-qa
```

### Con npx / pnpm dlx / bunx

```bash
npx create-autonomous-qa my-project-qa
pnpm dlx create-autonomous-qa my-project-qa
bunx create-autonomous-qa my-project-qa
```

## Opciones

| Opción          | Descripción                                        |
| --------------- | -------------------------------------------------- |
| `--pnpm`        | Configura el proyecto para usar pnpm (por defecto) |
| `--bun`         | Configura el proyecto para usar Bun                |
| `--debug`       | Muestra stack traces ante errores inesperados      |
| `-h, --help`    | Muestra la ayuda                                   |
| `-V, --version` | Muestra la versión                                 |

### Ejemplos

```bash
# Generar con configuración por defecto (pnpm)
create-autonomous-qa my-project-qa

# Generar explícitamente con pnpm
create-autonomous-qa my-project-qa --pnpm

# Generar con Bun
create-autonomous-qa my-project-qa --bun
```

## Estructura generada

Al crear el proyecto se genera la siguiente estructura:

```text
my-project-qa/
├── .opencode/
│   └── skills/
│       └── autonomous-qa/
│           └── skill.md
├── promps/
│   ├── 01-create-specs.md
│   ├── 02-create-task.md
│   ├── 03-create-test.md
│   └── 04-create-test-result.md
├── tests/
│   └── example.spec.ts
├── pages/
├── fixtures/
├── qa-results/
│   ├── defects/
│   ├── evidence/
│   │   ├── screenshots/
│   │   ├── videos/
│   │   ├── traces/
│   │   ├── console/
│   │   └── network/
│   ├── analytics/
│   └── playwright/
│       ├── generated-tests/
│       └── execution-results/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── playwright.config.ts
```

## Siguientes pasos

Después de generar el proyecto:

```bash
cd my-project-qa
pnpm install  # o npm install / bun install
pnpm test     # o npm test / bun run test
```

> **Nota sobre Bun:** `bun test` usa el runner nativo de Bun y no es compatible con `@playwright/test`. Usa `bun run test` para ejecutar los tests de Playwright.

## Flujo de QA Autónomo con Agentes de IA

El proyecto generado incluye **4 prompts listos para usar** en `promps/` que guían a un agente de IA (como OpenCode) a través de todo el ciclo de vida de QA:

### 1. Crear Especificaciones (`promps/01-create-specs.md`)

Analiza el código de tu aplicación y genera especificaciones funcionales en `specs/`.

```bash
# Copia el contenido de promps/01-create-specs.md y pásalo a tu agente de IA
# El agente leerá tu código y creará specs/*.md
```

**Salida:** `specs/autenticacion.md`, `specs/transferencias.md`, etc.

---

### 2. Crear Tareas de QA (`promps/02-create-task.md`)

A partir de las specs, genera casos de prueba priorizados, deduplicados y con confidence score en `tasks/`.

```bash
# Copia promps/02-create-task.md y pásalo al agente
# El agente leerá specs/ y creará tasks/AUTH-001.md, TRANS-001.md, etc.
```

**Salida:** `tasks/AUTH-001.md`, `tasks/TRANS-001.md` (con tipo, confidence score, pasos, resultado esperado).

---

### 3. Generar Tests Playwright (`promps/03-create-test.md`)

Con specs + tasks, el agente genera código Playwright aplicando **Risk-Based Testing (RBT)**:

- CRÍTICO → 100% cobertura
- ALTO → 80% cobertura
- MEDIO → 60% cobertura
- BAJO → Solo Happy Path

```bash
# Copia promps/03-create-test.md y pásalo al agente
# El agente creará pages/, fixtures/, helpers/ y tests/*.spec.ts
```

**Salida:** `pages/LoginPage.ts`, `fixtures/testData.ts`, `tests/autenticacion.spec.ts`, etc.

---

### 4. Analizar Resultados (`promps/04-create-test-result.md`)

Tras ejecutar `pnpm test`, el agente analiza `qa-results/` y genera defectos deduplicados y métricas.

```bash
# Ejecuta los tests
pnpm test

# Copia promps/04-create-test-result.md y pásalo al agente
# El agente leerá qa-results/ y creará qa-results/defects/BUG-*.md + metrics.json
```

**Salida:** `qa-results/defects/BUG-001.md`, `qa-results/analytics/metrics.json`

---

### Resumen del flujo completo

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  01 Specs       │────▶│  02 Tasks       │────▶│  03 Tests       │────▶│  04 Results     │
│  (promps/01)    │     │  (promps/02)    │     │  (promps/03)    │     │  (promps/04)    │
│  ▼              │     │  ▼              │     │  ▼              │     │  ▼              │
│  specs/*.md     │     │  tasks/*.md     │     │  tests/*.spec.ts│     │  defects/BUG-*.md
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
     │                      │                      │                      │
     │                      │                      │                      │
     ▼                      ▼                      ▼                      ▼
 Analiza código      Prioriza + deduplica    Genera Playwright    Analiza evidencias
                     + confidence score      con RBT + POM        + genera métricas
```

> **Uso:** Cada archivo en `promps/` está diseñado para copiarse completo y pasárselo a tu agente de IA (OpenCode, Cursor, Copilot Chat, etc.). El agente ejecutará las instrucciones y generará los artefactos en los directorios correspondientes.

---

## Desarrollo de esta CLI

Si quieres contribuir o ejecutar esta CLI en modo desarrollo:

```bash
# Clonar el repositorio
git clone https://github.com/david-perez-zuniga/create-autonomous-qa.git
cd create-autonomous-qa

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev -- my-project

# Compilar
pnpm build

# Ejecutar versión compilada
pnpm start

# Ejecutar tests
pnpm test

# Cobertura
pnpm test:coverage

# Lint y formato
pnpm lint
pnpm format:check

# Empaquetar y verificar el contenido publicado
npm pack --dry-run
```

### Probar el paquete localmente

```bash
npm pack
mkdir -p /tmp/caqa-test && cd /tmp/caqa-test
npm init -y
npm install /ruta/a/create-autonomous-qa-0.2.0.tgz
npx create-autonomous-qa demo
```

## Características

- **Scaffold instantáneo** — Estructura completa de QA en segundos.
- **pnpm o Bun** — Elige el package manager con `--pnpm` o `--bun`.
- **Skill de agentes IA** — 9 fases: descubrimiento, reglas, escenarios, casos, código, ejecución, evidencias, defectos y reporte.
- **Seguro por diseño** — Validación de nombres, bloqueo de path traversal, nombres reservados de Windows y rollback completo ante fallos.
- **Errores claros** — Contrato de salida estable, errores por `stderr` y stack traces con `--debug`.
- **Multiplataforma** — Probado en Linux, macOS y Windows con Node 20, 22 y 24.

## Estado del proyecto

| Versión | Estado                                                                               |
| ------- | ------------------------------------------------------------------------------------ |
| `0.2.0` | Skill real, variables avanzadas, rollback, idempotencia, `CliError` y suite de tests |
| `0.3.0` | Instalación automática opcional, validación de templates y `--dry-run`               |
| `0.4.0` | Templates múltiples, marketplace y plugins                                           |
| `1.0.0` | API estable y framework completo                                                     |

## Contribuir

Las contribuciones son bienvenidas.

1. Haz un fork y crea una rama: `git checkout -b feature/mi-cambio`
2. Instala dependencias: `pnpm install`
3. Asegúrate de que todo pasa: `pnpm lint && pnpm typecheck && pnpm test`
4. Abre un Pull Request describiendo el cambio.

## Licencia

[MIT](./LICENSE) — Copyright (c) David Humberto Perez Zuniga
