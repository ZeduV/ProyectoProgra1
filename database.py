import pyodbc

# Configura aquí los datos de tu SQL Server
SERVER = '.'  # O el nombre de tu instancia de SQL Server (ej: 'LOCALHOST\\SQLEXPRESS')
DATABASE = 'TiendaDeportivaEdu'

def get_db_connection():
    try:
        # Cadena de conexión usando Autenticación de Windows
        conn_str = (
            f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            f"SERVER={SERVER};"
            f"DATABASE={DATABASE};"
            f"Trusted_Connection=yes;"
        )
        conn = pyodbc.connect(conn_str)
        return conn
    except Exception as e:
        print(f"Error al conectar a SQL Server: {e}")
        return None

# Prueba rápida de conexión
if __name__ == "__main__":
    connection = get_db_connection()
    if connection:
        print("¡Conexión exitosa a la base de datos TiendaDeportivaEdugo!")
        connection.close()