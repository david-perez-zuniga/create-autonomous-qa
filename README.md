# create-autonomous-qa

CLI para generar proyectos de QA autónomo con [Playwright](https://playwright.dev/), TypeScript y agentes de IA.

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
npm create autonomous-qa@latest my-project
```

### Con pnpm

```bash
pnpm create autonomous-qa my-project
```

### Con Bun

```bash
bun create autonomous-qa my-project
```

### Con npx / pnpm dlx / bunx

```bash
npx create-autonomous-qa my-project
pnpm dlx create-autonomous-qa my-project
bunx create-autonomous-qa my-project
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
create-autonomous-qa banking-qa

# Generar explícitamente con pnpm
create-autonomous-qa banking-qa --pnpm

# Generar con Bun
create-autonomous-qa banking-qa --bun
```

## Estructura generada

Al crear el proyecto se genera la siguiente estructura:

```text
my-project/
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
cd my-project
pnpm install  # o npm install / bun install
pnpm test     # o npm test / bun run test
```

> **Nota sobre Bun:** `bun test` usa el runner nativo de Bun y no es compatible con `@playwright/test`. Usa `bun run test` para ejecutar los tests de Playwright.

## Desarrollo de esta CLI

Si quieres contribuir o ejecutar esta CLI en modo desarrollo:

```bash
# Clonar el repositorio
git clone https://github.com/your-org/create-autonomous-qa.git
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
npm install /ruta/a/create-autonomous-qa-0.1.0.tgz
npx create-autonomous-qa demo
```

## Licencia

[MIT](./LICENSE)
