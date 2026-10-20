# 06 — Requisitos no funcionales

## 6.1 Rendimiento

### Presupuesto

| Escenario | Objetivo | Máximo aceptable |
|---|---|---|
| Generación con template estándar | < 1.5 s | < 3 s |
| Generación con template grande (futuro) | < 3 s | < 5 s |
| `--help` | < 300 ms | < 1 s |
| `--version` | < 300 ms | < 1 s |
| Arranque de la CLI | < 500 ms | < 1 s |

### Medición

- Desde la invocación del proceso hasta el exit.
- En un equipo de referencia: 4 vCPU, 8 GB RAM, SSD.
- Sin contar instalación de dependencias (fuera de alcance).
- Medición repetida 5 veces; se usa la mediana.

### Reglas

- No se permiten operaciones de red durante la generación.
- No se debe leer el template más de una vez por archivo.
- La copia debe ser streaming/recursiva del sistema de archivos, no archivo por archivo con múltiples stat.
- No se deben ejecutar procesos externos (npm, git, playwright) en v0.1.0.

### Benchmark

```bash
hyperfine --warmup 3 \
  "node dist/cli/index.js /tmp/qa-bench-\$RANDOM"
```

> El benchmark debe excluir el tiempo de creación del directorio destino si se mide por separado. Documentar el método.

## 6.2 Compatibilidad

### Plataformas

| Plataforma | Soporte | Notas |
|---|---|---|
| Linux (x64, arm64) | Sí | Objetivo principal de CI |
| macOS (x64, arm64) | Sí | |
| Windows 10/11 (x64) | Sí | Rutas y nombres reservados |
| GitHub Codespaces | Sí | Sin TTY, usuario no root |
| Docker (Linux) | Sí | Sin TTY |
| WSL2 | Sí | |

### Node.js

- `engines.node: ">=20"`.
- Probar en Node 20, 22 y 24.
- No usar APIs experimentales.
- No usar APIs removidas en versiones soportadas.

### Package managers

| Manager | Versión | Soporte |
|---|---|---|
| npm | >= 10 | Instalación de la CLI |
| pnpm | >= 10 | Instalación y proyectos generados |
| bun | >= 1.1 | Instalación y proyectos generados |

### Sistemas de archivos

- Case-sensitive (Linux) y case-insensitive (macOS/Windows).
- Rutas con espacios.
- Rutas con caracteres Unicode.
- Rutas largas en Windows (si es posible; documentar límite).

### Reglas multiplataforma

- Usar `node:path` para todas las rutas.
- No concatenar rutas con `/` o `\` manualmente.
- No asumir permisos POSIX.
- No usar `chmod` en v0.1.0.
- No usar shell scripts en la generación.
- No usar `rm -rf`; usar `fs.rmSync` con `recursive: true`.
- Resolver `templateDir` desde `import.meta.url`, no desde `cwd`.
- Evitar nombres reservados de Windows en validación.

## 6.3 Mantenibilidad

### Reglas

| Regla | Límite |
|---|---|
| Tamaño de archivo | ≤ 200 líneas (objetivo), ≤ 300 (máximo) |
| Complejidad ciclomática por función | ≤ 10 |
| Funciones por archivo | ≤ 10 |
| Profundidad de anidamiento | ≤ 3 |
| Parámetros por función | ≤ 4 (usar objeto si son más) |
| Duplicación | 0 bloques duplicados > 5 líneas |
| Strings mágicos | 0 en lógica; todos en `constants/` |
| `any` explícito | 0 |
| `@ts-ignore` | 0 sin justificación documentada |

### Estilo

- TypeScript estricto (`strict: true`).
- Prettier para formato.
- ESLint para calidad.
- Nombres en inglés para código; mensajes de usuario en inglés.
- Comentarios solo cuando explican *por qué*, no *qué*.
- Exports nombrados; evitar `default` salvo en configuración.

### Documentación

- README del repositorio con instalación, uso y ejemplos.
- JSDoc en funciones públicas de servicios y utilidades.
- Specs en `specs/`.
- CHANGELOG a partir de v0.2.0.
- ADRs para decisiones relevantes.

### Deuda técnica

- Toda deuda debe registrarse con contexto y plan.
- No se acepta deuda que rompa multiplataforma.
- No se acepta deuda en manejo de errores.

## 6.4 Escalabilidad

### Extensiones previstas

| Extensión | Mecanismo | Versión |
|---|---|---|
| Nuevo package manager | Registro en `PACKAGE_MANAGERS` + flag | 0.2.0 |
| Nuevo template | Directorio + manifiesto + flag | 0.4.0 |
| Nueva skill | Directorio en template + registro | 0.4.0 |
| Plugin | Interfaz `GeneratorPlugin` | 0.4.0 |
| Marketplace | Índice remoto + verificación | 0.4.0+ |

### Requisitos de diseño

- El Generator no debe conocer package managers concretos.
- Los Services no deben conocer flags CLI.
- Las rutas deben ser constantes, no literales dispersos.
- La salida de consola debe ser abstraída.
- Debe ser posible testear cada servicio de forma aislada.

### Límites conocidos

- No se soportan proyectos con más de 10 000 archivos en template (no es el caso de uso).
- No se soporta generación concurrente en el mismo destino.
- No se soportan nombres de proyecto con separadores de ruta en Windows más allá de `\` y `/`.

## 6.5 Seguridad

### Amenazas

| Amenaza | Mitigación |
|---|---|
| Path traversal (`../../etc`) | Validar y resolver ruta; rechazar escapes del `cwd` salvo ruta absoluta explícita permitida |
| Sobrescritura de archivos | Política de colisión estricta |
| Ejecución de código del template | No ejecutar scripts del template |
| Inyección en reemplazo de variables | `split/join`, no `RegExp` con valores |
| Fuga de secretos | No leer `.env` real; solo `.env.example` |
| Dependencias maliciosas | Lockfile, auditoría, dependencias mínimas |
| Prototype pollution | Parsear JSON y asignar solo campos permitidos |
| Symlinks maliciosos en template | No seguir symlinks; validar que el template sea un directorio real |

### Reglas

- La CLI no debe requerir permisos de administrador.
- La CLI no debe acceder a la red.
- La CLI no debe leer archivos fuera del template y del proyecto destino.
- La CLI no debe registrar variables de entorno en logs.
- La CLI no debe incluir secretos en el paquete.
- El paquete debe publicarse con `files` explícito para no incluir archivos innecesarios.

### Path traversal

```typescript
const target = path.resolve(cwd, projectName);
const relative = path.relative(cwd, target);

if (relative.startsWith("..") || path.isAbsolute(relative)) {
  throw new CliError("E_INVALID_NAME", "Project path must be inside the current directory");
}
```

> Si se decide permitir rutas absolutas, debe ser una opción explícita y documentada. v0.1.0 no las permite.

### Dependencias

- Minimizar dependencias runtime.
- `commander` es la única dependencia runtime en v0.1.0.
- Auditar con `pnpm audit` en CI.
- Fijar versiones en lockfile.
- Revisar cambios de dependencias en PRs.

## 6.6 Fiabilidad

### Requisitos

| ID | Requisito |
|---|---|
| REL-01 | Un fallo no debe dejar un proyecto parcial sin informar |
| REL-02 | El rollback debe ser best-effort y no ocultar el error original |
| REL-03 | Los errores deben tener código y mensaje accionable |
| REL-04 | La CLI debe funcionar sin TTY |
| REL-05 | La CLI debe funcionar sin conexión a internet |
| REL-06 | La CLI debe ser determinista |
| REL-07 | La CLI no debe bloquearse esperando input |
| REL-08 | Los servicios deben ser idempotentes |

### Matriz de fallos

| Fallo | Detección | Respuesta |
|---|---|---|
| Template ausente | `existsSync` | `E_TEMPLATE_MISSING`, sin escribir |
| Destino existente | `existsSync` | `E_DIR_EXISTS`, sin escribir |
| Sin permisos | excepción FS | `E_PERMISSION`, rollback |
| JSON inválido | `JSON.parse` | `E_CONFIG_FAILED`, rollback |
| Placeholder sin resolver | regex | `E_CONFIG_FAILED`, rollback |
| Disco lleno | excepción FS | `E_COPY_FAILED`, rollback |

## 6.7 Observabilidad

### Salida

- Mensajes de progreso en `stdout`.
- Errores en `stderr`.
- Exit codes documentados.
- Sin logs a archivo en v0.1.0.
- `DEBUG` para detalles.

### Exit codes

| Código | Significado |
|---|---|
| 0 | Éxito (incluye `--help` y `--version`) |
| 1 | Error de uso o de generación |
| 2 | Error inesperado (reservado) |

### Formato de error

```text
❌ <mensaje accionable>
```

En `DEBUG`:
```text
❌ <mensaje accionable>
Caused by: <detalle>
<stack trace>
```

### Telemetría

- v0.1.0 no incluye telemetría.
- Cualquier telemetría futura debe ser opt-in, documentada y sin datos personales.

## 6.8 Testabilidad

### Requisitos

- Servicios testeables sin tocar el filesystem real (inyección o `memfs`).
- CLI testeable con `execa` o `child_process`.
- Tests de integración sobre un directorio temporal.
- Snapshot de estructura generada.
- Snapshot de salida de consola.
- Cobertura mínima: 80 % en núcleo (v0.3.0).

### Herramientas sugeridas

| Propósito | Herramienta |
|---|---|
| Test runner | `vitest` |
| FS en memoria | `memfs` |
| CLI E2E | `execa` |
| Snapshots | `vitest` |
| Cobertura | `vitest --coverage` |
| Lint | `eslint` |
| Formato | `prettier` |

## 6.9 Distribución

### Paquete

```json
{
  "name": "create-autonomous-qa",
  "bin": {
    "create-autonomous-qa": "./dist/cli/index.js"
  },
  "files": [
    "dist",
    "template",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=20"
  }
}
```

### Reglas

- `dist/` debe incluir todos los módulos.
- `template/` debe incluirse en el paquete.
- El shebang `#!/usr/bin/env node` debe estar en `dist/cli/index.js`.
- El build debe preservar permisos de ejecución del bin.
- No incluir `src/`, `tests/` ni `specs/` en el paquete publicado.
- Verificar con `npm pack --dry-run`.

### Instalación

```bash
npm create autonomous-qa@latest my-project
# o
npm i -g create-autonomous-qa
# o
pnpm dlx create-autonomous-qa my-project
# o
bunx create-autonomous-qa my-project
```

> El alias `npm create` requiere que el paquete se llame `create-autonomous-qa`; el comando resultante es `create-autonomous-qa`.

### Versionado

- SemVer.
- `0.x` puede romper compatibilidad, pero debe documentarlo.
- Cambios de estructura generada ⇒ minor o major según impacto.
- CHANGELOG obligatorio desde v0.2.0.

## 6.10 Accesibilidad de la CLI

- Mensajes claros y accionables.
- No depender solo de color para transmitir estado.
- Emojis acompañados de texto.
- Salida legible en lectores de pantalla (evitar artefactos de spinner persistentes).
- Respetar `NO_COLOR`.
- No usar animaciones en entornos no TTY.

## 6.11 Internacionalización

- v0.1.0: mensajes en inglés.
- El contenido del proyecto generado puede estar en inglés.
- La documentación puede estar en español.
- No se requiere i18n en v0.1.0.
- Si se agrega i18n, debe ser por archivos de mensajes y sin concatenación de strings.

## 6.12 Privacidad

- No se recolectan datos.
- No se envían datos a servicios externos.
- No se leen archivos del usuario fuera del necesario.
- `AUTHOR` se obtiene de git/package.json local; si no está, se deja vacío.
- No se registran rutas absolutas en artefactos del proyecto generado salvo que el usuario lo solicite.

## 6.13 Licencia y comunidad

- Licencia MIT.
- `LICENSE` incluido en el paquete.
- Guía de contribución.
- Código de conducta.
- Templates de issues y PRs.
- CI para lint, test y build.
- Dependabot o similar.

## 6.14 Matriz de verificación no funcional

| Requisito | Verificación | Versión |
|---|---|---|
| < 3 s | Benchmark con hyperfine | 0.1.0 |
| Multiplataforma | CI matrix (ubuntu, macos, windows) | 0.1.0 |
| Sin TTY | Test con `CI=1` y pipes | 0.1.0 |
| Sin red | Test con red deshabilitada | 0.1.0 |
| Determinismo | Snapshot repetido | 0.1.0 |
| Rollback | Test de fallo simulado | 0.2.0 |
| Cobertura ≥ 80 % | Coverage report | 0.3.0 |
| `npm pack` correcto | Smoke test del tarball | 0.3.0 |
| Seguridad de path | Tests de traversal | 0.1.0 |
EOF
