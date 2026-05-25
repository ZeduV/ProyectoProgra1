from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        # Logo or Title
        self.set_font('Arial', 'B', 20)
        self.set_text_color(33, 37, 41)
        self.cell(0, 15, 'Documentacion del Proyecto: Tienda Deportiva', 0, 1, 'C')
        self.set_font('Arial', 'I', 12)
        self.set_text_color(108, 117, 125)
        self.cell(0, 10, 'Proyecto de Programacion', 0, 1, 'C')
        self.ln(5)

    def chapter_title(self, num, title):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(0, 102, 204)
        self.set_fill_color(240, 248, 255)
        self.cell(0, 10, f'{num}. {title}', 0, 1, 'L', True)
        self.ln(4)

    def chapter_body(self, text):
        self.set_font('Arial', '', 11)
        self.set_text_color(50, 50, 50)
        # Multi-cell for text wrap
        self.multi_cell(0, 7, text)
        self.ln(8)

    def section_subtitle(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_text_color(50, 50, 50)
        self.cell(0, 8, title, 0, 1, 'L')
        self.ln(2)

    def list_item(self, text):
        self.set_font('Arial', '', 11)
        self.set_text_color(50, 50, 50)
        self.cell(5, 7, '-', 0, 0)
        self.multi_cell(0, 7, text)

# Instantiation of inherited class
pdf = PDF()
pdf.add_page()
pdf.set_auto_page_break(auto=True, margin=15)

# Descripcion General
pdf.chapter_title('1', 'Descripcion General')
pdf.chapter_body('El proyecto "Tienda Deportiva" es una aplicacion web e-commerce de ciclo completo (Full-Stack) disenada para la venta de articulos deportivos (ropa, balones y zapatos). Cuenta con una interfaz moderna, dinamica y responsiva, un sistema de autenticacion de usuarios, roles de acceso (Admin/Cliente) y un panel de administracion interactivo para gestionar el inventario.')

# Arquitectura
pdf.chapter_title('2', 'Arquitectura del Sistema')
pdf.chapter_body('El proyecto sigue una arquitectura Cliente-Servidor (Cliente Liviano y Servidor API Restful) separando de manera estricta el Frontend y el Backend, garantizando escalabilidad y modularidad:')
pdf.list_item('Frontend: Single Page Application (SPA) construida con React.')
pdf.list_item('Backend: API RESTful desarrollada en Python utilizando el framework FastAPI.')
pdf.list_item('Base de Datos: Servidor Microsoft SQL Server (Relacional).')
pdf.ln(5)

# Tecnologias
pdf.chapter_title('3', 'Tecnologias Utilizadas')

pdf.section_subtitle('3.1 Frontend')
pdf.list_item('React.js: Construccion de interfaces de usuario.')
pdf.list_item('Vite: Herramienta de compilacion super rapida para React.')
pdf.list_item('Tailwind CSS: Framework utilitario para crear un diseno moderno y completamente responsive.')
pdf.list_item('Zustand: Gestor de estados globales (Carrito de compras y Autenticacion).')
pdf.list_item('React Router DOM: Manejo de multiples paginas y ruteo interno.')
pdf.ln(3)

pdf.section_subtitle('3.2 Backend')
pdf.list_item('Python 3: Lenguaje de programacion principal.')
pdf.list_item('FastAPI: Framework asincrono de alto rendimiento para APIs.')
pdf.list_item('PyODBC: Libreria que conecta Python de forma nativa con SQL Server.')
pdf.list_item('Uvicorn: Servidor web ASGI para ejecutar FastAPI.')
pdf.list_item('Hashlib (SHA-256): Libreria nativa de Python para el cifrado seguro de contrasenas.')
pdf.ln(3)

pdf.section_subtitle('3.3 Base de Datos')
pdf.list_item('Motor: SQL Server (Gestor de base de datos relacional).')
pdf.list_item('Tablas Principales: Usuarios, Productos, Categorias, Pedidos, DetallePedido.')
pdf.ln(5)

# Funcionalidades Principales
pdf.chapter_title('4', 'Funcionalidades Principales')

pdf.section_subtitle('4.1 Modulo del Cliente (Frontend Publico)')
pdf.list_item('Autenticacion: Registro seguro y Login de usuarios usando hashing de passwords.')
pdf.list_item('Catalogo: Visualizacion interactiva de productos, filtrado por categorias (Ropa, Balones, Zapatos) y busqueda en tiempo real.')
pdf.list_item('Carrito de Compras: Panel lateral para agregar/quitar articulos, calculando el total de manera asincrona.')
pdf.list_item('Pedidos: Registro de nuevas ordenes en BD y visualizacion del historial personal ("Mis Pedidos"). Permite cancelar pedidos en estado Pendiente.')
pdf.ln(3)

pdf.section_subtitle('4.2 Modulo de Administracion (Backend/Frontend Privado)')
pdf.list_item('Seguridad de Rutas: Panel protegido (/admin) exclusivo para usuarios con Rol "Admin".')
pdf.list_item('CRUD de Inventario: Crear, Leer, Actualizar y Eliminar productos del catalogo de manera interactiva a traves de ventanas modales conectadas a la API y la BD en tiempo real.')
pdf.ln(5)

# Endpoints
pdf.chapter_title('5', 'Endpoints Principales (API RESTful)')
pdf.chapter_body('El servidor expone multiples endpoints JSON sobre los que se sustenta la plataforma:')
pdf.list_item('POST /api/usuarios/registro : Registra un usuario y encripta su contrasena.')
pdf.list_item('POST /api/usuarios/login : Valida credenciales e inicia sesion.')
pdf.list_item('GET /api/productos : Devuelve lista de productos. Acepta query params para busqueda.')
pdf.list_item('POST /api/productos : Agrega un nuevo producto (Admin).')
pdf.list_item('PUT /api/productos/{id} : Edita las propiedades del producto (Admin).')
pdf.list_item('DELETE /api/productos/{id} : Borra el producto de la base de datos (Admin).')
pdf.list_item('POST /api/pedidos : Genera una nueva factura / recibo transaccional.')
pdf.list_item('PUT /api/pedidos/{id}/cancelar : Cancela una orden especifica.')
pdf.ln(5)

# Instrucciones de ejecucion
pdf.chapter_title('6', 'Instrucciones de Ejecucion Local')
pdf.list_item('1. Base de datos: Ejecutar los scripts SQL proporcionados en SSMS.')
pdf.list_item('2. Backend: Entrar a la carpeta raiz, activar el entorno virtual (venv/Scripts/activate) y correr "uvicorn main:app --reload". La API se expone en el puerto 8000.')
pdf.list_item('3. Frontend: Navegar a la carpeta "frontend", ejecutar "npm install" y despues "npm run dev". React estara sirviendose en el puerto 5173.')
pdf.ln(10)

# Anexos - Capturas de Pantalla
import os
img_dir = 'img'
if os.path.exists(img_dir):
    pdf.add_page()
    pdf.chapter_title('7', 'Anexo: Capturas de la Interfaz')
    pdf.chapter_body('A continuacion, se presentan algunas capturas representativas de la aplicacion en funcionamiento:')
    
    # Obtener todas las imagenes en la carpeta img
    imagenes = [f for f in os.listdir(img_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    
    from PIL import Image
    import tempfile
    
    for img_file in imagenes:
        img_path = os.path.join(img_dir, img_file)
        try:
            # Convertir imagen a JPEG usando Pillow para evitar errores de FPDF con PNGs/Alphas
            with Image.open(img_path) as img:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Guardar en un archivo temporal
                temp_fd, temp_path = tempfile.mkstemp(suffix='.jpg')
                os.close(temp_fd)
                img.save(temp_path, 'JPEG', quality=95)
            
            # Agregar pagina para cada imagen si es necesario, o solo un salto
            # Para evitar recortes en la imagen, agregamos una pagina nueva por captura
            pdf.add_page()
            # x = 15 para centrar dado el margen, w = 180, fpdf calculara el alto automatico
            pdf.image(temp_path, x=15, w=180)
            
            # Limpiar archivo temporal
            os.remove(temp_path)
            
        except Exception as e:
            print(f"No se pudo agregar la imagen {img_file}: {e}")

pdf.output('Documentacion_Tienda_Deportiva.pdf', 'F')
print('PDF generado correctamente.')
