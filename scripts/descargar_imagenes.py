"""
descargar_imagenes.py
---------------------
Descarga las imagenes de producto del catalogo de termoshop, las redimensiona
a maximo 600x600 manteniendo aspect ratio, y las guarda como WebP quality 85
en productos-imagenes/.

Idempotente: si la imagen ya existe se saltea (usar --force para regenerar).
Si la descarga falla o no hay URL, genera un placeholder PNG con el nombre
y marca del producto sobre fondo de la paleta del proyecto.

Uso:
    python scripts/descargar_imagenes.py
    python scripts/descargar_imagenes.py --force
"""

import argparse
import io
import sys
from pathlib import Path

try:
    import requests
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:
    print(f"[ERROR] Falta dependencia: {exc.name}. Instalar con:")
    print("    pip install Pillow requests")
    sys.exit(1)


RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "productos-imagenes"
TAMANO_MAX = (600, 600)
CALIDAD_WEBP = 85
TAMANO_PLACEHOLDER = (600, 600)
COLOR_VERDE_STANLEY = "#2C3E2D"
COLOR_DORADO = "#C9A961"
COLOR_TEXTO = "#FFFFFF"

# Paleta de colores por marca para los placeholders
COLORES_MARCA = {
    "Stanley": COLOR_VERDE_STANLEY,
    "Lumilagro": COLOR_DORADO,
    "Waicom": COLOR_VERDE_STANLEY,
    "Termolar": COLOR_DORADO,
}

# Catalogo: marca, nombre legible, archivo destino y URL fuente.
# Las URLs se obtuvieron de las tiendas oficiales / retailers en mayo 2026.
PRODUCTOS = [
    {
        "marca": "Stanley",
        "nombre": "Classic Legendary 1.4L",
        "archivo": "stanley-classic-14l.webp",
        # militarykit.com (Shopify CDN, fondo blanco, 1500px)
        "url": "https://www.militarykit.com/cdn/shop/products/stanley-classic-vacuum-bottle-hammertone-green-1.4l.jpg?v=1641398254&width=1500",
    },
    {
        "marca": "Stanley",
        "nombre": "Mate System 800ml",
        "archivo": "stanley-mate-system.webp",
        # stanley1913.ar (VTEX assets, 800px)
        "url": "https://stanleypm.vtexassets.com/arquivos/ids/159318-800-auto?v=638742945237100000&width=800&height=auto&aspect=true",
    },
    {
        "marca": "Lumilagro",
        "nombre": "Luminox 1L",
        "archivo": "lumilagro-luminox-1l.webp",
        # lumilagro.com.ar (sitio oficial, 800px)
        "url": "https://www.lumilagro.com.ar/wp-content/uploads/2022/09/termo-lumilagro-luminox-negro-1-800x800.webp",
    },
    {
        "marca": "Lumilagro",
        "nombre": "Senderito 500ml",
        "archivo": "lumilagro-senderito-500.webp",
        # eltiovende.com (retailer AR, fondo blanco)
        "url": "https://www.eltiovende.com/wp-content/uploads/2023/05/LM-45451-optimized.jpg",
    },
    {
        "marca": "Waicom",
        "nombre": "Premium 1L",
        "archivo": "waicom-premium-1l.webp",
        # Marca regional sin presencia online: usa placeholder generado.
        "url": None,
    },
    {
        "marca": "Termolar",
        "nombre": "Magic Pump 1L",
        "archivo": "termolar-magic-pump-1l.webp",
        # termolar.com.ar (sitio oficial via Tiendanube CDN, 1024px webp)
        "url": "https://acdn-us.mitiendanube.com/stores/001/471/168/products/8700bra-41cc1cf69cd483731917229519082121-1024-1024.webp",
    },
]


def descargar(url: str) -> Image.Image:
    """Descarga la URL y devuelve un Image de Pillow listo para procesar."""
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0 Safari/537.36"
        )
    }
    respuesta = requests.get(url, headers=headers, timeout=30)
    respuesta.raise_for_status()
    return Image.open(io.BytesIO(respuesta.content))


def optimizar_y_guardar(img: Image.Image, destino: Path) -> int:
    """Resize a TAMANO_MAX manteniendo ratio, convierte a RGB y guarda WebP."""
    img.thumbnail(TAMANO_MAX, Image.Resampling.LANCZOS)
    if img.mode in ("RGBA", "LA", "P"):
        # WebP soporta alpha pero para tamaños chicos preferimos RGB sobre blanco
        fondo = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        fondo.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
        img = fondo
    elif img.mode != "RGB":
        img = img.convert("RGB")
    img.save(destino, format="WEBP", quality=CALIDAD_WEBP, method=6)
    return destino.stat().st_size


def cargar_fuente(tamano: int) -> ImageFont.ImageFont:
    """Intenta cargar una fuente del sistema; cae a la default si no encuentra."""
    candidatos = [
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
    ]
    for ruta in candidatos:
        if Path(ruta).exists():
            try:
                return ImageFont.truetype(ruta, tamano)
            except OSError:
                continue
    return ImageFont.load_default()


def generar_placeholder(producto: dict, destino: Path) -> int:
    """Genera placeholder con marca + nombre sobre fondo de la paleta."""
    color_fondo = COLORES_MARCA.get(producto["marca"], COLOR_VERDE_STANLEY)
    img = Image.new("RGB", TAMANO_PLACEHOLDER, color_fondo)
    dibujo = ImageDraw.Draw(img)

    fuente_marca = cargar_fuente(64)
    fuente_nombre = cargar_fuente(36)

    marca = producto["marca"].upper()
    nombre = producto["nombre"]

    # Centrar marca arriba del centro
    bbox_marca = dibujo.textbbox((0, 0), marca, font=fuente_marca)
    ancho_marca = bbox_marca[2] - bbox_marca[0]
    alto_marca = bbox_marca[3] - bbox_marca[1]
    x_marca = (TAMANO_PLACEHOLDER[0] - ancho_marca) // 2
    y_marca = TAMANO_PLACEHOLDER[1] // 2 - alto_marca - 20
    dibujo.text((x_marca, y_marca), marca, fill=COLOR_TEXTO, font=fuente_marca)

    # Nombre debajo
    bbox_nombre = dibujo.textbbox((0, 0), nombre, font=fuente_nombre)
    ancho_nombre = bbox_nombre[2] - bbox_nombre[0]
    x_nombre = (TAMANO_PLACEHOLDER[0] - ancho_nombre) // 2
    y_nombre = TAMANO_PLACEHOLDER[1] // 2 + 20
    dibujo.text((x_nombre, y_nombre), nombre, fill=COLOR_TEXTO, font=fuente_nombre)

    img.save(destino, format="WEBP", quality=CALIDAD_WEBP, method=6)
    return destino.stat().st_size


def procesar(producto: dict, force: bool) -> None:
    destino = DESTINO / producto["archivo"]
    etiqueta = f"{producto['marca']} {producto['nombre']}"

    if destino.exists() and not force:
        tam_kb = destino.stat().st_size / 1024
        print(f"[SKIP] {etiqueta} -> {destino.name} ya existe ({tam_kb:.1f} KB)")
        return

    if producto["url"]:
        try:
            img = descargar(producto["url"])
            tam = optimizar_y_guardar(img, destino)
            print(
                f"[OK]   {etiqueta} -> {destino.name} "
                f"({tam / 1024:.1f} KB) <- {producto['url']}"
            )
            return
        except (requests.RequestException, OSError, ValueError) as exc:
            print(f"[WARN] {etiqueta}: descarga fallo ({exc}); usando placeholder")

    tam = generar_placeholder(producto, destino)
    print(
        f"[GEN]  {etiqueta} -> {destino.name} "
        f"({tam / 1024:.1f} KB) [placeholder generado]"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Descarga imagenes de producto")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-descarga aunque la imagen ya exista",
    )
    args = parser.parse_args()

    DESTINO.mkdir(parents=True, exist_ok=True)
    print(f"Destino: {DESTINO}")
    print(f"Productos a procesar: {len(PRODUCTOS)}\n")

    for producto in PRODUCTOS:
        procesar(producto, args.force)

    print("\nListo.")


if __name__ == "__main__":
    main()
