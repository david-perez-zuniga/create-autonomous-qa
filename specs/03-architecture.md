# 03 — Arquitectura

## 3.1 Principios

1. **Separación de responsabilidades:** cada módulo tiene una única razón para cambiar.
2. **Orquestación sin efectos directos:** el Project Generator coordina; los Services modifican archivos.
3. **Dependencias unidireccionales:** CLI → Generator → Services/Utils → Constants/Types.
4. **Sin lógica duplicada:** una sola implementación para reemplazo de variables, resolución de package managers y mensajes.
5. **Sin strings mágicos:** rutas, nombres de archivo, mensajes y flags viven en constantes.
6. **Testeabilidad:** servicios puros o con inyección de filesystem cuando sea necesario.
7. **Extensibilidad:** registrar nuevos package managers, templates y skills sin tocar el núcleo.
8. **Fallar rápido y limpio:** validar antes de escribir; rollback ante fallos de copia.

## 3.2 Estructura de directorios

### Repositorio de la CLI

```text
create-autonomous-qa/
├── src/
│   ├── cli/
│   │   └── index.ts
│   ├── generators/
│   │   └── project-generator.ts
│   ├── services/
│   │   ├── package-json-service.ts
│   │   ├── readme-service.ts
│   │   ├── skill-service.ts
│   │   └── console-service.ts
│   ├── types/
│   │   ├── generator-options.ts
│   │   ├── package-manager.ts
│   │   └── template-context.ts
│   ├── utils/
│   │   ├── template-engine.ts
│   │   ├── project-name.ts
│   │   └── fs-utils.ts
│   └── constants/
│       ├── package-managers.ts
│       ├── files.ts
│       └── messages.ts
├── template/
│   ├── .opencode/skills/autonomous-qa/skill.md
│   ├── tests/example.spec.ts
│   ├── pages/.gitkeep
│   ├── fixtures/.gitkeep
│   ├── qa-results/{defects,evidence,analytics,playwright}/.gitkeep
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── README.md
│   └── playwright.config.ts
├── tests/                     # tests de la CLI
├── specs/
├── package.json
├── tsconfig.json
└── README.md
```

### Proyecto generado

Ver `02-requirements.md` § FR-003.

## 3.3 Capas

```text
┌─────────────────────────────────────────────┐
│ CLI (src/cli)                               │
│ - Commander.js                              │
│ - parseo, help, version                     │
│ - validación de flags                       │
└────────────────────┬────────────────────────┘
                     │ GeneratorOptions
┌────────────────────▼────────────────────────┐
│ Generator (src/generators)                  │
│ - validación de destino                     │
│ - copia del template                        │
│ - orquestación de servicios                 │
│ - rollback                                  │
└───────┬─────────────┬─────────────┬─────────┘
        │             │             │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│ PackageJson  │ │ Readme   │ │ Skill      │
│ Service      │ │ Service  │ │ Service    │
└───────┬──────┘ └────┬─────┘ └─────┬──────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │ Utils (template-engine,   │
        │ project-name, fs-utils)   │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │ Constants + Types         │
        └───────────────────────────┘
```

## 3.4 Responsabilidades por módulo

### 3.4.1 CLI — `src/cli/index.ts`

**Hace:**
- Configura `Command` de Commander.js.
- Define nombre, descripción, versión.
- Define argumento `<project-name>`.
- Define flags `--pnpm`, `--bun`.
- Valida combinaciones de flags.
- Muestra ayuda y versión.
- Delega en `createProject`.
- Traduce errores a mensajes y exit codes.

**No hace:**
- Copiar archivos.
- Leer o escribir archivos.
- Conocer la estructura del template.

**Interfaz:**
```typescript
program
  .name("create-autonomous-qa")
  .description("Scaffold autonomous QA projects with Playwright and AI agents")
  .version(VERSION)
  .argument("<project-name>", "Name of the QA project to create")
  .option("--pnpm", "Configure the project for pnpm")
  .option("--bun", "Configure the project for Bun")
  .action(async (projectName: string, options: CliOptions) => {
    await createProject(projectName, toGeneratorOptions(options));
  });
```

### 3.4.2 Project Generator — `src/generators/project-generator.ts`

**Hace:**
- Resuelve `cwd`, `targetDir`, `templateDir`.
- Valida nombre y destino.
- Copia el template.
- Construye el `TemplateContext`.
- Invoca servicios en orden.
- Emite mensajes de progreso vía ConsoleService.
- Ejecuta rollback si falla la copia.
- Muestra próximos pasos.

**No hace:**
- Parsear JSON.
- Reemplazar placeholders directamente.
- Escribir archivos de configuración.

**Interfaz:**
```typescript
export interface CreateProjectResult {
  targetDir: string;
  packageManager: PackageManager;
}

export async function createProject(
  projectName: string,
  options: GeneratorOptions,
  deps?: GeneratorDependencies
): Promise<CreateProjectResult>;
```

**Dependencias inyectables (para tests):**
```typescript
export interface GeneratorDependencies {
  fs: Pick<typeof fs, "cpSync" | "existsSync" | "rmSync" | "mkdirSync">;
  console: ConsoleService;
  packageJsonService: typeof updatePackageJson;
  readmeService: typeof updateReadme;
  skillService: typeof updateSkill;
}
```

### 3.4.3 PackageJsonService — `src/services/package-json-service.ts`

**Hace:**
- Lee `package.json` como UTF-8.
- Parsea JSON con error controlado.
- Aplica campos definidos en FR-004.
- Escribe JSON con 2 espacios y salto de línea final.
- Es idempotente.

**Interfaz:**
```typescript
export interface PackageJsonInput {
  packageJsonPath: string;
  projectName: string;
  packageManager: PackageManager;
  templateContext: TemplateContext;
}

export function updatePackageJson(input: PackageJsonInput): void;
```

**Errores:**
- `E_CONFIG_FAILED` si el JSON es inválido o no se puede escribir.

### 3.4.4 ReadmeService — `src/services/readme-service.ts`

**Hace:**
- Verifica existencia del README.
- Lee contenido.
- Aplica TemplateEngine con el contexto completo.
- Escribe contenido.
- Verifica que no queden placeholders.

**Interfaz:**
```typescript
export interface ReadmeInput {
  readmePath: string;
  context: TemplateContext;
}

export function updateReadme(input: ReadmeInput): void;
```

### 3.4.5 SkillService — `src/services/skill-service.ts`

**Hace:**
- Verifica que exista el template de skill.
- Copia `skill.md` a `.opencode/skills/autonomous-qa/skill.md`.
- Aplica TemplateEngine.
- Valida metadatos mínimos.
- Es idempotente.

**Interfaz:**
```typescript
export interface SkillInput {
  targetDir: string;
  templateDir: string;
  context: TemplateContext;
}

export function installSkill(input: SkillInput): void;
```

### 3.4.6 ConsoleService — `src/services/console-service.ts`

**Hace:**
- Encapsula todo acceso a `console`.
- Expone métodos semánticos.
- Aplica color solo si hay TTY.
- Escribe errores en `stderr`.

**Interfaz:**
```typescript
export interface ConsoleService {
  banner(): void;
  success(message: string): void;
  error(message: string): void;
  info(message: string): void;
  nextSteps(projectPath: string, packageManager: PackageManager): void;
}
```

**Métodos y mensajes:**

| Método | Salida |
|---|---|
| `banner()` | `🚀 Creating Autonomous QA Project` |
| `success("Template copied")` | `✅ Template copied` |
| `success("package.json configured")` | `✅ package.json configured` |
| `success("README configured")` | `✅ README configured` |
| `success("Skill installed")` | `✅ Skill installed` |
| `info("Project created successfully")` | `Project created successfully` |
| `error(...)` | `❌ ...` en stderr |
| `nextSteps(...)` | bloque `Next steps:` |

### 3.4.7 TemplateEngine — `src/utils/template-engine.ts`

**Hace:**
- Reemplaza `{{KEY}}` por valores del contexto.
- Escapa correctamente el texto de reemplazo (no interpretar `$&`, `$1`, etc.).
- Detecta placeholders no resueltos.
- Es determinista.

**Interfaz:**
```typescript
export interface TemplateContext {
  PROJECT_NAME: string;
  PROJECT_PATH: string;
  PACKAGE_NAME: string;
  PACKAGE_MANAGER: "pnpm" | "bun";
  PACKAGE_MANAGER_FIELD: string;
  INSTALL_COMMAND: string;
  TEST_COMMAND: string;
  AUTHOR: string;
  DATE: string;
  YEAR: string;
  VERSION: string;
  NODE_VERSION: string;
}

export function replaceTemplateVariables(
  content: string,
  context: Partial<TemplateContext>
): string;

export function findUnresolvedVariables(content: string): string[];

export function assertNoUnresolvedVariables(content: string, filePath: string): void;
```

**Algoritmo:**
```text
1. Para cada clave del contexto:
   placeholder = "{{" + key + "}}"
   content = content.split(placeholder).join(String(value ?? ""))
2. Buscar /{{[A-Z][A-Z0-9_]*}}/g en el resultado.
3. Si hay coincidencias, lanzar error con la lista.
```

> **Importante:** usar `split/join`, no `RegExp` ni `replaceAll`, para evitar que secuencias como `$&`, `$1` o `\` del valor se interpreten como patrones de reemplazo.

### 3.4.8 Utils de nombre — `src/utils/project-name.ts`

**Hace:**
- Validar nombre de carpeta.
- Normalizar nombre npm.
- Derivar `basename`.
- Detectar nombres reservados de Windows.

**Interfaz:**
```typescript
export interface ProjectNameInfo {
  input: string;
  folderName: string;
  packageName: string;
  targetPath: string;
}

export function resolveProjectName(input: string, cwd: string): ProjectNameInfo;
export function isValidProjectName(input: string): boolean;
export function toPackageName(input: string): string;
```

### 3.4.9 Constantes

**`src/constants/package-managers.ts`:**
```typescript
export const PACKAGE_MANAGERS = {
  pnpm: {
    id: "pnpm",
    packageManager: "pnpm@12.14.0",
    installCommand: "pnpm install",
    testCommand: "pnpm test",
    lockfile: "pnpm-lock.yaml",
  },
  bun: {
    id: "bun",
    packageManager: "bun@latest",
    installCommand: "bun install",
    testCommand: "bun test",
    lockfile: "bun.lock",
  },
} as const;

export type PackageManagerId = keyof typeof PACKAGE_MANAGERS;
export type PackageManager = (typeof PACKAGE_MANAGERS)[PackageManagerId];
```

**`src/constants/files.ts`:**
```typescript
export const TEMPLATE_DIR = "template";
export const PACKAGE_JSON = "package.json";
export const README = "README.md";
export const SKILL_PATH = ".opencode/skills/autonomous-qa/skill.md";
export const QA_RESULTS_DIRS = ["defects", "evidence", "analytics", "playwright"] as const;
```

**`src/constants/messages.ts`:** todos los mensajes de usuario.

### 3.4.10 Tipos

**`src/types/generator-options.ts`:**
```typescript
export interface GeneratorOptions {
  packageManager?: PackageManagerId; // undefined ⇒ default "pnpm"
  cwd?: string;
  templateDir?: string;
}
```

**`src/types/cli-options.ts`:**
```typescript
export interface CliOptions {
  pnpm?: boolean;
  bun?: boolean;
}
```

## 3.5 Reglas de dependencia

| Desde | Puede importar | No puede importar |
|---|---|---|
| `cli` | `generators`, `types`, `constants` | `services` (salvo errores), `utils` de filesystem |
| `generators` | `services`, `utils`, `types`, `constants` | `cli` |
| `services` | `utils`, `types`, `constants` | `generators`, `cli` |
| `utils` | `types`, `constants` | `services`, `generators`, `cli` |
| `constants` | nada | todo lo demás |
| `types` | nada (solo tipos) | runtime |

> Herramienta sugerida: `dependency-cruiser` o ESLint `import/no-restricted-paths` (v0.3.0).

## 3.6 Flujo de ejecución

```text
1. Commander parsea argv
2. Valida flags mutuamente excluyentes
3. Resuelve GeneratorOptions
4. createProject():
   4.1. Resolver ProjectNameInfo (validación + normalización)
   4.2. Verificar existencia del template
   4.3. Verificar colisión del destino
   4.4. Copiar template
   4.5. Construir TemplateContext
   4.6. updatePackageJson()
   4.7. updateReadme()
   4.8. installSkill()
   4.9. Mostrar próximos pasos
5. Retornar resultado
6. CLI establece exit code
```

## 3.7 Secuencia (flujo feliz)

```text
User        CLI          Generator      Services        FS
 │           │               │              │             │
 │─ command ─▶               │              │             │
 │           │─ options ────▶│              │             │
 │           │               │─ exists? ─────────────────▶│
 │           │               │◀─ false ───────────────────│
 │           │               │─ copy template ───────────▶│
 │           │               │◀─ ok ──────────────────────│
 │           │               │─ updatePackageJson ───────▶│
 │           │               │◀─ ok ──────────────────────│
 │           │               │─ updateReadme ────────────▶│
 │           │               │◀─ ok ──────────────────────│
 │           │               │─ installSkill ────────────▶│
 │           │               │◀─ ok ──────────────────────│
 │           │◀─ result ─────│              │             │
 │◀─ output ─│               │              │             │
```

## 3.8 Secuencia (error de copia con rollback)

```text
Generator                 FS
   │                       │
   │─ mkdir target ───────▶│
   │◀─ ok ─────────────────│
   │─ cp template ────────▶│
   │◀─ error ──────────────│
   │─ rm -rf target ──────▶│
   │◀─ ok ─────────────────│
   │─ throw E_COPY_FAILED ─│
```

## 3.9 Estrategia de errores

### Tipos

```typescript
export type ErrorCode =
  | "E_DIR_EXISTS"
  | "E_INVALID_NAME"
  | "E_CONFLICT_FLAGS"
  | "E_TEMPLATE_MISSING"
  | "E_PERMISSION"
  | "E_COPY_FAILED"
  | "E_CONFIG_FAILED"
  | "E_UNKNOWN";

export class CliError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "CliError";
  }
}
```

### Reglas

- Los servicios lanzan `CliError` con código y contexto.
- El Generator propaga y hace rollback cuando corresponde.
- El CLI captura, imprime en `stderr` y establece `process.exitCode = 1`.
- Nunca usar `process.exit()` dentro de servicios (dificulta tests).
- El CLI puede usar `process.exitCode` en lugar de `process.exit()`.

## 3.10 Rollback

| Fase fallida | Acción |
|---|---|
| Validación | Nada que revertir |
| Creación de directorio | Eliminar directorio si lo creó la CLI |
| Copia de template | Eliminar directorio destino |
| Configuración de package.json | Mantener proyecto e informar archivo; opcional rollback completo |
| Configuración de README | Mantener proyecto e informar archivo |
| Instalación de skill | Mantener proyecto e informar archivo |

**Decisión v0.2.0:** rollback completo ante cualquier fallo posterior a la copia, para no dejar proyectos inconsistentes. El rollback debe ser best-effort y nunca ocultar el error original.

## 3.11 Extensibilidad

### Nuevo package manager

1. Agregar entrada a `PACKAGE_MANAGERS`.
2. Agregar flag en CLI (o generarlo dinámicamente).
3. Agregar tests.
4. No modificar servicios.

### Nuevo template

1. Crear `template-<name>/` con la estructura requerida.
2. Agregar `template` a `GeneratorOptions`.
3. Agregar flag `--template <name>`.
4. Validar con `TemplateValidator`.

### Nueva skill

1. Crear `template/.opencode/skills/<skill>/skill.md`.
2. Registrar en configuración de skills.
3. Extender `SkillService` para múltiples skills.

### Plugin (v0.4.0)

```typescript
export interface GeneratorPlugin {
  name: string;
  beforeGenerate?(ctx: TemplateContext): Promise<void>;
  afterGenerate?(result: CreateProjectResult): Promise<void>;
}
```

## 3.12 Configuración

| Fuente | Uso |
|---|---|
| `package.json` de la CLI | `version`, `bin`, `engines` |
| `tsconfig.json` | compilación ESM a `dist/` |
| Variables de entorno | `NO_COLOR`, `CI`, `DEBUG` |
| Flags CLI | package manager, template (futuro) |

### Variables de entorno

| Variable | Efecto |
|---|---|
| `NO_COLOR` | Desactiva color |
| `CI` | Desactiva color y spinners |
| `DEBUG=create-autonomous-qa` | Muestra stack traces y detalles |

## 3.13 Decisiones de arquitectura (ADR resumidas)

| ID | Decisión | Motivo |
|---|---|---|
| ADR-01 | Commander.js | Estándar, ligero, bien documentado |
| ADR-02 | ESM (`"type": "module"`) | Alineado con ecosistema moderno |
| ADR-03 | Templates como archivos estáticos | Simplicidad, editabilidad, validación |
| ADR-04 | Copia con `fs.cpSync` | Disponible en Node >= 16.7, multiplataforma |
| ADR-05 | Servicios síncronos | Simplicidad; el volumen de archivos es pequeño |
| ADR-06 | pnpm como default | Consistencia con el repositorio y el ecosistema |
| ADR-07 | Sin instalación de dependencias en v0.1.0 | Separar generación de ejecución |
| ADR-08 | `process.exitCode` en lugar de `process.exit` | Testeabilidad |
| ADR-09 | Rollback best-effort | Evitar proyectos parciales |
| ADR-10 | Skill en `.opencode/skills/` | Compatibilidad con OpenCode |
EOF
