# AcoustiCAD - Simulador de Aislamiento Acústico de Paredes Simples

AcoustiCAD es una aplicación web interactiva de alto rendimiento desarrollada en **Vue 3** y **Vite**, diseñada para replicar el comportamiento de softwares profesionales de predicción acústica (como INSUL). Calcula y grafica la pérdida de transmisión por inserción (Índice de Reducción Sonora $R$, en decibelios) para paneles simples homogéneos basándose en sus características mecánicas y geométricas.

---

## 🛠️ Stack Tecnológico

*   **Framework:** Vue 3 (Composition API) + Vite.
*   **Diseño y Estilos:** Tailwind CSS v4 (con un tema oscuro premium tipo salpicadero espacial).
*   **Visualización 3D:** Three.js puro con OrbitControls (reactividad bidireccional en el espesor y color del material).
*   **Gráficos 2D (Frecuencias):** Chart.js para trazar de forma fluida las curvas del espectro acústico.
*   **Gestión de Excel:** SheetJS (`xlsx`) para la importación y exportación nativa de datos en el cliente.
*   **Iconografía:** Lucide Icons (`@lucide/vue`).

---

## 🏛️ Estructura del Proyecto

La aplicación es completamente del lado del cliente, lo que garantiza velocidad máxima y portabilidad:

```text
src/
├── acousticEngine/
│   ├── massLaw.js           # Fórmulas de Ley de Masas Teórica e Incidencia Difusa
│   ├── iso12354.js          # Métodos de la norma ISO 12354-1 y Frecuencia Crítica (fc)
│   ├── sharp.js             # Modelo semi-empírico de Ben Sharp (1978)
│   ├── davy.js              # Modelo físico de John Davy (2009) y eficiencia de radiación
│   └── weightedIndex.js     # Cálculo de Rw (Índice ponderado) según ISO 717-1
├── assets/
│   ├── materiales.json      # Base de datos local inicial de materiales
│   └── style.css            # Estilos globales y reseteo de Tailwind CSS v4
├── components/
│   ├── SidebarMaterials.vue # Panel de control, ajuste de propiedades e importador/exportador
│   ├── Canvas3D.vue         # Renderizador WebGL de la pared simple mediante Three.js
│   ├── AcousticChart.vue    # Gráfica de líneas dB vs Frecuencia (20 Hz - 20 kHz)
│   └── ResultsTable.vue     # Tabla detallada por tercios de octava y Rw global
├── App.vue                  # Estado reactivo global, cálculos e integración
└── main.js                  # Punto de entrada de Vue
```

---

## 🚀 Fórmulas y Modelos Acústicos Implementados

### 1. Frecuencia Crítica ($f_c$)
Determina la zona de coincidencia donde las flexiones mecánicas del panel coinciden con la longitud de onda sonora en el aire:
$$f_c = \frac{c_0^2}{2 \pi h} \sqrt{\frac{12 \rho (1 - \nu^2)}{E}}$$
*   $c_0 = 343\text{ m/s}$ (velocidad del sonido en el aire)
*   $h$: espesor del paramento (m)
*   $\rho$: densidad del material ($\text{kg/m}^3$)
*   $E$: módulo de Young (Pa)
*   $\nu$: coeficiente de Poisson

### 2. Ley de Masas (Teórica y Corregida)
*   **Teórica (Campo Difuso):** $R = 20 \log_{10}(m \cdot f) - 47\text{ dB}$
*   **Corregida (Campo Real / Límite):** $R = 20 \log_{10}(m \cdot f) - 42.4 - 5\text{ dB}$ (con corrección empírica de 5 dB).

### 3. ISO 12354-1
Define tres zonas basadas en la frecuencia crítica y utiliza el factor de pérdida por amortiguamiento interno ($\eta$) en la zona de coincidencia para suavizar la caída en $f_c$.

### 4. Modelo de Sharp (1978)
Un modelo clásico por tramos muy utilizado por INSUL para tabiques homogéneos simples, que realiza una transición lineal en dB en la proximidad de $f_c/2$ hasta $f_c$, amortiguada por $\eta$.

### 5. Modelo de Davy (2009)
Un modelo avanzado que sustituye aproximaciones infinitas por eficiencia de radiación forzada ($\sigma$) en paneles de dimensiones finitas ($1.0\text{ m} \times 1.5\text{ m}$), integrando analíticamente la radiación a bajas frecuencias y el acoplamiento a altas frecuencias.

### 6. Índice Ponderado de Reducción Sonora ($R_w$)
Calculado según la norma **ISO 717-1** utilizando el sumatorio de desviaciones desfavorables limitadas a un máximo de $32.0\text{ dB}$ en las bandas críticas de $100\text{ Hz}$ a $3150\text{ Hz}$.

---

## 📂 Importación e Importación de Datos

### Exportar a Excel:
Genera un archivo `.xlsx` estructurado en tres pestañas:
1.  **Propiedades del Paramento:** Parámetros mecánicos ingresados y frecuencia crítica resultante.
2.  **Índices Globales Rw:** Resumen de la clasificación $R_w$ de la pared para los 5 métodos.
3.  **Curvas de Aislamiento:** Tabla con los decibelios de atenuación calculados para cada una de las 31 frecuencias entre 20 Hz y 20 kHz.

### Importar desde Excel / JSON:
Permite arrastrar o subir un libro de Excel que contenga columnas con propiedades físicas (`nombre`, `densidad`, `young`, `amortiguamiento`, `espesor`, `poisson`, `color`, `descripcion`). El motor lee las propiedades e integra instantáneamente los materiales en el desplegable de presets.

---

## 💻 Ejecución del Proyecto

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Ejecutar servidor de desarrollo:**
    ```bash
    npm run dev
    ```
3.  **Compilar para producción:**
    ```bash
    npm run build
    ```
