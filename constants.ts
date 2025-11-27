
import { FeatureConfig, FeatureId, PMFeatureListItem } from './types';
import {
  UserStoryIcon, AcceptanceCriteriaIcon, CompetitiveAnalysisIcon, PRDIcon, PrioritizationIcon, SWOTIcon, FeedbackIcon, ReleaseNotesIcon, ABTestIcon, ElevatorPitchIcon, KanoIcon, RiceIcon, HypothesisIcon, InterviewIcon, OKRIcon, KPIIcon
} from './components/icons';

const featurePromptEnhancer = (taskSpecificPrompt: string): string => {
  return `Eres "PM Copilot", un asistente experto en Product Management. Tu tono es profesional, útil y práctico.
IMPORTANTE SOBRE EL FORMATO DE RESPUESTA:
1. Responde SIEMPRE usando Markdown estándar y semántico.
2. Usa **encabezados H1 (#) y H2 (##)** para estructurar las secciones claramente.
3. Usa **listas con viñetas (-)** o **numeradas (1.)** para enumerar puntos.
4. Usa **negritas (**texto**)** para resaltar conceptos clave.
5. Asegúrate de separar los párrafos con un doble salto de línea para facilitar la lectura.
6. NO uses bloques de código (\`\`\`) para texto normal, solo para código real.
7. Tu respuesta será convertida directamente a un documento editable, así que mantén la estructura limpia y profesional.

Aquí está la tarea:
${taskSpecificPrompt}`;
};

export const PM_FEATURES: PMFeatureListItem[] = [
  { id: FeatureId.USER_STORY, title: 'Generador de Historias de Usuario', icon: UserStoryIcon },
  { id: FeatureId.ACCEPTANCE_CRITERIA, title: 'Creador de Criterios de Aceptación', icon: AcceptanceCriteriaIcon },
  { id: FeatureId.COMPETITIVE_FEATURES, title: 'Ideación de Funcionalidades Competitivas', icon: CompetitiveAnalysisIcon },
  { id: FeatureId.PRD_OUTLINE, title: 'Generador de Esquema de PRD', icon: PRDIcon },
  { id: FeatureId.SWOT_ANALYSIS, title: 'Generador de Análisis FODA', icon: SWOTIcon },
  { id: FeatureId.AI_TICKET_ANALYSIS, title: 'Análisis de Tickets con IA', icon: FeedbackIcon },
  { id: FeatureId.RELEASE_NOTES, title: 'Redactor de Notas de Lanzamiento', icon: ReleaseNotesIcon },
  { id: FeatureId.AB_TEST_IDEAS, title: 'Generador de Ideas para Pruebas A/B', icon: ABTestIcon },
  { id: FeatureId.ELEVATOR_PITCH, title: 'Creador de Elevator Pitch', icon: ElevatorPitchIcon },
  { id: FeatureId.KANO_MODEL, title: 'Generador de Matriz Kano', icon: KanoIcon },
  { id: FeatureId.RICE_SCORING, title: 'Generador de Priorización RICE', icon: RiceIcon },
  { id: FeatureId.HYPOTHESIS_GENERATOR, title: 'Generador de Hipótesis', icon: HypothesisIcon },
  { id: FeatureId.VALIDATION_INTERVIEW_SCRIPT, title: 'Guion de Entrevista de Validación', icon: InterviewIcon },
  { id: FeatureId.OKR_GENERATOR, title: 'Generador de OKR', icon: OKRIcon },
  { id: FeatureId.KPI_GENERATOR, title: 'Generador de KPIs', icon: KPIIcon },
];

export const featureConfigs: FeatureConfig[] = [
  {
    id: FeatureId.USER_STORY,
    title: 'Generador de Historias de Usuario',
    description: 'Crea historias de usuario efectivas basadas en la descripción de una funcionalidad y el usuario objetivo.',
    icon: UserStoryIcon,
    inputFields: [
      { id: 'featureDescription', label: 'Descripción de la Funcionalidad', placeholder: 'Ej: Un sistema de login con autenticación de dos factores', type: 'textarea', rows: 3 },
      { id: 'targetUser', label: 'Usuario Objetivo', placeholder: 'Ej: Usuarios preocupados por la seguridad', type: 'text' },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Genera historias de usuario bien escritas para:
**Funcionalidad:** "${inputs.featureDescription}"
**Usuario Objetivo:** "${inputs.targetUser}"

Estructura de la respuesta:
# Historias de Usuario Generadas

## Historia Principal
"Como [rol], quiero [acción] para que [beneficio]."

## Historias Alternativas / Casos de Borde
*   **Caso 1:** [Historia]
*   **Caso 2:** [Historia]
`
    ),
    outputTitle: 'Historias de Usuario',
    exampleInputs: {
      featureDescription: 'Un panel de control para visualizar el consumo de energía en tiempo real de dispositivos inteligentes del hogar.',
      targetUser: 'Propietarios de casas eco-conscientes que quieren reducir su factura de luz.',
    },
  },
  {
    id: FeatureId.ACCEPTANCE_CRITERIA,
    title: 'Creador de Criterios de Aceptación',
    description: 'Define criterios de aceptación claros y concisos para una historia de usuario.',
    icon: AcceptanceCriteriaIcon,
    inputFields: [
      { id: 'userStory', label: 'Historia de Usuario', placeholder: 'Ej: Como usuario, quiero poder resetear mi contraseña para recuperar el acceso a mi cuenta.', type: 'textarea', rows: 3 },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Genera criterios de aceptación detallados y testeables para:
**Historia de Usuario:** "${inputs.userStory}"

Instrucciones:
1. Usa una lista con viñetas.
2. Cada criterio debe seguir la estructura Gherkin (Dado/Cuando/Entonces) si es posible, o ser una afirmación clara.
3. Mantén cada criterio en un solo bloque de texto.

Estructura sugerida:
# Criterios de Aceptación

## Escenarios Exitosos
*   **Dado** que el usuario está en la pantalla X, **cuando** hace Y, **entonces** sucede Z.
*   [Otro criterio positivo]

## Escenarios de Error y Borde
*   **Dado** [condición de error], **cuando** [acción], **entonces** mostrar mensaje de error adecuado.
`
    ),
    outputTitle: 'Criterios de Aceptación',
    exampleInputs: {
      userStory: 'Como comprador online, quiero poder filtrar los productos por rango de precio para encontrar artículos dentro de mi presupuesto.',
    },
  },
  {
    id: FeatureId.COMPETITIVE_FEATURES,
    title: 'Ideación de Funcionalidades Competitivas',
    description: 'Genera ideas de funcionalidades innovadoras para diferenciar tu producto en el mercado.',
    icon: CompetitiveAnalysisIcon,
    inputFields: [
      { id: 'productDescription', label: 'Descripción de tu Producto', placeholder: 'Ej: Una app móvil para gestión de tareas personales.', type: 'textarea', rows: 3 },
      { id: 'competitorInfo', label: 'Información de Competidores (Opcional)', placeholder: 'Ej: Competidor A ofrece X, Competidor B destaca en Y.', type: 'textarea', rows: 2 },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Analiza el producto: "${inputs.productDescription}".
${inputs.competitorInfo ? `Competencia: "${inputs.competitorInfo}".` : ''}

Genera un documento con ideas de funcionalidades innovadoras.

# Análisis de Diferenciación y Oportunidades

## Ideas de Alto Impacto
1.  **[Nombre Idea 1]:** Descripción detallada de la funcionalidad y por qué diferencia al producto.
2.  **[Nombre Idea 2]:** Descripción detallada.

## Quick Wins (Implementación Rápida)
*   **[Idea]:** Descripción.
`
    ),
    outputTitle: 'Ideas Competitivas',
    exampleInputs: {
      productDescription: 'Una aplicación de aprendizaje de idiomas enfocada en conversaciones reales con tutores nativos.',
      competitorInfo: 'Duolingo (gamificación fuerte), Babbel (enfoque académico), Preply (marketplace de tutores).',
    },
  },
  {
    id: FeatureId.PRD_OUTLINE,
    title: 'Generador de Esquema de PRD',
    description: 'Crea un esquema estructurado para un Documento de Requisitos de Producto (PRD) con énfasis en la definición del problema.',
    icon: PRDIcon,
    inputFields: [
      { id: 'productFeatureName', label: 'Nombre del Producto/Funcionalidad', placeholder: 'Ej: Nuevo Dashboard de Analíticas', type: 'text' },
      { id: 'briefDescription', label: 'Breve Descripción', placeholder: 'Ej: Un dashboard para visualizar métricas clave de uso.', type: 'textarea', rows: 2 },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Genera un esquema de PRD profesional y detallado para **"${inputs.productFeatureName}"**.
Descripción: "${inputs.briefDescription}".

# Documento de Requisitos de Producto (PRD)

## 1. Introducción y Visión
*   **Visión:** ¿Qué estamos construyendo y cuál es el objetivo final?
*   **Alineación Estratégica:** ¿Por qué es importante para la empresa ahora?

## 2. Definición del Problema (Pain Points)
*   **El Dolor del Usuario:** Describe en profundidad qué fricción o problema enfrenta el usuario actualmente.
*   **Impacto y Consecuencias:** ¿Qué sucede si no resolvemos este problema? (Costos, abandono, frustración).
*   **Validación:** ¿Qué evidencia tenemos? (Feedback, datos, intuición informada).

## 3. Usuarios y Casos de Uso
*   **User Personas:** ¿Quiénes son los usuarios principales?
*   **Historias de Usuario Clave:** Los flujos más importantes que este producto debe habilitar.

## 4. Requisitos Funcionales (Scope)
*   **[Funcionalidad Clave 1]:** Descripción detallada del comportamiento esperado.
*   **[Funcionalidad Clave 2]:** Descripción detallada.

## 5. Requisitos No Funcionales
*   Rendimiento, Seguridad, Escalabilidad, Accesibilidad.

## 6. Métricas de Éxito (KPIs)
*   ¿Cómo mediremos el éxito del lanzamiento? (Adopción, Retención, Satisfacción).
`
    ),
    outputTitle: 'Borrador de PRD',
    exampleInputs: {
      productFeatureName: 'Sistema de Billetera Digital Integrada',
      briefDescription: 'Una funcionalidad dentro de nuestra app de e-commerce que permite a los usuarios cargar saldo, recibir reembolsos instantáneos y pagar compras sin usar tarjeta de crédito directamente.',
    },
  },
  {
    id: FeatureId.SWOT_ANALYSIS,
    title: 'Generador de Análisis FODA',
    description: 'Realiza un análisis FODA (Fortalezas, Oportunidades, Debilidades, Amenazas).',
    icon: SWOTIcon,
    inputFields: [
      { id: 'subjectDescription', label: 'Descripción del Producto/Empresa/Iniciativa', placeholder: 'Ej: Nuestra nueva línea de productos ecológicos para el hogar.', type: 'textarea', rows: 3 },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Realiza un análisis FODA para: "${inputs.subjectDescription}".

# Análisis FODA

## Fortalezas (Internas)
*   **[Fortaleza 1]:** Explicación.
*   **[Fortaleza 2]:** Explicación.

## Oportunidades (Externas)
*   **[Oportunidad 1]:** Explicación.

## Debilidades (Internas)
*   **[Debilidad 1]:** Explicación.

## Amenazas (Externas)
*   **[Amenaza 1]:** Explicación.
`
    ),
    outputTitle: 'Análisis FODA',
    exampleInputs: {
      subjectDescription: 'Una startup de entrega de comida a domicilio utilizando drones autónomos en áreas suburbanas. Tenemos tecnología patentada de drones silenciosos, pero poca experiencia en logística y regulaciones aéreas.',
    },
  },
  {
    id: FeatureId.AI_TICKET_ANALYSIS,
    title: 'Análisis de Tickets con IA',
    description: 'Sube un CSV o pega texto de tickets para identificar patrones, expectativas, insights, predecir bajas y generar estrategias. Cada sección incluirá gráficos interactivos.',
    icon: FeedbackIcon,
    inputFields: [
      { id: 'ticketText', label: 'Pegar Texto de Tickets (si no usas CSV)', placeholder: 'Ej: "Ticket 123, Cliente A: El login falla..."\n"Ticket 124, Cliente B: Necesito ayuda con..."', type: 'textarea', rows: 5 },
      { id: 'ticketCsvFile', label: 'Subir Archivo CSV de Tickets', placeholder: '', type: 'file', accept: '.csv, text/csv' },
    ],
    promptGenerator: (inputs) => {
      const ticketData = inputs.ticketCsvFileContent || inputs.ticketText;
      if (!ticketData || (typeof ticketData === 'string' && ticketData.trim() === '')) {
        return featurePromptEnhancer("No se detectaron datos. Por favor pide al usuario que ingrese tickets.");
      }

      const basePrompt = `Eres un experto analista de Product Management. Analiza los siguientes datos de tickets.
---
DATOS:
${ticketData}
---
Realiza el análisis y estructura tu respuesta EXACTAMENTE con los siguientes encabezados de nivel 2 (##). Debajo de cada encabezado, provee el análisis textual y los datos para gráficos en el formato solicitado.
IMPORTANTE: Para los datos de los gráficos, NO uses negritas en los nombres de las categorías (ej: "Login" en vez de "**Login**").

## Detección de Patrones de Problemas Comunes
*   **Resumen:** [Resumen del análisis]
*   **Datos Gráfico:**
    - [Nombre Patrón] (Frecuencia: [N])
    - [Nombre Patrón] (Frecuencia: [N])

## Extracción de Expectativas de Solución
*   **Resumen:** [Resumen del análisis]
*   **Datos Gráfico:**
    - [Expectativa] (Importancia Estimada: [1-5])

## Determinación de Insights por Volumen e Impacto
*   **Resumen:** [Resumen del análisis]
*   **Tabla Scatter:**
    | Insight | Volumen (1-5) | Impacto (1-5) | Justificación |
    | [Nombre] | [N] | [N] | [Texto] |

## Predicción de Baja de Clientes y sus Motivos
*   **Resumen:** [Resumen del análisis]
*   **Datos Gráfico:**
    - [Motivo] (Riesgo Estimado: [N]%)
*   **Detalle:**
    - **[Motivo]:** Análisis detallado, clientes afectados y tickets asociados.

## Creación de Estrategias Preventivas y Personalizadas
*   **Resumen:** [Resumen del análisis]
*   **Datos Gráfico:**
    - [Estrategia] (Impacto Potencial Estimado: [1-5])
*   **Detalle:** Explicación de las estrategias.
`;
      return featurePromptEnhancer(basePrompt);
    },
    outputTitle: 'Dashboard de Análisis de Tickets',
    exampleInputs: {
      ticketText: `Ticket #101: Cliente Juan P. - "La aplicación se cierra sola cada vez que intento exportar el reporte mensual a PDF. Es urgente, necesito esto para mi jefe."
Ticket #102: Cliente Ana M. - "No encuentro dónde cambiar mi contraseña. He buscado por todo el perfil."
Ticket #103: Cliente Carlos R. - "Exportar a PDF falla siempre en iOS. Arreglen esto o cancelaré mi suscripción."
Ticket #104: Cliente Lucia F. - "Me gustaría que hubiera un modo oscuro, la app es muy brillante de noche."
Ticket #105: Cliente Pedro S. - "El cobro de este mes vino duplicado. Exijo un reembolso inmediato."
Ticket #106: Cliente Sofia L. - "Otra vez crash al exportar PDF. Estoy evaluando cambiarme a la competencia si no se soluciona."
Ticket #107: Cliente Miguel A. - "¿Tienen integración con Slack? Sería muy útil."
Ticket #108: Cliente Laura G. - "La exportación a PDF no funciona. Frustrante."`,
    },
  },
  {
    id: FeatureId.RELEASE_NOTES,
    title: 'Redactor de Notas de Lanzamiento',
    description: 'Crea notas de lanzamiento claras y atractivas para nuevas versiones de productos.',
    icon: ReleaseNotesIcon,
    inputFields: [
      { id: 'productName', label: 'Nombre del Producto y Versión', placeholder: 'Ej: SuperApp v2.5.0', type: 'text' },
      { id: 'newFeatures', label: 'Nuevas Funcionalidades', placeholder: 'Ej: - Integración con Calendario\n- Modo Oscuro Mejorado', type: 'textarea', rows: 3 },
      { id: 'bugFixes', label: 'Correcciones de Errores (Opcional)', placeholder: 'Ej: - Corregido error al guardar preferencias\n- Mejorada la estabilidad en Android 13', type: 'textarea', rows: 2 },
      { id: 'improvements', label: 'Mejoras (Opcional)', placeholder: 'Ej: - Rendimiento optimizado en carga de datos\n- Interfaz de usuario más intuitiva', type: 'textarea', rows: 2 },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Redacta notas de lanzamiento para: **"${inputs.productName}"**.

# Notas de la Versión

## 🚀 Nuevas Funcionalidades
${inputs.newFeatures}

${inputs.improvements ? `## ✨ Mejoras\n${inputs.improvements}` : ''}

${inputs.bugFixes ? `## 🐛 Correcciones de Errores\n${inputs.bugFixes}` : ''}
`
    ),
    outputTitle: 'Borrador de Release Notes',
    exampleInputs: {
      productName: 'TaskMaster Pro v3.0 - Edición "Productividad Total"',
      newFeatures: '- Vistas tipo Kanban para proyectos.\n- Colaboración en tiempo real en documentos adjuntos.\n- Integración nativa con Google Calendar y Outlook.',
      bugFixes: '- Solucionado un problema donde las notificaciones llegaban con retraso en iOS.\n- Corregido el error de sincronización offline.',
      improvements: '- La aplicación carga un 50% más rápido al iniciar.\n- Rediseño completo de la barra de navegación para mejor accesibilidad.',
    },
  },
  {
    id: FeatureId.AB_TEST_IDEAS,
    title: 'Generador de Ideas para Pruebas A/B',
    description: 'Obtén ideas para pruebas A/B orientadas a mejorar una funcionalidad o métrica específica.',
    icon: ABTestIcon,
    inputFields: [
      { id: 'testSubject', label: 'Funcionalidad/Elemento UI a Probar', placeholder: 'Ej: Botón de "Comprar Ahora" en la página de producto', type: 'text' },
      { id: 'testGoal', label: 'Objetivo de la Prueba', placeholder: 'Ej: Incrementar la tasa de conversión en un 10%', type: 'text' },
      { id: 'currentMetrics', label: 'Métricas Actuales (Opcional)', placeholder: 'Ej: Tasa de conversión actual: 5%', type: 'text' },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Genera ideas de A/B Testing para: **"${inputs.testSubject}"**.
Objetivo: **"${inputs.testGoal}"**.

# Plan de Pruebas A/B

## Idea 1: [Nombre descriptivo]
*   **Hipótesis:** Si cambiamos X por Y, entonces Z mejorará porque...
*   **Variación A (Control):** [Descripción]
*   **Variación B (Prueba):** [Descripción]
*   **Métrica Clave:** [KPI]

## Idea 2: [Nombre descriptivo]
*   **Hipótesis:** ...
*   **Variación B:** ...
`
    ),
    outputTitle: 'Ideas de A/B Testing',
    exampleInputs: {
      testSubject: 'Página de registro (Sign-up) de usuarios nuevos',
      testGoal: 'Reducir la tasa de abandono durante el registro y aumentar registros completados en un 15%.',
      currentMetrics: 'Tasa de finalización del formulario: 45%. Tiempo promedio en página: 3 minutos.',
    },
  },
  {
    id: FeatureId.ELEVATOR_PITCH,
    title: 'Creador de Elevator Pitch',
    description: 'Desarrolla un discurso de ventas conciso y persuasivo para tu producto o idea.',
    icon: ElevatorPitchIcon,
    inputFields: [
      { id: 'productName', label: 'Nombre del Producto/Idea', placeholder: 'Ej: App "ConectaLocal"', type: 'text' },
      { id: 'targetAudience', label: 'Audiencia Objetivo', placeholder: 'Ej: Pequeños comercios locales', type: 'text' },
      { id: 'problemSolved', label: 'Problema que Resuelve', placeholder: 'Ej: Dificultad para digitalizarse y alcanzar nuevos clientes.', type: 'textarea', rows: 2 },
      { id: 'uniqueSolution', label: 'Solución Única/Beneficio Clave', placeholder: 'Ej: Plataforma fácil de usar para crear tienda online y marketing con IA en minutos.', type: 'textarea', rows: 2 },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Crea un Elevator Pitch para **"${inputs.productName}"**.

# Elevator Pitch

## La Estructura (Guion)
"¿Sabías que **[Problema/Audiencia]**?
Por eso creamos **${inputs.productName}**.
A diferencia de las alternativas, nosotros **[Solución Única]**.
Esto significa que tú podrás **[Beneficio Final]**."

## Versión Corta (Un tweet)
"[Escribe aquí una versión de una sola frase contundente]"
`
    ),
    outputTitle: 'Elevator Pitch',
    exampleInputs: {
      productName: 'EcoStream',
      targetAudience: 'Organizadores de eventos corporativos y ferias comerciales.',
      problemSolved: 'El desperdicio masivo de papel en folletos, agendas impresas y tarjetas de visita que terminan en la basura.',
      uniqueSolution: 'Una plataforma todo-en-uno que digitaliza toda la experiencia del asistente mediante códigos QR dinámicos y networking basado en proximidad, eliminando el papel al 100%.',
    },
  },
  {
    id: FeatureId.KANO_MODEL,
    title: 'Generador de Matriz Kano',
    description: 'Clasifica funcionalidades según el modelo Kano para entender su impacto en la satisfacción del cliente.',
    icon: KanoIcon,
    inputFields: [
      { id: 'productDescription', label: 'Descripción del Producto', placeholder: 'Ej: Un software de gestión de proyectos para equipos remotos.', type: 'textarea', rows: 2 },
      { id: 'featureList', label: 'Lista de Funcionalidades (una por línea)', placeholder: 'Ej: Chat en tiempo real\nAsignación de tareas\nDiagramas de Gantt\nIntegración con Slack', type: 'textarea', rows: 4 },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Clasifica las funcionalidades usando el Modelo Kano para: "${inputs.productDescription}".

# Clasificación Kano

## Must-be (Básicas)
*   **[Funcionalidad]:** Justificación.

## Performance (Lineales)
*   **[Funcionalidad]:** Justificación.

## Attractive (Delighters)
*   **[Funcionalidad]:** Justificación.

## Indifferent (Indiferentes)
*   **[Funcionalidad]:** Justificación.
`
    ),
    outputTitle: 'Análisis Kano',
    exampleInputs: {
      productDescription: 'Un reloj inteligente (smartwatch) enfocado en la salud y el fitness.',
      featureList: 'Medición de pasos\nMonitorización de frecuencia cardíaca 24/7\nResistencia al agua 50m\nBatería de 30 días de duración\nDetección automática de caídas\nJuegos casuales instalados\nControl de música por gestos en el aire',
    },
  },
  {
    id: FeatureId.RICE_SCORING,
    title: 'Generador de Priorización RICE',
    description: 'Estima y calcula el puntaje RICE para un listado de funcionalidades para ayudar en la priorización.',
    icon: RiceIcon,
    inputFields: [
      { id: 'featureList', label: 'Lista de Funcionalidades', placeholder: 'Ej: Funcionalidad A\nFuncionalidad B', type: 'textarea', rows: 5 },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Realiza una estimación RICE (Reach, Impact, Confidence, Effort) para estas funcionalidades.

# Priorización RICE

## Tabla Resumen (Ordenada por Score)
| Funcionalidad | Reach | Impact | Confidence | Effort | **RICE Score** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [Nombre] | [N] | [N] | [%] | [N] | **[Resultado]** |
| ... | ... | ... | ... | ... | ... |

## Detalle de la Estimación
### 1. [Funcionalidad con mayor puntaje]
*   **Razonamiento:** Explicación breve de por qué tiene estos valores.

### 2. [Siguiente funcionalidad]
*   **Razonamiento:** Explicación breve.
`
    ),
    outputTitle: 'Priorización RICE',
    exampleInputs: {
      featureList: 'Login con Google (Reach: todos los usuarios nuevos, Impact: bajo, Effort: bajo)\nModo Oscuro (Reach: 30% usuarios, Impact: medio)\nSistema de Referidos (Reach: alto, Impact: alto, Confidence: 70%)\nIntegración compleja con Salesforce (Reach: 5% usuarios Enterprise, Impact: masivo, Effort: muy alto)',
    },
  },
  {
    id: FeatureId.HYPOTHESIS_GENERATOR,
    title: 'Generador de Hipótesis',
    description: 'Formula hipótesis de producto claras y validables.',
    icon: HypothesisIcon,
    inputFields: [
      { id: 'problemStatement', label: 'Declaración del Problema', placeholder: 'Ej: Los usuarios abandonan el carrito de compra antes de finalizar.', type: 'textarea', rows: 2 },
      { id: 'targetUser', label: 'Usuario Objetivo', placeholder: 'Ej: Compradores online primerizos.', type: 'text' },
      { id: 'solutionIdea', label: 'Idea de Solución (Opcional)', placeholder: 'Ej: Simplificar el proceso de checkout a un solo paso.', type: 'textarea', rows: 2 },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Genera hipótesis de producto para:
Problema: "${inputs.problemStatement}"
Usuario: "${inputs.targetUser}"

# Hipótesis de Producto

## Hipótesis Principal
**Creemos que** [la solución propuesta]
**Para** [el usuario objetivo]
**Resultará en** [resultado esperado]
**Lo sabremos cuando** [señal de mercado/métrica].

## Hipótesis Alternativas
1.  **Enfoque alternativo:** Creemos que...
`
    ),
    outputTitle: 'Hipótesis Generadas',
    exampleInputs: {
      problemStatement: 'Los usuarios gratuitos no entienden el valor de las funcionalidades Premium y no actualizan su plan.',
      targetUser: 'Usuarios Freemium activos (usan la app >3 veces/semana).',
      solutionIdea: 'Ofrecer una prueba gratuita de 7 días de las funcionalidades Premium al intentar acceder a una de ellas.',
    },
  },
  {
    id: FeatureId.VALIDATION_INTERVIEW_SCRIPT,
    title: 'Guion de Entrevista de Validación',
    description: 'Crea un guion de entrevista para validar una hipótesis de producto.',
    icon: InterviewIcon,
    inputFields: [
      { id: 'hypothesis', label: 'Hipótesis a Validar', placeholder: 'Ej: Creemos que ofrecer un descuento...', type: 'textarea', rows: 3 },
      { id: 'targetAudience', label: 'Audiencia Objetivo', placeholder: 'Ej: Usuarios que visitan el sitio por primera vez...', type: 'text' },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Crea un guion de entrevista para validar: "${inputs.hypothesis}".

# Guion de Entrevista

## 1. Introducción (2 min)
*   Presentación y objetivo.
*   "No hay respuestas correctas o incorrectas".

## 2. Exploración del Problema (5 min)
*   **Pregunta:** [Pregunta abierta sobre hábitos actuales]
*   **Pregunta:** "Cuéntame sobre la última vez que..."

## 3. Test de Concepto (5 min)
*   **Pregunta:** [Presentar concepto] "¿Qué opinas de esto?"
*   **Pregunta:** "¿Cómo te ayudaría esto en tu día a día?"

## 4. Cierre
*   Agradecimiento y permiso para contactar de nuevo.
`
    ),
    outputTitle: 'Guion de Entrevista',
    exampleInputs: {
      hypothesis: 'Creemos que los freelancers necesitan una herramienta automatizada para calcular sus impuestos trimestrales porque actualmente pierden mucho tiempo haciéndolo manualmente. Lo sabremos si están dispuestos a pagar $10/mes por esta función.',
      targetAudience: 'Diseñadores y desarrolladores freelance que gestionan su propia contabilidad.',
    },
  },
  {
    id: FeatureId.OKR_GENERATOR,
    title: 'Generador de OKR',
    description: 'Define Objetivos y Resultados Clave (OKRs) alineados con metas estratégicas.',
    icon: OKRIcon,
    inputFields: [
      { id: 'strategicGoal', label: 'Meta Estratégica Principal', placeholder: 'Ej: Mejorar la retención de usuarios este trimestre.', type: 'textarea', rows: 2 },
      { id: 'timeframe', label: 'Periodo de Tiempo', placeholder: 'Ej: Q3 2024', type: 'text' },
      { id: 'teamOrProduct', label: 'Equipo o Producto (Opcional)', placeholder: 'Ej: Equipo de Growth / App Móvil', type: 'text' },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Genera OKRs para: "${inputs.strategicGoal}".
Periodo: ${inputs.timeframe}.

# OKRs Sugeridos

## Objetivo 1: [Objetivo inspirador]
*   **KR 1:** Aumentar [métrica] de X a Y.
*   **KR 2:** Lograr [hito].
*   **KR 3:** Reducir [métrica negativa] en un Z%.

## Objetivo 2: [Objetivo secundario]
*   **KR 1:** ...
`
    ),
    outputTitle: 'Borrador de OKRs',
    exampleInputs: {
      strategicGoal: 'Convertirnos en la plataforma líder de educación para profesionales en LatAm.',
      timeframe: 'Segundo Semestre 2024',
      teamOrProduct: 'Equipo de Contenido y Comunidad',
    },
  },
  {
    id: FeatureId.KPI_GENERATOR,
    title: 'Generador de KPIs',
    description: 'Identifica Indicadores Clave de Rendimiento (KPIs) relevantes para tus objetivos.',
    icon: KPIIcon,
    inputFields: [
      { id: 'businessObjective', label: 'Objetivo de Negocio o Producto', placeholder: 'Ej: Incrementar el engagement de los usuarios en la plataforma.', type: 'textarea', rows: 2 },
      { id: 'productArea', label: 'Área de Producto o Contexto', placeholder: 'Ej: Red social interna de la empresa / Feature de comentarios.', type: 'text' },
      { id: 'userType', label: 'Tipo de Usuario (Opcional)', placeholder: 'Ej: Usuarios gratuitos / Usuarios premium', type: 'text' },
    ],
    promptGenerator: (inputs) => featurePromptEnhancer(
      `Sugiere KPIs para el objetivo: "${inputs.businessObjective}".

# KPIs Recomendados

## Métricas Principales (North Star)
1.  **[Nombre KPI]:** Definición y por qué es crucial.

## Métricas Secundarias (Salud del Producto)
2.  **[Nombre KPI]:** Definición.
3.  **[Nombre KPI]:** Definición.

## Métricas de Negocio
4.  **[Nombre KPI]:** Definición.
`
    ),
    outputTitle: 'KPIs Sugeridos',
    exampleInputs: {
      businessObjective: 'Mejorar la eficiencia del soporte técnico reduciendo el volumen de tickets repetitivos.',
      productArea: 'Centro de Ayuda y Chatbot de Soporte',
      userType: 'Usuarios nuevos (<30 días en la plataforma)',
    },
  },
];
