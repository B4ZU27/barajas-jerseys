# Mi Catálogo — Documentación Técnica

---

## 1. ¿Qué es este proyecto?

**Mi Catálogo** es una plataforma **multi-tienda** para vender camisas de fútbol. La idea central es:

- Un **catálogo maestro** de productos (camisas de ligas y selecciones) administrado por un superadmin.
- Múltiples **tiendas independientes**, cada una manejada por su propio dueño (*store owner*).
- Cada tienda elige qué productos mostrar de ese catálogo y a qué precio.
- Los clientes acceden a cada tienda por su propio URL: `tudominio.com/{storecode}`.

**Flujo resumido:**
```
Superadmin agrega camisas al catálogo maestro
        ↓
Superadmin crea tiendas y asigna dueños
        ↓
Store owner activa productos en su tienda y ajusta precios
        ↓
Clientes visitan /{storecode} y ven el catálogo de esa tienda
```

---

## 2. Stack de tecnología

| Capa | Tecnología | Para qué sirve |
|------|-----------|----------------|
| Framework | **Next.js 16** (App Router) | Páginas, rutas de API, SSR, routing |
| UI | **React 19** + **TypeScript** | Componentes interactivos |
| Estilos | **Tailwind CSS 4** | Clases utilitarias de CSS |
| Base de datos + Auth | **Supabase** | PostgreSQL + autenticación + RLS |
| Imágenes/Videos | **Cloudinary** | Storage de medios en la nube |
| Deploy | **Vercel** (planeado) | Hosting del frontend |

### Next.js App Router — conceptos clave

Next.js tiene dos tipos de componentes:

- **Server Components** (por defecto): se ejecutan en el servidor. Pueden acceder a la base de datos directamente, leer cookies, hacer fetch con datos privados. No tienen `useState` ni `useEffect`.
- **Client Components** (`'use client'` al inicio del archivo): se ejecutan en el navegador. Tienen estado, eventos, interactividad.

Las páginas del admin (`page.tsx`) son Server Components — buscan datos en la DB y los pasan como props a Client Components que manejan la interacción.

Las **API Routes** (`app/api/.../route.ts`) son endpoints HTTP que corren solo en el servidor. El frontend las llama con `fetch()`.

---

## 3. Supabase — cómo funciona

Supabase es un backend como servicio basado en **PostgreSQL**. Nos da:

1. **Base de datos** PostgreSQL con acceso via cliente JavaScript.
2. **Auth** — registro, login, sesiones con JWT.
3. **RLS** (Row Level Security) — políticas de acceso a nivel de fila.
4. **Storage** — no usamos este, usamos Cloudinary para imágenes.

### Clientes de Supabase que usamos

Tenemos **tres formas** de conectarnos a Supabase:

```
lib/supabase/client.ts   → Cliente del NAVEGADOR  (usa ANON_KEY, tiene sesión del usuario)
lib/supabase/server.ts   → Cliente del SERVIDOR   (usa ANON_KEY + cookies del usuario)
lib/api-auth.ts          → Cliente de SERVICIO    (usa SERVICE_ROLE_KEY, bypasea todo)
```

#### Cliente del navegador (`createClient` en `client.ts`)
- Usado en componentes `'use client'`.
- Conoce al usuario actual porque lee su sesión del localStorage/cookie del navegador.
- Respeta el RLS — solo ve lo que el usuario tiene permiso de ver.
- **Ejemplo de uso**: El botón de logout llama `supabase.auth.signOut()`.

#### Cliente del servidor (`createClient` en `server.ts`)
- Usado en **Server Components** y **API Routes**.
- Lee la sesión del usuario desde las **cookies HTTP** de la request.
- También respeta el RLS — actúa como si fuera ese usuario.
- **Ejemplo de uso**: En `page.tsx` para verificar si el usuario tiene sesión activa.

#### Cliente de servicio (`serviceClient` en `api-auth.ts`)
- Usa la `SERVICE_ROLE_KEY` — la llave maestra del proyecto.
- **Ignora completamente el RLS**. Puede leer y escribir cualquier tabla.
- Solo se usa en el servidor (nunca en el cliente, nunca en variables públicas).
- **Ejemplo de uso**: Leer la tabla `store_owners` que tiene RLS restrictivo, insertar productos en `store_products`.

### Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL         # URL del proyecto Supabase (público, visible en browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY    # Llave pública anónima (público, respeta RLS)
SUPABASE_SERVICE_ROLE_KEY        # Llave de servicio (PRIVADA, solo servidor, bypasea RLS)
```

---

## 4. RLS — Row Level Security

RLS es un sistema de PostgreSQL que define **quién puede leer o escribir cada fila** de cada tabla.

### Sin RLS

```sql
SELECT * FROM store_owners;
-- Cualquiera que tenga acceso a la DB puede ver todos los registros
```

### Con RLS

```sql
-- Política: solo puedes ver tu propia fila
CREATE POLICY "owners_see_own" ON store_owners
  FOR SELECT USING (auth.uid() = user_id);
```

Ahora si consultas con el cliente anónimo (ANON_KEY), Supabase automáticamente agrega `WHERE user_id = <tu_user_id>` a la query. Si no hay sesión, no devuelve nada.

### Nuestras tablas con RLS restrictivo

Las tablas `store_owners` y `catalog_admins` tienen RLS que bloquea el acceso incluso a usuarios autenticados cuando se usa la ANON_KEY. Por eso **todas las consultas a esas tablas deben usar `serviceClient()`**.

### El patrón que seguimos

```typescript
// ❌ MAL — usa ANON_KEY, bloqueado por RLS en tablas protegidas
const supabase = await createClient()
const { data } = await supabase.from('store_owners').select('store_id')...

// ✅ BIEN — usa SERVICE_ROLE_KEY, bypasea RLS
const db = serviceClient()
const { data } = await db.from('store_owners').select('store_id')...
```

---

## 5. Autenticación — cómo funciona

### Tipos de usuarios

| Tipo | Email en Supabase Auth | Tabla de rol |
|------|----------------------|--------------|
| Superadmin / Catalog Admin | Email real (e.g. `admin@email.com`) | `catalog_admins` |
| Store Owner | `{storecode}@owner.local` (e.g. `barajas@owner.local`) | `store_owners` |
| Cliente | No tiene cuenta | — |

Los store owners no tienen email real — se crea un email interno con formato `{storecode}@owner.local` para que puedan autenticarse con Supabase Auth. El email de contacto real del dueño se guarda en `user_metadata.contact_email`.

### Flujo de login

```
Usuario abre /admin/login
        ↓
¿Ingresó email o storecode?
  - Si tiene @  → es email real → login directo
  - Sin @        → es storecode → convierte a "{storecode}@owner.local"
        ↓
supabase.auth.signInWithPassword({ email, password })
        ↓
Si ok → GET /api/admin/my-role
  → consulta catalog_admins y store_owners con serviceClient()
  → devuelve { role: 'catalog_admin' | 'store_owner' }
        ↓
Redirige según rol:
  - catalog_admin → /admin
  - store_owner   → /admin/my-store
```

### Middleware — proxy.ts

El archivo `proxy.ts` (el middleware de Next.js 16) corre en **cada request** a rutas `/admin/*`:

```typescript
export async function proxy(request: NextRequest) {
  // 1. Refresca el token de sesión si está por expirar
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Si no hay sesión y no es la página de login → redirigir a login
  if (!user && !isLoginPage) {
    return NextResponse.redirect('/admin/login')
  }

  return supabaseResponse  // deja pasar la request
}
```

Esto protege todas las rutas admin automáticamente — si pierdes la sesión, te redirige al login.

### Helpers de autenticación (`lib/api-auth.ts`)

Todas las API routes usan estos helpers:

```typescript
requireAuth()         // Verifica que haya sesión activa → devuelve { user }
requireCatalogAdmin() // Verifica que sea catalog admin  → devuelve { user }
requireStoreOwner()   // Verifica que sea store owner    → devuelve { user, storeId }
```

Ejemplo de uso en una API route:
```typescript
export async function POST(request: NextRequest) {
  const auth = await requireStoreOwner()
  if (!auth.ok) return auth.response  // devuelve 401 o 403 si no autorizado

  // auth.storeId es el ID de la tienda del usuario logueado
  await db.from('store_products').insert({ store_id: auth.storeId, ... })
}
```

---

## 6. Base de datos — estructura

```
catalog_admins          store_owners
┌──────────────┐        ┌──────────────┐
│ user_id (FK) │        │ user_id (FK) │
│ created_at   │        │ store_id (FK)│
└──────────────┘        └──────┬───────┘
                               │
                         ┌─────▼──────┐
    leagues              │   stores   │         promotions
┌──────────────┐         │────────────│         ┌───────────────┐
│ id           │         │ id         │         │ store_id (FK) │
│ slug         │         │ slug       │◄────────│ active        │
│ name         │         │ name       │         │ banner        │
│ sort_order   │         │ whatsapp   │         │ deals (JSON)  │
└──────┬───────┘         │ show_prices│         └───────────────┘
       │                 │ logo_url   │
  ┌────▼─────┐           └─────┬──────┘
  │  clubs   │                 │
  │──────────│           ┌─────▼───────────┐
  │ id       │           │  store_products │
  │ slug     │           │─────────────────│
  │ name     │           │ store_id (FK)   │
  │ league_id│           │ product_id (FK) │
  └────┬─────┘           │ price           │
       │                 │ available       │
  ┌────▼─────────────┐   └─────────────────┘
  │     products     │           ▲
  │──────────────────│           │
  │ id               │───────────┘
  │ slug             │
  │ name             │
  │ price_default    │
  │ league_id (FK)   │
  │ club_id (FK)     │
  │ description      │
  │ sizes (array)    │
  │ tags (array)     │
  │ images (array)   │
  │ videos (array)   │
  │ created_by (FK)  │
  └──────────────────┘
```

### Descripción de cada tabla

**`products`** — Catálogo maestro de productos. Aquí viven todas las camisas. Solo los catalog admins pueden agregar/editar/borrar.

**`leagues`** — Las ligas/categorías: La Liga, Premier League, Serie A, Selecciones, etc.

**`clubs`** — Los clubes o selecciones. Cada club pertenece a una liga.

**`stores`** — Cada tienda independiente. Tiene su `slug` (que es el storecode y el URL) y configuraciones como WhatsApp y si muestra precios.

**`store_products`** — La tabla pivote más importante. Une una tienda con un producto del catálogo maestro. Tiene su propio `price` (el precio personalizado de esa tienda). **No tiene columna `id`** — su clave primaria es la combinación `(store_id, product_id)`.

**`store_owners`** — Une un usuario de Supabase Auth con su tienda. RLS restrictivo — solo accesible con service role.

**`catalog_admins`** — Lista de usuarios que son superadmins. RLS restrictivo.

**`promotions`** — Promociones activas de cada tienda (banner de texto + deals de cantidad/precio).

---

## 7. Estructura del código

```
mi-catalogo/
├── proxy.ts                          ← Middleware: protege rutas /admin/*
├── app/
│   ├── layout.tsx                    ← Layout raíz: fuentes globales
│   ├── page.tsx                      ← Redirige a 404 (requiere storecode)
│   │
│   ├── [storecode]/                  ← TIENDA PÚBLICA
│   │   ├── layout.tsx                  Carga datos de la tienda, navbar, banners
│   │   ├── page.tsx                    Homepage: hero, videos, colecciones, destacados
│   │   ├── camisas/page.tsx            Grid con todos los productos + filtros
│   │   ├── collections/[category]/     Productos filtrados por liga
│   │   ├── products/[slug]/page.tsx    Detalle de producto
│   │   ├── tags/[tag]/page.tsx         Productos por tag (retro, mundialista...)
│   │   ├── tallas/page.tsx             Guía de tallas
│   │   ├── nosotros/page.tsx           Acerca de la tienda
│   │   └── contacto/page.tsx           Contacto
│   │
│   ├── admin/                        ← PANEL DE ADMINISTRACIÓN
│   │   ├── login/page.tsx              Login con detección de rol
│   │   │
│   │   ├── (panel)/                  ← CATALOG ADMIN (superadmin)
│   │   │   ├── layout.tsx              Sidebar de admin + guard de acceso
│   │   │   ├── page.tsx                Formulario agregar producto
│   │   │   ├── products/page.tsx       Lista de productos del catálogo maestro
│   │   │   ├── products/[slug]/        Editar producto
│   │   │   ├── stores/page.tsx         Ver y gestionar tiendas
│   │   │   ├── stores/new/             Wizard para crear nueva tienda
│   │   │   └── store-owners/page.tsx   Info sobre store owners
│   │   │
│   │   └── my-store/                 ← STORE OWNER
│   │       ├── layout.tsx              Sidebar de owner + carga datos de la tienda
│   │       ├── page.tsx                Redirige a /products
│   │       ├── products/page.tsx       Catálogo unificado: todos los productos + estado en tienda
│   │       ├── products/[id]/page.tsx  Detalle de producto con navegación prev/next
│   │       └── settings/page.tsx       Configuración de la tienda + cambio de contraseña
│   │
│   └── api/admin/
│       ├── my-role/                    Detecta el rol del usuario actual
│       ├── add-product/                Crear producto en catálogo maestro
│       ├── update-product/             Editar producto
│       ├── delete-product/             Borrar producto
│       ├── create-store/               Crear tienda + cuenta de owner
│       ├── delete-store/               Borrar tienda + cuenta de owner
│       ├── cloudinary-signature/       Token firmado para subir imágenes
│       ├── my-store/
│       │   ├── settings/               Actualizar datos de la tienda
│       │   └── password/               Cambiar contraseña del owner
│       └── store-products/
│           ├── add/                    Agregar producto(s) a la tienda
│           ├── price/                  Cambiar precio de un producto en tienda
│           └── remove/                 Quitar producto de la tienda
│
├── components/
│   ├── Navbar.tsx                    ← Navegación pública de la tienda
│   ├── ProductCard.tsx               ← Tarjeta de producto (grid)
│   ├── ProductGrid.tsx               ← Grid con filtros y paginación (cliente)
│   ├── HeroCarousel.tsx              ← Carrusel de hero en homepage
│   ├── VideoStrip.tsx                ← Tira de videos en homepage
│   ├── VideoCarousel.tsx             ← Carrusel de videos en detalle de producto
│   ├── ImageCarousel.tsx             ← Carrusel de imágenes en detalle de producto
│   ├── CollectionCard.tsx            ← Tarjeta de colección/liga en homepage
│   ├── SizeSelector.tsx              ← Selector de talla en detalle
│   ├── SizeGuide.tsx                 ← Tabla de tallas
│   ├── ProductActions.tsx            ← Botón de WhatsApp / CTA en detalle
│   ├── AdminSidebar.tsx              ← Sidebar del panel de catalog admin
│   ├── OwnerSidebar.tsx              ← Sidebar del panel de store owner
│   └── AutoSignOut.tsx               ← Cierra sesión por inactividad
│
└── lib/
    ├── supabase/
    │   ├── client.ts                 ← Cliente para el navegador ('use client')
    │   └── server.ts                 ← Cliente para el servidor (lee cookies)
    ├── api-auth.ts                   ← Guards de auth para API routes + serviceClient
    ├── products.ts                   ← Funciones para consultar productos de Supabase
    ├── stores.ts                     ← Funciones para consultar tiendas
    ├── cloudinary-upload.ts          ← Upload de archivos a Cloudinary
    └── categoryColors.ts             ← Colores de fondo por liga
```

---

## 8. Cómo funciona cada área

### Panel del Catalog Admin (`/admin`)

El superadmin puede:
- **Agregar productos** al catálogo maestro con imágenes y videos (subidos a Cloudinary).
- **Ver y editar** todos los productos.
- **Crear tiendas** con un wizard de 5 pasos:
  1. Nombre y storecode
  2. Datos del owner (email, teléfono, contraseña)
  3. Template de productos (ninguno / todos / por liga / por tag)
  4. Confirmación
  5. Pantalla de éxito con credenciales del owner
- **Borrar tiendas** (elimina también la cuenta del owner en Auth).

### Panel del Store Owner (`/admin/my-store`)

El dueño de tienda puede:
- **Ver el catálogo unificado**: todos los 204+ productos del catálogo maestro, cada uno con un indicador de si está o no en su tienda.
- **Agregar productos** individualmente o todos de un tirón ("Agregar todo").
- **Editar el precio** de cada producto directamente en la tarjeta (inline editing).
- **Quitar productos** de su tienda (con confirmación).
- **Navegar al detalle** de cada producto para ver todas las imágenes, agregar/quitar y editar precio.
- **Swipe** entre productos en móvil en la vista de detalle.
- **Configurar** su tienda: cambiar slug, WhatsApp, visibilidad de precios.
- **Cambiar contraseña**.

### Tienda pública (`/{storecode}`)

Lo que ven los clientes:
- Homepage con hero carousel, tira de videos, colecciones y destacados.
- Grid completo con filtros por club y tags.
- Páginas de detalle con carrusel de imágenes, videos, selector de talla y botón de WhatsApp.
- Guía de tallas, nosotros, contacto.

---

## 9. Flujos de datos típicos

### Agregar un producto a la tienda (store owner)

```
[Cliente] Click en "+ Agregar" en ProductCard
    ↓
fetch POST /api/admin/store-products/add
  { productIds: ["uuid-del-producto"] }
    ↓
[Servidor] requireStoreOwner()
  → serviceClient().from('store_owners').select('store_id')  ← bypasea RLS
  → devuelve { storeId: "53715812-..." }
    ↓
[Servidor] Busca price_default del producto en `products`
    ↓
[Servidor] Upsert en `store_products`:
  { store_id, product_id, price: price_default, available: true }
  ON CONFLICT (store_id, product_id) DO NOTHING
    ↓
[Respuesta] { ok: true }
    ↓
[Cliente] onAdd() → actualiza inStoreIds state → card cambia a "En tienda"
```

### Cargar la página del catálogo del owner

```
[Browser] GET /admin/my-store/products
    ↓
[proxy.ts] getUser() con anon client + cookies
  → usuario autenticado → deja pasar
    ↓
[page.tsx] createClient().auth.getUser() → obtiene user.id
    ↓
[page.tsx] serviceClient().from('store_owners')
  .select('store_id').eq('user_id', user.id)
  → ownership.store_id = "53715812-..."
    ↓
Promise.all([
  serviceClient().from('products').select(...)  → 204 productos
  serviceClient().from('store_products')
    .select('product_id, price')
    .eq('store_id', "53715812-...")             → N productos en tienda
])
    ↓
Construye array unificado:
  storeMap = Map { product_id → { price } }
  items = products.map(p => ({
    ...p,
    inStore: storeMap.has(p.id),      ← true/false
    customPrice: storeMap.get(p.id)?.price
  }))
    ↓
Renderiza <ProductsGrid items={items} />
```

---

## 10. Variables de entorno necesarias

```bash
# Supabase (proyecto en supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...         # Pública, va al browser
SUPABASE_SERVICE_ROLE_KEY=eyJ...             # PRIVADA, nunca al browser

# Cloudinary (proyecto en cloudinary.com)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu-cloud
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc123...              # PRIVADA

# ID de la tienda para obtener promociones globales
NEXT_PUBLIC_STORE_ID=uuid-de-la-tienda-default
```

---

## 11. Errores comunes y sus causas

| Error | Causa | Solución |
|-------|-------|----------|
| `column X does not exist` | El `.select()` pide una columna que no existe en la tabla | Revisar los nombres exactos de columnas en Supabase |
| `0 resultados` en queries con anon key | RLS bloquea el acceso | Usar `serviceClient()` en lugar de `createClient()` para esas tablas |
| API returns 403 | `requireStoreOwner()` no puede leer `store_owners` | Mismo problema de RLS — la función usa `serviceClient()` para resolverlo |
| Redirect loop a `/admin/login` | La sesión expiró o las cookies no se propagan correctamente | El middleware `proxy.ts` detecta usuario sin sesión y redirige |
| Optimistic update se revierte al recargar | El fetch a la API falló silenciosamente | Revisar en Network tab si la API devolvió 200 o error |

---

## 12. Roadmap — Próximos pasos

### Fase 1: Deploy (lo que hay ahora, en producción)

#### 1.1 Comprar un dominio

1. Ir a [Namecheap](https://namecheap.com) o [Cloudflare Registrar](https://cloudflare.com/products/registrar/) (los más baratos y confiables).
2. Buscar tu dominio, por ejemplo `micatalogo.mx` o `barajasjerseys.com`.
3. Comprarlo — Cloudflare Registrar cobra el precio de costo sin markup.

#### 1.2 Hacer el deploy en Vercel

1. Subir el código a un repositorio en **GitHub**.
2. Entrar a [vercel.com](https://vercel.com) → "New Project" → conectar el repo.
3. En el paso de configuración agregar todas las variables de entorno (las del punto 10 de este doc).
4. Vercel hace el build y te da una URL temporal como `mi-catalogo.vercel.app`.

#### 1.3 Conectar tu dominio a Vercel

1. En el dashboard de Vercel → tu proyecto → **Settings → Domains**.
2. Agregar tu dominio, por ejemplo `micatalogo.mx`.
3. Vercel te da dos opciones para configurar en tu proveedor de dominio:
   - **Nameservers** (recomendado si usas Cloudflare): apuntas los nameservers de tu dominio a Vercel.
   - **CNAME/A record**: agregas un registro DNS específico.
4. En Namecheap o Cloudflare, vas a la configuración DNS de tu dominio y agregas lo que Vercel pide.
5. Esperar 5–30 minutos a que propague. Vercel activa HTTPS automáticamente.

Resultado: `micatalogo.mx/{storecode}` lleva a la tienda pública, `micatalogo.mx/admin` al panel.

#### 1.4 Panel de admin en subdominio separado (opcional pero recomendado)

Por seguridad y claridad, puedes poner el admin en `admin.micatalogo.mx`:

1. En Vercel → Settings → Domains → agregar `admin.micatalogo.mx`.
2. En tu DNS agregar un CNAME: `admin` → `cname.vercel-dns.com`.
3. En el código, agregar una variable de entorno `NEXT_PUBLIC_ADMIN_DOMAIN=admin.micatalogo.mx`.
4. Actualizar el middleware `proxy.ts` para que solo sirva rutas `/admin/*` cuando el hostname es `admin.micatalogo.mx`.
5. Las tiendas públicas siguen en `micatalogo.mx/{storecode}`.

```
micatalogo.mx/barajas       → tienda pública de Barajas Jerseys
micatalogo.mx/otherstore    → tienda pública de otra tienda
admin.micatalogo.mx/admin   → panel de administración (invisible para clientes)
```

---

### Fase 2: Carrito de compras

El carrito no requiere base de datos propia — se puede manejar con estado del cliente + un proveedor de pagos.

#### 2.1 Estado del carrito (client-side)

Crear un **Context** de React que vive en el layout de la tienda:

```typescript
// lib/cart-context.tsx
interface CartItem {
  productId: string
  slug:      string
  name:      string
  image:     string
  size:      string
  price:     number
  quantity:  number
}

// Persistir en localStorage para que no se pierda al recargar
```

Componentes nuevos:
- `CartIcon.tsx` — ícono en el navbar con contador de items.
- `CartDrawer.tsx` — panel lateral que se abre al hacer clic.
- `CartItem.tsx` — fila dentro del drawer con cantidad editable.

#### 2.2 Página de checkout

Nueva ruta: `/{storecode}/checkout`

Formulario con:
- Nombre completo
- Email
- Teléfono
- Dirección de envío (calle, número, colonia, ciudad, CP, estado)
- Resumen del pedido
- Botón de pago

#### 2.3 Integración de pagos con Stripe

1. Crear cuenta en [stripe.com](https://stripe.com).
2. Instalar el SDK: `npm install stripe @stripe/stripe-js`.
3. Agregar variables de entorno:
   ```bash
   STRIPE_SECRET_KEY=sk_live_...       # PRIVADA, solo servidor
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. Crear API route `POST /api/checkout/create-session`:
   - Recibe los items del carrito y el `storeId`.
   - Crea una **Stripe Checkout Session** con los productos y precios.
   - Devuelve la `session.url` para redirigir al usuario.
5. Al completar el pago, Stripe redirige a `/{storecode}/checkout/success?session_id=...`.
6. Crear un **webhook** `POST /api/webhooks/stripe` que escucha el evento `checkout.session.completed` para registrar el pedido en la DB.

#### 2.4 Alternativa más simple: Conekta (México)

Si los clientes son principalmente de México, [Conekta](https://conekta.com) es más fácil de aprobar y acepta tarjetas, OXXO y SPEI. Misma arquitectura que Stripe.

---

### Fase 3: Pedidos y envíos

#### 3.1 Tabla de pedidos en la DB

```sql
CREATE TABLE orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     UUID REFERENCES stores(id),
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT,
  shipping_address JSONB NOT NULL,
  items            JSONB NOT NULL,  -- array de { productId, name, size, price, qty }
  subtotal         NUMERIC NOT NULL,
  shipping_cost    NUMERIC NOT NULL DEFAULT 0,
  total            NUMERIC NOT NULL,
  status           TEXT DEFAULT 'pending',  -- pending, paid, shipped, delivered, cancelled
  payment_id       TEXT,  -- ID del pago en Stripe/Conekta
  tracking_number  TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);
```

#### 3.2 Panel de pedidos para el store owner

Nueva ruta: `/admin/my-store/orders`

- Lista de pedidos con status, cliente, total, fecha.
- Clic en un pedido → detalle con dirección, items, botón para actualizar status.
- Botón para ingresar número de guía de rastreo.
- Email automático al cliente cuando cambia el status (usando Resend o SendGrid).

#### 3.3 Envíos con Skydropx o Envia.com (México)

[Skydropx](https://skydropx.com) y [Envia.com](https://envia.com) son APIs de mensajería para México que integran Fedex, DHL, Estafeta, J&T desde una sola API.

Flujo:
1. Al confirmar un pedido pagado, llamar a la API de Skydropx con los datos de paquete y destino.
2. Skydropx cotiza todas las paqueterías disponibles.
3. El admin elige la opción y genera la guía — se descarga el PDF automáticamente.
4. El número de guía se guarda en el pedido y se envía al cliente por email.

Variables de entorno adicionales:
```bash
SKYDROPX_API_KEY=...
SKYDROPX_WAREHOUSE_ID=...  # ID de tu almacén/origen
```

#### 3.4 Calcular costo de envío en el checkout

En la página de checkout, cuando el usuario ingresa su CP:
1. Llamar a `POST /api/shipping/quote` con CP de destino + peso estimado del pedido.
2. El servidor consulta Skydropx y devuelve opciones (precio + días de entrega).
3. El usuario elige la opción de envío.
4. El total final = subtotal + envío elegido.

---

### Fase 4: Mejoras de experiencia

#### 4.1 Email transaccional

Usar [Resend](https://resend.com) (gratis hasta 3,000 emails/mes) con React Email para templates:
- Confirmación de pedido al cliente
- Notificación de nuevo pedido al store owner
- Email de seguimiento cuando se asigna guía
- Contraseña de bienvenida al crear tienda nueva

```bash
RESEND_API_KEY=re_...
```

#### 4.2 Notificaciones por WhatsApp

Usar la API de WhatsApp Business (Meta) o [Twilio](https://twilio.com) para enviar:
- Confirmación de pedido
- Notificación de envío con link de rastreo

#### 4.3 Página de rastreo pública

Nueva ruta: `/{storecode}/rastreo`
- El cliente ingresa su número de pedido o email.
- Muestra el status actual y el número de guía con link a la paquetería.

#### 4.4 Inventario y stock

Agregar columna `stock: integer` a `store_products`.
- El store owner puede actualizar el stock desde su panel.
- En la tienda pública, productos con `stock = 0` muestran "Agotado".
- Al completar un pedido (webhook de Stripe), decrementar el stock automáticamente.

#### 4.5 Cupones de descuento

Nueva tabla `coupons`:
```sql
CREATE TABLE coupons (
  code         TEXT PRIMARY KEY,
  store_id     UUID REFERENCES stores(id),
  type         TEXT,  -- 'percentage' | 'fixed'
  value        NUMERIC,
  min_purchase NUMERIC DEFAULT 0,
  max_uses     INTEGER,
  uses         INTEGER DEFAULT 0,
  expires_at   TIMESTAMPTZ,
  active       BOOLEAN DEFAULT true
);
```

---

---

### Fase 5: Crecimiento del negocio

Esta fase no es técnica — es la más importante para que el proyecto genere dinero real.

#### 5.1 Ampliar el catálogo de camisas

El catálogo actual tiene ~204 productos. Para crecer:

- **Buscar proveedores**: Alibaba, DHgate, proveedores locales en CDMX (La Merced, Tepito), o directamente marcas como Score Sports.
- **Qué buscar primero**:
  - Temporada actual de los equipos más populares (Real Madrid, Barcelona, Manchester City, México, Argentina)
  - Retros que se vendan bien (verificar en Instagram y TikTok qué piden)
  - Ediciones especiales y mundiales
- **Criterios de selección**: precio de costo, calidad AAA vs player version, disponibilidad de tallas completas (S–4XL)
- **Cómo agregarlos al sistema**: El catalog admin sube fotos + datos en `/admin` → automáticamente disponible para todos los store owners.
- **Meta a corto plazo**: llegar a 500 productos con buena cobertura de ligas principales.

#### 5.2 Mejorar el look del catálogo

El diseño actual es funcional pero puede pulirse para verse más profesional:

- **Fotos de producto consistentes**: fondo blanco o gris uniforme, misma perspectiva en todas las imágenes. Considerar un mini estudio de foto (colgador + luz difusa + fondo de papel).
- **Mockups de camisas**: si no tienes foto real, usar herramientas como [Placeit](https://placeit.net) o [Smartmockups](https://smartmockups.com) para mostrar la camisa "puesta".
- **Homepage más atractiva**: agregar una sección de "más vendidos", banners de temporada (Champions League, Apertura/Clausura MX), y un contador de colecciones.
- **Tipografía y colores por tienda**: en el futuro, permitir que cada store owner personalice colores y fuentes de su tienda desde el panel.
- **Reviews / testimonios**: sección con fotos de clientes usando las camisas — genera confianza.

#### 5.3 Abrir Instagram

Instagram es el canal más efectivo para vender ropa deportiva en México.

**Cuenta(s) a crear:**
- Una cuenta principal de la plataforma (si quieres hacer branding del negocio como SaaS).
- O una cuenta por tienda, manejada por cada store owner.

**Estrategia de contenido:**
- **Fotos de producto**: camisa bien presentada, buena iluminación, fondo limpio. Mínimo 3 fotos por camisa nueva.
- **Reels cortos** (15–30 seg): unboxing, "outfit del día", comparativa AAA vs player version, reacciones de clientes.
- **Stories diarios**: precio del día, stock disponible, "¿cuál quieres?", encuestas.
- **UGC** (User Generated Content): repostear fotos de clientes con sus camisas — pedir que etiqueten la cuenta.
- **Hashtags relevantes**: #camisasdefutbol #jerseys #retro #premierleague #laliga #ligamx #mexico

**Herramientas útiles:**
- [Canva](https://canva.com) para diseñar posts con tu branding.
- [Later](https://later.com) o [Buffer](https://buffer.com) para programar publicaciones.
- Instagram Shopping para etiquetar productos directo en las fotos (requiere cuenta de Business y catálogo conectado).

#### 5.4 Promocionar las camisas

**Orgánico (sin costo):**
- **TikTok**: los videos cortos de jerseys tienen mucho alcance orgánico. Formato: unboxing + prueba de calidad + precio.
- **Facebook Marketplace**: para ventas locales, es de los canales con más conversión en México.
- **Grupos de Facebook**: hay grupos de miles de personas que buscan camisas (buscar "camisas de futbol México", "jerseys fútbol CDMX").
- **WhatsApp Status**: si ya tienes contactos interesados, el status de WhatsApp es alcance 100% orgánico.

**Pagado (cuando haya flujo de caja):**
- **Meta Ads** (Instagram + Facebook): el ROI en ropa deportiva es bueno con segmentación por intereses (fútbol, ligas específicas, equipos). Empezar con $200–$500 MXN/día, escalar lo que funciona.
- **TikTok Ads**: más barato que Meta, buen alcance en 18–35 años.
- **Google Shopping**: cuando tengas el carrito funcionando, aparecer en resultados de "comprar camisa Real Madrid México" tiene mucha intención de compra.
- **Colaboraciones con influencers**: micro-influencers de fútbol (10k–100k seguidores) suelen aceptar canje de producto o comisiones del 10–15%.

**Métricas a rastrear:**
- Costo por clic (CPC)
- Costo por venta (CAC — Customer Acquisition Cost)
- Valor promedio de pedido
- Tasa de conversión (visitantes que compran)

---

### Resumen visual del roadmap

```
FASE 0 (actual)
  ✅ Catálogo público multi-tienda
  ✅ Panel de admin y store owners
  ✅ Gestión de productos y precios
  ✅ Imágenes en Cloudinary

FASE 1 — Deploy
  → Dominio propio
  → Deploy en Vercel
  → Admin en subdominio separado

FASE 2 — Ventas
  → Carrito de compras
  → Checkout con formulario
  → Pagos con Stripe / Conekta

FASE 3 — Operaciones
  → Tabla de pedidos
  → Panel de pedidos para el owner
  → Envíos con Skydropx
  → Emails transaccionales

FASE 4 — Escala técnica
  → Notificaciones WhatsApp
  → Inventario / stock
  → Cupones de descuento
  → Página de rastreo pública

FASE 5 — Crecimiento del negocio
  → Ampliar catálogo (meta: 500 productos)
  → Mejorar fotos y look del catálogo
  → Abrir Instagram y TikTok
  → Contenido orgánico diario
  → Meta Ads cuando haya flujo de caja
  → Colaboraciones con micro-influencers
```
