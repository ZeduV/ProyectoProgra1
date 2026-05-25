from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from database import get_db_connection
from typing import Optional, List
import hashlib

app = FastAPI(title="API Tienda Deportiva Edu")

# Configuración de CORS para que React se pueda conectar después
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se cambia por la URL de React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== MODELOS DE DATOS (Pydantic) ==========

# Modelo para registrar un usuario
class UsuarioRegistro(BaseModel):
    nombre: str
    apellido: str
    edad: int
    email: EmailStr
    password: str

# Modelo para login
class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str

# Modelo para un item del pedido
class ItemPedido(BaseModel):
    productoId: int
    cantidad: int
    precioUnitario: float

# Modelo para crear un pedido
class PedidoRequest(BaseModel):
    usuarioId: int
    items: List[ItemPedido]

# Modelo para crear un producto (Admin)
class ProductoCreate(BaseModel):
    nombreProducto: str
    descripcion: str
    precio: float
    stock: int
    imagenURL: Optional[str] = None
    categoriaId: int

# Modelo para actualizar un producto (Admin)
class ProductoUpdate(BaseModel):
    nombreProducto: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    imagenURL: Optional[str] = None
    categoriaId: Optional[int] = None

# ========== RUTAS ==========

@app.get("/")
def inicio():
    return {"mensaje": "¡Bienvenido a la API de la Tienda Deportiva Edu!"}

# RUTA 1: Registrar un nuevo usuario
@app.post("/api/usuarios/registro")
def registrar_usuario(usuario: UsuarioRegistro):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        # 1. Verificar si el email ya existe
        cursor.execute("SELECT UsuarioID FROM Usuarios WHERE Email = ?", (usuario.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El correo ya está registrado")
        
        # 2. Encriptar la contraseña usando SHA-256 (encaja perfecto con tu VARBINARY(64))
        # Convertimos el texto a bytes, lo haseamos y obtenemos los bytes del hash
        password_bytes = usuario.password.encode('utf-8')
        password_hash = hashlib.sha256(password_bytes).digest()
        
        # 3. Insertar el usuario en la base de datos
        query = """
            INSERT INTO Usuarios (Nombre, Apellido, Edad, Email, PasswordHash)
            VALUES (?, ?, ?, ?, ?)
        """
        cursor.execute(query, (usuario.nombre, usuario.apellido, usuario.edad, usuario.email, password_hash))
        conn.commit() # Confirmar los cambios en SQL Server
        
        return {"mensaje": "Usuario registrado con éxito"}
        
    except Exception as e:
        conn.rollback() # Cancelar si hubo un error
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# RUTA 2: Login de usuario (verifica email + contraseña encriptada)
@app.post("/api/usuarios/login")
def login_usuario(datos: UsuarioLogin):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        # 1. Buscar el usuario por email (ahora incluye Rol)
        cursor.execute(
            "SELECT UsuarioID, Nombre, Apellido, Email, PasswordHash, Rol FROM Usuarios WHERE Email = ?",
            (datos.email,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
        
        # 2. Encriptar la contraseña ingresada y comparar con la de la BD
        password_bytes = datos.password.encode('utf-8')
        password_hash = hashlib.sha256(password_bytes).digest()
        
        # row[4] es el PasswordHash almacenado en VARBINARY
        stored_hash = bytes(row[4])
        
        if password_hash != stored_hash:
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
        
        # 3. Retornar datos del usuario con su rol
        return {
            "mensaje": "Login exitoso",
            "usuario": {
                "usuarioId": row[0],
                "nombre": row[1],
                "apellido": row[2],
                "email": row[3],
                "rol": row[5] or "Cliente",
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# RUTA 3: Obtener todos los productos (con filtro por categoría y búsqueda por nombre)
@app.get("/api/productos")
def obtener_productos(
    categoria: Optional[int] = Query(None, description="Filtrar por CategoriaID"),
    buscar: Optional[str] = Query(None, description="Buscar productos por nombre")
):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        # Construir la consulta dinámicamente según los filtros
        base_query = """
            SELECT p.ProductoID, p.NombreProducto, p.Descripcion, p.Precio, 
                   p.Stock, p.ImagenURL, p.CategoriaID, c.NombreCategoria
            FROM Productos p
            INNER JOIN categorias c ON p.CategoriaID = c.CategoriaID
        """
        conditions = []
        params = []
        
        if categoria:
            conditions.append("p.CategoriaID = ?")
            params.append(categoria)
        
        if buscar:
            conditions.append("p.NombreProducto LIKE ?")
            params.append(f"%{buscar}%")
        
        if conditions:
            base_query += " WHERE " + " AND ".join(conditions)
        
        base_query += " ORDER BY p.ProductoID"
        
        cursor.execute(base_query, tuple(params))
        
        rows = cursor.fetchall()
        productos = []
        for row in rows:
            productos.append({
                "id": row[0],
                "name": row[1],
                "description": row[2],
                "price": float(row[3]),
                "stock": row[4],
                "image": row[5],
                "categoryId": row[6],
                "category": row[7],
            })
        
        return productos
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# RUTA 4: Obtener todas las categorías
@app.get("/api/categorias")
def obtener_categorias():
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT CategoriaID, NombreCategoria FROM categorias ORDER BY CategoriaID")
        rows = cursor.fetchall()
        categorias = [{"id": row[0], "name": row[1]} for row in rows]
        return categorias
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# RUTA 5: Crear un nuevo pedido (con sus detalles)
@app.post("/api/pedidos")
def crear_pedido(pedido: PedidoRequest):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        # 1. Calcular el total del pedido
        total = sum(item.cantidad * item.precioUnitario for item in pedido.items)
        
        # 2. Insertar la cabecera del pedido y obtener el ID generado
        cursor.execute(
            """
            INSERT INTO Pedidos (UsuarioID, FechaPedido, Total, Estado)
            OUTPUT INSERTED.PedidoID
            VALUES (?, GETDATE(), ?, 'Pendiente')
            """,
            (pedido.usuarioId, total)
        )
        pedido_id = cursor.fetchone()[0]
        
        # 4. Insertar cada línea de detalle
        for item in pedido.items:
            cursor.execute(
                """
                INSERT INTO DetallePedido (PedidoID, ProductoID, Cantidad, PrecioUnitario)
                VALUES (?, ?, ?, ?)
                """,
                (pedido_id, item.productoId, item.cantidad, item.precioUnitario)
            )
        
        conn.commit()
        
        return {
            "mensaje": "Pedido creado con éxito",
            "pedidoId": pedido_id,
            "total": total
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# RUTA 6: Obtener los pedidos de un usuario (filtrado por UsuarioID)
@app.get("/api/pedidos/{usuario_id}")
def obtener_pedidos_usuario(usuario_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        # 1. Obtener los pedidos del usuario
        cursor.execute(
            """
            SELECT PedidoID, FechaPedido, Total, Estado
            FROM Pedidos
            WHERE UsuarioID = ?
            ORDER BY FechaPedido DESC
            """,
            (usuario_id,)
        )
        pedidos_rows = cursor.fetchall()
        
        pedidos = []
        for p_row in pedidos_rows:
            pedido_id = p_row[0]
            
            # 2. Para cada pedido, obtener sus detalles con el nombre del producto
            cursor.execute(
                """
                SELECT d.Cantidad, d.PrecioUnitario, p.NombreProducto
                FROM DetallePedido d
                INNER JOIN Productos p ON d.ProductoID = p.ProductoID
                WHERE d.PedidoID = ?
                """,
                (pedido_id,)
            )
            detalles_rows = cursor.fetchall()
            
            detalles = []
            for d_row in detalles_rows:
                detalles.append({
                    "cantidad": d_row[0],
                    "precioUnitario": float(d_row[1]),
                    "producto": d_row[2],
                })
            
            pedidos.append({
                "pedidoId": pedido_id,
                "fecha": p_row[1].isoformat() if p_row[1] else None,
                "total": float(p_row[2]),
                "estado": p_row[3],
                "detalles": detalles,
            })
        
        return pedidos
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# RUTA 7: Crear un producto (Solo Admin)
@app.post("/api/productos")
def crear_producto(producto: ProductoCreate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """
            INSERT INTO Productos (NombreProducto, Descripcion, Precio, Stock, ImagenURL, CategoriaID)
            OUTPUT INSERTED.ProductoID
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (producto.nombreProducto, producto.descripcion, producto.precio,
             producto.stock, producto.imagenURL, producto.categoriaId)
        )
        producto_id = cursor.fetchone()[0]
        conn.commit()
        
        return {
            "mensaje": "Producto creado con éxito",
            "productoId": producto_id
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# RUTA 8: Actualizar un producto (Solo Admin)
@app.put("/api/productos/{producto_id}")
def actualizar_producto(producto_id: int, producto: ProductoUpdate):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        # Construir query dinámico solo con los campos enviados
        updates = []
        params = []
        
        if producto.nombreProducto is not None:
            updates.append("NombreProducto = ?")
            params.append(producto.nombreProducto)
        if producto.descripcion is not None:
            updates.append("Descripcion = ?")
            params.append(producto.descripcion)
        if producto.precio is not None:
            updates.append("Precio = ?")
            params.append(producto.precio)
        if producto.stock is not None:
            updates.append("Stock = ?")
            params.append(producto.stock)
        if producto.imagenURL is not None:
            updates.append("ImagenURL = ?")
            params.append(producto.imagenURL)
        if producto.categoriaId is not None:
            updates.append("CategoriaID = ?")
            params.append(producto.categoriaId)
        
        if not updates:
            raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")
        
        params.append(producto_id)
        query = f"UPDATE Productos SET {', '.join(updates)} WHERE ProductoID = ?"
        cursor.execute(query, tuple(params))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        conn.commit()
        return {"mensaje": "Producto actualizado con éxito"}
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# RUTA 9: Eliminar un producto (Solo Admin)
@app.delete("/api/productos/{producto_id}")
def eliminar_producto(producto_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM Productos WHERE ProductoID = ?", (producto_id,))
        
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        
        conn.commit()
        return {"mensaje": "Producto eliminado con éxito"}
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()

# RUTA 10: Cancelar un pedido (Solo si está Pendiente)
@app.put("/api/pedidos/{pedido_id}/cancelar")
def cancelar_pedido(pedido_id: int):
    conn = get_db_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Error de conexión con la base de datos")
    
    cursor = conn.cursor()
    
    try:
        # Verificar que el pedido existe y está pendiente
        cursor.execute(
            "SELECT Estado FROM Pedidos WHERE PedidoID = ?",
            (pedido_id,)
        )
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
        if row[0] != 'Pendiente':
            raise HTTPException(status_code=400, detail="Solo se pueden cancelar pedidos pendientes")
        
        cursor.execute(
            "UPDATE Pedidos SET Estado = 'Cancelado' WHERE PedidoID = ?",
            (pedido_id,)
        )
        conn.commit()
        
        return {"mensaje": "Pedido cancelado con éxito"}
        
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error en el servidor: {str(e)}")
    finally:
        cursor.close()
        conn.close()