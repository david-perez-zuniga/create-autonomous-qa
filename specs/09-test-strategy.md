# 09 — Estrategia de pruebas

## 9.1 Objetivo

Definir cómo se verifica que la CLI cumple las specs 01–08, con énfasis en:

- Correctitud de la generación.
- Contrato de salida.
- Manejo de errores y rollback.
- Multiplataforma.
- Determinismo.
- Rendimiento.
- Seguridad de rutas.

## 9.2 Pirámide

```text
        ┌─────────────────────┐
        │ E2E / tarball       │  pocas, lentas, alto valor
        ├─────────────────────┤
        │ Integración CLI     │  moderadas
        ├─────────────────────┤
        │ Unitarias           │  muchas, rápidas
        └─────────────────────┘
```

| Nivel | Cantidad objetivo | Alcance |
|---|---|---|
| Unitarias | 60–70 % | Utils y Services |
| Integración | 20–30 % | Generator + FS temporal |
| E2E | 5–10 % | Binario + tarball |

## 9.3 Herramientas

| Propósito | Herramienta | Versión |
|---|---|---|
| Test runner | `vitest` | latest |
| Ejecutar CLI | `execa` | latest |
| FS temporal | `node:fs` + `mkdtemp` | nativo |
| FS en memoria | `memfs` | latest |
| Snapshots | `vitest` | latest |
| Cobertura | `vitest --coverage` (v8) | latest |
| Lint | `eslint` + `typescript-eslint` | latest |
| Formato | `prettier` | latest |
| Benchmark | `hyperfine` (local/CI opcional) | latest |

## 9.4 Estructura de tests

```text
tests/
├── unit/
│   ├── template-engine.test.ts
│   ├── project-name.test.ts
│   ├── package-manager.test.ts
│   ├── package-json-service.test.ts
│   ├── readme-service.test.ts
│   ├── skill-service.test.ts
│   ├── console-service.test.ts
│   └── paths.test.ts
├── integration/
│   ├── generator.test.ts
│   ├── rollback.test.ts
│   ├── structure.test.ts
│   └── errors.test.ts
├── e2e/
│   ├── cli-help.test.ts
│   ├── cli-version.test.ts
│   ├── cli-generate.test.ts
│   ├── cli-pnpm.test.ts
│   ├── cli-bun.test.ts
│   └── tarball.test.ts
├── fixtures/
│   ├── templates/
│   │   ├── minimal/
│   │   └── invalid/
│   └── expected/
└── helpers/
    ├── temp-dir.ts
    ├── run-cli.ts
    └── snapshot-tree.ts
```

## 9.5 Pruebas unitarias

### 9.5.1 TemplateEngine

| ID | Caso | Esperado |
|---|---|---|
| UT-TE-01 | Reemplazo simple | `{{NAME}}` → `demo` |
| UT-TE-02 | Múltiples ocurrencias | Todas reemplazadas |
| UT-TE-03 | Valor con `$&` | Se inserta literal |
| UT-TE-04 | Valor con `$1` | Se inserta literal |
| UT-TE-05 | Valor con `\` | Se inserta literal |
| UT-TE-06 | Clave ausente | Permanece `{{KEY}}` |
| UT-TE-07 | `undefined` | Se reemplaza por `""` |
| UT-TE-08 | Detección de no resueltos | Lista correcta |
| UT-TE-09 | Sin placeholders | Lista vacía |
| UT-TE-10 | Placeholder mal formado `{{name}}` | No se reemplaza, se reporta si se valida |
| UT-TE-11 | Contenido vacío | `""` |
| UT-TE-12 | Unicode | Se preserva |

### 9.5.2 Project name

| ID | Caso | Esperado |
|---|---|---|
| UT-PN-01 | `demo` | válido |
| UT-PN-02 | `Demo` | normaliza a `demo` |
| UT-PN-03 | `my project` | normaliza a `my-project` |
| UT-PN-04 | `..` | inválido |
| UT-PN-05 | `.` | inválido |
| UT-PN-06 | `/abs/path` | inválido en v0.1.0 |
| UT-PN-07 | `../escape` | inválido |
| UT-PN-08 | `CON` | inválido (Windows) |
| UT-PN-09 | `demo.` | inválido (Windows) |
| UT-PN-10 | `demo ` | inválido |
| UT-PN-11 | `a`.repeat(215) | inválido como npm |
| UT-PN-12 | `@scope/name` | válido como package name |

### 9.5.3 Package managers

| ID | Caso | Esperado |
|---|---|---|
| UT-PM-01 | default | pnpm |
| UT-PM-02 | `--pnpm` | pnpm |
| UT-PM-03 | `--bun` | bun |
| UT-PM-04 | ambos | error |
| UT-PM-05 | comandos pnpm | install/test correctos |
| UT-PM-06 | comandos bun | install/test correctos |

### 9.5.4 PackageJsonService

| ID | Caso | Esperado |
|---|---|---|
| UT-PJ-01 | JSON válido | campos actualizados |
| UT-PJ-02 | JSON inválido | `E_CONFIG_FAILED` |
| UT-PJ-03 | archivo ausente | `E_CONFIG_FAILED` |
| UT-PJ-04 | campos extra | preservados |
| UT-PJ-05 | idempotencia | mismo resultado |
| UT-PJ-06 | newline final | presente |
| UT-PJ-07 | indentación | 2 espacios |
| UT-PJ-08 | `packageManager` default | pnpm |

### 9.5.5 ReadmeService

| ID | Caso | Esperado |
|---|---|---|
| UT-RM-01 | placeholders | reemplazados |
| UT-RM-02 | sin placeholders | sin cambios |
| UT-RM-03 | archivo ausente | no rompe (o error definido) |
| UT-RM-04 | placeholders desconocidos | `E_CONFIG_FAILED` |
| UT-RM-05 | idempotencia | mismo resultado |
| UT-RM-06 | UTF-8 | preservado |

### 9.5.6 SkillService

| ID | Caso | Esperado |
|---|---|---|
| UT-SK-01 | template presente | copia y personaliza |
| UT-SK-02 | template ausente | `E_TEMPLATE_MISSING` |
| UT-SK-03 | placeholders | reemplazados |
| UT-SK-04 | idempotencia | mismo resultado |
| UT-SK-05 | crea directorios | `.opencode/skills/autonomous-qa/` |
| UT-SK-06 | frontmatter | `name` y `description` |

### 9.5.7 ConsoleService

| ID | Caso | Esperado |
|---|---|---|
| UT-CS-01 | banner | texto exacto |
| UT-CS-02 | success | `✅` + mensaje |
| UT-CS-03 | error | `stderr` + `❌` |
| UT-CS-04 | nextSteps pnpm | comandos pnpm |
| UT-CS-05 | nextSteps bun | comandos bun |
| UT-CS-06 | `NO_COLOR` | sin ANSI |
| UT-CS-07 | no TTY | sin ANSI |

## 9.6 Pruebas de integración

### 9.6.1 Generación completa

| ID | Caso | Esperado |
|---|---|---|
| IT-GEN-01 | nombre simple | estructura completa |
| IT-GEN-02 | nombre con subruta | ruta creada, package name basename |
| IT-GEN-03 | `--pnpm` | packageManager y próximos pasos |
| IT-GEN-04 | `--bun` | packageManager y próximos pasos |
| IT-GEN-05 | default | pnpm |
| IT-GEN-06 | sin placeholders | 0 `{{` en archivos configurados |
| IT-GEN-07 | JSON válido | parsea sin error |
| IT-GEN-08 | estructura | coincide con snapshot |
| IT-GEN-09 | determinismo | dos ejecuciones iguales |
| IT-GEN-10 | `.gitkeep` | carpetas preservadas |

### 9.6.2 Errores y rollback

| ID | Caso | Esperado |
|---|---|---|
| IT-ERR-01 | destino existente | `E_DIR_EXISTS`, sin cambios |
| IT-ERR-02 | destino vacío | error conservador |
| IT-ERR-03 | template ausente | `E_TEMPLATE_MISSING` |
| IT-ERR-04 | fallo de copia | rollback |
| IT-ERR-05 | JSON inválido | rollback |
| IT-ERR-06 | sin permisos | `E_PERMISSION` (skip en root) |
| IT-ERR-07 | path traversal | `E_INVALID_NAME` |

### 9.6.3 Helpers

```typescript
// tests/helpers/temp-dir.ts
export async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "caqa-"));
  try {
    return await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}
```

```typescript
// tests/helpers/run-cli.ts
import { execa } from "execa";

export function runCli(args: string[], cwd: string) {
  return execa(process.execPath, ["dist/cli/index.js", ...args], {
    cwd,
    reject: false,
    env: { ...process.env, NO_COLOR: "1", CI: "1" },
  });
}
```

## 9.7 Pruebas E2E

### 9.7.1 Comandos

| ID | Caso | Esperado |
|---|---|---|
| E2E-01 | `--help` | exit 0, uso y flags |
| E2E-02 | `--version` | exit 0, versión de package.json |
| E2E-03 | sin args | exit 0, ayuda |
| E2E-04 | `demo` | exit 0, estructura |
| E2E-05 | `demo --pnpm` | exit 0, pnpm |
| E2E-06 | `demo --bun` | exit 0, bun |
| E2E-07 | `demo --pnpm --bun` | exit 1, error |
| E2E-08 | destino existente | exit 1, error |
| E2E-09 | `--unknown` | exit 1, error |
| E2E-10 | sin TTY | sin ANSI, no bloqueo |

### 9.7.2 Tarball

| ID | Caso | Esperado |
|---|---|---|
| E2E-TAR-01 | `npm pack --dry-run` | incluye `dist/` y `template/` |
| E2E-TAR-02 | instalar tarball en temp | bin disponible |
| E2E-TAR-03 | ejecutar desde otro cwd | template resuelto |
| E2E-TAR-04 | estructura generada | completa |

```bash
npm pack
mkdir -p /tmp/caqa-e2e && cd /tmp/caqa-e2e
npm init -y
npm install /path/to/create-autonomous-qa-0.1.0.tgz
npx create-autonomous-qa demo
test -f demo/.opencode/skills/autonomous-qa/skill.md
```

## 9.8 Snapshots

### Árbol de archivos

```typescript
export async function snapshotTree(root: string): Promise<string[]> {
  const entries: string[] = [];
  async function walk(dir: string) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const rel = path.relative(root, full).split(path.sep).join("/");
      if (entry.isDirectory()) {
        entries.push(`${rel}/`);
        await walk(full);
      } else {
        entries.push(rel);
      }
    }
  }
  await walk(root);
  return entries.sort();
}
```

### Reglas

- Los snapshots deben ser estables entre plataformas: rutas con `/`, sin rutas absolutas, sin timestamps.
- Si un snapshot cambia, revisar si es intencional y actualizar con justificación.
- No usar snapshots para mensajes que incluyan fechas o rutas temporales.

## 9.9 Matriz de compatibilidad

### CI

| OS | Node 20 | Node 22 | Node 24 |
|---|---|---|---|
| ubuntu-latest | ✅ | ✅ | ✅ |
| macos-latest | ✅ | ✅ | — |
| windows-latest | ✅ | ✅ | — |

### Package managers

| Manager | Test |
|---|---|
| pnpm | Instalación del repo + generación |
| npm | Instalación del tarball |
| bun | Instalación del tarball + generación |

### Entornos

| Entorno | Verificación |
|---|---|
| TTY | Salida con color |
| No TTY | Sin color, sin bloqueo |
| `CI=1` | Sin color, sin prompts |
| `NO_COLOR=1` | Sin color |
| Sin red | Generación funciona |
| Ruta con espacios | Generación funciona |
| Ruta Unicode | Generación funciona |

## 9.10 Cobertura

### Umbrales

| Versión | Líneas | Ramas | Funciones |
|---|---|---|---|
| 0.1.0 | 50 % | 40 % | 50 % |
| 0.2.0 | 70 % | 60 % | 70 % |
| 0.3.0 | 80 % | 70 % | 80 % |
| 1.0.0 | 85 % | 75 % | 85 % |

### Exclusiones

- `src/cli/index.ts` (bootstrap) puede excluirse de cobertura unitaria, pero debe cubrirse con E2E.
- Archivos de tipos.
- Constantes.

## 9.11 Rendimiento

```bash
hyperfine --warmup 3 --runs 10 \
  "node dist/cli/index.js /tmp/caqa-bench-1" \
  --prepare "rm -rf /tmp/caqa-bench-1"
```

### Criterios

- Mediana < 3 s.
- p95 < 5 s.
- Sin crecimiento lineal con el número de archivos del template (dentro de lo razonable).
- Sin llamadas de red.

## 9.12 Seguridad

| ID | Caso | Esperado |
|---|---|---|
| SEC-01 | `../../etc/passwd` | rechazado |
| SEC-02 | `/etc/passwd` | rechazado |
| SEC-03 | symlink en template | no seguido |
| SEC-04 | nombre con `\0` | rechazado |
| SEC-05 | nombre con `..` | rechazado |
| SEC-06 | `.env` real | no leído |
| SEC-07 | dependencias | `pnpm audit` sin high/critical |

## 9.13 Datos de prueba

- Usar templates de fixture en `tests/fixtures/templates/`.
- No usar el template real para tests unitarios de servicios.
- Usar `mkdtemp` para integración.
- Limpiar siempre con `finally`.
- No escribir en el repositorio durante los tests.
- No usar rutas absolutas fijas.

## 9.14 CI

### Pipeline

```yaml
name: ci
on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [20, 22]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
      - run: pnpm test:coverage
```

### Reglas

- `pnpm install --frozen-lockfile` en CI.
- Fallar ante lint, tipos o tests.
- Ejecutar E2E del tarball en al menos un job.
- Publicar cobertura como artefacto.
- No publicar en npm desde PRs.

## 9.15 Criterios de aceptación de la estrategia

- [ ] Todos los FR tienen al menos un test.
- [ ] Todos los errores del catálogo tienen un test.
- [ ] La estructura generada tiene snapshot.
- [ ] El contrato de consola tiene snapshot.
- [ ] El tarball se prueba instalado.
- [ ] CI cubre 3 OS.
- [ ] Cobertura cumple el umbral de la versión.
- [ ] Rendimiento dentro del presupuesto.
- [ ] Seguridad de rutas verificada.
EOF
