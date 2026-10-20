# 08 — Brechas de implementación

> **Estado (2026-10-20):** las brechas descritas en este documento fueron cerradas. Ver `../tasks/00-checklist.md` para la verificación y `../tasks/` para el detalle de cada tarea.

## 8.1 Método

Comparación entre las specs (01–07) y el estado del repositorio en la fecha de este documento.

Estados:

- ✅ Implementado y alineado.
- ⚠️ Implementado parcialmente o con desviaciones.
- ❌ No implementado.
- 🧪 No verificable (sin tests).

## 8.2 Resumen ejecutivo

La CLI existe y genera un proyecto, pero **no cumple todavía con la estructura, la skill, el contrato de salida ni la robustez** definidos en las specs. Los riesgos principales son:

1. El template está incompleto (faltan `.opencode/`, `.env.example`, `.gitignore`, `pages/`, `fixtures/`, `qa-results/` y contenido en archivos clave).
2. `SkillService` es un stub; nunca se instala la skill.
3. La resolución de `templateDir` con `process.cwd()` falla cuando la CLI se ejecuta desde otro directorio o desde el paquete instalado.
4. No hay tests, lint, formato ni CI.
5. El contrato de consola no coincide con la spec.

## 8.3 Tabla de brechas

### 8.3.1 CLI

| ID | Requisito | Estado actual | Brecha | Prioridad |
|---|---|---|---|---|
| G-001 | Versión desde `package.json` | `"0.1.0"` hardcodeado en `src/cli/index.ts` | Leer versión real | Alta |
| G-002 | Validación `--pnpm` + `--bun` | No valida | Agregar conflicto | Alta |
| G-003 | Validación de nombre | No valida | Implementar `project-name.ts` | Alta |
| G-004 | `--help` con ejemplos | Commander genera ayuda básica | Agregar `addHelpText` | Media |
| G-005 | Manejo de errores y exit codes | `console.error` + `process.exit(1)` | `CliError` + `process.exitCode` | Alta |
| G-006 | Sin salida de debug de opciones | Imprime `options` | Eliminar | Alta |
| G-007 | `GeneratorOptions` con package manager | Solo `bun?` y `pnpm?` | Tipar `PackageManagerId` | Media |
| G-008 | No interactivo | Cumple | — | — |
| G-009 | Color condicional a TTY | No aplica | Implementar en ConsoleService | Baja |

### 8.3.2 Project Generator

| ID | Requisito | Estado actual | Brecha | Prioridad |
|---|---|---|---|---|
| G-010 | Resolver `templateDir` desde el paquete | `path.join(process.cwd(), "template")` | Usar `import.meta.url` + `paths.ts` | Crítica |
| G-011 | Rollback ante fallo | No implementado | Implementar | Alta |
| G-012 | Delegar toda escritura a Services | Copia template directamente | Aceptable para copia; documentar excepción | Media |
| G-013 | Construir `TemplateContext` | Solo pasa nombre | Implementar contexto completo | Alta |
| G-014 | Llamar a `SkillService` | No lo llama | Integrar | Alta |
| G-015 | Mensajes de progreso | Mensajes distintos y en español | Alinear a FR-008 | Alta |
| G-016 | Retornar resultado | Retorna `void` | Retornar `CreateProjectResult` | Media |
| G-017 | Idempotencia | No aplica | Definir y testear | Baja |

### 8.3.3 Servicios

| ID | Requisito | Estado actual | Brecha | Prioridad |
|---|---|---|---|---|
| G-018 | `PackageJsonService` nombre npm normalizado | Usa el argumento tal cual | Normalizar | Alta |
| G-019 | `PackageJsonService` `packageManager` siempre presente | Opcional | Default pnpm | Alta |
| G-020 | `PackageJsonService` newline final | No garantiza | Agregar `\n` | Media |
| G-021 | `ReadmeService` variables completas | Solo `PROJECT_NAME` | Usar `TemplateContext` | Alta |
| G-022 | `ReadmeService` detectar placeholders | No detecta | Agregar validación | Alta |
| G-023 | `SkillService` real | Solo `console.log` | Implementar copia + personalización | Crítica |
| G-024 | `ConsoleService` contrato | Mensajes divergentes | Reescribir según FR-008 | Alta |
| G-025 | `ConsoleService` `stderr` para errores | Usa `console.error` en Generator | Centralizar | Media |
| G-026 | `TemplateEngine` escape de `$` | Usa `RegExp` con valor | Usar `split/join` | Alta |
| G-027 | `TemplateEngine` detección de no resueltos | No detecta | Agregar función | Alta |
| G-028 | `template-engine` tipos | `Record<string, string>` | `TemplateContext` | Media |
| G-029 | `project-name` util | No existe | Implementar | Alta |
| G-030 | `paths` util | No existe | Implementar | Crítica |

### 8.3.4 Template

| ID | Requisito | Estado actual | Brecha | Prioridad |
|---|---|---|---|---|
| G-031 | `.opencode/skills/autonomous-qa/skill.md` | No existe en `template/` | Crear | Crítica |
| G-032 | `.env.example` | No existe | Crear | Alta |
| G-033 | `.gitignore` | No existe en template | Crear | Alta |
| G-034 | `pages/` | No existe en template | Crear con `.gitkeep` | Alta |
| G-035 | `fixtures/` | No existe en template | Crear con `.gitkeep` | Alta |
| G-036 | `qa-results/defects/` | No existe en template | Crear | Alta |
| G-037 | `qa-results/evidence/` | No existe en template | Crear | Alta |
| G-038 | `qa-results/analytics/` | No existe en template | Crear | Alta |
| G-039 | `qa-results/playwright/` | No existe en template | Crear | Alta |
| G-040 | `playwright.config.ts` | Archivo vacío | Implementar configuración | Crítica |
| G-041 | `tests/example.spec.ts` | Archivo vacío | Implementar test de ejemplo | Crítica |
| G-042 | `README.md` | Contenido en una sola línea y sin formato | Reescribir | Alta |
| G-043 | `package.json` scripts y deps | Existe, pero sin `packageManager` | Inyectar vía servicio | Media |
| G-044 | `template.json` | No existe | Agregar en v0.3.0 | Media |

### 8.3.5 Build y distribución

| ID | Requisito | Estado actual | Brecha | Prioridad |
|---|---|---|---|---|
| G-045 | `tsconfig` con `outDir` y `rootDir` | Comentados | Configurar `dist/` | Crítica |
| G-046 | Shebang en bin | No generado | Agregar banner o script postbuild | Crítica |
| G-047 | `files` en `package.json` | Ausente | Agregar `dist`, `template`, docs | Alta |
| G-048 | `LICENSE` | Ausente | Agregar MIT | Media |
| G-049 | `prepublishOnly` | `pnpm build` | Añadir tests y lint | Media |
| G-050 | Smoke test del tarball | No existe | Agregar en v0.3.0 | Alta |
| G-051 | Resolución de template en `dist/` | Rota | Ver G-010/G-030 | Crítica |

### 8.3.6 Calidad

| ID | Requisito | Estado actual | Brecha | Prioridad |
|---|---|---|---|---|
| G-052 | Tests unitarios | No existen | Implementar con Vitest | Alta |
| G-053 | Tests de integración CLI | No existen | Implementar con execa | Alta |
| G-054 | Tests de estructura generada | No existen | Snapshot | Alta |
| G-055 | Lint | No configurado | ESLint | Media |
| G-056 | Formato | No configurado | Prettier | Media |
| G-057 | CI | No configurado | GitHub Actions | Alta |
| G-058 | Cobertura | No medida | Configurar coverage | Media |
| G-059 | README del repositorio | Solo título | Documentar | Alta |
| G-060 | CHANGELOG | No existe | Agregar | Baja |

### 8.3.7 Documentación y specs

| ID | Requisito | Estado actual | Brecha | Prioridad |
|---|---|---|---|---|
| G-061 | Specs | Creadas en `specs/` | Mantener actualizadas | — |
| G-062 | Guía de contribución | No existe | Agregar | Baja |
| G-063 | Código de conducta | No existe | Agregar | Baja |
| G-064 | Ejemplos de uso | No existen | Agregar al README | Media |

## 8.4 Detalle de brechas críticas

### G-010 / G-051 — Resolución del template

**Actual:**
```typescript
const templateDir = path.join(process.cwd(), "template");
```

**Problema:**
- Si el usuario ejecuta `create-autonomous-qa` desde `/home/user/projects`, busca `/home/user/projects/template`.
- Si la CLI está instalada globalmente, el template vive en `node_modules/create-autonomous-qa/template`, no en `cwd`.
- En `dist/generators/project-generator.js`, la ruta relativa cambia.

**Solución:**
```typescript
// src/utils/paths.ts
import path from "node:path";
import { fileURLToPath } from "node:url";

const CLI_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

export function getTemplateDir(): string {
  return path.join(CLI_ROOT, "template");
}
```

> Ajustar la profundidad según la ubicación final de `paths.ts` (`src/utils` → raíz = `../..`; en `dist/utils` → raíz = `../..`). Verificar con test.

### G-023 — SkillService

**Actual:**
```typescript
export function updateSkill() {
  console.log("🤖 Skill configurada");
}
```

**Solución:**
```typescript
export function installSkill(input: SkillInput): void {
  const source = path.join(input.templateDir, SKILL_PATH);
  const destination = path.join(input.targetDir, SKILL_PATH);

  if (!fs.existsSync(source)) {
    throw new CliError("E_TEMPLATE_MISSING", `Missing skill template: ${source}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const content = fs.readFileSync(source, "utf8");
  const rendered = replaceTemplateVariables(content, input.context);
  assertNoUnresolvedVariables(rendered, destination);
  fs.writeFileSync(destination, rendered, "utf8");
}
```

### G-040 / G-041 — Archivos vacíos

`template/playwright.config.ts` y `template/tests/example.spec.ts` están vacíos (0 bytes). Esto produce proyectos que no pueden ejecutar tests.

**Solución:** usar el contenido de referencia de `04-templates.md` § 4.8.3 y § 4.8.4.

### G-042 — README del template

**Actual:** una sola línea sin saltos:
```text
# {{PROJECT_NAME}} Proyecto generado por create-autonomous-qa. ## 🚀 Primeros pasos pnpm install pnpm test
```

**Solución:** reemplazar por el template de `04-templates.md` § 4.8.2.

### G-045 / G-046 — Build

**Actual (`tsconfig.json`):**
```json
// "rootDir": "./src",
// "outDir": "./dist",
```

**Solución:**
```json
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "nodenext",
    "target": "esnext",
    "moduleResolution": "nodenext",
    "strict": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Shebang:** agregar `#!/usr/bin/env node` como primera línea de `src/cli/index.ts`. TypeScript lo preserva si está al inicio del archivo.

### G-052 / G-053 — Tests

No hay ningún test. Se propone:

```text
tests/
├── unit/
│   ├── template-engine.test.ts
│   ├── project-name.test.ts
│   ├── package-json-service.test.ts
│   ├── readme-service.test.ts
│   └── skill-service.test.ts
└── integration/
    ├── cli.test.ts
    └── generation.test.ts
```

Ver `09-test-strategy.md`.

## 8.5 Backlog priorizado

### Sprint 1 — Cerrar el flujo principal (v0.1.0 → base de v0.2.0)

| Orden | Tarea | Brechas | Estimación |
|---|---|---|---|
| 1 | `paths.ts` + resolver template desde el paquete | G-010, G-030, G-051 | S |
| 2 | Completar template (skill, config, example, env, gitignore, carpetas) | G-031…G-044 | M |
| 3 | `project-name.ts` + validación | G-003, G-018 | S |
| 4 | `TemplateContext` + TemplateEngine robusto | G-013, G-021, G-026, G-027 | M |
| 5 | `SkillService` real | G-023 | S |
| 6 | `ConsoleService` según contrato | G-015, G-024, G-025 | S |
| 7 | `package.json` con `packageManager` default | G-019, G-020 | S |
| 8 | `tsconfig` + shebang + `files` | G-045, G-046, G-047 | S |
| 9 | Manejo de errores + rollback | G-005, G-011 | M |
| 10 | Tests unitarios e integración base | G-052…G-054 | M |

### Sprint 2 — Calidad y documentación (v0.2.0)

| Orden | Tarea | Brechas |
|---|---|---|
| 11 | README del repositorio | G-059 |
| 12 | ESLint + Prettier | G-055, G-056 |
| 13 | CI matrix | G-057 |
| 14 | Cobertura | G-058 |
| 15 | Idempotencia | G-017 |
| 16 | `--help` con ejemplos | G-004 |
| 17 | CHANGELOG y LICENSE | G-048, G-060 |
| 18 | Guía de contribución | G-062, G-063 |

### Sprint 3 — Validación y distribución (v0.3.0)

| Orden | Tarea | Brechas |
|---|---|---|
| 19 | `TemplateValidator` + manifiesto | G-044 |
| 20 | `--validate-template` | — |
| 21 | `--install` / `--with-browsers` | — |
| 22 | Smoke test del tarball | G-050 |
| 23 | `--debug` | — |

## 8.6 Criterios de cierre de brechas

Una brecha se considera cerrada cuando:

- [ ] El código implementa el comportamiento especificado.
- [ ] Existe al menos un test que lo cubre.
- [ ] La documentación relevante está actualizada.
- [ ] Funciona en Linux, macOS y Windows.
- [ ] No introduce regresiones en el flujo principal.
- [ ] El cambio está en el CHANGELOG (desde v0.2.0).

## 8.7 Riesgos de no cerrar brechas

| Brecha | Consecuencia |
|---|---|
| G-010/G-051 | La CLI falla al instalarse vía npm/pnpm/bunx |
| G-023 | No se cumple la promesa central de "QA autónomo" |
| G-031…G-041 | El proyecto generado no ejecuta tests ni tiene skill |
| G-045/G-046 | El bin no funciona tras el build |
| G-052…G-054 | Regresiones silenciosas |
| G-057 | Fallos en plataformas no probadas |
| G-059 | Baja adopción y soporte |
EOF
