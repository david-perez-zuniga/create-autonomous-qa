# Changelog

Todas las mudanças relevantes de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y
el proyecto adheres a [Semantic Versioning](https://semver.org/lang/es/).

## [0.2.0] - 2026-10-20

### Añadido

- `SkillService` que copia y personaliza la skill de QA autónomo con el
  contexto del proyecto (nombre, package manager, versión y fecha).
- Contexto de template completo con `AUTHOR`, `DATE`, `YEAR`, `VERSION` y
  `NODE_VERSION`, con fallback a la configuración de git y al `package.json`.
- `CliError` con códigos de error tipados (`E_DIR_EXISTS`, `E_INVALID_NAME`,
  `E_CONFLICT_FLAGS`, `E_TEMPLATE_MISSING`, `E_PERMISSION`, `E_COPY_FAILED`,
  `E_CONFIG_FAILED`, `E_UNKNOWN`).
- Flag `--debug` para mostrar stack traces ante errores inesperados.
- Flag `--bun` para generar proyectos configurados con Bun.
- Motor de templates robusto que no interpreta `$&`, `$1` ni backslashes, con
  detección de placeholders sin resolver.
- Suite de tests con 73 casos: unitarios, de integración y E2E de la CLI.
- Cobertura de código con umbral mínimo del 80 %.
- Workflow de CI con matriz Ubuntu/macOS/Windows y Node 20, 22 y 24.
- ESLint (configuración flat), Prettier y EditorConfig.
- Ejemplos de uso en `--help`.
- Límite de 255 caracteres en el nombre de carpeta del proyecto.

### Cambiado

- El template se resuelve desde la raíz del paquete con `import.meta.url` en
  lugar de `process.cwd()`, para que funcione desde cualquier directorio.
- La salida de consola sigue un contrato estricto: `stdout` para el progreso y
  `stderr` para los errores.
- Los servicios de `package.json`, `README.md` y la skill ahora son idempotentes.
- `tsconfig.json` compila `src/` a `dist/` y excluye el template para evitar
  artefactos compilados dentro del paquete publicado.
- `package.json` declara `files`, `prepack` y `prepublishOnly`, por lo que el
  tarball siempre incluye `dist/`, `template/`, `README.md` y `LICENSE`.

### Corregido

- Rollback completo: si falla la copia o la configuración, el directorio
  generado se elimina y no queda ningún proyecto incompleto.
- Los directorios existentes nunca se sobrescriben y no existe un flag
  `--force` por diseño.
- El `.gitignore` del template se empaqueta como `template/gitignore` y se
  renombra a `.gitignore` al generar, porque npm excluye los archivos
  `.gitignore` de los tarballs.
- Las negaciones del `.gitignore` del template conservan los archivos
  `.gitkeep` anidados dentro de `npm pack`.
- El test de ejemplo del template se omite cuando no existe `BASE_URL`.

## [0.1.0] - 2026-10-19

### Añadido

- CLI `create-autonomous-qa` con Commander.js, comando `<project-name>` y flags
  `--pnpm` y `--bun`.
- Copia del template con la estructura base de QA: tests, Page Objects,
  fixtures, evidencias, defectos, analytics y reportes de Playwright.
- `package.json` y `README.md` dinámicos en el proyecto generado.
- Plantilla con `playwright.config.ts`, `.env.example`, `.gitignore` y test de
  ejemplo.
- Skill de QA autónomo de 9 fases para agentes de IA.
- Build ESM a `dist/` con shebang ejecutable.

[0.2.0]: https://github.com/david-perez-zuniga/create-autonomous-qa/releases/tag/v0.2.0
[0.1.0]: https://github.com/david-perez-zuniga/create-autonomous-qa/releases/tag/v0.1.0
