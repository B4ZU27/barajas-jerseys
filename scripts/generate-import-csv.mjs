/**
 * generate-import-csv.mjs
 *
 * Genera un CSV compatible con Medusa v2 a partir de products.json del catálogo.
 *
 * Uso:
 *   node scripts/generate-import-csv.mjs
 *
 * Requisitos:
 *   - El servidor de Medusa debe estar corriendo (npm run dev)
 *   - Tener un token de admin en MEDUSA_TOKEN o pasarlo como variable de entorno
 *
 * Variables de entorno (opcionales, tienen defaults):
 *   MEDUSA_URL=http://localhost:9000
 *   MEDUSA_TOKEN=tu_jwt_token    (si no se pone, el CSV tendrá placeholders para UUIDs)
 *   PRODUCTS_PATH=../mi-catalogo/data/products.json
 */

import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ─── Config ──────────────────────────────────────────────────────────────────

const MEDUSA_URL   = process.env.MEDUSA_URL   ?? "http://localhost:9000"
const MEDUSA_TOKEN = process.env.MEDUSA_TOKEN ?? ""
const PRODUCTS_PATH = process.env.PRODUCTS_PATH
  ?? path.join(__dirname, "../data/products.json")
const OUTPUT_PATH = path.join(__dirname, "../products-import.csv")

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch(endpoint) {
  const res = await fetch(`${MEDUSA_URL}${endpoint}`, {
    headers: MEDUSA_TOKEN ? { Authorization: `Bearer ${MEDUSA_TOKEN}` } : {},
  })
  if (!res.ok) throw new Error(`API error ${res.status} en ${endpoint}`)
  return res.json()
}

function escapeCsv(val) {
  if (val === null || val === undefined) return ""
  const str = String(val)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function row(values) {
  return values.map(escapeCsv).join(",")
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // 1. Leer products.json
  if (!fs.existsSync(PRODUCTS_PATH)) {
    console.error(`❌ No se encontró products.json en: ${PRODUCTS_PATH}`)
    console.error(`   Ajusta PRODUCTS_PATH o corre el script desde barajas-backend/`)
    process.exit(1)
  }
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf-8"))
  console.log(`📦 ${products.length} productos encontrados`)

  // 2. Obtener IDs de Medusa (categorías, colecciones, sales channel, shipping profile)
  let categoryMap    = {}  // handle → id
  let collectionMap  = {}  // title  → id
  let salesChannelId = ""
  let shippingProfileId = ""

  if (MEDUSA_TOKEN) {
    console.log("🔌 Conectando a Medusa para obtener IDs...")
    try {
      const [catsData, colsData, scData, spData] = await Promise.all([
        apiFetch("/admin/product-categories?limit=100"),
        apiFetch("/admin/collections?limit=100"),
        apiFetch("/admin/sales-channels?limit=10"),
        apiFetch("/admin/shipping-profiles?limit=10"),
      ])

      for (const c of catsData.product_categories ?? []) categoryMap[c.handle]  = c.id
      for (const c of colsData.collections ?? [])        collectionMap[c.title]  = c.id
      salesChannelId    = scData.sales_channels?.[0]?.id ?? ""
      shippingProfileId = spData.shipping_profiles?.[0]?.id ?? ""

      console.log(`✅ ${Object.keys(categoryMap).length} categorías`)
      console.log(`✅ ${Object.keys(collectionMap).length} colecciones`)
      console.log(`✅ Sales channel: ${salesChannelId || "no encontrado"}`)
      console.log(`✅ Shipping profile: ${shippingProfileId || "no encontrado"}`)
    } catch (err) {
      console.warn(`⚠️  No se pudo conectar a Medusa: ${err.message}`)
      console.warn("   El CSV tendrá placeholders — rellena los UUIDs manualmente.")
    }
  } else {
    console.warn("⚠️  Sin MEDUSA_TOKEN — el CSV tendrá placeholders para UUIDs.")
    console.warn("   Corre: MEDUSA_TOKEN=tu_token node scripts/generate-import-csv.mjs")
  }

  // 3. Construir el CSV
  // Medusa: una fila por variante. Si un producto tiene 5 tallas → 5 filas con el mismo handle.
  // Los datos del producto (título, imágenes, etc.) se repiten en cada fila.

  // Calcular el máximo de imágenes para las columnas
  const maxImages = Math.max(...products.map((p) => (p.images ?? []).length))

  // Headers
  const imageHeaders = Array.from({ length: maxImages }, (_, i) => `Product Image ${i + 1} Url`)

  const headers = [
    "Product Handle",
    "Product Title",
    "Product Description",
    "Product Status",
    "Product Thumbnail",
    "Product Collection Id",
    "Product Category 1",
    "Product Tag 1",
    "Product Tag 2",
    "Product Metadata",
    "Product Sales Channel 1",
    "Shipping Profile Id",
    ...imageHeaders,
    "Variant Title",
    "Variant SKU",
    "Variant Manage Inventory",
    "Variant Allow Backorder",
    "Variant Price MXN",
    "Variant Option 1 Name",
    "Variant Option 1 Value",
  ]

  const csvRows = [headers.join(",")]

  for (const p of products) {
    const categoryId   = categoryMap[p.category]   ?? `TODO_UUID_categoria_${p.category}`
    const collectionId = p.tags?.includes("retro")
      ? (collectionMap["Retro"] ?? collectionMap["retro"] ?? "TODO_UUID_coleccion_retro")
      : p.tags?.includes("destacado")
        ? (collectionMap["Destacados"] ?? "TODO_UUID_coleccion_destacados")
        : ""

    const scId = salesChannelId || "TODO_UUID_sales_channel"
    const spId = shippingProfileId || "TODO_UUID_shipping_profile"

    const thumbnail = p.images?.[0] ?? ""
    const metadata  = JSON.stringify({ club: p.club ?? "" })

    // Tags (máx 2 columnas en nuestro schema)
    const tag1 = p.tags?.[0] ?? ""
    const tag2 = p.tags?.[1] ?? ""

    // Imágenes con padding hasta maxImages
    const images = Array.from({ length: maxImages }, (_, i) => p.images?.[i] ?? "")

    // Una fila por talla/variante
    const sizes = p.sizes ?? ["Único"]
    for (const size of sizes) {
      const sku = `${p.slug}-${size}`.toUpperCase()

      const values = [
        p.slug,
        p.name,
        p.description ?? "",
        p.available === false ? "draft" : "published",
        thumbnail,
        collectionId,
        categoryId,
        tag1,
        tag2,
        metadata,
        scId,
        spId,
        ...images,
        size,
        sku,
        "FALSE",          // Manage inventory
        "FALSE",          // Allow backorder
        p.price ?? "",    // Precio en MXN
        "Talla",          // Option name
        size,             // Option value
      ]

      csvRows.push(row(values))
    }
  }

  // 4. Escribir el archivo
  fs.writeFileSync(OUTPUT_PATH, csvRows.join("\n"), "utf-8")

  const totalRows = csvRows.length - 1 // sin header
  console.log(`\n✅ CSV generado: ${OUTPUT_PATH}`)
  console.log(`   ${products.length} productos → ${totalRows} filas (una por talla)`)

  if (!MEDUSA_TOKEN) {
    console.log("\n⚠️  Recuerda reemplazar los TODOs antes de importar:")
    console.log("   - TODO_UUID_categoria_*  → IDs de las categorías en Medusa")
    console.log("   - TODO_UUID_coleccion_*  → IDs de las colecciones en Medusa")
    console.log("   - TODO_UUID_sales_channel → ID del sales channel")
    console.log("   - TODO_UUID_shipping_profile → ID del shipping profile")
    console.log("\n   O corre con token: MEDUSA_TOKEN=xxx node scripts/generate-import-csv.mjs")
  }
}

main().catch((err) => {
  console.error("❌ Error:", err.message)
  process.exit(1)
})
