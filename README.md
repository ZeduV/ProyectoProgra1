# Tienda Deportiva - Proyecto de Programación

Un sistema de gestión de comercio electrónico para una tienda deportiva, que incluye un backend desarrollado en Python con FastAPI y un frontend construido en React con Vite.

## Características Principales

*   **Autenticación de Usuarios**: Registro e inicio de sesión seguro con contraseñas encriptadas (SHA-256).
*   **Catálogo de Productos**: Visualización de productos deportivos, con filtros por categoría y búsqueda por nombre.
*   **Gestión de Pedidos**: Los usuarios pueden crear pedidos y ver su historial de compras.
*   **Panel de Administración**: Funciones exclusivas para administradores que permiten crear, actualizar y eliminar productos del catálogo.
*   **Generación de Reportes**: Sistema integrado para la creación de comprobantes o reportes en formato PDF.

## Tecnologías Utilizadas

### Backend
*   **Lenguaje**: Python
*   **Framework**: FastAPI
*   **Validación de Datos**: Pydantic
*   **Base de Datos**: SQL Server (conexión a través de `pyodbc`)
*   **Otros**: `hashlib` para seguridad.

### Frontend
*   **Librería/Framework**: React 19 con Vite
*   **Estilos**: Tailwind CSS 4
*   **Enrutamiento**: React Router v7
*   **Gestión de Estado**: Zustand

## Estructura del Proyecto

```text
ProyectoProgra1/
│
├── frontend/               # Código fuente del cliente 
│   ├── src/                # Componentes, páginas y hooks de React
│   ├── public/             # Archivos estáticos
│   ├── package.json        # Dependencias de npm
│   └── vite.config.js      # Configuración de Vite
│
├── img/                    # Imágenes y recursos estáticos
├── main.py                 # Punto de entrada de la API (FastAPI)
├── database.py             # Configuración y conexión a SQL Server
├── generar_pdf.py          # Script para la generación de reportes PDF
└── Documentacion_Tienda_Deportiva.pdf # Documentación del proyecto
```

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:
*   [Python 3.8+](https://www.python.org/downloads/)
*   [Node.js](https://nodejs.org/) (Versión 18 o superior recomendada)
*   [SQL Server](https://www.microsoft.com/es-es/sql-server/sql-server-downloads) y el [ODBC Driver for SQL Server](https://learn.microsoft.com/es-es/sql/connect/odbc/download-odbc-driver-for-sql-server).

## Instalación y Ejecución

### 1. Configuración de la Base de Datos
1. Crea una base de datos en SQL Server llamada `TiendaDeportivaEdu`.
2. Asegúrate de ejecutar los scripts de creación de tablas correspondientes (para `Usuarios`, `Productos`, `Categorias`, `Pedidos` y `DetallePedido`).
3. (Opcional) Verifica y ajusta la conexión en `database.py` si tu instancia de servidor no es el localhost estándar (`.`):
   ```python
   SERVER = '.' # Cambiar si es necesario
   DATABASE = 'TiendaDeportivaEdu'
   ```

### 2. Configuración del Backend (FastAPI)
1. Abre una terminal en la raíz del proyecto.
2. Crea y activa un entorno virtual (recomendado):
   ```bash
   python -m venv venv
   # En Windows:
   venv\Scripts\activate
   ```
3. Instala las dependencias necesarias:
   ```bash
   pip install fastapi uvicorn pyodbc pydantic
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   uvicorn main:app --reload
   ```
   > La API estará disponible en `http://127.0.0.1:8000` y la documentación interactiva (Swagger) en `http://127.0.0.1:8000/docs`.

### 3. Configuración del Frontend (React)
1. Abre una nueva terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Node:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de React:
   ```bash
   npm run dev
   ```
   > La aplicación web estará disponible en el puerto indicado en la consola (usualmente `http://localhost:5173`).

