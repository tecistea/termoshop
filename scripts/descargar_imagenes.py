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
        # toromates.com (CloudFront CDN, fondo blanco limpio sin overlays)
        "url": "https://d22fxaf9t8d39k.cloudfront.net/2d7a318615646fc671f800523359db5a35888724eab8c7875c2538a0b2f54e7b40982.jpg",
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
        "nombre": "Terra 600cc",
        "archivo": "lumilagro-terra-600.webp",
        # lumilagro.com.ar (sitio oficial, imagen Terra verde 800x800)
        "url": "https://www.lumilagro.com.ar/wp-content/uploads/2020/12/terraverde1-800x800.jpg",
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
    # ----- Parcial 2: 6 productos nuevos -----
    {
        "marca": "Stanley",
        "nombre": "Adventure To-Go 1L",
        "archivo": "stanley-adventure-togo-1l.webp",
        # stanley1913.mx (Shopify CDN, foto oficial Adventure To-Go, fondo blanco)
        "url": "https://stanley1913.mx/cdn/shop/files/B2B_Web_PNG-The-Adventure-To-Go-Bottle-1-1QT-Charcoal-Glow-Front_13d01e42-57c7-4f4c-995e-4442482f1ce0.webp?v=1777220868&width=1080",
    },
    {
        "marca": "Stanley",
        "nombre": "Trigger-Action Travel Mug 590ml",
        "archivo": "stanley-trigger-action-590.webp",
        # newdaysports.com (Shopify CDN, Trigger-Action Travel Mug Matte Black, fondo blanco)
        "url": "https://www.newdaysports.com/cdn/shop/products/B2B_Large_PNG-Trigger_Action_Travel_Mug_20oz_MBlack_front_1800x1800_01404ee2-deda-4d2e-ae51-7145016180d8_1024x.png?v=1762526789",
    },
    {
        "marca": "Lumilagro",
        "nombre": "Terra Estampado 1L",
        "archivo": "lumilagro-terra-estampado-1l.webp",
        # Tiendanube CDN (retailer), Terra estampado 1L, fondo blanco
        "url": "https://acdn-us.mitiendanube.com/stores/461/661/products/termo-terra-estampado_mesa-de-trabajo-11-20536d7620cfb4277e16261032006913-1024-1024.webp",
    },
    {
        "marca": "Termolar",
        "nombre": "Lumina 1L",
        "archivo": "termolar-lumina-1l.webp",
        # termolar.com.ar (sitio oficial via Tiendanube CDN, 1024px webp)
        "url": "https://acdn-us.mitiendanube.com/stores/001/471/168/products/97511-77100a248284dabeec16091093711396-1024-1024.webp",
    },
    {
        "marca": "Stanley",
        "nombre": "IceFlow Flip Straw 700ml",
        "archivo": "stanley-iceflow-flip-straw-700.webp",
        # stanley1913.com (Shopify CDN oficial, IceFlow Flip Straw Bottle, fondo blanco)
        "url": "https://www.stanley1913.com/cdn/shop/files/Web_PNG_Square-TheIceFlowFlipStraw2.0Bottle24OZ-Cream2.0-Front.png?v=1778265784&width=1200",
    },
    {
        "marca": "Stanley",
        "nombre": "Quencher H2.0 FlowState 1.2L",
        "archivo": "stanley-quencher-h2-12l.webp",
        # stanley1913.com (Shopify CDN oficial, Quencher H2.0 FlowState 40oz, fondo blanco)
        "url": "https://www.stanley1913.com/cdn/shop/files/Web_PNG_Square-The_Quencher_H2.0_FlowState_Tumbler_40OZ_-_Purple_Dust_-_Front.png?v=1770952011&width=1200",
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
