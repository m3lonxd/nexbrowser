"""Inter SemiBold ile 'NexBrowser' yazısını SVG path olarak üretir (fonta bağımlı olmasın)."""
import sys
from fontTools.ttLib import TTCollection
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

TTC = sys.argv[1]
font = next(f for f in TTCollection(TTC).fonts
            if f["name"].getDebugName(4) == "Inter SemiBold")
gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
upm = font["head"].unitsPerEm
asc = font["OS/2"].sCapHeight
TEXT, H, PAD = "NexBrowser", 56, 2
scale = 30 / asc  # büyük harf yüksekliği 30 birim
baseline = (H + 30) / 2

def build(fill_attr, out):
    x, paths = 0.0, []
    for ch in TEXT:
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (scale, 0, 0, -scale, PAD + x, baseline)))
        paths.append(pen.getCommands())
        x += hmtx[g][0] * scale - 0.4
    w = round(PAD * 2 + x, 2)
    d = "".join(paths)
    with open(out, "w") as fh:
        fh.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {H}">'
                 f'<path {fill_attr} d="{d}"/></svg>\n')

build('fill="#fff"', "branding-src/about-wordmark.svg")
build('style="fill:context-fill #15141a"', "branding-src/firefox-wordmark.svg")
