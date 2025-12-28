Documentación técnica  - EndPoints 
- Documentación Técnica: Servidor Principal y Enrutamiento (`server.js`)
    
    ---
    
    # Documentación Técnica: Servidor Principal y Enrutamiento (`server.js`)
    
    ## 1. Resumen General
    
    Este archivo inicializa la aplicación Express, configura las políticas de seguridad básicas (CORS), gestiona el tamaño máximo de las peticiones (para soportar subida de imágenes en Base64) y define el mapa completo de rutas tanto para la API REST como para el servido de archivos estáticos del Frontend.
    
    Actúa como el **Dispatcher** central: recibe todas las peticiones HTTP y las delega al módulo correspondiente (`routes/*`).
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas del Sistema
    
    - **express:** Framework del servidor web.
    - **cors:** Middleware para permitir peticiones Cross-Origin (vital si el frontend y backend están en dominios/puertos distintos).
    - **body-parser:** (Redundante) Middleware para parsear bodies. *Nota: Ya está incluido en Express 4.16+, ver sección de recomendaciones.*
    - **serve-favicon:** Middleware para servir el icono del sitio.
    - **path:** Manejo de rutas de archivos.
    
    ### Variables de Entorno
    
    - `PORT`: Puerto de escucha (por defecto `3000` si no se define).
    
    ---
    
    ## 3. Configuración del Servidor
    
    ### 3.1 Middleware Global
    
    - **Límite de Payload:** Se configura `express.json` y `urlencoded` con un límite de **100mb**.
        - *Razón:* Permitir la subida de imágenes pesadas codificadas en Base64 (como se vio en `guardarfotos.js` y `configuracion.js`).
        - *Código:* `app.use(express.json({ limit: '100mb' }));`
    - **CORS:** Habilitado para todos los orígenes (`app.use(cors())`).
    - **Archivos Estáticos:**
        - `../frontend`: Sirve el código fuente del cliente.
        - `./uploads`: Expone públicamente las imágenes subidas (Riesgo de seguridad si no se controla).
        - `./public`: Sirve assets como el favicon y los HTMLs principales.
    
    ---
    
    ## 4. Mapa de Rutas (Route Map)
    
    ### 4.1 Rutas de Frontend (Vistas)
    
    El servidor actúa también como servidor web para la aplicación SPA (Single Page Application) o multipágina, sirviendo archivos HTML específicos para rutas limpias.
    
    | **Ruta URL** | **Archivo Servido** | **Descripción** |
    | --- | --- | --- |
    | `/login` | `public/Login.html` | Pantalla de inicio de sesión. |
    | `/dashboard` | `public/dashboard.html` | Tablero principal. |
    | `/configuracion` | `public/configuracion.html` | Panel de admin. |
    | `/graficos` | `public/Graficos.html` | Visualización de datos. |
    | `/carnets` | `public/carnet.html` | Generación de PDFs. |
    |  |  |  |
    
    ### 4.2 Rutas de API (Endpoints)
    
    Aquí se integran todos los módulos documentados anteriormente. Nótese la inconsistencia en la nomenclatura (CamelCase, minúsculas, Spanglish).
    
    | **Prefijo URL** | **Módulo Controlador** | **Funcionalidad Documentada** |
    | --- | --- | --- |
    | `/api/auth` | `auth.js` | Login y Tokens. |
    | `/api/Categoria` | `db_Categoria.js` | Gestión de categorías. |
    | `/api/Localidad` | `localidades.js` | CRUD Localidades. |
    | `/api/Usuario` | `Usuario.js` | Consulta de usuarios. |
    | `/api/indicadores` | `dashboard.js` | Datos estadísticos globales. |
    | `/api/graficos` | `graficos.js` | Cuantificación de respuestas. |
    | `/api/fotos` | `guardarfotos.js` | Subida de imágenes a disco. |
    | `/api/Organizacion` | `organizaciones.js` | CRUD Organizaciones. |
    | `/api/forms` | `forms.js` | Estructura de formularios dinámicos. |
    | `/api/respuesta` | `RespuestaSave.js` | Guardado de respuestas. |
    | `/api/permisos` | `permisos.js` | Gestión de roles (no provisto, pero referenciado). |
    | `/api/personal` | `GuardarPersonal.js` | Gestión de RRHH. |
    | `/api/excel` | `excel.js` | Exportación de reportes. |
    | `/api/plantilla` | `plantillaExcel.js` | Importación masiva. |
    | `/api/configuracion` | `configuracion.js` | Identidad corporativa. |
    | `/api/responses` | `responses.js` | (Posible duplicado o lógica extra de respuestas). |
    | `/api/carnets` | `generatePDF.js` | Generación de ZIPs y PDFs. |
    
    ---
    
    ---
    
    ### Conclusión del Proyecto
    
    El sistema backend. Tienes un mapa completo de:
    
    1. **Seguridad:** Autenticación básica y manejo de sesiones (`auth.js`).
    2. **Datos Maestros:** Usuarios, Organizaciones, Localidades, Categorías.
    3. **Core de Negocio:** Motor de Formularios Dinámicos (`forms.js`, `RespuestaSave.js`).
    4. **Operatividad:** Gestión de Personal (`GuardarPersonal.js`).
    5. **Entradas/Salidas:** Importación Excel, Exportación Excel, Generación PDF.
    6. **Infraestructura:** Manejo de archivos, configuración global y orquestación (`server.js`).
    
    El sistema es funcional pero presenta deuda técnica en áreas de **seguridad (SQL Injection, exposición de archivos)** y **estandarización de código**. Esta documentación servirá de base sólida para el plan de refactorización y mantenimiento.
    
- Documentación Técnica: Módulo de Autenticación (`auth.js`)
    
    # Documentación Técnica: Módulo de Autenticación (`auth.js`)
    
    ## 1. Resumen General
    
    Este archivo define un `Router` de Express encargado de la gestión del ciclo de vida de la sesión de los usuarios. A diferencia de las implementaciones estándar de JWT (Stateless), este sistema utiliza **tokens opacos** (referencias criptográficas aleatorias) que se persisten en una tabla de base de datos (`refreshtokens`). Esto permite un control granular sobre las sesiones, incluyendo la capacidad de revocar tokens y validar su expiración en tiempo real contra el servidor.
    
    El módulo también incluye endpoints para el registro y actualización de datos de usuarios, así como la recuperación de perfiles y permisos detallados durante el inicio de sesión.
    
    ## 2. Dependencias y Configuración
    
    El módulo requiere las siguientes dependencias e importaciones:
    
    - **Librerías:**
        - `express`: Framework para el manejo de rutas.
        - `bcrypt`: Utilizado para el hashing de contraseñas (Nota: Implementación parcial en el código actual).
        - `crypto`: Módulo nativo de Node.js utilizado para generar los tokens aleatorios hexadecimales (64 bytes).
        - `jsonwebtoken`: Importado pero **no utilizado** en la lógica actual (se usa `crypto` en su lugar).
    - **Módulos Internos:**
        - `../config/database`: Módulo de conexión a la base de datos (un pool de conexiones MySQL).
    - **Tablas de Base de Datos Requeridas:**
        - `Usuarios`: Almacena información personal y credenciales.
        - `refreshtokens`: Almacena los tokens de sesión, fechas de expiración y estado de revocación.
        - `permisos`: Tabla relacionada para definir roles y capacidades del sistema (utilizada en `/login`).
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1. Login Simple (Legacy)
    
    **Ruta:** `POST /loginAnt`
    
    **Descripción:** Autenticación básica. Verifica credenciales y genera un token de sesión sin cargar la estructura compleja de permisos.
    
    - **Body (JSON):**
        - `email` (string): Correo electrónico del usuario.
        - `password` (string): Contraseña en texto plano.
    - **Lógica de Variables:**
        - `expiresAt`: Se calcula sumando 24 horas a la fecha actual.
        - `token`: Generado vía `crypto.randomBytes(64)`.
    - **Respuesta Exitosa (200 OK):**JSON
    
    ```jsx
    {
      "success": true,
      "token": "cadena_hexadecimal...",
      "user": {
        "id": 1,
        "email": "correo@ejemplo.com",
        "nombre": "Nombre Usuario",
        "cedula": "123456"
      },
      "expiresAt": "2023-10-27T10:00:00.000Z"
    }
    ```
    
    - **Errores:**
        - `400/200 OK` (Lógica interna): `{ "success": false, "message": "Usuario no encontrado" }` si las credenciales no coinciden o `UsuEst` no es 'A'.
    
    ### 3.2. Login Principal
    
    **Ruta:** `POST /login`
    
    **Descripción:** Autenticación completa. Realiza un `JOIN` entre `usuarios` y `permisos` para devolver un objeto de sesión enriquecido con banderas de autorización.
    
    - **Body (JSON):**
        - `email` (string)
        - `password` (string)
    - Variables de Permisos (Base de datos):
        
        Se recuperan y mapean las siguientes banderas (valores 'S'/'N' o booleanos lógicos): PermCreForm, PerElForm, PerRespEn, PerRespIna, PerRespImpEx, PerRespImpFoto, PerRespDes, PermConfSis.
        
    - **Respuesta Exitosa (200 OK):**JSON
        
        ```jsx
        {
          "success": true,
          "token": "cadena_hexadecimal_segura...",
          "expiresAt": "ISO_Date_String",
          "user": {
            "id": 1,
            "email": "...",
            "nombre": "...",
            "cedula": "...",
            "admin": "S",
            "perfil": { "id": 1, "nombre": "Administrador" }
          },
          "permissions": {
            "PermCreForm": "S",
            "PerElForm": "N",
            ...
          }
        }
        ```
        
    
    ### 3.3. Verificación de Token
    
    **Ruta:** `GET /verify`
    
    **Descripción:** Valida si un token es auténtico, no ha expirado y no ha sido revocado. Actualiza la columna `RtUltimoUso` en la base de datos.
    
    - **Headers:**
        - `Authorization`: `Bearer <token>`
    - **Lógica:**
        1. Extrae el token del header.
        2. Consulta `refreshtokens` unida a `Usuarios`.
        3. Verifica `RtExpira > NOW()` y `RtRevocado = 0`.
    - **Respuesta Exitosa (200 OK):**JSON
        
        ```jsx
        {
          "valid": true,
          "user": { ...datos_basicos... },
          "expiresAt": "ISO_Date_String"
        }
        ```
        
    - **Respuesta Inválida:** `{ "valid": false, "message": "Token inválido o expirado" }`.
    
    ### 3.4. Cerrar Sesión (Logout)
    
    **Ruta:** `POST /logout`
    
    **Descripción:** Revoca lógicamente el token actual para impedir su uso futuro.
    
    - **Headers:**
        - `Authorization`: `Bearer <token>`
    - **Acción en Base de Datos:** Ejecuta `UPDATE refreshtokens SET RtRevocado = 1`.
    - **Respuesta:** `{ "success": true, "message": "Logout exitoso" }`.
    
    ### 3.5. Registro de Usuario
    
    **Ruta:** `POST /register`
    
    **Descripción:** Crea un nuevo usuario en el sistema con estado inicial 'P' (Pendiente/Provisional).
    
    - **Body (JSON):**
        - `nombre`, `cedula`, `telefono`, `email`, `password`.
    - **Lógica Interna:**
        - Verifica existencia previa del email.
        - **Nota sobre el código:** Genera `hashedPassword` usando `bcrypt`, pero la consulta SQL actual (`INSERT INTO ... VALUES ...`) está insertando la variable `password` (texto plano) en lugar de `hashedPassword`.
    - **Respuesta:** `{ "success": true, "message": "Usuario creado exitosamente" }`.
    
    ### 3.6. Actualizar Usuario
    
    **Ruta:** `POST /Actualizar`
    
    **Descripción:** Modifica los datos de un usuario existente buscado por su email.
    
    - **Body (JSON):**
        - `nombre`, `cedula`, `telefono`, `email`, `estado`, `password`.
    - **Lógica Interna:**
        - Actualiza todos los campos.
        - **Nota sobre el código:** Al igual que en registro, se calcula el hash pero se pasa la variable `password` en texto plano a la consulta SQL.
    - **Respuesta:** `{ "success": true, "message": "Usuario actualizado exitosamente" }`.
    
    ### 3.7. Renovar Token (Refresh)
    
    **Ruta:** `POST /refresh`
    
    **Descripción:** Implementa la rotación de tokens. Invalida el token actual y emite uno nuevo para extender la sesión sin requerir credenciales nuevamente.
    
    - **Headers:**
        - `Authorization`: `Bearer <token>`
    - **Acción:**
        1. Verifica token actual.
        2. Marca actual como revocado (`RtRevocado = 1`).
        3. Genera e inserta nuevo token en `refreshtokens`.
    - **Respuesta:**JSON
    
    ```jsx
    {
      "success": true,
      "token": "nuevo_token_hex...",
      "expiresAt": "nueva_fecha...",
      "message": "Token renovado"
    }
    ```
    
    ---
    
    ## 4. Observaciones de Seguridad y Código
    
    Al analizar el código para documentación, se destacan los siguientes puntos técnicos sobre la implementación actual:
    
    1. **Manejo de Contraseñas:** En los endpoints `/register` y `/Actualizar`, la variable `hashedPassword` se calcula correctamente mediante `bcrypt.hash(password, 10)`, pero no se utiliza en el array de parámetros de la consulta `connection.execute`. Se está insertando `password` (texto plano).
    2. **Inyección SQL:** El código utiliza correctamente *Prepared Statements* (uso de `?` en las consultas), lo cual protege contra inyección SQL en todos los endpoints documentados.
    3. **Gestión de Conexiones:** Se utiliza el patrón `try...catch...finally` para asegurar que `connection.release()` se ejecute, evitando fugas de conexiones en el pool de base de datos.
    4. **Autenticación Stateful:** La seguridad depende de la base de datos. Si la base de datos cae, la validación de tokens (`/verify`) fallará, a diferencia de los JWTs estándar que pueden validarse matemáticamente sin BD.
- Documentación Técnica: Gestión de Roles y Permisos (`permisos.js`)
    
    # Documentación Técnica: Gestión de Roles y Permisos (`permisos.js`)
    
    ## 1. Resumen General
    
    Este archivo define las rutas para la administración de los perfiles de seguridad (roles) dentro de la aplicación. Permite crear, editar, eliminar y consultar las definiciones de permisos (CRUD de la tabla `permisos`). Adicionalmente, incluye endpoints para asignar estos perfiles a los usuarios y consultar la lista consolidada de usuarios con sus privilegios actuales.
    
    Es un componente crítico para la seguridad, ya que aquí se definen las banderas (`flags`) que habilitan o bloquean funcionalidades en el frontend y backend.
    
    ## 2. Dependencias y Requisitos
    
    - **Librerías:**
        - `express`: Para el enrutamiento HTTP.
        - `../config/database`: Módulo de conexión a la base de datos (MySQL).
    - **Tablas de Base de Datos:**
        - `permisos`: Tabla maestra de definiciones de roles.
        - `usuarios`: Tabla de usuarios (actualizada aquí para asignación de roles).
    - **Requisitos Previos:**
        - La base de datos debe soportar transacciones o conexiones asíncronas estándar.
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1. Crear Nuevo Perfil
    
    **Ruta:** `POST /crear`
    
    Descripción: Inserta una nueva definición de rol en la base de datos.
    
    Nota: El sistema establece por defecto en 'N' (No) varios permisos administrativos (PerDesCar, PerIngPar, etc.) que no se reciben en el body.
    
    - **Body (JSON):**
        - `PermDesc` (string): Nombre descriptivo del rol (ej. "Administrador").
        - Flags de permisos (valores esperados: 'S'/'N'): `PermCreForm`, `PerElForm`, `PerRespEn`, `PerRespIna`, `PerRespImpEx`, `PerRespImpFoto`, `PerRespDes`, `PermConfSis`.
    - **Validaciones:** Verifica si `PermDesc` ya existe antes de insertar.
    - **Respuesta Exitosa (200 OK):**JSON
        
        ```jsx
        { "success": true, "message": "Perfil creado exitosamente" }
        ```
        
    - **Errores:**
        - Perfil duplicado:
        
        ```jsx
         { "success": false, "message": "El perfil ya existe" }
        ```
        
    
    ### 3.2. Actualizar Definición de Perfil
    
    **Ruta:** `POST /Actualizar`
    
    **Descripción:** Modifica los permisos asociados a un rol existente identificado por su ID (`PermSec`). Reinicia ciertos permisos administrativos a `'N'` forzosamente durante la actualización.
    
    - **Body (JSON):**
        - `PermSec` (int): ID único del permiso a editar.
        - `PermDesc` (string): Nuevo nombre del rol.
        - Flags de permisos: `PermCreForm`, `PerElForm`, ... (lista completa igual al endpoint `/crear`).
    - **Respuesta Exitosa (200 OK):**JSON
        
        ```jsx
        { "success": true, "message": "Perfil creado exitosamente" }
        ```
        
        *(Nota: El mensaje de éxito en el código dice "creado", aunque la acción es una actualización).*
        
    
    ### 3.3. Asignar Perfil a Usuario
    
    **Ruta:** `POST /ActualizarPerfil`
    
    **Descripción:** Asocia un rol específico (`PermSec`) a un usuario (`UsuId`) y actualiza su estado (`UsuEst`). A diferencia del endpoint anterior, este **modifica la tabla `usuarios`**, no la tabla `permisos`.
    
    - **Body (JSON):**
        - `UsuId` (int): ID del usuario.
        - `PermSec` (int): ID del rol a asignar.
        - `UsuEst` (string): Estado del usuario (ej. 'A' Activo, 'I' Inactivo).
    - **Respuesta Exitosa (200 OK):**JSON
        
        ```jsx
        { "success": true, "message": "Usuario actualizado correctamente" }
        ```
        
    
    ### 3.4. Eliminar Perfil
    
    **Ruta:** `POST /Eliminar`
    
    **Descripción:** Elimina físicamente un registro de la tabla `permisos`.
    
    - **Body (JSON):**
        - `PermSec` (int): ID del perfil a eliminar.
    - **Respuesta Exitosa (200 OK):**JSON
        
        ```jsx
        { "success": true, "message": "Perfil eliminado correctamente" }
        ```
        
    - **Errores:**
        - Si el ID no existe: `{ "success": false, "message": "No existe el perfil" }`.
    
    ### 3.5. Consultar Permiso por ID
    
    **Ruta:** `GET /permisos/:PermSec`
    
    **Descripción:** Retorna la información detallada de un solo perfil.
    
    - **Parámetros de Ruta:**
        - `PermSec`: ID numérico del permiso.
    - **Respuesta Exitosa:**JSON
        
        ```jsx
        {
          "success": true,
          "data": {
            "PermSec": 1,
            "PermDesc": "Administrador",
            "PermCreForm": "S",
            ...
          }
        }
        ```
        
    
    ### 3.6. Listar Todos los Permisos (Detallado)
    
    **Ruta:** `GET /permisos`
    
    **Descripción:** Retorna una lista completa de todos los roles y sus configuraciones de banderas. Útil para grids de administración.
    
    - **Respuesta:** Array de objetos JSON con la estructura completa de la tabla `permisos`.
    
    ### 3.7. Listar Permisos (Select/Dropdown)
    
    **Ruta:** `GET /permisosSelect`
    
    **Descripción:** Versión ligera del listado anterior. Retorna solo ID y Descripción. Optimizado para poblar elementos `<select>` en el frontend.
    
    - **Respuesta:**JSON
        
        ```jsx
        [
          { "PermSec": 1, "PermDesc": "Administrador" },
          { "PermSec": 2, "PermDesc": "Auditor" }
        ]
        ```
        
    
    ### 3.8. Listar Usuarios con Permisos (Vista Consolidada)
    
    **Ruta:** `GET /Usuario`
    
    **Descripción:** Realiza un `LEFT JOIN` entre `usuarios` y `permisos`. Devuelve la lista de usuarios incluyendo las banderas de permisos desglosadas. Si un usuario no tiene permiso asignado, las banderas retornan 'N' mediante `IFNULL`.
    
    - **Respuesta:**JSON
        
        ```jsx
        [
          {
            "UsuId": 10,
            "UsuNom": "Juan Perez",
            "UsuEst": "A",
            "PermDesc": "Admin",
            "PermSec": 5,
            "PermCreForm": "S",
            "PerElForm": "N",
            ...
          }
        ]
        ```
        
    
    ---
    
    ## 4. Consideraciones de Seguridad y Datos
    
    1. **Hardcoding de Valores:** En los endpoints `/crear` y `/Actualizar`, existen columnas como `PerDesCar`, `PerIngPar`, `PerElPar` que se establecen forzosamente a `'N'`. Si en el futuro se requiere gestionar estos permisos, se deberá modificar la query SQL hardcodeada en este archivo.
    2. **Integridad Referencial:** El endpoint `/Eliminar` no verifica si existen usuarios asignados al perfil antes de eliminarlo. Si la base de datos no tiene una restricción `FOREIGN KEY` configurada, esto podría dejar usuarios con referencias huérfanas a un `PermSec` inexistente.
    3. **Mensajes de Respuesta:** En `/Actualizar`, el mensaje de éxito es idéntico al de `/crear` ("Perfil creado..."). Se recomienda ajustar esto para evitar confusión en el cliente.
    4. **Validación de Existencia en Actualización:** Aunque en `/Actualizar` se ejecuta una query para buscar si el `PermDesc` existe (`checkQuery`), el código actual no utiliza el resultado de esa verificación para detener la ejecución; procede directamente al `UPDATE`.
    
    ---
    
- Documentación Técnica: Servicio de Gestión de Usuarios (`Usuario.js`)
    
    ---
    
    # Documentación Técnica: Servicio de Gestión de Usuarios (`Usuario.js`)
    
    ## 1. Resumen General
    
    Este archivo define un endpoint único orientado a la recuperación de información detallada de un usuario específico mediante su correo electrónico. Funciona como un servicio de búsqueda y consulta de perfiles.
    
    **Nota de Arquitectura:** Aunque los comentarios internos del código hacen referencia a "obtener todas las localidades", la lógica implementada corresponde estrictamente a la búsqueda de **usuarios**. Se trata de una inconsistencia en los comentarios del código fuente (Deuda técnica de documentación interna).
    
    ## 2. Dependencias y Requisitos
    
    ### Dependencias de Software
    
    - **express:** Framework para el enrutamiento.
    - **../config/database:** Módulo de conexión a la base de datos (MySQL).
    
    ### Requisitos de Datos
    
    Requiere acceso de lectura a la tabla `usuarios` con las siguientes columnas mínimas:
    
    - `UsuId`, `UsuCod`, `UsuNom`, `UsuCed`, `UsuEmail`, `UsuTel`, `UsuEst`.
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Obtener Usuario por Email
    
    Recupera los datos de perfil de un usuario. Aunque es una operación de lectura, se utiliza el verbo `POST` para enviar el criterio de búsqueda en el cuerpo de la petición.
    
    - **Método HTTP:** `POST`
    - **Ruta:** `/usuario/obtener`
    
    ### Funcionalidad
    
    1. Valida la existencia del parámetro `email` en el cuerpo de la solicitud.
    2. Ejecuta una consulta SQL segura (`SELECT *`) filtrando por el correo electrónico proporcionado.
    3. Si encuentra registros, mapea los resultados a una estructura JSON limpia (excluyendo datos sensibles como la contraseña, aunque la consulta original trae todos los campos).
    4. Retorna la información del usuario o un mensaje indicando que no se encontraron coincidencias.
    
    ### Headers Requeridos
    
    | **Header** | **Valor** | **Descripción** |
    | --- | --- | --- |
    | `Content-Type` | `application/json` | Necesario para interpretar el body. |
    | `Authorization` | `Bearer <token>` | **Recomendado:** Aunque el código no muestra middleware explícito, este endpoint expone PII (Información de Identificación Personal) y debería estar protegido. |
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `email` | String | **Sí** | Correo electrónico del usuario a buscar. |
    
    ### Respuesta Exitosa (200 OK - Usuario Encontrado)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "usuario obtenido exitosamente",
      "data": [
        {
          "UsuId": 101,
          "UsuCod": "COD001",
          "UsuNom": "Ana Torres",
          "UsuCed": "1098765432",
          "UsuEmail": "ana@example.com",
          "UsuTel": "3001234567",
          "UsuEst": "A"
        }
      ],
      "total": 1
    }
    ```
    
    ### Respuesta Exitosa (200 OK - Usuario No Encontrado)
    
    El sistema maneja la ausencia de datos como una respuesta exitosa a nivel de protocolo (200 OK) pero con un indicador lógico de fallo.
    
    JSON
    
    ```jsx
    {
      "success": false,
      "message": "No se encontraron usuarios",
      "data": []
    }
    ```
    
    ### Errores (Códigos de Estado)
    
    - **400 Bad Request:** Cuando no se envía el campo `email`.
        - `{ "error": "Falta el parámetro 'email'" }`
    - **500 Internal Server Error:** Fallo en la conexión a base de datos o error de ejecución SQL.
        - `{ "success": false, "message": "Error interno del servidor: ..." }`
    
    ---
    
    ## 4. Ejemplos de Uso
    
    **Petición cURL:**
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/usuario/obtener \
      -H "Content-Type: application/json" \
      -d '{"email": "usuario@empresa.com"}'
    ```
    
    ---
    
    ---
    
- Documentación Técnica: Gestión de Organizaciones (`organizaciones.js`)
    
    ---
    
    # Documentación Técnica: Gestión de Organizaciones (`organizaciones.js`)
    
    ## 1. Resumen General
    
    Este módulo gestiona el ciclo de vida de los datos de las organizaciones. Implementa lógica para listar, buscar por ID, eliminar y una lógica híbrida de creación/actualización basada en el NIT (Número de Identificación Tributaria). Actúa como maestro de datos para vincular usuarios y formularios.
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas y Configuración
    
    - **express:** Framework para el manejo de rutas HTTP.
    - **../config/database:** Pool de conexiones a la base de datos MySQL.
    
    ### Esquema de Datos Requerido
    
    Tabla `organizaciones` con columnas:
    
    - `orgSec` (PK, Auto-increment), `orgNom`, `orgNit`, `oUsuCod`, `oFecha`, `OrgTel`, `OrgCor`, `OrgWeb`, `OrgRepLe`.
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Listar Todas las Organizaciones
    
    Obtiene el listado completo de organizaciones registradas.
    
    - **Método:** `POST` (Actúa como GET)
    - **Ruta:** `/organizaciones/obtener`
    
    ### Body del Request
    
    No requiere parámetros, pero espera un cuerpo JSON válido (aunque sea vacío `{}`).
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Organizaciones obtenidas exitosamente",
      "data": [
        {
          "llave": 1,
          "nombre": "Empresa ABC",
          "nit": "900123456",
          "telefono": "6011234567",
          "correo": "contacto@abc.com",
          "web": "www.abc.com",
          "replegal": "Juan Perez",
          "usuario": "ADMIN01",
          "fecha": "2023-10-27T00:00:00.000Z"
        }
      ],
      "total": 1
    }
    ```
    
    ---
    
    ### 3.2 Obtener Organización por ID
    
    Busca una organización específica mediante su identificador primario (`orgsec`).
    
    - **Método:** `GET`
    - **Ruta:** `/organizaciones/obtener/:orgid`
    
    ### Parámetros de Ruta (URL)
    
    | **Parámetro** | **Tipo** | **Descripción** |
    | --- | --- | --- |
    | `orgid` | Integer | ID único de la organización (`orgSec`). |
    
    ### Respuesta Exitosa (200 OK)
    
    Retorna un array `data` con un solo elemento si se encuentra.
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Organizaciones obtenidas exitosamente",
      "data": [ { "llave": 5, "nombre": "...", ... } ],
      "total": 1
    }
    ```
    
    ### Errores
    
    - **404 Not Found (Lógico):** `{ "success": false, "message": "No se encontraron organizaciones", "data": [] }`
    
    ---
    
    ### 3.3 Crear o Actualizar (Upsert por NIT)
    
    Este endpoint tiene una lógica dual: intenta crear una organización, pero si detecta que el **NIT** ya existe, actualiza el registro existente en lugar de duplicarlo.
    
    - **Método:** `POST`
    - **Ruta:** `/organizaciones/crear`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `usucod` | String | **Sí** | Código del usuario creador/modificador. |
    | `nombre` | String | **Sí** | Razón social. |
    | `nit` | String | **Sí** | Identificación tributaria (Clave de búsqueda). |
    | `telefono` | String | No | Teléfono de contacto. |
    | `correo` | String | No | Email corporativo. |
    | `web` | String | No | Sitio web. |
    | `replegal` | String | No | Representante legal. |
    
    ### Comportamiento Lógico
    
    1. Busca en la BD si existe `orgNit`.
    2. **Si existe:** Ejecuta `UPDATE` sobre los campos proporcionados.
    3. **Si NO existe:** Ejecuta `INSERT` con la fecha actual (`oFecha`).
    
    ### Respuesta Exitosa (200 OK - Creación)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Organización creada exitosamente",
      "data": {
        "llave": 15,
        "nombre": "Nueva Empresa",
        "nit": "800999888",
        "usuario": "USER01",
        "fecha": "2023-12-20"
      }
    }
    ```
    
    ---
    
    ### 3.4 Actualizar Organización (Explícito por ID)
    
    Actualiza los datos de una organización basándose estrictamente en su ID (`orgSec`).
    
    - **Método:** `POST`
    - **Ruta:** `/organizaciones/actualizar`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `id` | Integer | **Sí** | ID de la organización (`orgSec`). |
    | `nombre` | String | **Sí** | Nueva razón social. |
    | `nit` | String | **Sí** | Nuevo NIT. |
    | `telefono`, `correo`, `web`, `replegal` | String | No | Campos opcionales a actualizar. |
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Organización actualizada exitosamente",
      "data": {
        "llave": 15,
        "nombre_anterior": "Nombre Viejo",
        "nombre_nuevo": "Nombre Nuevo",
        "actualizada": true
      }
    }
    ```
    
    ### Errores
    
    - **404 Not Found:** `{ "success": false, "message": "Organización no encontrada" }`
    - **400 Bad Request:** Faltan datos obligatorios.
    
    ---
    
    ### 3.5 Eliminar Organización
    
    Elimina físicamente un registro de la base de datos.
    
    - **Método:** `POST`
    - **Ruta:** `/organizaciones/eliminar`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `id` | Integer | **Sí** | ID de la organización a eliminar. |
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Organización eliminada exitosamente",
      "data": { "id": 15, "eliminada": true }
    }
    ```
    
    ---
    
    ## 4. Ejemplos de Uso (cURL)
    
    **Crear una Organización (o actualizar si el NIT existe):**
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/organizaciones/crear \
      -H "Content-Type: application/json" \
      -d '{
        "usucod": "ADMIN",
        "nombre": "Tecnología SAS",
        "nit": "900555444",
        "telefono": "555-1234",
        "correo": "contacto@tecno.com"
      }'
    ```
    
    **Obtener Organización por ID:**
    
    Bash
    
    ```jsx
    curl -X GET http://api.dominio.com/organizaciones/obtener/5
    ```
    
    ---
    
- Documentación Técnica: Gestión de Localidades (`localidades.js`)
    
    ---
    
    # Documentación Técnica: Gestión de Localidades (`localidades.js`)
    
    ## 1. Resumen General
    
    Este módulo implementa un CRUD (Crear, Leer, Actualizar, Eliminar) completo para la entidad **Localidad**. Las localidades funcionan como datos maestros auxiliares, utilizados probablemente para categorizar usuarios, organizaciones o la recolección de formularios. El diseño sigue un patrón de API RESTful en estructura de respuesta, aunque utiliza exclusivamente el verbo HTTP `POST` para todas las operaciones.
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas
    
    - **express:** Manejo del enrutamiento.
    - **../config/database:** Pool de conexiones a MySQL.
    
    ### Base de Datos
    
    Requiere la tabla `localidad` con las siguientes columnas:
    
    - `localSec` (PK, Auto-incrementable)
    - `localNom` (Nombre de la localidad)
    - `lUsuCod` (Código del usuario creador)
    - `lFecha` (Fecha de creación)
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Listar Todas las Localidades
    
    Recupera el catálogo completo de localidades disponibles.
    
    - **Método:** `POST` (Utilizado como GET)
    - **Ruta:** `/localidad/obtener`
    
    ### Body del Request
    
    No requiere parámetros, pero espera un JSON vacío `{}`.
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Localidades obtenidas exitosamente",
      "data": [
        {
          "llave": 1,
          "localidad": "Zona Norte",
          "usuario": "ADMIN01",
          "fecha": "2023-10-27T00:00:00.000Z"
        }
      ],
      "total": 1
    }
    ```
    
    ---
    
    ### 3.2 Crear Localidad
    
    Registra una nueva localidad en el sistema con la fecha actual del servidor.
    
    - **Método:** `POST`
    - **Ruta:** `/localidad/crear`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `usucod` | String | **Sí** | Identificador del usuario que crea el registro. |
    | `nombre` | String | **Sí** | Nombre de la localidad. |
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Localidad creada exitosamente",
      "data": {
        "id": 15,
        "nombre": "Zona Sur",
        "usuario": "USER123",
        "fecha": "2023-12-20"
      }
    }
    ```
    
    ---
    
    ### 3.3 Eliminar Localidad
    
    Elimina físicamente un registro basado en su ID.
    
    - **Método:** `POST` (Utilizado como DELETE)
    - **Ruta:** `/localidad/eliminar`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `id` | Integer | **Sí** | ID de la localidad (`localSec`). |
    
    ### Errores Comunes
    
    - **404 Not Found:** `{ "success": false, "message": "Localidad no encontrada" }`
    - **400 Bad Request:** `{ "success": false, "message": "ID de localidad es requerido" }`
    
    ---
    
    ### 3.4 Actualizar Localidad
    
    Modifica el nombre de una localidad existente.
    
    - **Método:** `POST` (Utilizado como PATCH/PUT)
    - **Ruta:** `/localidad/actualizar`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `id` | Integer | **Sí** | ID de la localidad a modificar. |
    | `nombre` | String | **Sí** | Nuevo nombre para la localidad. |
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Localidad actualizada exitosamente",
      "data": {
        "id": 15,
        "nombre_anterior": "Zona Sur",
        "nombre_nuevo": "Zona Sur Expandida",
        "actualizada": true
      }
    }
    ```
    
    ---
    
    ### 3.5 Obtener Localidad por ID
    
    Busca un registro específico. Útil para pre-cargar formularios de edición.
    
    - **Método:** `POST` (Utilizado como GET)
    - **Ruta:** `/localidad/obtener-por-id`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `id` | Integer | **Sí** | ID de la localidad. |
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Localidad encontrada",
      "data": {
        "llave": 15,
        "localidad": "Zona Sur Expandida",
        "usuario": "USER123",
        "fecha": "2023-12-20T05:00:00.000Z"
      }
    }
    ```
    
    ---
    
    ## 4. Ejemplos de Uso (cURL)
    
    **Crear una nueva localidad:**
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/localidad/crear \
      -H "Content-Type: application/json" \
      -d '{"usucod": "ADMIN", "nombre": "Sede Principal"}'
    ```
    
    **Eliminar una localidad:**
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/localidad/eliminar \
      -H "Content-Type: application/json" \
      -d '{"id": 15}'
    ```
    
    ---
    
    ---
    
- Documentación Técnica: Gestión de Categorías (`db_Categoria.js`)
    
    ---
    
    # Documentación Técnica: Gestión de Categorías (`db_Categoria.js`)
    
    ## 1. Resumen General
    
    Este módulo administra la entidad **Categoría**, utilizada para agrupar y clasificar los formularios o encuestas del sistema. A diferencia de los módulos anteriores, este archivo implementa una generación de IDs alfanuméricos personalizados y lógica avanzada de transacciones para operaciones masivas.
    
    **Nota de Contexto:** En los logs y comentarios del código existen referencias a "Guardando Encuesta", lo cual indica que este código probablemente fue refactorizado a partir de un módulo de encuestas. Funcionalmente, opera sobre la tabla `categoria`.
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas
    
    - **express:** Enrutamiento HTTP.
    - **../config/database:** Pool de conexiones MySQL con soporte para transacciones (`beginTransaction`, `commit`, `rollback`).
    
    ### Esquema de Base de Datos
    
    Requiere la tabla `categoria` con las siguientes columnas:
    
    - `CatFormSec` (PK, Varchar/String): ID generado aleatoriamente.
    - `CatFormTitu`, `CatFormDesc`: Título y descripción.
    - `CatFormEst`: Estado (`ACT` = Activo, `INA` = Inactivo).
    - `CatFormLog`: Almacenamiento de URL o string de logo/icono.
    - `CatFormFecCre`, `CatFormUsuCre`: Auditoría de creación.
    - `CatFormFecMod`, `CatFormUsuMod`: Auditoría de modificación.
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Crear Categoría
    
    Registra una nueva categoría generando un ID alfanumérico único.
    
    - **Método:** `POST`
    - **Ruta:** `/wsGuardarCategoria`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `titulo` | String | **Sí** | Título de la categoría. |
    | `descripcion` | String | No | Descripción detallada. |
    | `foto` | String | No | URL o base64 del icono/logo. |
    
    ### Lógica Interna
    
    1. Genera un ID aleatorio (no auto-incremental) usando `Math.random`.
    2. Inicia una transacción de base de datos.
    3. Inserta el registro con estado por defecto `'ACT'` y usuario `'prueba'` (Hardcoded).
    4. Confirma la transacción (`commit`).
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Encuesta guardada exitosamente",
      "form_id": "7x91zn3...", 
      "titulo": "Salud Ocupacional",
      "tiene_foto": false
    }
    ```
    
    ---
    
    ### 3.2 Listar Todas las Categorías
    
    Obtiene el historial completo de categorías, ordenado por fecha de creación ascendente.
    
    - **Método:** `GET`
    - **Ruta:** `/wsListarCategorias`
    
    ### Respuesta Exitosa
    
    Retorna un array mapeado con nombres de propiedades amigables para el frontend.
    
    JSON
    
    ```jsx
    {
      "success": true,
      "total": 5,
      "categorias": [
        {
          "id": "abc123xyz",
          "titulo": "Inspecciones",
          "descripcion": "Formularios de campo",
          "estado": "ACT",
          "fecha_creacion": "2023-10-01T10:00:00.000Z",
          "fecha_formateada": "1 de octubre de 2023, 10:00"
        }
      ]
    }
    ```
    
    ---
    
    ### 3.3 Listar Categorías Activas
    
    Filtra exclusivamente las categorías con estado vigente (`CatFormEst = 'ACT'`).
    
    - **Método:** `GET`
    - **Ruta:** `/wsListarCategoriastab`
    - **Diferencia:** Incluye la cláusula `WHERE CatFormEst = 'ACT'`.
    
    ---
    
    ### 3.4 Obtener Categoría por ID
    
    Recupera el detalle de una categoría específica.
    
    - **Método:** `GET`
    - **Ruta:** `/wsObtenerCategoria/:id`
    
    ### Parámetros
    
    - `id` (Path param): Identificador único de la categoría.
    
    ### Respuesta Exitosa
    
    JSON
    
    ```jsx
    {
      "success": true,
      "categoria": {
        "id": "abc123xyz",
        "titulo": "Inspecciones",
        "fecha_formateada": "..."
      }
    }
    ```
    
    ---
    
    ### 3.5 Eliminación Física (Hard Delete)
    
    Elimina permanentemente una categoría de la base de datos.
    
    - **Método:** `DELETE`
    - **Ruta:** `/wsEliminarCategoria/:id`
    
    ### Validaciones
    
    - Verifica si el ID existe antes de intentar borrar.
    - **Nota:** Existe código comentado (líneas 218-232) preparado para validar si hay formularios dependientes antes de borrar. Actualmente esa validación está **desactivada**.
    
    ---
    
    ### 3.6 Gestión de Estado (Soft Delete / Reactivación)
    
    Endpoints para cambiar el estado de la categoría sin eliminar el registro.
    
    ### Desactivar (Inactivar)
    
    - **Método:** `PATCH`
    - **Ruta:** `/wsDesactivarCategoria/:id`
    - **Acción:** Actualiza `CatFormEst = 'INA'` y registra fecha/usuario de modificación.
    
    ### Reactivar
    
    - **Método:** `PATCH`
    - **Ruta:** `/wsReactivarCategoria/:id`
    - **Acción:** Actualiza `CatFormEst = 'ACT'`.
    
    ---
    
    ### 3.7 Eliminación Masiva (Bulk Delete)
    
    Permite eliminar múltiples categorías en una sola petición.
    
    - **Método:** `DELETE`
    - **Ruta:** `/wsEliminarCategorias`
    
    ### Body del Request
    
    JSON
    
    `{
      "ids": ["id_1", "id_2", "id_3"]
    }`
    
    ### Lógica de Transacción (Parcialmente Atómica)
    
    Itera sobre los IDs proporcionados. Si logra eliminar al menos uno, hace `COMMIT` de los exitosos. Si todos fallan, hace `ROLLBACK`. Retorna un reporte detallado de cuáles se eliminaron y cuáles fallaron.
    
    ### Respuesta
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "2 categorías eliminadas, 1 errores",
      "eliminadas": [{ "id": "id_1", "titulo": "Cat A" }],
      "errores": [{ "id": "id_99", "error": "Categoría no encontrada" }]
    }
    ```
    
    ---
    
    ## 4. Ejemplos de Uso (cURL)
    
    **Crear una Categoría:**
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/wsGuardarCategoria \
      -H "Content-Type: application/json" \
      -d '{
        "titulo": "Mantenimiento",
        "descripcion": "Revisiones preventivas",
        "foto": "http://img.com/logo.png"
      }'
    ```
    
    **Eliminación Masiva:**
    
    Bash
    
    ```jsx
    curl -X DELETE http://api.dominio.com/wsEliminarCategorias \
      -H "Content-Type: application/json" \
      -d '{ "ids": ["xp9s2k", "m4j1l0"] }'
    ```
    
    ---
    
    ---
    
- Documentación Técnica: Motor de Estructura de Formularios (`forms.js`)
    
    ---
    
    ## 1. Resumen General
    
    Este módulo gestiona la **definición estructural** de los formularios. Permite crear y modificar preguntas dinámicas (texto, numérico, fechas, selección múltiple), gestionar sus opciones y recuperar la estructura completa.
    
    Una característica clave es que implementa la recuperación híbrida: puede devolver un formulario en blanco o un formulario **pre-llenado** con respuestas de un usuario específico, fusionando la definición de la estructura con los datos transaccionales.
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas
    
    - **express:** Enrutamiento HTTP.
    - **../config/database:** Pool de conexiones a MySQL con soporte de transacciones.
    
    ### Modelo de Datos
    
    Interactúa con un esquema relacional complejo:
    
    - **Formulario:** Tabla principal de preguntas (`FormSec`, `FormPregunta`, `FormTipo`, `FormOrden`).
    - **FormularioOpciones:** Opciones para preguntas de selección (`FormOpSec`, `FormOp`).
    - **Categoria:** Para validar la existencia del padre (`CatFormSec`).
    - **Respuestas:** (Lectura) Para pre-llenar datos (`RespNum`, `RespFecha`, `RespValor`).
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Guardar Estructura del Formulario (Upsert Complejo)
    
    Este endpoint actúa como un "Guardado Maestro". Procesa una lista de preguntas y opciones, actualizando las existentes o creando nuevas.
    
    - **Método:** `POST`
    - **Ruta:** `/save/:catFormSec`
    
    ### Lógica de Transacción (Crítica)
    
    1. **Limpieza de Opciones:** Elimina **todas** las opciones (`FormularioOpciones`) asociadas a la categoría completa antes de reinsertarlas.
        - *Riesgo:* Esta es una operación destructiva masiva dentro de la transacción.
    2. **Procesamiento de Preguntas:** Itera sobre el array `formulario`.
        - Intenta `UPDATE` por `FormSec` y `CatFormSec`.
        - Si no afecta filas, ejecuta `INSERT`.
    3. **Reinserción de Opciones:** Itera sobre `formulario_opciones` e inserta nuevamente todas las opciones.
    
    ### Body del Request (JSON)
    
    JSON
    
    ```jsx
    {
      "formulario": [
        {
          "FormSec": "Q1", 
          "CatFormSec": "CAT01",
          "FormPregunta": "¿Edad?",
          "FormTipo": "number",
          "FormJson": "{}",
          "FormReq": true,
          "FormOrden": 1
        }
      ],
      "formulario_opciones": [
        { "FormSec": "Q1", "FormOp": "Opción A" } 
      ]
    }
    ```
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Formulario guardado en BD exitosamente",
      "saved_questions": 1,
      "saved_options": 1
    }
    ```
    
    ---
    
    ### 3.2 Eliminar Pregunta
    
    Elimina una pregunta específica y sus opciones asociadas mediante una transacción.
    
    - **Método:** `DELETE`
    - **Ruta:** `/DeleteQ/:catFormSec/:FormSec`
    
    ### Parámetros
    
    - `catFormSec`: ID de la categoría.
    - `FormSec`: ID de la pregunta a eliminar.
    
    ### Lógica Interna
    
    1. Elimina opciones en `FormularioOpciones` vinculadas a esa pregunta.
    2. Elimina la pregunta en `Formulario`.
    3. Commit.
    
    ---
    
    ### 3.3 Obtener Formulario Pre-llenado (Con Respuestas)
    
    Recupera la estructura del formulario e inyecta los valores respondidos por un usuario específico (`perId`).
    
    - **Método:** `GET`
    - **Ruta:** `/wsObtenerFormulario/:catFormSec/:perId`
    
    ### Parámetros
    
    - `catFormSec`: ID de la categoría (Formulario).
    - `perId`: ID de la persona/instancia de respuesta.
    
    ### Lógica SQL Dinámica
    
    Utiliza una subconsulta (`SELECT CASE...`) en la proyección principal para mapear la respuesta correcta según el tipo de dato (`RespNum`, `RespFecha` o `RespValor`) desde la tabla `respuestas`.
    
    ### Respuesta (Estructura Fusionada)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "formulario": {
        "categoria": { ... },
        "preguntas": [
          {
            "id": "Q1",
            "type": "text",
            "text": "Nombre Completo",
            "valor": "Juan Perez", // <--- Campo inyectado desde tabla respuestas
            "options": []
          }
        ]
      }
    }
    ```
    
    ---
    
    ### 3.4 Obtener Formulario en Blanco (Estructura)
    
    Recupera solo la estructura del formulario para ser llenado por primera vez.
    
    - **Método:** `GET`
    - **Ruta:** `/wsObtenerFormulario/:catFormSec`
    - **Comportamiento:** Idéntico al anterior, pero no ejecuta la subconsulta de respuestas ni inyecta el campo `valor`.
    
    ---
    
    ## 4. Ejemplos de Uso (cURL)
    
    **Obtener Formulario con Respuestas Previas:**
    
    Bash
    
    `curl -X GET http://api.dominio.com/wsObtenerFormulario/CAT123/PER555`
    
    **Guardar Formulario (Estructura):**
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/save/CAT123 \
      -H "Content-Type: application/json" \
      -d '{
        "formulario": [{"FormSec": "Q1", "FormPregunta": "Color?", "FormTipo": "select", "FormOrden": 1}],
        "formulario_opciones": [{"FormSec": "Q1", "FormOp": "Rojo"}, {"FormSec": "Q1", "FormOp": "Azul"}]
      }'
    ```
    
    ---
    
- Documentación Técnica: Servicio de Almacenamiento de Respuestas (`RespuestaSave.js`)
    
    ---
    
    # Documentación Técnica: Servicio de Almacenamiento de Respuestas (`RespuestaSave.js`)
    
    ## 1. Resumen General
    
    Este módulo gestiona la recepción y persistencia de las respuestas emitidas por los usuarios. Implementa una estrategia de almacenamiento **polimórfica a nivel de columna** (almacena el dato en columnas diferentes según su tipo: numérico, fecha o texto) y maneja la lógica de versiones o secuencias de respuesta (`RespSec`).
    
    El servicio está diseñado para procesar lotes (batches) de respuestas en una sola petición HTTP, iterando sobre ellas para aplicar lógica de actualización o inserción (Upsert).
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas
    
    - **express:** Enrutamiento HTTP.
    - **../config/database:** Pool de conexiones a MySQL.
    
    ### Modelo de Datos
    
    Requiere la tabla `respuestas` con las siguientes columnas clave:
    
    - `PerId` (ID de la Persona/Usuario).
    - `FormSec` (ID de la Pregunta/Formulario).
    - `RespValor` (Almacenamiento de texto/varchar).
    - `RespNum` (Almacenamiento de números/decimales).
    - `RespFecha` (Almacenamiento de fechas).
    - `RespSec` (Secuencial/Versión de la respuesta).
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Guardar Respuestas (Batch Upsert)
    
    Recibe un array de respuestas, determina el tipo de dato de cada una y las guarda en la base de datos.
    
    - **Método:** `POST`
    - **Ruta:** `/save`
    
    ### Body del Request (JSON - Array)
    
    El endpoint espera un **Array de Objetos**, donde cada objeto representa una respuesta individual.
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `perId` | String/Int | **Sí** | Identificador de la persona que responde. |
    | `id` | String/Int | **Sí** | Identificador de la pregunta (`FormSec`). |
    | `tipo` | String | **Sí** | Tipo de dato: `'number'`, `'date'`, o default (texto). |
    | `valor` | Any | **Sí** | El contenido de la respuesta. |
    
    **Ejemplo de Payload:**
    
    JSON
    
    ```jsx
    [
      {
        "perId": 101,
        "id": "Q_EDAD",
        "tipo": "number",
        "valor": 35
      },
      {
        "perId": 101,
        "id": "Q_NOMBRE",
        "tipo": "text",
        "valor": "Juan Perez"
      }
    ]
    ```
    
    ### Lógica de Procesamiento Interno
    
    1. **Iteración:** Recorre el array de entradas usando un bucle `for...of` para soportar `await`.
    2. **Mapeo de Tipos:**
        - Si `tipo === 'number'` → Asigna a `RespNum`.
        - Si `tipo === 'date'` → Asigna a `RespFecha`.
        - Cualquier otro caso → Asigna a `RespValor`.
    3. **Intento de Actualización (Update):**
        - Ejecuta un `UPDATE` buscando por `PerId` y `FormSec`.
        - **Nota:** Si existe el registro, sobrescribe los tres campos (`RespValor`, `RespFecha`, `RespNum`) dejando `null` en los que no correspondan al tipo actual.
    4. **Inserción (Fallback):**
        - Si el `UPDATE` devuelve `affectedRows === 0` (el registro no existe), procede a insertar.
        - **Cálculo de Secuencia (`RespSec`):**
            - Usa una variable auxiliar `bandera` y `nuevaRespSec`.
            - Si es la primera iteración que requiere inserción (`bandera == 1`), consulta el `MAX(RespSec)` actual en la base de datos para ese usuario y pregunta.
            - Incrementa `nuevaRespSec` y realiza el `INSERT`.
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "mensaje": "Respuesta enviada",
      "camposProcesados": 2
    }
    ```
    
    ### Errores
    
    - **500 Internal Server Error:** Fallos de conexión o errores SQL.
        - `{ "success": false, "message": "Error interno del servidor: ..." }`
    
    ---
    
    ## 4. Ejemplos de Uso (cURL)
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/save \
      -H "Content-Type: application/json" \
      -d '[
        { "perId": 55, "id": "PREG_01", "tipo": "text", "valor": "Respuesta A" },
        { "perId": 55, "id": "PREG_02", "tipo": "number", "valor": 100 }
      ]'
    ```
    
    ---
    
    ---
    
- Documentación Técnica: Gestión de Personal (`GuardarPersonal.js`)
    
    ---
    
    # Documentación Técnica: Gestión de Personal (`GuardarPersonal.js`)
    
    ## 1. Resumen General
    
    Este módulo implementa el CRUD completo para la entidad **Personal**. A diferencia de una gestión de usuarios estándar, este módulo maneja una gran cantidad de datos demográficos, laborales y de disponibilidad horaria.
    
    Características destacadas:
    
    - **Gestión de Fotos:** Almacenamiento de imágenes de perfil en formato Base64 directamente en la base de datos.
    - **Lógica de Negocio:** Generación automática de consecutivos de expediente y cálculo de edad en tiempo real.
    - **Soft Delete:** Implementa desvinculación y reintegro lógico en lugar de borrado físico.
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas
    
    - **express:** Enrutamiento HTTP.
    - **../config/database:** Pool de conexiones a MySQL.
    
    ### Modelo de Datos
    
    Interactúa principalmente con la tabla `personal` y realiza cruces (JOINs) con `organizaciones` y `localidad` para enriquecer la respuesta.
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Crear o Actualizar Personal (Upsert)
    
    Endpoint maestro para registrar nuevos empleados o actualizar existentes. Maneja una extensa lista de campos demográficos y laborales.
    
    - **Método:** `POST`
    - **Ruta:** `/personal/crear`
    
    ### Lógica Interna
    
    1. **Validación:** Verifica campos obligatorios (`userid`, `PerNom`, `PerDoc`, etc.).
    2. **Verificación de Existencia:** Consulta si el `PerId` ya existe.
        - **Si existe:** Ejecuta un `UPDATE` masivo actualizando todos los campos, incluyendo la foto.
        - **Si NO existe:**
            1. Ejecuta `INSERT`.
            2. Genera un consecutivo de expediente (`PerNro`) con formato `YYYYMMDD-XXX` basado en el ID insertado.
            3. Ejecuta un segundo `UPDATE` para guardar este consecutivo.
    
    ### Body del Request (JSON - Parcial)
    
    JSON
    
    ```jsx
    {
      "userid": "ADMIN01",
      "PerNom": "Carlos Ruiz",
      "PerDoc": "12345678",
      "PerGen": "M",
      "PerTipoDoc": "CC",
      "PerTel": "3001234567",
      "PerEstado": "Vinculado",
      "PerOrgSec": 1,
      "localSec": 5,
      "PerFechNa": "1990-05-15",
      "fotoBase64": "data:image/png;base64,iVBORw0KGgo...",
      "PerTipRH": "O+",
      "PerBar": "Centro",
      "PerDiTraLu": 1, // Disponibilidad Lunes (Bit/Boolean)
      "..." : "..."
    }
    ```
    
    ---
    
    ### 3.2 Listar Personal (Básico)
    
    Obtiene el listado completo de personal activo e inactivo, calculando la edad actual mediante SQL (`TIMESTAMPDIFF`).
    
    - **Método:** `POST`
    - **Ruta:** `/personal/obtener`
    
    ### Respuesta Exitosa
    
    JSON
    
    ```jsx
    {
      "success": true,
      "data": [
        {
          "id": 101,
          "nombre": "Carlos Ruiz",
          "cedula": "12345678",
          "edad": 33, // Calculado en BD
          "organizacion": "Empresa ABC",
          "localidad": "Norte",
          "foto": "data:image..."
        }
      ]
    }
    ```
    
    ---
    
    ### 3.3 Listar con Filtro Dinámico (Riesgo de Seguridad)
    
    Permite obtener personal inyectando una cláusula `WHERE` directa desde el cliente.
    
    - **Método:** `POST`
    - **Ruta:** `/personal/obtenerwhere`
    
    ### Body del Request
    
    JSON
    
    `{
      "where": " AND p.PerGen = 'F' AND o.orgSec = 5"
    }`
    
    **Advertencia Crítica:** Este endpoint concatena el string recibido directamente a la consulta SQL (`query += where`). Es altamente vulnerable a **Inyección SQL**.
    
    ---
    
    ### 3.4 Consultar por ID o Documento
    
    Existen múltiples endpoints para recuperar detalles, con ligeras variaciones en la estructura de respuesta o criterio de búsqueda.
    
    | **Ruta** | **Criterio** | **Uso Principal** |
    | --- | --- | --- |
    | `/personal/obtenerId` | `PerId` | Edición de perfil, carga todos los campos técnicos (`PerDiTraLu`, etc.). |
    | `/personal/obtenerDoc` | `PerId` o `PerDoc` | Búsqueda flexible por ID interno o Cédula. |
    | `/personal/CarnetId` | `PerId` | Datos optimizados para impresión de carnés/identificación. |
    
    ---
    
    ### 3.5 Gestión de Estado (Soft Delete)
    
    Cambia el estado de vinculación del personal sin borrar el registro.
    
    - **Eliminar (Desvincular):**
        - **Ruta:** `/personal/eliminar`
        - **Acción:** `UPDATE personal SET PerEstado = 'No vinculado'`.
    - **Reintegrar:**
        - **Ruta:** `/personal/reintegrar`
        - **Acción:** `UPDATE personal SET PerEstado = 'Vinculado'`.
    
    ---
    
    ## 4. Ejemplos de Uso (cURL)
    
    **Crear Personal Nuevo:**
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/personal/crear \
      -H "Content-Type: application/json" \
      -d '{
        "userid": "admin",
        "PerNom": "Ana Lopez",
        "PerDoc": "98765432",
        "PerGen": "F",
        "PerTipoDoc": "CC",
        "PerTel": "555-0000",
        "PerEstado": "Vinculado",
        "PerOrgSec": 1,
        "localSec": 1,
        "PerFechNa": "1995-01-01"
      }'
    ```
    
    **Consultar por Cédula:**
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/personal/obtenerDoc \
      -H "Content-Type: application/json" \
      -d '{ "id": "98765432" }'
    ```
    
    ---
    
- Documentación Técnica: Servicio de Indicadores y Dashboard (`dashboard.js`)
    
    ---
    
    # Documentación Técnica: Servicio de Indicadores y Dashboard (`dashboard.js`)
    
    ## 1. Resumen General
    
    Este módulo tiene como única responsabilidad la extracción y transformación de datos analíticos sobre la fuerza laboral (entidad `Personal`). Ejecuta 7 consultas SQL complejas de forma secuencial para generar estadísticas sobre demografía, vulnerabilidad, horarios laborales y distribución geográfica.
    
    **Patrón de Diseño:** Facade de Lectura. El frontend realiza una sola llamada y el backend orquesta la recolección de datos de múltiples dimensiones.
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas
    
    - **express:** Enrutamiento HTTP.
    - **../config/database:** Pool de conexiones a MySQL.
    
    ### Modelo de Datos
    
    Requiere acceso de lectura intensiva a las tablas:
    
    - `personal`: Fuente primaria de datos.
    - `localidad`: Para la segmentación geográfica.
    - **Dependencia de Datos:** Las consultas dependen de valores específicos en columnas tipo flag (ej. `'X'` para turnos, `'SI'` para condiciones de vulnerabilidad).
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Obtener Indicadores Principales
    
    Endpoint monolítico que devuelve todos los datos necesarios para pintar las gráficas del dashboard.
    
    - **Método:** `POST` (Anti-patrón REST: Debería ser `GET`, ya que no modifica estado).
    - **Ruta:** `/principal`
    
    ### Body del Request
    
    No requiere cuerpo ni parámetros. Ignora cualquier dato enviado.
    
    ### Lógica de Agregación (Queries)
    
    El servicio ejecuta las siguientes consultas de forma secuencial (await):
    
    1. **Género:** Agrupación simple por `PerGen`.
    2. **Población Vulnerable (Habitantes de Calle):** Conteo filtrado por `PerHabCa = 'SI'`.
    3. **Discapacidad:** Conteo filtrado por `PerDis = 'SI'`.
    4. **Disponibilidad Laboral (Matriz de Turnos):**
        - Utiliza `UNION ALL` para combinar 7 subconsultas (Lunes a Domingo).
        - Suma condicionalmente: `SUM(PerDiTraDia = 'X' AND Jornada = 'X')`.
        - Devuelve una matriz de 7 filas (días) con columnas `AM` y `PM`.
    5. **Rangos de Edad (Segmentación):**
        - Calcula edad con `TIMESTAMPDIFF(YEAR, PerFechNa, CURDATE())`.
        - Segmentos: Joven (18-25), Adulto (26-59), Adulto Mayor (>=60).
    6. **Antigüedad/Vinculación:**
        - Calcula meses totales: `(Años * 12) + Meses`.
        - Clasifica en rangos textuales ("Menos de 2 años", "Entre 3 y 5", etc.) usando un `CASE` masivo.
    7. **Distribución Geográfica:** JOIN con `localidad` y conteo descendente.
    
    ### Respuesta Exitosa (200 OK)
    
    Devuelve un objeto `data` conteniendo los arrays de resultados de cada consulta.
    
    JSON
    
    ```jsx
    {
      "success": true,
      "data": {
        "genero": [
          { "Genero": "M", "Total": 45 },
          { "Genero": "F", "Total": 30 }
        ],
        "habitantesCalle": [ { "Total": 5 } ],
        "discapacidad": [ { "Total": 2 } ],
        "DiasLaborales": [
          { "Dia": "Lunes", "AM": 12, "PM": 8 },
          { "Dia": "Martes", "AM": 10, "PM": 10 }
          // ... hasta Domingo
        ],
        "rangoEdad": [
          { "Rango_Edad": "Adulto", "Total": 50 },
          { "Rango_Edad": "Joven", "Total": 25 }
        ],
        "rangoActividad": [
          { "Rango_Actividad": "Menos de 2 años", "Total": 10 }
        ],
        "localidad": [
          { "Localidad": "Centro", "Total": 40 }
        ]
      }
    }
    ```
    
    ### Errores
    
    - **500 Internal Server Error:** Fallo en cualquiera de las consultas SQL.
    
    ---
    
    ## 4. Ejemplos de Uso (cURL)
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/principal \
      -H "Content-Length: 0"
    ```
    
    ---
    
- Documentación Técnica: Cuantificación de Respuestas (`graficos.js`)
    
    ---
    
    # Documentación Técnica: Cuantificación de Respuestas (`graficos.js`)
    
    ## 1. Resumen General
    
    Este módulo se encarga de procesar y cuantificar los datos recolectados a través de los formularios dinámicos. Su función principal es **agregar** las respuestas almacenadas para generar distribuciones de frecuencia (ej. cuántas personas respondieron "Sí" vs "No", o distribución de opciones en una lista desplegable).
    
    **Filtro Inteligente:** El sistema excluye automáticamente las preguntas abiertas (texto, números, fechas) para concentrarse únicamente en datos cuantificables/graficables (Select, Radio, Checkbox).
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas
    
    - **express:** Enrutamiento HTTP.
    - **../config/database:** Pool de conexiones a MySQL.
    
    ### Modelo de Datos
    
    Requiere acceso de lectura (JOIN) entre:
    
    - `respuestas` (`RespValor`, `FormSec`): Tabla de hechos.
    - `formulario` (`FormPregunta`, `FormTipo`, `CatFormSec`): Tabla de dimensiones/metadatos.
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Obtener Estadísticas por Categoría
    
    Calcula el conteo de cada opción de respuesta para todas las preguntas cerradas de un formulario específico.
    
    - **Método:** `POST` (Utilizado como GET)
    - **Ruta:** `/respuestas`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `id` | String | **Sí** | ID de la Categoría/Formulario (`CatFormSec`) a analizar. |
    
    ### Lógica SQL y de Procesamiento
    
    1. **Filtrado de Tipos:** La consulta SQL excluye explícitamente tipos no agregables:SQL
        
        `WHERE f.FormTipo NOT IN ('number', 'text', 'date')`
        
    2. **Filtrado por ID (Vulnerable):** Inyecta el ID recibido directamente en la consulta (Ver sección de Seguridad).
    3. **Agrupamiento:** Realiza un `GROUP BY` compuesto por Pregunta (`FormSec`) y Valor de Respuesta (`RespValor`) y cuenta las ocurrencias (`COUNT(*)`).
    4. **Transformación (Backend):** Convierte el resultado plano de la base de datos (array de filas) en un objeto jerárquico fácil de consumir por librerías de gráficos en el frontend (Chart.js, Recharts, etc.).
    
    ### Respuesta Exitosa (200 OK)
    
    El objeto `data` contiene las preguntas como claves y un array de objetos `{respuesta, total}` como valores.
    
    JSON
    
    ```jsx
    {
      "success": true,
      "data": {
        "¿Tiene vivienda propia?": [
          { "respuesta": "Sí", "total": 45 },
          { "respuesta": "No", "total": 120 }
        ],
        "Nivel de Estudios": [
          { "respuesta": "Bachiller", "total": 30 },
          { "respuesta": "Primaria", "total": 50 },
          { "respuesta": "Ninguno", "total": 10 }
        ]
      }
    }
    ```
    
    ### Errores
    
    - **500 Internal Server Error:** Error en la ejecución de la consulta SQL.
    
    ---
    
    ## 4. Ejemplos de Uso (cURL)
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/respuestas \
      -H "Content-Type: application/json" \
      -d '{ "id": "CAT_ENCUESTA_SOCIOECONOMICA" }'
    ```
    
    ---
    
- Documentación Técnica: Generador de PDFs y Archivos ZIP (`generatePDF.js`)
    
    ---
    
    # Documentación Técnica: Generador de PDFs y Archivos ZIP (`generatePDF.js`)
    
    ## 1. Resumen General
    
    Este módulo implementa un servicio de generación masiva de documentos PDF utilizando un navegador *headless* (Puppeteer). Su función principal es recibir un array de fragmentos HTML, renderizarlos visualmente como credenciales o carnés, convertirlos a PDF individualmente y empaquetarlos en un único archivo `.zip` comprimido que se transmite al cliente mediante *streams*.
    
    **Patrón de Arquitectura:** Worker / Batch Processor on-demand.
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas del Sistema
    
    - **puppeteer:** Controla una instancia de Chrome/Chromium.
        - *Requisito de Sistema:* Requiere un entorno capaz de ejecutar Chromium. En entornos Docker (Alpine/Debian), se necesitan librerías compartidas adicionales (nss, freetype, harfbuzz, etc.).
    - **archiver:** Gestión de compresión ZIP.
    - **stream:** Módulo nativo de Node.js para manejo eficiente de memoria.
    
    ### Dependencias Externas (Runtime)
    
    - **Google Fonts:** El código inyecta enlaces a Google Fonts (Quicksand, Raleway, Poppins). El servidor necesita salida a internet para renderizar las fuentes correctamente.
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Generar Lote de Carnés (ZIP)
    
    Renderiza HTMLs dinámicos y descarga un ZIP.
    
    - **Método:** `POST`
    - **Ruta:** `/zip`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `css` | String | No | Estilos CSS globales para aplicar a todos los carnés. |
    | `data` | Array | **Sí** | Lista de objetos con la información de cada carné. |
    | `data[].html` | String | **Sí** | Fragmento de HTML crudo a renderizar. |
    | `data[].Nombre` | String | **Sí** | Utilizado para nombrar el archivo PDF interno. |
    
    ### Comportamiento del Proceso (Step-by-Step)
    
    1. **Inicialización:** Levanta una instancia de Puppeteer con las banderas `-no-sandbox` y `-disable-setuid-sandbox`.
    2. **Streaming:** Crea un `archiver` nivel 9 (máxima compresión) y conecta su salida (`pipe`) directamente al objeto `res` (respuesta HTTP) para evitar almacenar el ZIP en disco o memoria RAM.
    3. **Iteración:** Recorre el array `data`. Para cada elemento:
        - Construye un HTML completo inyectando el CSS y fuentes externas.
        - Define estilos forzados para `.itemLado2 b` (tamaño de fuente 10px, color gris).
        - **Renderizado:** Carga el contenido en una pestaña del navegador (`page.setContent`).
        - **Espera:** Aguarda evento `domcontentloaded` y explícitamente `document.fonts.ready` para evitar textos parpadeantes o fuentes por defecto.
        - **Impresión:** Genera PDF con dimensiones fijas: **325px x 526px** (Formato Carné Vertical).
        - **Empaquetado:** Añade el Buffer del PDF al ZIP con el nombre `carnet_{Nombre}.pdf`.
    4. **Finalización:** Cierra el navegador y finaliza el stream del ZIP.
    
    ### Respuesta Exitosa (200 OK)
    
    - **Header:** `Content-Disposition: attachment; filename="carnets.zip"`
    - **Body:** Stream binario (application/zip).
    
    ### Manejo de Errores
    
    - **Fallo Parcial:** Si un carné falla al generarse (bloque `try/catch` dentro del loop), el error se loguea en consola y el proceso continúa con el siguiente. El ZIP resultante contendrá los PDFs que sí se lograron generar.
    - **Fallo Crítico:** Si falla el lanzamiento del navegador o el ZIP, retorna `500`. Si los headers ya se enviaron (stream iniciado), destruye la conexión.
    
    ---
    
    ## 4. Ejemplos de Uso (cURL)
    
    Bash
    
    ```jsx
    curl -X POST http://api.dominio.com/zip \
      -H "Content-Type: application/json" \
      -d '{
        "css": "body { background: #f0f0f0; }",
        "data": [
          {
            "Nombre": "JuanPerez",
            "html": "<div class=\"carnet\"><h1>Juan Perez</h1><p>ID: 123</p></div>"
          },
          {
            "Nombre": "MariaLopez",
            "html": "<div class=\"carnet\"><h1>Maria Lopez</h1><p>ID: 456</p></div>"
          }
        ]
      }' --output carnets.zip
    ```
    
    ---
    
- Documentación Técnica: Generador de Reportes Excel Dinámicos (`excel.js`)
    
    ---
    
    # Documentación Técnica: Generador de Reportes Excel Dinámicos (`excel.js`)
    
    ## 1. Resumen General
    
    Este módulo permite exportar una "sábana de datos" completa que fusiona la información estática del personal con las respuestas dinámicas de los formularios.
    
    El desafío técnico que resuelve este módulo es convertir la tabla vertical `respuestas` (donde cada respuesta es una fila) en columnas horizontales en el Excel, creando encabezados dinámicos basados en el texto de la pregunta.
    
    **Patrón:** Dynamic SQL Pivoting.
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas
    
    - **exceljs:** Motor de generación de hojas de cálculo. Soporta streaming y estilos.
    - **../config/database:** Conexión MySQL.
    
    ### Base de Datos
    
    Requiere un esquema relacional estricto:
    
    - `formulario` (`FormPregunta`, `FormOrden`): Para determinar los encabezados de las columnas dinámicas.
    - `respuestas` (`RespValor`, `RespNum`, `RespFecha`): Datos a pivotar.
    - `personal`: Datos fijos de la fila.
    
    ---
    
    ## 3. Lógica de Pivoteo Dinámico (Core Function)
    
    La función `getRespuestasPivot(whereClause)` realiza la magia en dos pasos:
    
    ### Paso 1: Construcción de Columnas
    
    Ejecuta una consulta para concatenar dinámicamente sentencias SQL `CASE`.
    
    SQL
    
    ```jsx
    SELECT GROUP_CONCAT(
      DISTINCT CONCAT(
        'MAX(CASE WHEN f.FormPregunta = ''', f.FormPregunta, ''' THEN ... END) AS `', f.FormPregunta, '`'
      ) ORDER BY f.CatFormSec, f.FormOrden
    ) ...
    ```
    
    Resultado: Genera un string largo que contiene fragmentos como:
    
    , MAX(CASE WHEN f.FormPregunta = 'Edad' THEN ... END) AS 'Edad', MAX(CASE WHEN ...
    
    ### Paso 2: Ejecución de la Consulta Maestra
    
    Inyecta el string generado anteriormente en una consulta `SELECT` masiva que:
    
    1. Selecciona campos fijos de `personal`, `organizaciones` y `localidad`.
    2. Agrega las columnas dinámicas (`${columnas}`).
    3. Aplica el filtro recibido (`whereClause`).
    4. Agrupa por `PerId` para "aplanar" las múltiples respuestas de un usuario en una sola fila.
    
    ---
    
    ## 4. Documentación de Endpoints
    
    ### 4.1 Exportar Reporte Consolidado
    
    Genera y descarga el archivo `.xlsx`.
    
    - **Método:** `POST`
    - **Ruta:** `/Exportar`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `where` | String | No | Cláusula SQL cruda para filtrar registros (Ej: `p.PerGen = 'F'`). |
    
    ### Flujo de Procesamiento
    
    1. **Extracción de Datos:** Llama a `getRespuestasPivot` con el filtro proporcionado.
    2. **Maquetación Excel:**
        - Crea un `Workbook` y una `Worksheet`.
        - Genera encabezados automáticamente usando `Object.keys(data[0])`.
        - Estiliza la primera fila (Negrita, Centrado).
    3. **Streaming:**
        - Configura headers HTTP para descarga de archivos (`Content-Disposition`).
        - Escribe el binario directamente al flujo de respuesta (`res`) usando `workbook.xlsx.write(res)`.
    
    ### Respuesta Exitosa (200 OK)
    
    - **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
    - **Body:** Stream binario del archivo Excel.
    
    ### Errores
    
    - **500 Internal Server Error:** Si falla la consulta SQL (ej. error de sintaxis en el `where`) o la generación del Excel.
    
    ---
    
- Documentación Técnica: Motor de Importación/Exportación Masiva (`plantillaExcel.js`)
    
    ---
    
    # Documentación Técnica: Motor de Importación/Exportación Masiva (`plantillaExcel.js`)
    
    ## 1. Resumen General
    
    Este módulo gestiona el ciclo de vida de la carga masiva de datos. Sus responsabilidades se dividen en dos flujos principales:
    
    1. **Generación de Plantillas (Downstream):** Crea dinámicamente un archivo Excel (`.xlsx`) que refleja la estructura actual de la base de datos (campos fijos de personal + columnas dinámicas por cada pregunta activa en los formularios).
    2. **Importación y Procesamiento (Upstream):** Recibe archivos Excel diligenciados, valida la integridad de los datos, mapea columnas dinámicas a IDs de preguntas en la BD y ejecuta una **transacción compleja** para insertar o actualizar personal y sus respuestas asociadas.
    
    **Patrón de Diseño:** Strategy Pattern implícito (separación de lógica en clases `GeneradorPlantillaExcel` y `ProcesadorPlantilla`).
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas de Sistema
    
    - **multer:** Middleware para el manejo de carga de archivos `multipart/form-data`. Configurado para aceptar solo extensiones `.xls` y `.xlsx` con un límite de 10MB.
    - **exceljs:** Usado para la escritura avanzada de archivos (estilos, anchos de columna).
    - **xlsx (SheetJS):** Usado para la lectura robusta y parseo del archivo entrante.
    
    ### Requisitos de Infraestructura
    
    - Carpeta `./uploads`: El sistema intenta crearla automáticamente si no existe para almacenar temporalmente los archivos subidos.
    
    ---
    
    ## 3. Clases Principales
    
    ### 3.1 `GeneradorPlantillaExcel`
    
    Encargada de construir la estructura del archivo descargable.
    
    - **Lógica Dinámica:** Consulta la tabla `formulario` y agrupa las preguntas por `CatFormDesc` (Categoría).
    - **Estructura del Excel:**
        - **Fila 1:** Nombre de la Categoría (Fusionada visualmente).
        - **Fila 2:** Texto de la Pregunta (`FormPregunta`).
        - **Columnas 1-32:** Campos estáticos de `Personal` (Nombre, Documento, etc.).
        - **Columnas 33+:** Campos dinámicos de los formularios.
    - **Hoja de Instrucciones:** Genera una segunda pestaña con guías de uso y validaciones para el usuario final.
    
    ### 3.2 `ProcesadorPlantilla`
    
    Motor de ingesta de datos.
    
    - **Mapeo Inteligente:** No confía en el orden de las columnas. Lee la Fila 2 (Encabezados) y busca coincidencia de texto con `FormPregunta` en la base de datos para obtener el `FormSec` (ID) correspondiente.
    - **Normalización de Fechas:** Implementa `convertirFecha()` para manejar la ambigüedad de formatos en Excel (Números seriales vs Strings `DD/MM/YYYY`).
    
    ---
    
    ## 4. Documentación de Endpoints
    
    ### 4.1 Generar Plantilla Vacía
    
    Descarga un Excel estructurado listo para ser diligenciado.
    
    - **Método:** `POST`
    - **Ruta:** `/generar`
    - **Respuesta:** Stream binario (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`).
    - **Nombre de Archivo:** `plantilla_encuestas_YYYY-MM-DD_HH_mm_ss.xlsx`.
    
    ### 4.2 Importar Excel (Carga Masiva)
    
    Procesa un archivo subido, valida y persiste los datos.
    
    - **Método:** `POST`
    - **Ruta:** `/importar`
    - **Content-Type:** `multipart/form-data`
    
    ### Parámetros del Formulario
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `archivo` | File | **Sí** | Archivo Excel (.xlsx). |
    | `soloValidar` | Boolean | No | Si es `true`, simula el proceso y retorna errores sin guardar en BD (Dry Run). |
    
    ### Lógica de Transacción (Atomicidad)
    
    El proceso está envuelto en una transacción de base de datos (`connection.beginTransaction()`):
    
    1. **Upsert de Personal:** Itera fila por fila.
        - Busca si el documento (`PerDoc`) ya existe.
        - **Si existe:** Ejecuta `UPDATE` masivo de todos los campos.
        - **Si no existe:** Ejecuta `INSERT` y genera consecutivo (`generarConsecutivo`).
    2. **Inserción de Respuestas:**
        - Calcula el último `RespSec` global.
        - Inserta en la tabla `respuestas` vinculando el `PerId` (nuevo o existente) y el `FormSec` mapeado desde la columna.
    3. **Commit/Rollback:** Si ocurre cualquier error (referencia inválida, tipo de dato incorrecto), se hace `ROLLBACK` total. Ningún dato parcial se guarda.
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "message": "Archivo importado y procesado correctamente",
      "resultados": {
        "personasInsertadas": 50,
        "respuestasInsertadas": 350,
        "estadisticas": { "totalPersonas": 50, "totalFormularios": 10 }
      }
    }
    ```
    
    ### 4.3 Leer Excel (Preview Simple)
    
    Endpoint utilitario para convertir un Excel a JSON crudo sin procesamiento de negocio. Útil para previsualización en frontend.
    
    - **Método:** `POST`
    - **Ruta:** `/leerExcel`
    
    ---
    
- Documentación Técnica: Servicio de Gestión de Archivos e Imágenes (`guardarfotos.js`)
    
    ---
    
    # Documentación Técnica: Servicio de Gestión de Archivos e Imágenes (`guardarfotos.js`)
    
    ## 1. Resumen General
    
    Este módulo se encarga de la persistencia física de las imágenes de perfil del personal. A diferencia de `GuardarPersonal.js` (que vimos anteriormente y que parecía guardar el Base64 directo en la BD en una primera instancia), este módulo implementa una estrategia de **desacoplamiento**: recibe el Base64, lo guarda como archivo `.jpg/.png` en el sistema de archivos del servidor y almacena únicamente la **ruta relativa** en la base de datos MySQL.
    
    **Patrón de Arquitectura:** File System Offloading (reducir peso en BD moviendo BLOBs a disco).
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas del Sistema
    
    - **fs.promises (Node.js nativo):** Manejo asíncrono del sistema de archivos.
    - **path (Node.js nativo):** Resolución de rutas de directorios segura.
    - **../config/database:** Conexión a MySQL.
    
    ### Requisitos de Infraestructura
    
    - **Permisos de Escritura:** El proceso de Node.js debe tener permisos de escritura en la carpeta padre para crear el directorio `/uploads`.
    - **Directorio de Destino:** El script intenta crear automáticamente la carpeta `../uploads` (un nivel arriba de la carpeta de rutas).
    
    ---
    
    ## 3. Documentación de Endpoints
    
    ### 3.1 Guardar Imagen (Base64 a Disco)
    
    Recibe una cadena Base64, la decodifica, guarda el archivo físico y actualiza la referencia en la tabla `personal`.
    
    - **Método:** `POST`
    - **Ruta:** `/guardar`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `imageData` | String | **Sí** | Cadena Base64 completa (incluyendo `data:image/...`). |
    | `imageName` | String | **Sí** | **Crítico:** Se usa como la llave de búsqueda (`PerDoc` / Cédula) para actualizar el registro. |
    
    ### Lógica de Procesamiento
    
    1. **Validación de Formato:** Utiliza Regex para validar y extraer el tipo de imagen (`png`, `jpg`) y la data pura.
    2. **Generación de Nombre:** Crea un nombre de archivo único combinando:
        - Timestamp (`Date.now()`).
        - String aleatorio.
        - Nombre sanitizado (reemplaza caracteres especiales).
    3. **Escritura en Disco:** Convierte el string a `Buffer` y escribe el archivo en la carpeta `uploads`.
    4. **Actualización en BD:** Ejecuta un `UPDATE personal SET PerFoto = ? WHERE PerDoc = ?`.
        - **Nota:** Aquí se revela que `imageName` en el frontend debe ser el **Número de Documento** del personal.
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    ```jsx
    {
      "success": true,
      "filename": "1709123456789_x9z1a_123456.png",
      "path": "/uploads/1709123456789_x9z1a_123456.png",
      "id": 0, // ID de inserción (0 porque es un Update)
      "size": 15400, // Bytes
      "executionTime": "15ms"
    }
    ```
    
    ---
    
    ### 3.2 Listar Imágenes (Código Inconsistente)
    
    Intenta listar metadatos de imágenes.
    
    - **Método:** `GET`
    - **Ruta:** `/api/images`
    - **Estado:** **Roto / Inutilizable**.
        - Hace referencia a una variable `pool` que no está definida en el archivo (debería ser `dbConfig`).
        - Consulta una tabla `images` que no parece estar relacionada con el flujo principal (`personal`).
    
    ---
    
    ### 3.3 Eliminar Imagen (Código Inconsistente)
    
    Intenta eliminar una imagen por ID.
    
    - **Método:** `DELETE`
    - **Ruta:** `/api/images/:id`
    - **Estado:** **Roto / Inutilizable**.
        - Mismo error de referencia a variable `pool`.
        - Consulta tabla `images`.
    
    ---
    
    ## 4. Análisis Crítico (Senior Architect)
    
    ### 4.1 Inconsistencia de Código (Bug Bloqueante)
    
    El archivo contiene código mezclado de dos implementaciones diferentes:
    
    1. **Lógica Activa (`POST /guardar`):** Usa `dbConfig` y actualiza la tabla `personal`. Esta es la lógica correcta según el resto del sistema.
    2. **Lógica Muerta/Legacy (`GET` y `DELETE`):** Usa una variable `pool` no importada y consulta una tabla fantasma `images`.
        - **Acción Requerida:** Eliminar o refactorizar las rutas `/api/images` ya que provocarán un `ReferenceError: pool is not defined` si se invocan.
    
    ### 4.2 Seguridad en Subida de Archivos
    
    - **Validación de Tipos:** El Regex `imageData.match(/^data:image\/([a-z]+);base64,(.+)$/)` es una validación débil. Confía en el encabezado MIME del string Base64. Un atacante podría subir un script malicioso con extensión `.jpg`.
    - **Ubicación de Uploads:** Guardar archivos en `../uploads` (fuera de la carpeta de rutas pero posiblemente dentro del root del servidor web) requiere que el servidor (Nginx/Apache/Express Static) esté configurado para **no ejecutar** scripts en esa carpeta.
    
    ### 4.3 Confusión de Parámetros
    
    En el endpoint `/guardar`:
    
    JavaScript
    
    ```jsx
    // Línea 45
    const safeName = imageName.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
    // ...
    // Línea 56
    'Update personal set PerFoto = ? where PerDoc = ? ', [relativePath, safeName]
    ```
    
    La variable `safeName` se usa para el nombre del archivo Y TAMBIÉN para el `WHERE PerDoc = ?`.
    
    - **Riesgo:** Si el documento tiene caracteres que el regex reemplaza (aunque raro en documentos de identidad), la actualización en BD fallará silenciosamente (affectedRows = 0) porque el `PerDoc` sanitizado no coincidirá con el `PerDoc` real en la base de datos.
    
    ---
    
- Documentación Técnica: Configuración Global del Sistema (`configuracion.js`)
    
    # Documentación Técnica: Configuración Global del Sistema (`configuracion.js`)
    
    ## 1. Resumen General
    
    Este módulo implementa el patrón **Singleton en Base de Datos**, gestionando un único registro de configuración que controla la apariencia y metadatos de la organización (Alcaldía/Empresa). Su responsabilidad principal es permitir la personalización de la interfaz (White Labeling) y la persistencia de activos gráficos institucionales (Logos, Portadas) en el sistema de archivos local.
    
    ## 2. Dependencias y Requisitos
    
    ### Bibliotecas del Sistema
    
    - **express:** Enrutamiento HTTP.
    - **../config/database:** Pool de conexiones a MySQL.
    - **fs (File System):** Módulo nativo para escritura síncrona de archivos.
    - **path:** Resolución de rutas de directorios.
    
    ### Modelo de Datos
    
    Requiere la tabla `configuracion` con las columnas:
    
    - `ConfOrgSec` (PK, generalmente fija en 1).
    - `ConfOrgNom`, `confOrgSubCar`, `confOrgAlcCar` (Textos institucionales).
    - `ConfOrgColor` (Hexadecimal para temas de UI).
    - `ConfOrgLogo`, `confOrgPort`, `confOrgFot` (Rutas relativas de archivos).
    
    ---
    
    ## 3. Lógica de Gestión de Activos
    
    ### Función Helper: `guardarImagenBase64`
    
    Función utilitaria interna para materializar imágenes codificadas en el servidor.
    
    - **Entrada:** String Base64 (`data:image/png;base64,...`) y un nombre base (ej. 'logo').
    - **Proceso:**
        1. Decodifica el encabezado MIME para extraer la extensión.
        2. Crea un Buffer binario.
        3. Verifica/Crea el directorio `../uploads` de forma síncrona.
        4. Escribe el archivo en disco (`fs.writeFileSync`).
    - **Salida:** Retorna la ruta relativa web (ej. `/uploads/logo.png`) para ser guardada en BD.
    
    ---
    
    ## 4. Documentación de Endpoints
    
    ### 4.1 Guardar/Actualizar Configuración (Upsert)
    
    Establece los parámetros visuales y de identidad de la aplicación. Maneja la lógica de "Insertar si no existe, Actualizar si existe".
    
    - **Método:** `POST`
    - **Ruta:** `/guardar`
    
    ### Body del Request (JSON)
    
    | **Campo** | **Tipo** | **Requerido** | **Descripción** |
    | --- | --- | --- | --- |
    | `nombreAlcaldia` | String | Sí | Nombre principal de la entidad. |
    | `subtitulo` | String | No | Slogan o subtítulo. |
    | `color` | String | No | Código HEX del color primario. |
    | `mensaje` | String | No | Mensaje de bienvenida o cargo (`confOrgAlcCar`). |
    | `imagenes` | Objeto | No | Contenedor de strings Base64. |
    | `imagenes.ConfOrgLogo` | Base64 | No | Logo institucional. |
    | `imagenes.confOrgPort` | Base64 | No | Imagen de portada. |
    | `imagenes.confOrgFot` | Base64 | No | Foto del alcalde/director. |
    
    ### Lógica de Persistencia
    
    1. **Materialización de Archivos:** Invoca `guardarImagenBase64` para cada imagen recibida. Si no se envía una imagen, retorna `null`.
    2. **Verificación de Existencia:** Consulta `COUNT(*)` en la tabla `configuracion`.
    3. **Bifurcación (Upsert Manual):**
        - **Si existe:** Ejecuta `UPDATE`. Utiliza `COALESCE(?, Columna)` para evitar sobrescribir una imagen existente con `NULL` si el usuario no subió una nueva en esta petición.
        - **Si no existe:** Ejecuta `INSERT` inicializando el ID en 1.
    
    ### Respuesta Exitosa (200 OK)
    
    JSON
    
    `{
      "ok": true,
      "mensaje": "Configuración guardada correctamente"
    }`
    
    ---
    
    ### 4.2 Obtener Configuración
    
    Recupera los parámetros actuales para renderizar el frontend.
    
    - **Método:** `GET`
    - **Ruta:** `/traer`
    
    ### Comportamiento
    
    Ejecuta `SELECT * FROM configuracion LIMIT 1`. Retorna el objeto directo de la base de datos o `null` si la tabla está vacía.
    

---

---

---
