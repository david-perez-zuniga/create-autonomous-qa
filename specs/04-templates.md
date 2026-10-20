# 04 — Sistema de templates

## 4.1 Objetivo

Definir el contrato de los templates que la CLI copia y personaliza, de modo que:

- Todo proyecto generado tenga la estructura requerida.
- Los placeholders se resuelvan de forma determinista.
- Los templates se puedan validar antes de copiar.
- Se puedan agregar templates nuevos sin cambiar el núcleo.

## 4.2 Ubicación

```text
<repo-cli>/template/
```

El template estándar se incluye en el paquete publicado. La resolución debe funcionar tanto en desarrollo (`src/` con `tsx`) como en producción (`dist/cli/index.js`).

### Resolución de ruta

```typescript
const templateDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../template"
);
```

> En producción, `dist/cli/index.js` → `dist/generators/...` debe resolver a la raíz del paquete. Se recomienda calcular la raíz una sola vez y exponer `getTemplateDir()` desde `src/utils/paths.ts`.

### Reglas

- No usar `process.cwd()` para ubicar el template: el usuario puede ejecutar la CLI desde cualquier directorio.
- `process.cwd()` se usa solo para resolver el destino del proyecto.
- Si el template no existe, lanzar `E_TEMPLATE_MISSING`.

## 4.3 Manifiesto del template

Cada template debe incluir un manifiesto `template.json` (v0.3.0) con:

```json
{
  "id": "default",
  "name": "Default Autonomous QA Template",
  "version": "1.0.0",
  "description": "Playwright + TypeScript + autonomous QA skill",
  "engine": {
    "node": ">=20"
  },
  "requiredFiles": [
    "package.json",
    "README.md",
    "playwright.config.ts",
    ".gitignore",
    ".env.example",
    "tests/example.spec.ts",
    ".opencode/skills/autonomous-qa/skill.md"
  ],
  "directories": [
    "pages",
    "fixtures",
    "qa-results/defects",
    "qa-results/evidence",
    "qa-results/analytics",
    "qa-results/playwright"
  ],
  "variables": [
    "PROJECT_NAME",
    "PROJECT_PATH",
    "PACKAGE_NAME",
    "PACKAGE_MANAGER",
    "PACKAGE_MANAGER_FIELD",
    "INSTALL_COMMAND",
    "TEST_COMMAND",
    "AUTHOR",
    "DATE",
    "YEAR",
    "VERSION",
    "NODE_VERSION"
  ]
}
```

> En v0.1.0 el manifiesto es opcional; en v0.3.0 es obligatorio y validado.

## 4.4 Estructura del template estándar

```text
template/
├── .opencode/
│   └── skills/
│       └── autonomous-qa/
│           └── skill.md
├── tests/
│   └── example.spec.ts
├── pages/
│   └── .gitkeep
├── fixtures/
│   └── .gitkeep
├── qa-results/
│   ├── defects/
│   │   └── .gitkeep
│   ├── evidence/
│   │   └── .gitkeep
│   ├── analytics/
│   │   └── .gitkeep
│   └── playwright/
│       └── .gitkeep
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── playwright.config.ts
```

### Reglas sobre `.gitkeep`

- Se permite `.gitkeep` para preservar carpetas vacías.
- El Project Generator no debe eliminar `.gitkeep` en v0.1.0.
- En una versión futura se puede reemplazar por contenido real (page objects, fixtures).

## 4.5 Contexto de template

```typescript
export interface TemplateContext {
  PROJECT_NAME: string;          // "banking-qa"
  PROJECT_PATH: string;          // "banking-qa" o "clients/banking-qa"
  PACKAGE_NAME: string;          // nombre npm normalizado
  PACKAGE_MANAGER: string;       // "pnpm" | "bun"
  PACKAGE_MANAGER_FIELD: string; // "pnpm@12.14.0" | "bun@latest"
  INSTALL_COMMAND: string;       // "pnpm install" | "bun install"
  TEST_COMMAND: string;          // "pnpm test" | "bun test"
  AUTHOR: string;
  DATE: string;                  // ISO 8601 date: "2026-10-20"
  YEAR: string;                  // "2026"
  VERSION: string;               // versión de la CLI
  NODE_VERSION: string;          // ">=20"
}
```

### Fuentes de valores

| Variable | Fuente | Fallback |
|---|---|---|
| `PROJECT_NAME` | Argumento CLI (basename) | — (obligatorio) |
| `PROJECT_PATH` | Argumento CLI tal como se pasó | — |
| `PACKAGE_NAME` | Normalización npm del nombre | — |
| `PACKAGE_MANAGER` | Flag / default | `pnpm` |
| `PACKAGE_MANAGER_FIELD` | Constante del package manager | — |
| `INSTALL_COMMAND` | Constante del package manager | — |
| `TEST_COMMAND` | Constante del package manager | — |
| `AUTHOR` | `git config user.name` → `package.json` del usuario → `""` | `""` |
| `DATE` | Fecha local en formato `YYYY-MM-DD` | — |
| `YEAR` | Año de `DATE` | — |
| `VERSION` | `package.json` de la CLI | `0.0.0` |
| `NODE_VERSION` | `engines.node` de la CLI | `>=20` |

> `AUTHOR` no debe romper la generación si no se puede resolver. En ese caso se usa cadena vacía y el template debe tolerarlo.

## 4.6 Sintaxis de placeholders

```text
{{VARIABLE_NAME}}
```

### Reglas

- Nombres en mayúsculas, dígitos y guion bajo: `^[A-Z][A-Z0-9_]*$`.
- Sin espacios dentro de las llaves.
- Se reemplazan todas las ocurrencias.
- Los placeholders desconocidos son un error en v0.3.0.
- En v0.1.0 se permite dejar placeholders desconocidos, pero se advierte en modo `DEBUG`.

### Ejemplos

```markdown
# {{PROJECT_NAME}}

Package manager: {{PACKAGE_MANAGER}}
```

```json
{
  "name": "{{PACKAGE_NAME}}",
  "packageManager": "{{PACKAGE_MANAGER_FIELD}}"
}
```

## 4.7 Motor de templates

### Firma

```typescript
export function replaceTemplateVariables(
  content: string,
  context: Record<string, string | number | undefined>
): string;
```

### Algoritmo

```text
Entrada: content, context
Salida: content con placeholders reemplazados

1. Para cada [key, value] de context:
   a. Si value es undefined o null → usar "".
   b. placeholder = "{{" + key + "}}"
   c. content = content.split(placeholder).join(String(value))
2. Retornar content
```

### Por qué `split/join` y no `RegExp`

- Evita que caracteres especiales del valor (`$&`, `$1`, `\`) se interpreten.
- Es más rápido para múltiples ocurrencias.
- Es determinista.

### Detección de no resueltos

```typescript
const UNRESOLVED = /{{[A-Z][A-Z0-9_]*}}/g;

export function findUnresolvedVariables(content: string): string[] {
  return [...new Set(content.match(UNRESOLVED) ?? [])];
}
```

### Validación

- `package.json`, `README.md` y `skill.md` deben quedar sin placeholders.
- Otros archivos configurados también.
- Si quedan placeholders → `E_CONFIG_FAILED` con la lista.

## 4.8 Especificación por archivo

### 4.8.1 `package.json`

**Requisitos:**
- JSON válido.
- Campos de FR-004.
- Sin placeholders tras la configuración.

**Template base:**
```json
{
  "name": "{{PACKAGE_NAME}}",
  "version": "0.1.0",
  "private": true,
  "description": "Autonomous QA project generated by create-autonomous-qa",
  "type": "module",
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug",
    "report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.56.0",
    "@types/node": "^24.0.0",
    "typescript": "^5.9.0"
  }
}
```

**Después de la generación se agrega:**
```json
"packageManager": "{{PACKAGE_MANAGER_FIELD}}"
```

> El `packageManager` puede venir en el template o ser inyectado por `PackageJsonService`. La especificación prefiere inyección por servicio para mantener el template neutro.

### 4.8.2 `README.md`

**Debe incluir:**

1. Título `# {{PROJECT_NAME}}`.
2. Descripción.
3. Requisitos previos.
4. Instalación.
5. Ejecución de tests.
6. Estructura del proyecto.
7. Skill de QA autónomo.
8. Próximos pasos.

**Template:**
````markdown
# {{PROJECT_NAME}}

Autonomous QA project generated with **create-autonomous-qa**.

## Requirements

- Node.js {{NODE_VERSION}}
- {{PACKAGE_MANAGER}}

## Getting started

```bash
{{INSTALL_COMMAND}}
{{TEST_COMMAND}}
```

## Project structure

```text
.
├── tests/          # Playwright test suites
├── pages/          # Page objects
├── fixtures/       # Shared fixtures
├── qa-results/     # Defects, evidence, analytics, Playwright output
└── .opencode/      # AI skills
```

## Autonomous QA skill

This project includes the `autonomous-qa` skill at
`.opencode/skills/autonomous-qa/skill.md`.

The skill guides an AI agent through:

1. Functional discovery
2. Business rule detection
3. Scenario generation
4. Test case generation
5. Playwright code generation
6. Test execution
7. Evidence capture
8. Defect classification
9. Report generation

## Scripts

| Command | Description |
|---|---|
| `{{TEST_COMMAND}}` | Run all tests |
| `{{PACKAGE_MANAGER}} run test:ui` | Run tests in UI mode |
| `{{PACKAGE_MANAGER}} run report` | Show the last report |

## Generated by

create-autonomous-qa v{{VERSION}} — {{DATE}}
````

> Ajustar los comandos de UI/report según package manager si difieren; o usar `playwright` directamente.

### 4.8.3 `playwright.config.ts`

**Requisitos:**
- Configuración funcional de Playwright.
- Salida de reportes en `qa-results/playwright`.
- Evidencias en `qa-results/evidence`.
- `testDir: "./tests"`.
- `baseURL` desde `process.env.BASE_URL`.
- `trace`, `screenshot`, `video` en fallos.
- Reporter HTML + JSON.

**Contenido de referencia:**
```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { outputFolder: "qa-results/playwright/html", open: "never" }],
    ["json", { outputFile: "qa-results/playwright/results.json" }],
  ],
  outputDir: "qa-results/evidence",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
```

> El template actual está vacío; debe completarse en v0.2.0.

### 4.8.4 `tests/example.spec.ts`

**Requisitos:**
- Test ejecutable sin configuración adicional más allá de `BASE_URL`.
- No debe fallar por defecto si no hay aplicación.
- Debe demostrar uso de Playwright de forma mínima.

**Opción recomendada:** test de humo contra `BASE_URL` marcado con `test.skip` si no hay URL, o un test que valide la página de ejemplo de Playwright.

```typescript
import { test, expect } from "@playwright/test";

test("example: page has a title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/.+/);
});
```

> Si `BASE_URL` no está disponible, el test fallará. Se recomienda documentar `BASE_URL` en `.env.example` y permitir `test.skip(!process.env.BASE_URL)`.

### 4.8.5 `.env.example`

```dotenv
# Base URL of the application under test
BASE_URL=http://localhost:3000

# Optional: credentials for authenticated flows
QA_USER=
QA_PASSWORD=

# Optional: API endpoints
API_BASE_URL=

# Playwright
CI=
```

### 4.8.6 `.gitignore`

```gitignore
node_modules/
dist/
.env
.env.local
qa-results/evidence/*
!qa-results/evidence/.gitkeep
qa-results/playwright/*
!qa-results/playwright/.gitkeep
playwright-report/
test-results/
.DS_Store
Thumbs.db
*.log
```

> Decisión: las evidencias y la salida cruda de Playwright no se versionan; la estructura se preserva con `.gitkeep`. Los reportes de `qa-results/analytics/` y los defectos de `qa-results/defects/` sí pueden versionarse porque son artefactos de valor para el equipo.

### 4.8.7 `skill.md`

Ver `05-autonomous-qa-skill.md`.

### 4.8.8 `pages/` y `fixtures/`

- Carpetas vacías con `.gitkeep`.
- Sin archivos de ejemplo en v0.1.0.
- En v0.2.0 se puede agregar `pages/example.page.ts` y `fixtures/example.fixture.ts`.

## 4.9 Validación de templates

### Reglas (v0.3.0)

| ID | Regla | Error |
|---|---|---|
| TV-01 | `template/` existe | `E_TEMPLATE_MISSING` |
| TV-02 | `package.json` existe y es JSON válido | `E_TEMPLATE_INVALID` |
| TV-03 | `README.md` existe | `E_TEMPLATE_INVALID` |
| TV-04 | `playwright.config.ts` existe y no está vacío | `E_TEMPLATE_INVALID` |
| TV-05 | `tests/example.spec.ts` existe | `E_TEMPLATE_INVALID` |
| TV-06 | `skill.md` existe | `E_TEMPLATE_INVALID` |
| TV-07 | `.env.example` existe | `E_TEMPLATE_INVALID` |
| TV-08 | `.gitignore` existe | `E_TEMPLATE_INVALID` |
| TV-09 | Directorios requeridos existen | `E_TEMPLATE_INVALID` |
| TV-10 | Placeholders declarados en manifiesto | `E_TEMPLATE_INVALID` |
| TV-11 | Sin placeholders desconocidos | `E_TEMPLATE_INVALID` |
| TV-12 | Sin archivos binarios inesperados | `E_TEMPLATE_INVALID` |

### Comando de validación

```bash
create-autonomous-qa --validate-template
```

> v0.3.0. No forma parte de v0.1.0.

## 4.10 Versionado de templates

- Cada template declara `version` en `template.json`.
- La CLI registra la versión usada en `.create-autonomous-qa.json` (opcional).
- Cambios incompatibles en la estructura ⇒ major del template.
- Nuevos archivos opcionales ⇒ minor.
- Correcciones ⇒ patch.

## 4.11 Templates múltiples (v0.4.0)

```bash
create-autonomous-qa my-project --template banking
```

### Estructura

```text
templates/
├── default/
├── banking/
└── ecommerce/
```

### Reglas

- Cada template es autocontenido.
- Todos deben cumplir la estructura mínima.
- La selección por defecto es `default`.
- Un template desconocido produce error con la lista de disponibles.

## 4.12 Checklist de template

- [ ] `package.json` válido y con scripts requeridos.
- [ ] `README.md` con placeholders documentados.
- [ ] `playwright.config.ts` funcional.
- [ ] `tests/example.spec.ts` ejecutable.
- [ ] `.env.example` con variables documentadas.
- [ ] `.gitignore` con artefactos.
- [ ] `.opencode/skills/autonomous-qa/skill.md` completo.
- [ ] Carpetas `pages/`, `fixtures/`, `qa-results/*`.
- [ ] Sin placeholders desconocidos.
- [ ] Sin archivos temporales.
- [ ] Codificación UTF-8 sin BOM.
- [ ] Saltos de línea LF (o CRLF consistentes, ver 4.13).

## 4.13 Saltos de línea y codificación

- Todos los archivos de template se almacenan con **LF**.
- La CLI escribe con LF en todas las plataformas para determinismo.
- Los archivos se leen y escriben como UTF-8.
- No se debe agregar BOM.
- Los templates no deben contener caracteres de control salvo `\n` y `\t`.

## 4.14 Archivos binarios

- v0.1.0 no incluye binarios.
- Si en el futuro se incluyen (imágenes, fuentes), deben declararse en el manifiesto y copiarse sin pasar por el TemplateEngine.
EOF
