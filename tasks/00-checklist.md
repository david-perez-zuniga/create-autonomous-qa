# Checklist completo

## Bloqueadores
- [x] T-001: paths.ts + resolver template desde paquete
- [x] T-002: tsconfig + shebang en cli/index.ts
- [x] T-003: package.json files + prepublishOnly
- [x] T-004: SkillService completo + integración

## Importantes
- [x] T-005: Validación nombre/directorio
- [x] T-006: Contrato de salida exacto
- [x] T-007: Rollback
- [x] T-008: LICENSE
- [x] T-009: TemplateEngine robusto
- [x] T-010: Contexto completo

## Opcionales
- [x] T-011: Tests unitarios
- [x] T-012: Tests integración
- [x] T-013: CI
- [x] T-014: Lint/formato
- [x] T-015: Debug
- [x] T-016: Help mejorado

## Verificación

| Comando | Resultado |
|---|---|
| `pnpm build` | OK |
| `pnpm lint` | OK |
| `pnpm typecheck` | OK |
| `pnpm test` | 73 tests OK |
| `pnpm test:coverage` | 86.31 % statements, 74.03 % branches |
| `pnpm format:check` | OK |
| `npm pack --dry-run` | incluye `dist/`, `template/`, `LICENSE` y `README.md` |
| Instalación del tarball en directorio temporal | genera el proyecto correctamente |
