# Tareas para dejar `create-autonomous-qa` listo para uso real

Este directorio contiene el desglose de las 16 tareas necesarias para que la CLI funcione correctamente con `npx`, `pnpm dlx`, `bunx` y al publicarse en npm.

## Estado

Todas las tareas están completadas.

| Documento | Contenido |
|---|---|
| [00-checklist.md](./00-checklist.md) | Checklist con estado y verificación |
| [01-blockers.md](./01-blockers.md) | Bloqueadores críticos (T-001 a T-004) |
| [02-important.md](./02-important.md) | Mejoras importantes (T-005 a T-010) |
| [03-optional.md](./03-optional.md) | Calidad, tests y CI (T-011 a T-016) |

## Resumen de cambios

- El template se resuelve desde la raíz del paquete con `import.meta.url`, no desde `process.cwd()`.
- El build genera `dist/` con shebang y el paquete incluye `dist/`, `template/`, `README.md` y `LICENSE`.
- `SkillService` copia y personaliza `.opencode/skills/autonomous-qa/skill.md`.
- Se agregó validación de nombres, path traversal y nombres reservados de Windows.
- La salida de consola sigue el contrato de las specs y usa `stderr` para errores.
- Los servicios son idempotentes y el generador hace rollback ante fallos.
- El contexto de template incluye autor, fecha, versión, package manager y comandos.
- Hay tests unitarios, de integración y E2E; lint, formato, typecheck, CI y cobertura.
- `--debug` muestra stack traces y `--help` incluye ejemplos.

## Verificación rápida

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
npm pack --dry-run
```
