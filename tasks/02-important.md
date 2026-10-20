# Mejoras importantes

## T-005: Validación de nombre y directorio
- **Archivo(s):** `src/utils/project-name.ts` (nuevo), `src/generators/project-generator.ts`, `src/cli/index.ts`
- **Tareas:**
  - Crear util para validar nombre (evitar `..`, `.`, rutas absolutas, nombres reservados Windows)
  - Validar que directorio destino no exista (mantener comportamiento estricto)
  - Normalizar nombre para `package.json` si es necesario
- **Criterio:** Errores claros con exit code 1

## T-006: Contrato de salida exacto
- **Archivo(s):** `src/services/console-service.ts`, `src/generators/project-generator.ts`, `src/cli/index.ts`
- **Tareas:**
  - Alinear mensajes al spec: `🚀 Creating Autonomous QA Project`, `✅ Template copied`, `✅ package.json configured`, `✅ README configured`, `✅ Skill installed`, `Project created successfully`, `Next steps:`
  - No imprimir objeto `options`
  - Errores a stderr con `❌`
  - Respetar `NO_COLOR`/no TTY
- **Criterio:** Salida coincide con formato esperado

## T-007: Rollback ante errores
- **Archivo(s):** `src/generators/project-generator.ts`, `src/utils/fs-utils.ts` (nuevo)
- **Tareas:**
  - Si falla copia/configuración tras crear directorio, eliminarlo (best-effort)
  - No usar `process.exit` en servicios
  - Usar `process.exitCode` o lanzar errores
- **Criterio:** No deja proyecto parcial en fallos simulados

## T-008: LICENSE
- **Archivo(s):** `LICENSE` (nuevo)
- **Tareas:**
  - Añadir archivo LICENSE con MIT (coincidir con `package.json`)
- **Criterio:** Presente en repo y en paquete

## T-009: TemplateEngine robusto
- **Archivo(s):** `src/utils/template-engine.ts`
- **Tareas:**
  - Reemplazar con `split/join` en lugar de `RegExp` con valores
  - Añadir `findUnresolvedVariables()` y `assertNoUnresolvedVariables()`
  - Tratar `undefined/null` como `""`
- **Criterio:** Valores con `$&`, `$1` se insertan literalmente

## T-010: Contexto completo para templates
- **Archivo(s):** `src/generators/project-generator.ts`, `src/services/readme-service.ts`, `src/services/package-json-service.ts`, `src/services/skill-service.ts`, `src/types/template-context.ts` (nuevo)
- **Tareas:**
  - Construir `TemplateContext` con `PROJECT_NAME`, `PACKAGE_NAME`, `PACKAGE_MANAGER`, `PACKAGE_MANAGER_FIELD`, `INSTALL_COMMAND`, `TEST_COMMAND`, `AUTHOR`, `DATE`, `YEAR`, `VERSION`, `NODE_VERSION`
  - Pasar contexto a todos los servicios
- **Criterio:** README y skill quedan sin placeholders sin resolver
