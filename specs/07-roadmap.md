# 07 — Roadmap

## 7.1 Principios de planificación

- Cada versión debe entregar valor usable de forma independiente.
- No se avanza de versión sin criterios de salida cumplidos.
- La estructura generada debe ser compatible hacia adelante cuando sea posible.
- Los cambios incompatibles se documentan en CHANGELOG y en la guía de migración.
- La calidad (tests, lint, documentación) es parte del alcance, no un extra.

## 7.2 Estado actual

| Área | Estado |
|---|---|
| CLI con Commander.js | Implementado (básico) |
| Generación de proyecto | Implementado (básico) |
| Copia de template | Implementado |
| package.json dinámico | Implementado |
| README dinámico | Implementado (parcial) |
| Soporte pnpm | Implementado |
| Soporte Bun | Implementado (parcial) |
| SkillService | Stub |
| Estructura completa del template | Incompleta |
| Tests | Ausentes |
| Documentación | Mínima |

> Ver `08-implementation-gaps.md` para el detalle y el plan de cierre.

## 7.3 v0.1.0 — CLI funcional

### Tema
Bootstrap básico de proyectos QA con Playwright, pnpm y Bun.

### Entregables

| ID | Entregable |
|---|---|
| V010-01 | CLI `create-autonomous-qa` con Commander.js |
| V010-02 | Comando `<project-name>` |
| V010-03 | Flags `--pnpm`, `--bun` |
| V010-04 | `--help` y `--version` |
| V010-05 | Copia de template estándar |
| V010-06 | `package.json` dinámico |
| V010-07 | `README.md` dinámico |
| V010-08 | Mensajes de consola y próximos pasos |
| V010-09 | Validación de colisión de directorio |
| V010-10 | Estructura de carpetas completa |
| V010-11 | `.env.example` y `.gitignore` |
| V010-12 | `playwright.config.ts` funcional |
| V010-13 | Test de ejemplo ejecutable |
| V010-14 | Build ESM a `dist/` con shebang |
| V010-15 | README del repositorio |

### Criterios de salida

- [x] `pnpm build` produce `dist/cli/index.js` ejecutable.
- [x] `node dist/cli/index.js demo` genera un proyecto válido.
- [x] `--pnpm` y `--bun` configuran `packageManager` correctamente.
- [x] `--help` y `--version` funcionan.
- [x] El proyecto generado pasa `pnpm install` y `pnpm test` (con `BASE_URL` disponible o test skip).
- [x] La estructura generada coincide con FR-003.
- [x] Generación < 3 s.
- [x] Funciona en Linux, macOS y Windows (CI).
- [x] Sin errores no controlados en flujo feliz.
- [x] README del repositorio documenta uso.

### Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Template incompleto | Proyecto generado no ejecutable | Checklist de template |
| Ruta del template en `dist/` | `E_TEMPLATE_MISSING` en producción | Test del tarball |
| Playwright config vacío | Tests no ejecutables | Completar template |
| Sin tests de la CLI | Regresiones | Tests de integración |

## 7.4 v0.2.0 — Skill y experiencia

### Tema
SkillService real, variables avanzadas y mejor UX.

### Entregables

| ID | Entregable |
|---|---|
| V020-01 | `SkillService` copia y personaliza `skill.md` |
| V020-02 | Skill completa con las 9 fases |
| V020-03 | `TemplateContext` con `AUTHOR`, `DATE`, `YEAR`, `VERSION` |
| V020-04 | README completo y personalizado |
| V020-05 | `playwright.config.ts` completo |
| V020-06 | Rollback ante fallos |
| V020-07 | Idempotencia de servicios |
| V020-08 | Mensajes de consola según contrato FR-008 |
| V020-09 | Tests unitarios de servicios |
| V020-10 | Tests de integración de CLI |
| V020-11 | Manejo de errores con `CliError` |
| V020-12 | Detección de placeholders no resueltos |
| V020-13 | Validación de nombre de proyecto |

### Criterios de salida

- [x] `skill.md` generado cumple SK-01…SK-10.
- [x] Salida de consola coincide con el contrato.
- [x] Errores usan `stderr` y exit codes documentados.
- [x] Rollback verificado con fallo simulado.
- [x] Cobertura ≥ 70 %.
- [x] `AUTHOR` y `DATE` se resuelven con fallback.
- [x] No quedan placeholders en archivos configurados.

### Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Skill demasiado genérica | Poco valor para agentes | Revisión con casos reales |
| `AUTHOR` no disponible | Placeholder vacío | Fallback documentado |
| Cambios de salida rompen tests | Ruido | Contrato estable + snapshots |

## 7.5 v0.3.0 — Automatización y validación

### Tema
Instalación automática opcional, validación de templates y calidad.

### Entregables

| ID | Entregable |
|---|---|
| V030-01 | Flag `--install` para instalar dependencias |
| V030-02 | Flag `--with-browsers` para `playwright install` |
| V030-03 | Detección del package manager disponible |
| V030-04 | `TemplateValidator` |
| V030-05 | Comando `--validate-template` |
| V030-06 | Manifiesto `template.json` obligatorio |
| V030-07 | `--debug` con stack traces |
| V030-08 | `--dry-run` (opcional) |
| V030-09 | Cobertura ≥ 80 % |
| V030-10 | CI matrix completa |
| V030-11 | `npm pack` smoke test |
| V030-12 | CHANGELOG |

### Criterios de salida

- [ ] `--install` funciona en pnpm y Bun.
- [ ] Si falla la instalación, el proyecto queda generado y se informa.
- [ ] `--validate-template` detecta TV-01…TV-12.
- [ ] `--debug` no se activa por defecto.
- [ ] CI verde en 3 sistemas operativos.
- [ ] Paquete publicado contiene `dist/` y `template/`.

### Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Instalación lenta | Mala UX | Progreso claro, timeout |
| Red requerida | Fallos en CI | Instalación opt-in |
| `playwright install` pesado | Tiempo | Consentimiento explícito |

## 7.6 v0.4.0 — Ecosistema

### Tema
Templates múltiples, marketplace y plugins.

### Entregables

| ID | Entregable |
|---|---|
| V040-01 | Flag `--template <name>` |
| V040-02 | Directorio `templates/` con `default` y al menos uno adicional |
| V040-03 | Registro de templates |
| V040-04 | Interfaz `GeneratorPlugin` |
| V040-05 | Carga de plugins locales |
| V040-06 | Índice de skills (marketplace) |
| V040-07 | Instalación de skills desde índice |
| V040-08 | Verificación de integridad (checksum) |
| V040-09 | Documentación de extensibilidad |

### Criterios de salida

- [ ] `--template banking` genera el template correcto.
- [ ] Un template desconocido lista los disponibles.
- [ ] Un plugin puede ejecutar hooks `beforeGenerate` y `afterGenerate`.
- [ ] La instalación desde marketplace falla de forma segura sin conexión.
- [ ] Checksums verificados.

### Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Marketplace inseguro | Ejecución de código | Solo contenido declarativo + checksum |
| Templates divergentes | Inconsistencia | Validador común |
| Complejidad de plugins | Mantenibilidad | Interfaz mínima y versionada |

## 7.7 v1.0.0 — Framework completo

### Tema
Plataforma estable para QA autónomo.

### Entregables

| ID | Entregable |
|---|---|
| V100-01 | API estable de templates y skills |
| V100-02 | Documentación completa |
| V100-03 | Guías de migración |
| V100-04 | Soporte de múltiples package managers |
| V100-05 | Suite de tests madura |
| V100-06 | Política de versionado y deprecación |
| V100-07 | Ejemplos end-to-end |
| V100-08 | Comunidad y contribución |

### Criterios de salida

- [ ] API pública documentada y versionada.
- [ ] Cobertura ≥ 85 %.
- [ ] Sin breaking changes pendientes.
- [ ] Migración documentada desde 0.x.
- [ ] Adopción validada con proyectos reales.

## 7.8 Dependencias entre versiones

```text
v0.1.0 ──▶ v0.2.0 ──▶ v0.3.0 ──▶ v0.4.0 ──▶ v1.0.0
   │           │           │           │
   │           │           │           └─ plugins/marketplace
   │           │           └─ validación/instalación
   │           └─ skills/UX/rollback
   └─ CLI/template/base
```

## 7.9 Priorización (MoSCoW)

### Must

- Generación correcta y completa.
- pnpm y Bun.
- Skill instalada.
- Manejo de errores.
- Multiplataforma.
- Documentación de uso.

### Should

- Rollback.
- Idempotencia.
- Validación de templates.
- `--debug`.
- Tests de integración.

### Could

- `--dry-run`.
- Trazabilidad `.create-autonomous-qa.json`.
- Telemetría opt-in.
- `--force`.

### Won't (por ahora)

- Ejecutar pruebas.
- Instalar navegadores por defecto.
- Interfaz web.
- Autenticación.
- Hosting de marketplace.

## 7.10 Métricas por versión

| Versión | Cobertura | Tiempo generación | Plataformas CI | Docs |
|---|---|---|---|---|
| 0.1.0 | ≥ 50 % | < 3 s | 1 | README |
| 0.2.0 | ≥ 70 % | < 3 s | 2 | README + specs |
| 0.3.0 | ≥ 80 % | < 3 s | 3 | Docs completas |
| 0.4.0 | ≥ 80 % | < 3 s | 3 | Docs + guías |
| 1.0.0 | ≥ 85 % | < 2 s | 3 | Docs + migración |

## 7.11 Registro de cambios

Cada release debe incluir:

- Versión y fecha.
- Cambios agregados.
- Cambios modificados.
- Cambios deprecados.
- Cambios removidos.
- Correcciones.
- Notas de migración (si aplica).

Formato sugerido: [Keep a Changelog](https://keepachangelog.com/).
EOF
