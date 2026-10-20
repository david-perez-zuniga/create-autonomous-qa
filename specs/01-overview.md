# 01 — Overview

## 1.1 Identidad del producto

| Campo | Valor |
|---|---|
| Nombre | Create Autonomous QA |
| Tipo | Herramienta CLI open-source |
| Comando | `create-autonomous-qa` |
| Versión inicial | `0.1.0` |
| Licencia | MIT |
| Runtime | Node.js >= 20 |
| Lenguaje | TypeScript (ESM) |
| Distribución | npm, pnpm, bunx |
| Repositorio | `create-autonomous-qa` |

## 1.2 Problema

Iniciar un proyecto de automatización QA con Playwright requiere hoy una secuencia manual y propensa a errores:

1. Crear la estructura de carpetas.
2. Instalar y configurar Playwright.
3. Configurar TypeScript.
4. Definir convenciones de páginas, fixtures y tests.
5. Preparar una carpeta de resultados y evidencias.
6. Documentar el proyecto.
7. Instalar y configurar agentes/skills de IA.
8. Repetir el proceso en cada nuevo proyecto.

El costo se multiplica cuando el objetivo es **QA autónomo**: además de Playwright se necesita una estructura de artefactos (defectos, evidencias, analítica) y una skill de IA que guíe el ciclo completo de descubrimiento, generación, ejecución y reporte.

## 1.3 Solución

Una CLI que, con un único comando, genera un proyecto de QA autónomo listo para trabajar:

```bash
create-autonomous-qa banking-qa
```

Resultado esperado:

```text
🚀 Creating Autonomous QA Project

✅ Template copied
✅ package.json configured
✅ README configured
✅ Skill installed

Project created successfully

Next steps:

cd banking-qa
pnpm install
pnpm test
```

## 1.4 Objetivo general

Generar automáticamente proyectos de QA Autónomo preparados para el siguiente ciclo:

```text
Descubrimiento funcional
        ↓
Generación de escenarios
        ↓
Generación de casos de prueba
        ↓
Generación Playwright
        ↓
Ejecución automática
        ↓
Captura de evidencias
        ↓
Clasificación de defectos
        ↓
Generación de artefactos
```

## 1.5 Objetivos específicos

| ID | Objetivo | Métrica |
|---|---|---|
| OBJ-01 | Reducir el bootstrap de un proyecto QA a un comando | 1 comando, < 3 s |
| OBJ-02 | Estandarizar la estructura de proyectos QA | 100 % de proyectos con la estructura definida |
| OBJ-03 | Incluir una skill de QA autónomo lista para usar | `skill.md` presente y personalizado |
| OBJ-04 | Soportar pnpm y Bun sin configuración manual | `--pnpm` / `--bun` funcionales |
| OBJ-05 | Ser multiplataforma | Windows, Linux, macOS y Codespaces |
| OBJ-06 | Permitir extensión futura | templates, skills, plugins y marketplace |

## 1.6 Personas

### QA Automation Engineer
Necesita un proyecto Playwright+TypeScript consistente, sin perder tiempo en configuración. Valora velocidad, convenciones y ejemplos ejecutables.

### SDET
Necesita una base extensible para escribir tests, fixtures y page objects. Valora separación de responsabilidades, tipado y herramientas modernas.

### QA Architect
Necesita estandarizar la estructura de múltiples equipos y proyectos. Valora consistencia, documentación, extensibilidad y gobierno de templates.

### Developer
Necesita incorporar pruebas automatizadas a su flujo sin dominar tooling QA. Valora comandos simples, mensajes claros y documentación inicial.

### AI Agent / Autonomous Testing System
Necesita una estructura predecible de carpetas, una skill con instrucciones explícitas y rutas canónicas para evidencias, defectos y reportes.

## 1.7 Alcance

### Incluido en v0.1.0

- CLI con Commander.js.
- Comando principal `create-autonomous-qa <project-name>`.
- Flags `--pnpm`, `--bun`, `--help`, `--version`.
- Copia de templates.
- Personalización de `package.json`.
- Personalización de `README.md`.
- Configuración de `packageManager`.
- Mensajes de consola y próximos pasos.
- Estructura de carpetas del proyecto generado.

### Incluido a partir de versiones posteriores

- SkillService completo (v0.2.0).
- Variables avanzadas (`AUTHOR`, `DATE`, `VERSION`) (v0.2.0).
- Instalación automática de dependencias y navegadores (v0.3.0).
- Validación de templates (v0.3.0).
- Templates múltiples, marketplace y plugins (v0.4.0).

### Fuera de alcance

- Ejecutar pruebas.
- Ejecutar Playwright.
- Descargar navegadores.
- Instalar dependencias.
- Gestionar CI/CD.
- Servir una aplicación web.
- Alojar un marketplace.
- Ejecutar agentes de IA.
- Modificar proyectos existentes generados previamente.
- Migraciones entre versiones de proyectos generados.

> **Regla de alcance:** la responsabilidad de la CLI termina cuando el proyecto fue generado y configurado correctamente. Cualquier ejecución posterior pertenece al proyecto generado y a sus propios scripts.

## 1.8 Supuestos

- El usuario tiene Node.js >= 20 instalado, o un package manager que lo resuelva.
- El usuario ejecuta la CLI en un directorio con permisos de escritura.
- El nombre del proyecto es un nombre de carpeta válido.
- El directorio destino no existe o está vacío.
- La CLI se distribuye con los templates incluidos en el paquete publicado.
- No se requiere conexión a internet para generar el proyecto (solo para instalarlo después).

## 1.9 Restricciones

- La CLI no debe modificar archivos fuera del directorio destino.
- La CLI no debe ejecutar scripts arbitrarios del template.
- La CLI no debe instalar dependencias en v0.1.0.
- La CLI debe funcionar sin TTY interactiva (CI, Codespaces, pipes).
- La CLI debe ser determinista: mismo input + misma versión ⇒ misma estructura de salida.
- La CLI no debe requerir configuración global previa.

## 1.10 Métricas de éxito

| Métrica | Objetivo |
|---|---|
| Tiempo de generación (template estándar) | < 3 s |
| Proyectos generados correctamente | ≥ 99 % en entornos soportados |
| Comandos necesarios para bootstrap | 1 |
| Archivos requeridos presentes | 100 % |
| Errores no controlados en flujo feliz | 0 |
| Cobertura de tests del núcleo | ≥ 80 % (v0.3.0) |

## 1.11 Glosario

| Término | Definición |
|---|---|
| Scaffolding | Generación automática de la estructura inicial de un proyecto |
| Template | Conjunto de archivos y carpetas usados como base para un proyecto generado |
| Placeholder | Marcador `{{VARIABLE}}` reemplazado durante la generación |
| Skill | Conjunto de instrucciones y recursos para un agente de IA |
| QA autónomo | Ciclo de pruebas guiado por agentes con mínima intervención humana |
| Artefacto | Evidencia, reporte, defecto o métrica producida por el ciclo QA |
| Paquete | Distribución publicable en npm (`create-autonomous-qa`) |
| Proyecto generado | Directorio creado por la CLI a partir de un template |
| Template estándar | Template por defecto incluido en la versión instalada |
| Project Generator | Componente que orquesta la creación del proyecto |
| Service | Componente que encapsula una responsabilidad de configuración |
EOF
