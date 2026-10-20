# 10 — Referencia de CLI

## 10.1 Sinopsis

```bash
create-autonomous-qa [options] <project-name>
```

## 10.2 Descripción

Genera un proyecto de QA autónomo con Playwright, TypeScript, estructura de artefactos y una skill de IA.

La CLI **no instala dependencias ni ejecuta pruebas**. Solo crea y configura el proyecto.

## 10.3 Argumentos

| Argumento | Obligatorio | Descripción |
|---|---|---|
| `<project-name>` | Sí | Nombre o ruta relativa del proyecto a crear |

### Reglas

- Se interpreta relativo al directorio actual.
- El `basename` se usa como nombre del paquete.
- No se permiten rutas absolutas en v0.1.0.
- No se permite escapar del directorio actual con `..`.
- Se rechazan nombres reservados de Windows.

## 10.4 Opciones

| Opción | Alias | Descripción | Desde |
|---|---|---|---|
| `--pnpm` | — | Configura el proyecto para pnpm | 0.1.0 |
| `--bun` | — | Configura el proyecto para Bun | 0.1.0 |
| `-V, --version` | `-V` | Muestra la versión | 0.1.0 |
| `-h, --help` | `-h` | Muestra la ayuda | 0.1.0 |

### Opciones futuras

| Opción | Descripción | Versión |
|---|---|---|
| `--template <name>` | Selecciona un template | 0.4.0 |
| `--install` | Instala dependencias | 0.3.0 |
| `--with-browsers` | Instala navegadores de Playwright | 0.3.0 |
| `--debug` | Muestra stack traces | 0.3.0 |
| `--dry-run` | Muestra acciones sin escribir | 0.3.0 |
| `--validate-template` | Valida el template | 0.3.0 |
| `--force` | Sobrescribe el destino | Sin definir |
| `--no-color` | Desactiva color | 0.2.0 |

## 10.5 Matriz de comportamiento

| Entrada | Resultado | Exit |
|---|---|---|
| `create-autonomous-qa demo` | Proyecto pnpm | 0 |
| `create-autonomous-qa demo --pnpm` | Proyecto pnpm | 0 |
| `create-autonomous-qa demo --bun` | Proyecto bun | 0 |
| `create-autonomous-qa demo --pnpm --bun` | Error de conflicto | 1 |
| `create-autonomous-qa` | Ayuda | 0 |
| `create-autonomous-qa --help` | Ayuda | 0 |
| `create-autonomous-qa --version` | Versión | 0 |
| `create-autonomous-qa demo extra` | Error de argumentos | 1 |
| `create-autonomous-qa --unknown` | Error de opción | 1 |
| `create-autonomous-qa demo` (existe) | Error de colisión | 1 |
| `create-autonomous-qa ..` | Error de nombre | 1 |

## 10.6 Salida

### Flujo feliz

```text
🚀 Creating Autonomous QA Project

✅ Template copied
✅ package.json configured
✅ README configured
✅ Skill installed

Project created successfully

Next steps:

cd banking-qa
pnpm install
pnpm test
```

### Con Bun

```text
🚀 Creating Autonomous QA Project

✅ Template copied
✅ package.json configured
✅ README configured
✅ Skill installed

Project created successfully

Next steps:

cd banking-qa
bun install
bun test
```

### Error de colisión

```text
❌ Directory "banking-qa" already exists
```

### Error de flags

```text
❌ Choose either --pnpm or --bun, not both
```

### Error de nombre

```text
❌ Invalid project name: ..
```

## 10.7 Streams

| Stream | Contenido |
|---|---|
| `stdout` | Banner, progreso, éxito, próximos pasos, ayuda, versión |
| `stderr` | Errores |

### Reglas

- No mezclar errores en `stdout`.
- No imprimir stack traces salvo `DEBUG`.
- No imprimir objetos de opciones.
- No usar `console.log` directamente fuera de `ConsoleService`.

## 10.8 Exit codes

| Código | Significado |
|---|---|
| 0 | Éxito, ayuda o versión |
| 1 | Error de uso, validación, colisión o generación |
| 2 | Reservado para error inesperado |

## 10.9 Variables de entorno

| Variable | Efecto | Desde |
|---|---|---|
| `NO_COLOR` | Desactiva ANSI | 0.1.0 |
| `CI` | Desactiva ANSI y spinners | 0.1.0 |
| `DEBUG` | Muestra detalles y stack traces | 0.3.0 |

### Ejemplo

```bash
NO_COLOR=1 create-autonomous-qa demo
```

## 10.10 Archivos generados

```text
<project-name>/
├── .opencode/
│   └── skills/
│       └── autonomous-qa/
│           └── skill.md
├── tests/
│   └── example.spec.ts
├── pages/
├── fixtures/
├── qa-results/
│   ├── defects/
│   ├── evidence/
│   ├── analytics/
│   └── playwright/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── playwright.config.ts
```

## 10.11 Configuración del proyecto generado

| Aspecto | pnpm | Bun |
|---|---|---|
| `packageManager` | `pnpm@12.14.0` | `bun@latest` |
| Instalación | `pnpm install` | `bun install` |
| Tests | `pnpm test` | `bun test` |
| Lockfile | `pnpm-lock.yaml` | `bun.lock` |
| Runtime | Node.js >= 20 | Bun >= 1.1 / Node >= 20 |

> **Nota:** `bun test` usa el runner nativo de Bun y no es compatible con `@playwright/test`. Para ejecutar la suite Playwright se recomienda `bun run test` (script `"test": "playwright test"`). Ver `02-requirements.md` § 2.7.

## 10.12 Ejemplos

### Crear un proyecto básico

```bash
create-autonomous-qa banking-qa
cd banking-qa
pnpm install
pnpm test
```

### Crear con pnpm explícito

```bash
create-autonomous-qa banking-qa --pnpm
```

### Crear con Bun

```bash
create-autonomous-qa banking-qa --bun
cd banking-qa
bun install
bun test
```

### Usar sin instalación global

```bash
pnpm dlx create-autonomous-qa banking-qa
```

```bash
bunx create-autonomous-qa banking-qa
```

```bash
npx create-autonomous-qa banking-qa
```

### Ayuda

```bash
create-autonomous-qa --help
```

### Versión

```bash
create-autonomous-qa --version
```

## 10.13 Catálogo de errores

| Código | Mensaje | Causa | Solución |
|---|---|---|---|
| `E_DIR_EXISTS` | `Directory "<name>" already exists` | Destino ocupado | Elegir otro nombre o eliminar el directorio |
| `E_INVALID_NAME` | `Invalid project name: <name>` | Nombre inválido | Usar un nombre válido |
| `E_CONFLICT_FLAGS` | `Choose either --pnpm or --bun, not both` | Flags incompatibles | Usar uno solo |
| `E_TEMPLATE_MISSING` | `Template not found. Reinstall create-autonomous-qa` | Instalación corrupta | Reinstalar |
| `E_PERMISSION` | `Permission denied writing to <path>` | Sin permisos | Cambiar permisos o directorio |
| `E_COPY_FAILED` | `Failed to copy template: <detail>` | Error de FS | Revisar disco/permisos |
| `E_CONFIG_FAILED` | `Failed to configure <file>: <detail>` | JSON/placeholder inválido | Revisar template o reportar |
| `E_UNKNOWN` | `Unexpected error: <detail>` | Error no controlado | Reportar con `DEBUG=1` |

## 10.14 Comportamiento en entornos no interactivos

- No hay prompts.
- No hay spinners persistentes.
- No hay animaciones.
- No hay espera de input.
- La salida es estable y parseable.
- El color se desactiva si `!process.stdout.isTTY` o `NO_COLOR` o `CI`.

## 10.15 Compatibilidad

| Entorno | Soportado |
|---|---|
| Linux | Sí |
| macOS | Sí |
| Windows 10/11 | Sí |
| GitHub Codespaces | Sí |
| Docker | Sí |
| WSL2 | Sí |
| Node.js >= 20 | Sí |
| pnpm >= 10 | Sí |
| npm >= 10 | Sí |
| bun >= 1.1 | Sí |

## 10.16 Limitaciones conocidas (v0.1.0)

- No instala dependencias.
- No instala navegadores.
- No ejecuta tests.
- No permite sobrescribir un directorio existente.
- No permite rutas absolutas.
- No soporta templates múltiples.
- No soporta plugins.
- No incluye telemetría.
- No incluye i18n.

## 10.17 Referencia rápida

```text
create-autonomous-qa <project-name> [--pnpm | --bun]
create-autonomous-qa --help
create-autonomous-qa --version
```
EOF
