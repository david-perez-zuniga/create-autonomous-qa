# Mejoras opcionales (recomendadas)

## T-011: Tests unitarios (Vitest)
- **Dependencias:** `vitest`, `@vitest/coverage-v8`
- **Tests:** `template-engine`, `project-name`, `package-json-service`, `readme-service`, `skill-service`, `paths`
- **Scripts:** `test`, `test:coverage`

## T-012: Tests de integración
- **Dependencias:** `execa`, `memfs` si se desea
- **Tests:** generación completa, errores, rollback, estructura

## T-013: CI (GitHub Actions)
- **Archivo:** `.github/workflows/ci.yml`
- **Jobs:** build + test + lint en ubuntu/macos/windows

## T-014: Lint y formato
- **Dependencias:** `eslint`, `typescript-eslint`, `prettier`, `prettier-plugin-*`
- **Archivos:** `.eslintrc`, `.prettierrc`, `.editorconfig`

## T-015: Debug y errores mejorados
- **Flags:** `--debug`
- **Mejoras:** `CliError`, exit codes consistentes

## T-016: Mejorar CLI help/version
- **Mejoras:** Ayuda con ejemplos, versión desde package.json
