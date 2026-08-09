# -*- coding: utf-8 -*-
"""Media Print Pack — site architecture board (current vs complete)."""
from PIL import Image, ImageDraw, ImageFont

S = 2
W, H = 1900, 1112

INK   = (22, 19, 15);    MUTED = (110, 100, 90);  FAINT = (168, 160, 152)
LINE  = (233, 226, 215); PAPER = (255, 253, 250); CANVAS = (231, 227, 221)
TINT  = (247, 242, 234); ACCENT = (221, 99, 32);  ACCENT2 = (179, 72, 15)
SOFT  = (253, 241, 231); LEAF = (47, 107, 79);    LEAFSOFT = (232, 243, 237)
AMBER = (198, 124, 8);   AMBSOFT = (255, 244, 224); WHITE = (255, 255, 255)
WIRE  = (222, 217, 209); WIRE2 = (206, 200, 191)

F, FB, FS = ('C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/segoeuib.ttf',
             'C:/Windows/Fonts/seguisb.ttf')
_c = {}


def f(sz, w='r'):
    k = (sz, w)
    if k not in _c:
        _c[k] = ImageFont.truetype({'r': F, 'b': FB, 's': FS}[w], sz * S)
    return _c[k]


img = Image.new('RGB', (W * S, H * S), CANVAS)
d = ImageDraw.Draw(img, 'RGBA')

rr = lambda b, r, fill=None, outline=None, w=1: d.rounded_rectangle(
    [v * S for v in b], radius=r * S, fill=fill, outline=outline, width=int(w * S))
rect = lambda b, fill=None, outline=None, w=1: d.rectangle(
    [v * S for v in b], fill=fill, outline=outline, width=int(w * S))
txt = lambda xy, s, sz=13, w='r', fill=INK, anchor='la': d.text(
    (xy[0] * S, xy[1] * S), s, font=f(sz, w), fill=fill, anchor=anchor)
tw = lambda s, sz=13, w='r': d.textlength(s, font=f(sz, w)) / S
line = lambda p0, p1, fill=LINE, w=1: d.line(
    [p0[0] * S, p0[1] * S, p1[0] * S, p1[1] * S], fill=fill, width=int(w * S))


def circle(cx, cy, r, fill=None, outline=None, w=1):
    d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
              fill=fill, outline=outline, width=int(w * S))


def chip(x, y, label, bg, fg, sz=9, padx=7, pady=3, wt='s'):
    wd = tw(label, sz, wt) + padx * 2
    ht = sz + pady * 2 + 2
    rr((x, y, x + wd, y + ht), ht / 2, fill=bg)
    txt((x + padx, y + ht / 2 + .5), label, sz, wt, fg, anchor='lm')
    return wd


# ---------------------------------------------------------------- header
rect((0, 0, W, 96), fill=INK)
txt((56, 28), 'Site Architecture', 27, 'b', PAPER)
txt((56 + tw('Site Architecture', 27, 'b') + 14, 40), 'what exists  vs  the complete build',
    14, 'r', (150, 143, 136))
txt((56, 64), 'Media Print Pack  ·  mediaprint-eg.com', 13, 'r', (176, 168, 160))

lx = W - 56
for lbl, col in [('To build', ACCENT), ('Exists, needs depth', AMBER), ('Built today', LEAF)]:
    wd = tw(lbl, 11, 'r')
    txt((lx, 55), lbl, 11, 'r', (200, 194, 188), anchor='rm')
    circle(lx - wd - 12, 55, 5, fill=col)
    lx -= wd + 40

# ================================================== LEFT : SITE TREE
TX, TY = 56, 132
txt((TX, TY), 'A', 15, 'b', ACCENT)
txt((TX + 20, TY), 'INFORMATION ARCHITECTURE', 15, 'b', INK)
txt((TX, TY + 24), '7 pages today  →  43 pages in the complete build', 12, 'r', MUTED)

PANE = (TX, TY + 52, TX + 720, 992)
rr(PANE, 16, fill=PAPER, outline=LINE, w=1.5)

# (label, depth, status, note)   status: ok / part / new
TREE = [
    ('Home', 0, 'ok', 'hero · benefits · clients · process'),
    ('Products', 0, 'part', 'hub — needs mega-menu'),
    ('Flexible packaging', 1, 'new', 'category'),
    ('Zipper bags  ·  Garment bags  ·  Courier bags', 2, 'new', 'product pages'),
    ('Aluminium pouches  ·  5 kg sacks', 2, 'new', 'product pages'),
    ('Paper & board', 1, 'new', 'category'),
    ('Kraft carriers  ·  Paper sacks', 2, 'new', 'product pages'),
    ('Printed cartons  ·  Corrugated boxes', 2, 'new', 'product pages'),
    ('Fabric totes', 1, 'new', 'category'),
    ('Labels & stickers', 1, 'part', 'flat list today'),
    ('Bestsellers', 0, 'ok', '6 ranked, live pricing'),
    ('Industries', 0, 'new', 'the biggest SEO gap'),
    ('Food & beverage  ·  Coffee roasters', 1, 'new', 'landing pages'),
    ('Cosmetics  ·  Fashion  ·  Pharma  ·  E-commerce', 1, 'new', 'landing pages'),
    ('Services', 0, 'ok', 'commercial print'),
    ('Design & artwork service', 1, 'new', ''),
    ('Dieline templates (download)', 1, 'new', 'link-magnet'),
    ('Order a sample kit', 1, 'new', 'converts cold traffic'),
    ('Case studies', 0, 'new', 'real jobs, before/after'),
    ('About', 0, 'new', 'trust — currently missing'),
    ('Factory, machines & capacity', 1, 'new', ''),
    ('Certifications & food safety', 1, 'new', ''),
    ('Sustainability', 0, 'new', 'recyclable / food-safe'),
    ('Resources', 0, 'new', 'organic traffic engine'),
    ('Guides  ·  FAQ  ·  Packaging glossary', 1, 'new', ''),
    ('Quote basket', 0, 'new', 'multi-item, not one WhatsApp'),
    ('Account', 0, 'new', 'needs a backend'),
    ('Order tracking', 1, 'new', 'concept already designed'),
    ('Order history  ·  Saved artwork  ·  Reorder', 1, 'new', ''),
    ('Book a meeting', 0, 'ok', '3 modes'),
    ('Contact', 0, 'ok', 'form → WhatsApp'),
    ('Legal', 0, 'new', 'terms · privacy · shipping'),
]

ry = PANE[1] + 22
for label, depth, st, note in TREE:
    x = PANE[0] + 24 + depth * 26
    col = {'ok': LEAF, 'part': AMBER, 'new': ACCENT}[st]
    if depth == 0:
        rr((PANE[0] + 12, ry - 3, PANE[2] - 12, ry + 21), 7,
           fill=TINT if st != 'ok' else (243, 248, 245))
    circle(x + 5, ry + 9, 4.5, fill=col if depth == 0 else PAPER,
           outline=col, w=1.6)
    if depth > 0:
        line((x - 13, ry + 9), (x, ry + 9), fill=(214, 208, 200), w=1.4)
    txt((x + 17, ry + 9), label, 12 if depth == 0 else 11,
        'b' if depth == 0 else 'r', INK if depth == 0 else (86, 78, 70), anchor='lm')
    if note:
        txt((PANE[2] - 20, ry + 10), note, 10, 'r', FAINT, anchor='rm')
    ry += 25 if depth == 0 else 23

# ================================================== RIGHT : WIREFRAMES
WX = PANE[2] + 44
txt((WX, TY), 'B', 15, 'b', ACCENT)
txt((WX + 20, TY), 'PAGE LAYOUTS', 15, 'b', INK)
txt((WX, TY + 24), 'The six templates that carry a complete packaging site. Orange blocks are new.',
    12, 'r', MUTED)

CW, CH = 328, 396
GX, GY = 24, 44
COL0 = WX
ROW0 = TY + 56


def frame(cx, cy, title, sub, blocks, badge=None):
    rr((cx, cy, cx + CW, cy + CH), 12, fill=PAPER, outline=LINE, w=1.5)
    rect((cx + 1, cy + 1, cx + CW - 1, cy + 26), fill=TINT)
    rr((cx + 1, cy + 1, cx + 26, cy + 26), 6, fill=TINT)
    for i, c in enumerate([(232, 116, 106), (238, 196, 106), (150, 200, 140)]):
        circle(cx + 16 + i * 12, cy + 13, 3.5, fill=c)

    rr((cx + 58, cy + 6, cx + CW - 12, cy + 20), 7, fill=(238, 233, 226))
    txt((cx + 66, cy + 13), sub, 8, 'r', (150, 143, 136), anchor='lm')
    txt((cx, cy - 18), title, 12, 'b', (110, 102, 94))
    if badge:
        chip(cx + tw(title, 12, 'b') + 10, cy - 22, badge, ACCENT, WHITE, 8, 6, 2)

    by = cy + 34
    for (h, kind, label) in blocks:
        if kind == 'new':
            rr((cx + 12, by, cx + CW - 12, by + h), 7, fill=SOFT, outline=(240, 200, 168), w=1.2)
            tc = ACCENT2
        elif kind == 'key':
            rr((cx + 12, by, cx + CW - 12, by + h), 7, fill=INK)
            tc = PAPER
        elif kind == 'split':
            rr((cx + 12, by, cx + CW / 2 - 3, by + h), 7, fill=WIRE)
            rr((cx + CW / 2 + 3, by, cx + CW - 12, by + h), 7, fill=SOFT,
               outline=(240, 200, 168), w=1.2)
            tc = None
            txt((cx + 24, by + h / 2), label.split('|')[0], 9, 's', (110, 102, 94), anchor='lm')
            txt((cx + CW / 2 + 15, by + h / 2), label.split('|')[1], 9, 's', ACCENT2, anchor='lm')
        elif kind == 'grid':
            n = 3
            gw = (CW - 24 - (n - 1) * 6) / n
            for i in range(n):
                rr((cx + 12 + i * (gw + 6), by, cx + 12 + i * (gw + 6) + gw, by + h), 7, fill=WIRE)
            tc = None
            txt((cx + CW / 2, by + h / 2), label, 9, 's', (110, 102, 94), anchor='mm')
        else:
            rr((cx + 12, by, cx + CW - 12, by + h), 7, fill=WIRE)
            tc = (98, 90, 82)
        if tc is not None:
            txt((cx + 24, by + h / 2), label, 9, 's', tc, anchor='lm')
        by += h + 6


frame(COL0, ROW0, 'Home', 'mediaprint-eg.com', [
    (40, 'wire', 'Hero + quote CTA'),
    (22, 'wire', 'Capability marquee'),
    (46, 'grid', 'Product categories'),
    (40, 'wire', 'Benefit bento'),
    (32, 'key', 'Client wall'),
    (30, 'new', 'Case study strip'),
    (30, 'wire', '4-step process'),
    (28, 'new', 'Industry shortcuts'),
    (30, 'new', 'Sample kit offer'),
    (30, 'key', 'Contact band'),
])

frame(COL0 + CW + GX, ROW0, 'Category listing', '/products/flexible', [
    (24, 'wire', 'Breadcrumb + H1'),
    (26, 'new', 'Filter rail: material, size, MOQ'),
    (46, 'grid', 'Product cards'),
    (46, 'grid', 'Product cards'),
    (46, 'grid', 'Product cards'),
    (28, 'new', 'Compare selected'),
    (34, 'wire', 'Category SEO copy'),
    (30, 'new', 'Related categories'),
    (30, 'key', 'Contact band'),
])

frame(COL0 + (CW + GX) * 2, ROW0, 'Product detail', '/products/zipper-bags', [
    (24, 'wire', 'Breadcrumb'),
    (58, 'split', 'Photo gallery|Tier price + config'),
    (26, 'new', 'Live unit price & total'),
    (26, 'new', 'Add to quote basket'),
    (30, 'wire', 'Specs: material, sizes, MOQ'),
    (26, 'new', 'Lead time & shipping'),
    (26, 'new', 'Download dieline template'),
    (26, 'new', 'Reviews / jobs we printed'),
    (30, 'grid', 'Related products'),
    (30, 'key', 'Ask a question'),
], badge='NEW')

frame(COL0, ROW0 + CH + GY, 'Industry landing', '/industries/coffee', [
    (40, 'new', 'Hero: packaging for coffee roasters'),
    (30, 'new', 'Pain points for this sector'),
    (46, 'grid', 'Recommended products'),
    (32, 'new', 'Case study: a real roaster'),
    (28, 'new', 'Food-safety & barrier notes'),
    (30, 'wire', 'MOQ & lead-time table'),
    (30, 'new', 'Sector FAQ'),
    (30, 'key', 'Talk to a sector specialist'),
], badge='NEW')

frame(COL0 + CW + GX, ROW0 + CH + GY, 'Quote basket', '/quote', [
    (24, 'wire', 'Your quote request'),
    (34, 'new', 'Line 1: zipper bags 3,000'),
    (34, 'new', 'Line 2: hang tags 1,000'),
    (26, 'new', 'Add another product'),
    (30, 'wire', 'Estimated total (indicative)'),
    (30, 'new', 'Upload artwork files'),
    (30, 'wire', 'Delivery governorate'),
    (30, 'key', 'Send to sales'),
    (26, 'wire', 'or continue on WhatsApp'),
], badge='NEW')

frame(COL0 + (CW + GX) * 2, ROW0 + CH + GY, 'Account & tracking', '/account/orders', [
    (24, 'wire', 'My orders'),
    (30, 'new', 'MP-2418 · printing'),
    (46, 'new', 'Live phase tracker'),
    (26, 'new', 'Action needed: approve sample'),
    (30, 'wire', 'Past orders'),
    (26, 'new', 'Reorder exact job'),
    (26, 'new', 'Saved artwork files'),
    (26, 'new', 'Invoices & delivery notes'),
    (30, 'key', 'Message sales'),
], badge='NEW')

txt((56, H - 34), 'Concept for discussion · Media Print Pack · orange = to build, dark = conversion moment',
    11, 'r', (150, 143, 136))

img.save('D:/mediaprint/docs/site-architecture.png')
img.convert('RGB').save('D:/mediaprint/docs/site-architecture.jpg', quality=93)
print('saved', img.size)
