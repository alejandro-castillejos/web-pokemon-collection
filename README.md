# Pokémon TCG Collection

Aplicación web privada y responsive para explorar sets de Pokémon TCG, consultar cartas y administrar una colección y una wishlist personales.

## Tecnologías

- Next.js App Router, React y TypeScript
- Tailwind CSS
- Supabase Auth y PostgreSQL con Row Level Security (RLS)
- TCGdex como catálogo y fuente de imágenes

## Requisitos

- Node.js 20.9 o posterior
- npm
- Un proyecto de Supabase
- Las variables de entorno indicadas en `.env.example`

## Configuración local

1. Clona el repositorio y entra en la carpeta:

   ```powershell
   git clone https://github.com/alejandro-castillejos/web-pokemon-collection.git
   cd web-pokemon-collection
   ```

2. Instala las dependencias usando el lockfile:

   ```powershell
   npm ci
   ```

3. Crea el archivo local de variables de entorno:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Edita `.env.local` y coloca la URL y la publishable key de tu proyecto Supabase. No subas ese archivo a GitHub.

5. En Supabase, configura la URL de redirección de autenticación para incluir `/auth/callback`. En desarrollo, la URL base es `http://localhost:3000`. En producción, establece `NEXT_PUBLIC_SITE_URL` a la URL HTTPS del sitio y permite esa dirección en la configuración de Auth.

6. Inicia el servidor:

   ```powershell
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Base de datos

La estructura de `collection` y `wishlist` está versionada en `supabase/migrations`. Ambas tablas usan la combinación `user_id + card_id` como clave primaria y aplican políticas RLS para que cada usuario solo pueda consultar, agregar o eliminar sus propios registros.

La migración se incluye en el repositorio para reproducibilidad; no se ejecuta automáticamente al iniciar Next.js. Antes de aplicarla en un proyecto Supabase existente, verifica las políticas y los permisos que ya tengas configurados.

## Rutas principales

- `/`: inicio y resumen de colección
- `/sets`: catálogo de sets
- `/sets/[setId]`: cartas de un set
- `/sets/[setId]/[cardId]`: detalle de carta
- `/collection`: colección personal
- `/wishlist`: wishlist personal
- `/account`: cuenta y cambio de contraseña
- `/search`: página de resultados de búsqueda

## Comprobaciones

Antes de integrar cambios, ejecuta:

```powershell
npm run lint
npm run typecheck
npm run build
```

El workflow de GitHub Actions ejecuta estas comprobaciones en cada push y pull request hacia `main`.

## Seguridad básica

- No expongas credenciales del servidor ni archivos `.env.local`.
- Las Server Actions vuelven a verificar la sesión y validan las entradas recibidas.
- Las consultas personales deben filtrar por `user_id`; RLS se mantiene como segunda barrera.
- Los parámetros de URL para avisos de autenticación son códigos breves, no mensajes arbitrarios.
- CI bloquea vulnerabilidades altas o críticas en dependencias de producción. La auditoría completa también informa avisos de desarrollo: actualmente hay una alerta sin parche publicado para `braces`, transitiva de las herramientas de ESLint. Debe revisarse de nuevo cuando el proveedor publique una versión corregida, sin forzar una bajada mayor de Next.js para ocultarla.
