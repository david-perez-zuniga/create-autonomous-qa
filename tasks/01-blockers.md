# Bloqueadores críticos

## T-001: Resolver el template desde el paquete (no desde cwd)
- **Archivo(s):** `src/utils/paths.ts` (nuevo), `src/generators/project-generator.ts`
- **Problema:** `path.join(process.cwd(), "template")` busca en el directorio actual. Con `npx`/`pnpm dlx`/global falla.
- **Solución:**
  - Crear `src/utils/paths.ts` con `getTemplateDir()` usando `import.meta.url` y `fileURLToPath`.
  - Calcular desde `src/utils/` hacia la raíz del paquete: `path.resolve(dirname, "../../template")` (ajustar según estructura en `dist/`).
  - Reemplazar uso de `process.cwd()` para template por `getTemplateDir()`.
- **Criterio de aceptación:**
  - Funciona ejecutando desde fuera del repo
  - Funciona tras build (`dist/`)
  - Funciona con `npm pack` instalado en un directorio temporal

## T-002: Configurar build correctamente + shebang
- **Archivo(s):** `tsconfig.json`, `src/cli/index.ts`
- **Problema:** `outDir`/`rootDir` comentados, falta shebang
- **Solución:**
  - Actualizar `tsconfig.json`: `"rootDir": "./src"`, `"outDir": "./dist"`, `"module": "nodenext"`, `"moduleResolution": "nodenext"`, `"target": "esnext"`, mantener strict
  - Añadir `#!/usr/bin/env node` como primera línea de `src/cli/index.ts`
- **Criterio de aceptación:**
  - `pnpm build` genera `dist/cli/index.js` con shebang
  - Se puede ejecutar con `node dist/cli/index.js`

## T-003: Empaquetado para npm
- **Archivo(s):** `package.json`
- **Problema:** Falta `files` para incluir `dist/` y `template/`
- **Solución:**
  - Añadir `"files": ["dist", "template", "README.md", "LICENSE"]`
  - Verificar `prepublishOnly`: `pnpm build` (y opcionalmente tests)
- **Criterio de aceptación:**
  - `npm pack --dry-run` muestra `dist/` y `template/`
  - El tarball se puede instalar localmente y ejecutar

## T-004: Integrar SkillService correctamente
- **Archivo(s):** `src/services/skill-service.ts`, `src/generators/project-generator.ts`, `src/types/*`
- **Problema:** Es un stub, no se llama
- **Solución:**
  - Implementar `installSkill()` que copie `.opencode/skills/autonomous-qa/skill.md` desde template al destino
  - Aplicar `TemplateEngine` con contexto completo
  - Verificar no queden placeholders sin resolver
  - Llamarlo desde `createProject` tras README
  - Mostrar `✅ Skill installed` en orden correcto
- **Criterio de aceptación:**
  - `skill.md` se copia con `{{PROJECT_NAME}}` reemplazado
  - Aparece en salida correctamente
  - Funciona si falta (error claro) pero template debe tenerlo
