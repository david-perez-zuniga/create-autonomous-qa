# 02 — Requisitos funcionales

## 2.1 Convenciones

- **FR**: requisito funcional.
- **AC**: criterio de aceptación.
- **CA**: caso alternativo / error.
- Prioridad: **Must**, **Should**, **Could** (MoSCoW).
- Todos los requisitos de esta sección aplican a la versión indicada en la columna *Desde*.

## 2.2 Resumen de comandos

| Comando | Descripción | Desde |
|---|---|---|
| `create-autonomous-qa <project-name>` | Crea un proyecto con configuración por defecto | 0.1.0 |
| `create-autonomous-qa <project-name> --pnpm` | Crea un proyecto configurado para pnpm | 0.1.0 |
| `create-autonomous-qa <project-name> --bun` | Crea un proyecto configurado para Bun | 0.1.0 |
| `create-autonomous-qa --help` | Muestra ayuda | 0.1.0 |
| `create-autonomous-qa --version` | Muestra versión | 0.1.0 |

## 2.3 FR-001 — Creación de proyecto

**Prioridad:** Must · **Desde:** 0.1.0

La CLI debe crear un proyecto completo en `<cwd>/<project-name>` a partir del template estándar.

### AC-001.1 — Flujo feliz
```gherkin
Given un directorio de trabajo sin la carpeta "banking-qa"
When el usuario ejecuta "create-autonomous-qa banking-qa"
Then se crea el directorio "./banking-qa"
And se copia la estructura completa del template
And "package.json" contiene name = "banking-qa"
And "README.md" contiene el nombre del proyecto
And se muestran los próximos pasos
And el proceso termina con exit code 0
```

### AC-001.2 — Nombre con rutas relativas
```gherkin
Given un directorio de trabajo sin la carpeta "clients/banking-qa"
When el usuario ejecuta "create-autonomous-qa clients/banking-qa"
Then se crea la ruta "./clients/banking-qa"
And el campo "name" de package.json es "banking-qa"
```

> El nombre del paquete se deriva del basename de la ruta. El nombre visible del proyecto puede conservar la ruta.

### AC-001.3 — Determinismo
```gherkin
Given dos ejecuciones con el mismo nombre y versión de la CLI
When ambas finalizan correctamente
Then la estructura de archivos y carpetas es idéntica
```

### CA-001.4 — Directorio existente
```gherkin
Given que ya existe "./banking-qa"
When el usuario ejecuta "create-autonomous-qa banking-qa"
Then se muestra un error claro indicando que el directorio ya existe
And no se modifica ningún archivo existente
And el proceso termina con exit code 1
```

### CA-001.5 — Directorio existente vacío
```gherkin
Given que existe "./banking-qa" pero está vacío
When el usuario ejecuta "create-autonomous-qa banking-qa"
Then el comportamiento está definido por la política de colisión (ver 2.11)
```

### CA-001.6 — Sin permisos de escritura
```gherkin
Given un directorio de trabajo sin permisos de escritura
When el usuario ejecuta la CLI
Then se muestra un error de permisos
And no se crea un proyecto parcial
And el proceso termina con exit code 1
```

## 2.4 FR-002 — Parseo de argumentos

**Prioridad:** Must · **Desde:** 0.1.0

La CLI debe parsear argumentos y flags con Commander.js.

### Reglas

| Regla | Comportamiento |
|---|---|
| Sin argumentos | Mostrar ayuda y salir con código 0 |
| `--help` / `-h` | Mostrar ayuda y salir con código 0 |
| `--version` / `-V` | Mostrar versión y salir con código 0 |
| Nombre ausente con flags | Mostrar ayuda y salir con código 0 |
| Flags desconocidos | Error de opción desconocida y salir con código 1 |
| `--pnpm` y `--bun` juntos | Error de conflicto y salir con código 1 |
| Nombre con caracteres inválidos | Error de validación y salir con código 1 |
| Múltiples nombres | Error de argumentos sobrantes y salir con código 1 |

### AC-002.1 — Ayuda
```gherkin
When el usuario ejecuta "create-autonomous-qa --help"
Then se muestra el nombre del comando
And se muestra la descripción
And se muestran los argumentos y flags disponibles
And se muestran ejemplos de uso
And el proceso termina con exit code 0
```

### AC-002.2 — Versión
```gherkin
When el usuario ejecuta "create-autonomous-qa --version"
Then se muestra la versión exacta definida en package.json de la CLI
And el proceso termina con exit code 0
```

### AC-002.3 — Flags en conflicto
```gherkin
When el usuario ejecuta "create-autonomous-qa demo --pnpm --bun"
Then se muestra un error indicando que los flags son mutuamente excluyentes
And no se crea ningún proyecto
And el proceso termina con exit code 1
```

## 2.5 FR-003 — Estructura generada

**Prioridad:** Must · **Desde:** 0.1.0 (estructura base; skill y archivos completos en 0.2.0)

Todo proyecto generado debe contener exactamente:

```text
project/
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

### Reglas de estructura

- Las carpetas vacías (`pages/`, `fixtures/`, subcarpetas de `qa-results/`) deben conservarse. Se permite un `.gitkeep` si el sistema de archivos o el control de versiones lo requiere.
- No se deben generar archivos adicionales no declarados, salvo los necesarios para preservar carpetas vacías.
- `.opencode/skills/autonomous-qa/skill.md` es obligatorio.
- La estructura debe ser idéntica en Windows, Linux y macOS (rutas con `/` en la definición lógica).

### AC-003.1 — Estructura completa
```gherkin
Given que la CLI generó un proyecto
When se inspecciona el árbol de archivos
Then existen todas las rutas listadas en FR-003
And no falta ningún archivo obligatorio
And no existen archivos temporales de la CLI
```

## 2.6 FR-004 — Configuración de package.json

**Prioridad:** Must · **Desde:** 0.1.0

El `package.json` generado debe cumplir:

| Campo | Valor |
|---|---|
| `name` | Nombre del proyecto en formato npm válido |
| `version` | `0.1.0` |
| `private` | `true` |
| `description` | Descripción del proyecto generado |
| `type` | `module` |
| `packageManager` | Según flag (ver FR-005) |
| `scripts.test` | `playwright test` |
| `scripts.test:ui` | `playwright test --ui` |
| `scripts.test:headed` | `playwright test --headed` |
| `scripts.test:debug` | `playwright test --debug` |
| `scripts.report` | `playwright show-report` |
| `devDependencies.@playwright/test` | Versión fijada por el template |
| `devDependencies.@types/node` | Versión fijada por el template |
| `devDependencies.typescript` | Versión fijada por el template |

### Reglas de nombre npm

- Minúsculas.
- Sin espacios.
- Permitidos: `a-z`, `0-9`, `-`, `_`, `.`, `@`, `/` (scoped).
- Longitud máxima: 214 caracteres.
- No puede empezar con `.` ni `_`.
- Si el nombre del proyecto no es válido como nombre npm, se debe normalizar (minúsculas, espacios → `-`, caracteres inválidos eliminados) o rechazar con error claro.

### AC-004.1 — package.json válido
```gherkin
Given un proyecto generado con nombre "banking-qa"
When se parsea package.json
Then es JSON válido
And name = "banking-qa"
And version = "0.1.0"
And private = true
And type = "module"
And scripts.test = "playwright test"
```

### AC-004.2 — Preservación de campos del template
```gherkin
Given el package.json del template
When la CLI lo configura
Then los campos no mencionados en FR-004 se preservan
And el formato es JSON con indentación de 2 espacios
And termina con un salto de línea
```

## 2.7 FR-005 — Soporte de package managers

**Prioridad:** Must · **Desde:** 0.1.0

### Matriz de configuración

| Flag | `packageManager` | Comandos mostrados | Lockfile esperado |
|---|---|---|---|
| (ninguno) | `pnpm@12.14.0` | `pnpm install`, `pnpm test` | `pnpm-lock.yaml` |
| `--pnpm` | `pnpm@12.14.0` | `pnpm install`, `pnpm test` | `pnpm-lock.yaml` |
| `--bun` | `bun@latest` | `bun install`, `bun test` | `bun.lock` |

> **Decisión:** el valor por defecto es pnpm, alineado con el `packageManager` del propio repositorio. La CLI no debe dejar `packageManager` ausente.

> **Nota técnica (Bun):** `bun test` ejecuta el runner nativo de Bun, que no es compatible con la API de `@playwright/test`. Para ejecutar la suite Playwright el comando efectivo debe ser `bun run test` (script `"test": "playwright test"`) o `bunx playwright test`. El contrato de UX solicitado muestra `bun test`; se recomienda que la implementación muestre `bun run test` y documente la diferencia. Esta decisión debe confirmarse antes de v0.1.0.

### AC-005.1 — pnpm
```gherkin
When el usuario ejecuta "create-autonomous-qa demo --pnpm"
Then package.json contiene "packageManager": "pnpm@12.14.0"
And los próximos pasos muestran "pnpm install" y "pnpm test"
```

### AC-005.2 — bun
```gherkin
When el usuario ejecuta "create-autonomous-qa demo --bun"
Then package.json contiene "packageManager": "bun@latest"
And los próximos pasos muestran "bun install" y "bun test"
```

### AC-005.3 — Sin flag
```gherkin
When el usuario ejecuta "create-autonomous-qa demo"
Then package.json contiene "packageManager": "pnpm@12.14.0"
And los próximos pasos muestran "pnpm install" y "pnpm test"
```

## 2.8 FR-006 — Configuración de README

**Prioridad:** Must · **Desde:** 0.1.0

El `README.md` generado debe:

- Incluir el nombre del proyecto en el título.
- Incluir una descripción breve.
- Incluir requisitos previos (Node.js >= 20, package manager).
- Incluir comandos de instalación y ejecución según el package manager.
- Incluir la estructura del proyecto.
- Incluir referencia a la skill de QA autónomo.
- Incluir próximos pasos.
- No contener placeholders sin reemplazar.

### AC-006.1 — README personalizado
```gherkin
Given un proyecto generado con nombre "banking-qa" y package manager pnpm
When se lee README.md
Then el título contiene "banking-qa"
And menciona "pnpm install" y "pnpm test"
And no contiene "{{" ni "}}"
```

## 2.9 FR-007 — Instalación de skill

**Prioridad:** Must · **Desde:** 0.2.0 (stub en 0.1.0)

La CLI debe copiar y personalizar `.opencode/skills/autonomous-qa/skill.md` en el proyecto generado.

### AC-007.1 — Skill presente
```gherkin
Given un proyecto generado
When se inspecciona ".opencode/skills/autonomous-qa/skill.md"
Then el archivo existe
And contiene el nombre del proyecto
And contiene las fases del ciclo de QA autónomo
And no contiene placeholders sin reemplazar
```

### AC-007.2 — Mensaje de instalación
```gherkin
Given una generación exitosa
Then la salida incluye "✅ Skill installed"
```

## 2.10 FR-008 — Salida de consola

**Prioridad:** Must · **Desde:** 0.1.0

### Contrato de salida (flujo feliz)

```text
🚀 Creating Autonomous QA Project

✅ Template copied
✅ package.json configured
✅ README configured
✅ Skill installed

Project created successfully

Next steps:

cd <project-name>
<pm> install
<pm> test
```

### Reglas

- Una línea por evento relevante.
- Los mensajes de éxito usan `✅`.
- Los errores usan `❌` y se escriben en `stderr`.
- Los próximos pasos se escriben en `stdout`.
- No se imprimen objetos de opciones ni datos de depuración.
- La salida debe ser estable y apta para tests de integración.
- Se permite color ANSI solo si `stdout` es TTY; en CI/pipes debe desactivarse.
- El idioma de la CLI es inglés para mensajes de producto; los errores pueden incluir detalle en inglés.

### AC-008.1 — Salida estable
```gherkin
When se ejecuta la CLI en un entorno sin TTY
Then la salida no contiene códigos ANSI
And contiene las líneas del contrato
```

## 2.11 FR-009 — Política de colisión de directorios

**Prioridad:** Must · **Desde:** 0.1.0

| Situación | Comportamiento |
|---|---|
| El directorio no existe | Crear normalmente |
| El directorio existe y está vacío | Error (política conservadora) |
| El directorio existe y no está vacío | Error |
| El directorio existe y fue creado por esta CLI | Error, sin sobrescribir |
| `--force` (futuro) | Sobrescribir solo si se implementa explícitamente |

> v0.1.0 no soporta `--force`. No debe existir sobrescritura silenciosa.

### AC-009.1 — Sin sobrescritura
```gherkin
Given un directorio destino con archivos
When se ejecuta la CLI
Then el contenido existente permanece intacto
And el proceso termina con exit code 1
```

## 2.12 FR-010 — Manejo de errores

**Prioridad:** Must · **Desde:** 0.1.0

### Catálogo de errores

| Código | Situación | Mensaje | Exit |
|---|---|---|---|
| `E_DIR_EXISTS` | Directorio destino existente | `❌ Directory "<name>" already exists` | 1 |
| `E_INVALID_NAME` | Nombre inválido | `❌ Invalid project name: <name>` | 1 |
| `E_CONFLICT_FLAGS` | `--pnpm` + `--bun` | `❌ Choose either --pnpm or --bun, not both` | 1 |
| `E_TEMPLATE_MISSING` | Template no encontrado | `❌ Template not found. Reinstall create-autonomous-qa` | 1 |
| `E_PERMISSION` | Sin permisos | `❌ Permission denied writing to <path>` | 1 |
| `E_COPY_FAILED` | Fallo de copia | `❌ Failed to copy template: <detail>` | 1 |
| `E_CONFIG_FAILED` | Fallo de configuración | `❌ Failed to configure <file>: <detail>` | 1 |
| `E_UNKNOWN` | Error inesperado | `❌ Unexpected error: <detail>` | 1 |

### Reglas

- Nunca dejar un proyecto parcial sin informarlo.
- Si falla la copia, eliminar el directorio destino creado por la CLI (rollback best-effort).
- Si falla una configuración posterior, informar la ruta y el archivo afectado.
- En modo `--debug` (futuro) incluir stack trace.
- En modo normal, no mostrar stack trace.

### AC-010.1 — Error de directorio existente
```gherkin
Given un directorio existente
When se ejecuta la CLI
Then stderr contiene "already exists"
And stdout no contiene "Project created successfully"
And exit code = 1
```

## 2.13 FR-011 — Próximos pasos

**Prioridad:** Must · **Desde:** 0.1.0

Después de generar el proyecto, la CLI debe mostrar:

```text
Next steps:

cd <path>
<pm> install
<pm> test
```

- `<path>` es la ruta usada por el usuario (relativa o absoluta).
- `<pm>` es `pnpm` o `bun` según la configuración.
- No debe mostrar `npx playwright install` en v0.1.0 (queda para v0.3.0).

### AC-011.1 — Próximos pasos con Bun
```gherkin
Given una generación con --bun
Then la salida contiene "bun install"
And la salida contiene "bun test"
And la salida no contiene "pnpm"
```

## 2.14 FR-012 — Extensibilidad

**Prioridad:** Should · **Desde:** 0.2.0

La arquitectura debe permitir agregar:

- Nuevos package managers sin modificar el CLI.
- Nuevos templates seleccionables por nombre.
- Nuevas skills.
- Plugins de generación.
- Un marketplace de skills/templates.

### AC-012.1 — Package manager extensible
```gherkin
Given un nuevo package manager registrado en la configuración
When se agrega su flag correspondiente
Then el CLI lo reconoce sin cambios en el Project Generator
```

## 2.15 FR-013 — Modo no interactivo

**Prioridad:** Must · **Desde:** 0.1.0

- La CLI no debe hacer preguntas interactivas.
- Debe funcionar en CI, pipes y Codespaces.
- Debe aceptar toda la configuración por argumentos/flags.
- Debe fallar rápido ante configuración incompleta.

### AC-013.1 — CI
```gherkin
Given un entorno sin TTY
When se ejecuta la CLI con argumentos completos
Then el proyecto se genera sin bloquearse esperando input
```

## 2.16 FR-014 — Ayuda contextual y ejemplos

**Prioridad:** Should · **Desde:** 0.2.0

La ayuda debe incluir:

```text
Usage: create-autonomous-qa [options] <project-name>

Arguments:
  project-name        Name of the QA project to create

Options:
  --pnpm              Configure the project for pnpm
  --bun               Configure the project for Bun
  -V, --version       Output the version number
  -h, --help          Display help for command

Examples:
  $ create-autonomous-qa banking-qa
  $ create-autonomous-qa banking-qa --pnpm
  $ create-autonomous-qa banking-qa --bun
```

## 2.17 FR-015 — Validación de nombre

**Prioridad:** Must · **Desde:** 0.1.0

### Reglas

- No vacío.
- Se permiten rutas relativas con subdirectorios (`clients/banking-qa`).
- No se permiten rutas absolutas en v0.1.0.
- No se permiten segmentos `.` ni `..` en ninguna parte de la ruta.
- No caracteres de control.
- No nombres reservados de Windows (`CON`, `PRN`, `AUX`, `NUL`, `COM1`…`COM9`, `LPT1`…`LPT9`).
- No terminar en espacio o punto (Windows).
- Longitud razonable (≤ 214 para npm; ≤ 255 para carpeta).

### AC-015.1 — Nombre inválido
```gherkin
When el usuario ejecuta "create-autonomous-qa .."
Then se muestra "Invalid project name"
And exit code = 1
```

## 2.18 FR-016 — Idempotencia de servicios

**Prioridad:** Should · **Desde:** 0.2.0

Cada servicio debe ser idempotente sobre el archivo que configura:

- Aplicar `updatePackageJson` dos veces produce el mismo resultado.
- Aplicar `updateReadme` dos veces no duplica contenido.
- Aplicar `SkillService` dos veces no duplica metadatos.

### AC-016.1 — Idempotencia
```gherkin
Given un archivo ya configurado
When se ejecuta el servicio nuevamente
Then el contenido final es equivalente al anterior
```

## 2.19 FR-017 — Integridad de templates

**Prioridad:** Should · **Desde:** 0.3.0

Antes de copiar, la CLI debe validar:

- El directorio `template/` existe.
- Los archivos obligatorios existen.
- Los placeholders usados están declarados.
- No hay placeholders desconocidos.
- Los JSON del template son válidos.

### AC-017.1 — Template inválido
```gherkin
Given un template sin "package.json"
When se ejecuta la CLI
Then se muestra un error de template inválido
And no se crea el proyecto
```

## 2.20 FR-018 — Trazabilidad de generación

**Prioridad:** Could · **Desde:** 0.3.0

La CLI puede generar un archivo `.create-autonomous-qa.json` en el proyecto con:

```json
{
  "cliVersion": "0.1.0",
  "template": "default",
  "packageManager": "pnpm",
  "generatedAt": "2026-10-20T00:00:00.000Z"
}
```

> Este archivo es opcional y no forma parte de la estructura obligatoria de v0.1.0. Si se implementa, debe documentarse y excluirse del control de versiones o incluirse según decisión del proyecto.

## 2.21 Matriz de trazabilidad

| Requisito | Versión | Prioridad | Componente |
|---|---|---|---|
| FR-001 Creación | 0.1.0 | Must | ProjectGenerator |
| FR-002 Parseo | 0.1.0 | Must | CLI |
| FR-003 Estructura | 0.1.0/0.2.0 | Must | Template + Generator |
| FR-004 package.json | 0.1.0 | Must | PackageJsonService |
| FR-005 Package managers | 0.1.0 | Must | Constants + CLI |
| FR-006 README | 0.1.0 | Must | ReadmeService |
| FR-007 Skill | 0.2.0 | Must | SkillService |
| FR-008 Consola | 0.1.0 | Must | ConsoleService |
| FR-009 Colisiones | 0.1.0 | Must | ProjectGenerator |
| FR-010 Errores | 0.1.0 | Must | ConsoleService + Generator |
| FR-011 Próximos pasos | 0.1.0 | Must | ConsoleService |
| FR-012 Extensibilidad | 0.2.0 | Should | Arquitectura |
| FR-013 No interactivo | 0.1.0 | Must | CLI |
| FR-014 Ayuda | 0.2.0 | Should | CLI |
| FR-015 Validación | 0.1.0 | Must | Utils |
| FR-016 Idempotencia | 0.2.0 | Should | Services |
| FR-017 Integridad | 0.3.0 | Should | TemplateValidator |
| FR-018 Trazabilidad | 0.3.0 | Could | Generator |
EOF
