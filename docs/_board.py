# -*- coding: utf-8 -*-
"""
Media Print Pack — order tracking concept board.
Composes a print-ready presentation board (Figma-style) as a PNG.
Run:  python _board.py
"""
import math
from PIL import Image, ImageDraw, ImageFont

S = 2
W, H = 1840, 1560

INK      = (22, 19, 15)
MUTED    = (110, 100, 90)
FAINT    = (168, 160, 152)
LINE     = (233, 226, 215)
PAPER    = (255, 253, 250)
CANVAS   = (231, 227, 221)
TINT     = (247, 242, 234)
ACCENT   = (221, 99, 32)
ACCENT2  = (179, 72, 15)
SOFT     = (253, 241, 231)
LEAF     = (47, 107, 79)
LEAFSOFT = (232, 243, 237)
AMBER    = (198, 124, 8)
AMBSOFT  = (255, 244, 224)
RED      = (176, 42, 42)
REDSOFT  = (253, 233, 233)
WHITE    = (255, 255, 255)

F, FB, FS = ('C:/Windows/Fonts/segoeui.ttf', 'C:/Windows/Fonts/segoeuib.ttf',
             'C:/Windows/Fonts/seguisb.ttf')
_c = {}


def f(size, weight='r'):
    k = (size, weight)
    if k not in _c:
        _c[k] = ImageFont.truetype({'r': F, 'b': FB, 's': FS}[weight], size * S)
    return _c[k]


img = Image.new('RGB', (W * S, H * S), CANVAS)
d = ImageDraw.Draw(img, 'RGBA')


def rr(box, r, fill=None, outline=None, w=1):
    d.rounded_rectangle([v * S for v in box], radius=r * S, fill=fill,
                        outline=outline, width=int(w * S))


def rect(box, fill=None, outline=None, w=1):
    d.rectangle([v * S for v in box], fill=fill, outline=outline, width=int(w * S))


def txt(xy, s, size=13, weight='r', fill=INK, anchor='la'):
    d.text((xy[0] * S, xy[1] * S), s, font=f(size, weight), fill=fill, anchor=anchor)


def tw(s, size=13, weight='r'):
    return d.textlength(s, font=f(size, weight)) / S


def line(p0, p1, fill=LINE, w=1):
    d.line([p0[0] * S, p0[1] * S, p1[0] * S, p1[1] * S], fill=fill, width=int(w * S))


def circle(cx, cy, r, fill=None, outline=None, w=1):
    d.ellipse([(cx - r) * S, (cy - r) * S, (cx + r) * S, (cy + r) * S],
              fill=fill, outline=outline, width=int(w * S))


def check(cx, cy, r, col=WHITE, wdt=2.2):
    """Hand-drawn tick — Segoe UI has no reliable glyph at these sizes."""
    d.line([(cx - r * .48) * S, (cy + r * .02) * S, (cx - r * .08) * S, (cy + r * .44) * S],
           fill=col, width=int(wdt * S))
    d.line([(cx - r * .08) * S, (cy + r * .44) * S, (cx + r * .52) * S, (cy - r * .42) * S],
           fill=col, width=int(wdt * S))


def star(cx, cy, r, fill):
    pts = []
    for i in range(10):
        ang = math.pi / 2 + i * math.pi / 5
        rad = r if i % 2 == 0 else r * .45
        pts.append(((cx + rad * math.cos(ang)) * S, (cy - rad * math.sin(ang)) * S))
    d.polygon(pts, fill=fill)


def tri(cx, cy, r, fill):
    d.polygon([((cx - r * .5) * S, (cy - r) * S), ((cx - r * .5) * S, (cy + r) * S),
               ((cx + r * .85) * S, cy * S)], fill=fill)


def chip(x, y, label, bg, fg, size=10, padx=8, pady=4, weight='s'):
    wd = tw(label, size, weight) + padx * 2
    ht = size + pady * 2 + 2
    rr((x, y, x + wd, y + ht), ht / 2, fill=bg)
    txt((x + padx, y + ht / 2 + .5), label, size, weight, fg, anchor='lm')
    return wd


def frame_label(x, y, name):
    txt((x, y), name, 12, 'b', (122, 114, 106))


# ================================================================ HEADER
rect((0, 0, W, 100), fill=INK)
txt((56, 30), 'Order Tracking', 28, 'b', PAPER)
txt((56 + tw('Order Tracking', 28, 'b') + 14, 42), 'concept', 15, 'r', (150, 143, 136))
txt((56, 66), 'Media Print Pack  ·  one shared status for the customer and the workshop',
    13, 'r', (176, 168, 160))

lx = 56
for label, col in [('Done', LEAF), ('In progress', ACCENT), ('Waiting on customer', AMBER),
                   ('Overdue', RED), ('Not started', (120, 112, 104))]:
    circle(W - 700 + lx - 56 + 6, 55, 5, fill=col)
    txt((W - 700 + lx - 56 + 18, 55), label, 11, 'r', (200, 194, 188), anchor='lm')
    lx += tw(label, 11, 'r') + 42

# ============================================== SECTION A — CUSTOMER
AX, AY = 56, 136
txt((AX, AY), 'A', 15, 'b', ACCENT)
txt((AX + 20, AY), 'WHAT THE CUSTOMER SEES', 15, 'b', INK)
txt((AX, AY + 24), 'Opens from a private link in the WhatsApp thread we already use — no login, no app.',
    12, 'r', MUTED)

PH_W, PH_H = 268, 604
PH_Y = AY + 74

PHASES = [('Order confirmed', 'done'), ('Artwork & pre-press', 'done'),
          ('Artwork approved', 'done'), ('Sample produced', 'done'),
          ('Sample approved', 'done'), ('Plates & tooling', 'done'),
          ('Printing', 'now'), ('Finishing & die-cut', 'next'),
          ('Quality check', 'next'), ('Packed', 'next'),
          ('Out for delivery', 'next'), ('Delivered', 'next')]


def phone(x, y, title):
    rr((x - 6, y - 6, x + PH_W + 6, y + PH_H + 6), 30, fill=(214, 209, 202))
    rr((x, y, x + PH_W, y + PH_H), 26, fill=PAPER)
    rr((x + PH_W / 2 - 34, y + 9, x + PH_W / 2 + 34, y + 21), 6, fill=(226, 221, 214))
    frame_label(x, y - 24, title)


def phone_head(x, y, order):
    rr((x + 14, y + 34, x + 46, y + 66), 9, fill=ACCENT)
    txt((x + 30, y + 50), 'M', 15, 'b', WHITE, anchor='mm')
    txt((x + 54, y + 40), 'Media Print Pack', 12, 'b', INK)
    txt((x + 54, y + 56), order, 11, 'r', MUTED)
    line((x + 14, y + 80), (x + PH_W - 14, y + 80))


# ---------------- phone 1 : in progress
P1X = AX
phone(P1X, PH_Y, 'Customer  ·  order in progress')
phone_head(P1X, PH_Y, 'Order #MP-2418')

rr((P1X + 14, PH_Y + 94, P1X + PH_W - 14, PH_Y + 150), 10, fill=TINT)
txt((P1X + 26, PH_Y + 106), 'Zipper bags 20 × 25 cm', 12, 'b', INK)
txt((P1X + 26, PH_Y + 125), '1 colour · 3,000 pcs · EGP 6/pc', 11, 'r', MUTED)

cy = PH_Y + 164
rr((P1X + 14, cy, P1X + PH_W - 14, cy + 78), 12, fill=SOFT, outline=(244, 205, 176), w=1.5)
circle(P1X + 40, cy + 31, 13, fill=ACCENT)
tri(P1X + 41, cy + 31, 6, WHITE)
txt((P1X + 62, cy + 17), 'Now printing', 14, 'b', ACCENT2)
txt((P1X + 62, cy + 37), 'Started today, 09:40', 11, 'r', (150, 108, 74))
line((P1X + 26, cy + 56), (P1X + PH_W - 26, cy + 56), fill=(244, 214, 190))
txt((P1X + 26, cy + 66), 'Estimated delivery  ·  5 August', 11, 's', ACCENT2)

sy = cy + 98
txt((P1X + 26, sy), 'PROGRESS', 10, 'b', MUTED)
sy += 18
for i, (name, st) in enumerate(PHASES):
    yy = sy + i * 23
    if i < len(PHASES) - 1:
        line((P1X + 32, yy + 7), (P1X + 32, yy + 23),
             fill=LEAF if st == 'done' else (222, 217, 210), w=2)
    if st == 'done':
        circle(P1X + 32, yy + 6, 6.5, fill=LEAF); check(P1X + 32, yy + 6, 6.5)
    elif st == 'now':
        circle(P1X + 32, yy + 6, 10, fill=(250, 226, 208))
        circle(P1X + 32, yy + 6, 6.5, fill=ACCENT)
    else:
        circle(P1X + 32, yy + 6, 6.5, outline=(206, 200, 192), w=1.5, fill=PAPER)
    txt((P1X + 48, yy + 6), name, 11, 'b' if st == 'now' else 'r',
        INK if st != 'next' else FAINT, anchor='lm')
    if st == 'now':
        chip(P1X + 48 + tw(name, 11, 'b') + 8, yy - 2, 'NOW', ACCENT, WHITE, 9, 6, 2)

by = PH_Y + PH_H - 50
rr((P1X + 14, by, P1X + PH_W - 14, by + 36), 18, fill=INK)
txt((P1X + PH_W / 2, by + 18), 'Message sales on WhatsApp', 12, 's', PAPER, anchor='mm')

# ---------------- phone 2 : action required
P2X = AX + PH_W + 46
phone(P2X, PH_Y, 'Customer  ·  their approval is blocking us')
phone_head(P2X, PH_Y, 'Order #MP-2431')

ay = PH_Y + 96
rr((P2X + 14, ay, P2X + PH_W - 14, ay + 132), 12, fill=AMBSOFT, outline=(240, 214, 160), w=1.5)
circle(P2X + 40, ay + 30, 12, fill=AMBER)
txt((P2X + 40, ay + 30), '!', 15, 'b', WHITE, anchor='mm')
txt((P2X + 62, ay + 17), 'Your approval is needed', 13, 'b', (140, 88, 6))
txt((P2X + 62, ay + 36), 'The sample is ready to review', 11, 'r', (166, 122, 46))
for i in range(3):
    tx = P2X + 26 + i * 76
    rr((tx, ay + 56, tx + 66, ay + 102), 8, fill=(228, 216, 198))
    circle(tx + 33, ay + 74, 8, outline=(178, 165, 148), w=1.5)
    txt((tx + 33, ay + 90), 'sample %d' % (i + 1), 9, 'r', (150, 138, 122), anchor='mm')
txt((P2X + 26, ay + 113), 'Waiting since 2 Aug, 11:20  ·  2 days', 10, 's', (166, 122, 46))

ry = ay + 148
rr((P2X + 14, ry, P2X + PH_W - 14, ry + 40), 20, fill=LEAF)
check(P2X + 46, ry + 20, 8, WHITE, 2.4)
txt((P2X + PH_W / 2 + 12, ry + 20), 'Approve sample', 13, 'b', WHITE, anchor='mm')
rr((P2X + 14, ry + 48, P2X + PH_W - 14, ry + 84), 18, fill=PAPER, outline=LINE, w=1.5)
txt((P2X + PH_W / 2, ry + 66), 'Request changes', 12, 's', INK, anchor='mm')
txt((P2X + 26, ry + 100), 'Production starts the moment you approve.', 11, 'r', MUTED)

sy2 = ry + 128
mini = [('Artwork approved', 'done'), ('Sample produced', 'done'),
        ('Sample approval', 'block'), ('Plates & printing', 'next'),
        ('Finishing', 'next'), ('Delivery', 'next')]
for i, (name, st) in enumerate(mini):
    yy = sy2 + i * 25
    if i < len(mini) - 1:
        line((P2X + 32, yy + 7), (P2X + 32, yy + 25),
             fill=LEAF if st == 'done' else (222, 217, 210), w=2)
    if st == 'done':
        circle(P2X + 32, yy + 6, 6.5, fill=LEAF); check(P2X + 32, yy + 6, 6.5)
    elif st == 'block':
        circle(P2X + 32, yy + 6, 10, fill=(250, 231, 197))
        circle(P2X + 32, yy + 6, 6.5, fill=AMBER)
    else:
        circle(P2X + 32, yy + 6, 6.5, outline=(206, 200, 192), w=1.5, fill=PAPER)
    txt((P2X + 48, yy + 6), name, 11, 'b' if st == 'block' else 'r',
        INK if st != 'next' else FAINT, anchor='lm')
    if st == 'block':
        chip(P2X + 48 + tw(name, 11, 'b') + 8, yy - 2, 'YOUR TURN', AMBER, WHITE, 9, 6, 2)

fy = PH_Y + PH_H - 74
line((P2X + 26, fy - 14), (P2X + PH_W - 26, fy - 14))
txt((P2X + 26, fy + 4), 'Not sure about something?', 11, 's', INK)
txt((P2X + 26, fy + 22), 'Ask the sales rep handling this order.', 10, 'r', MUTED)
rr((P2X + 14, fy + 40, P2X + PH_W - 14, fy + 70), 15, fill=PAPER, outline=LINE, w=1.5)
txt((P2X + PH_W / 2, fy + 55), 'Message on WhatsApp', 11, 's', INK, anchor='mm')

# ---------------- phone 3 : delivered
P3X = AX + (PH_W + 46) * 2
phone(P3X, PH_Y, 'Customer  ·  order complete')
phone_head(P3X, PH_Y, 'Order #MP-2390')

dy = PH_Y + 96
rr((P3X + 14, dy, P3X + PH_W - 14, dy + 108), 12, fill=LEAFSOFT, outline=(190, 219, 204), w=1.5)
circle(P3X + PH_W / 2, dy + 36, 20, fill=LEAF)
check(P3X + PH_W / 2, dy + 36, 16, WHITE, 3)
txt((P3X + PH_W / 2, dy + 68), 'Delivered', 15, 'b', (30, 82, 60), anchor='mm')
txt((P3X + PH_W / 2, dy + 88), '6 August, 14:10 · received by Ahmed', 10, 'r', (78, 128, 104), anchor='mm')

ty = dy + 128
txt((P3X + 26, ty), 'ORDER SUMMARY', 10, 'b', MUTED)
for i, (k, v) in enumerate([('Product', 'Kraft bags 25×30×8'), ('Quantity', '1,000 pcs'),
                            ('Unit price', 'EGP 8.50'), ('Order total', 'EGP 8,500'),
                            ('Lead time', '9 working days')]):
    yy = ty + 24 + i * 25
    txt((P3X + 26, yy), k, 11, 'r', MUTED)
    txt((P3X + PH_W - 26, yy), v, 11, 's', INK, anchor='ra')
    if i < 4:
        line((P3X + 26, yy + 18), (P3X + PH_W - 26, yy + 18))

ry3 = ty + 168
rr((P3X + 14, ry3, P3X + PH_W - 14, ry3 + 40), 20, fill=ACCENT)
txt((P3X + PH_W / 2, ry3 + 20), 'Reorder this exact job', 13, 'b', WHITE, anchor='mm')
txt((P3X + PH_W / 2, ry3 + 56), 'Same spec, same price — one tap', 11, 'r', MUTED, anchor='mm')

rr((P3X + 14, ry3 + 78, P3X + PH_W - 14, ry3 + 128), 12, fill=TINT)
txt((P3X + PH_W / 2, ry3 + 94), 'How did we do?', 11, 's', INK, anchor='mm')
for i in range(5):
    star(P3X + PH_W / 2 - 48 + i * 24, ry3 + 114, 9, ACCENT if i < 4 else (216, 209, 199))

gy = PH_Y + PH_H - 56
line((P3X + 26, gy - 16), (P3X + PH_W - 26, gy - 16))
txt((P3X + 26, gy + 2), 'Invoice and delivery note', 11, 's', INK)
txt((P3X + PH_W - 26, gy + 3), 'Download PDF', 11, 's', ACCENT2, anchor='ra')
txt((P3X + 26, gy + 26), 'Kept with the order, so a reorder never', 10, 'r', MUTED)
txt((P3X + 26, gy + 40), 'starts from a blank page.', 10, 'r', MUTED)

# ============================================== SECTION B — OPS BOARD
BY = PH_Y + PH_H + 52
txt((AX, BY), 'B', 15, 'b', ACCENT)
txt((AX + 20, BY), 'WHAT MEDIA PRINT SEES', 15, 'b', INK)
txt((AX, BY + 24), 'Every live job on one board. Moving a card is what updates the customer — there is no second system to keep in sync.',
    12, 'r', MUTED)

OX, OY = AX, BY + 74
OW, OH = W - AX * 2, 386
rr((OX, OY, OX + OW, OY + OH), 16, fill=PAPER, outline=LINE, w=1.5)
frame_label(OX, OY - 24, 'Media Print staff  ·  desktop operations board')

rect((OX + 1, OY + 1, OX + OW - 1, OY + 52), fill=TINT)
rr((OX + 1, OY + 1, OX + 40, OY + 52), 8, fill=TINT)
rr((OX + 18, OY + 14, OX + 44, OY + 40), 7, fill=ACCENT)
txt((OX + 31, OY + 27), 'M', 12, 'b', WHITE, anchor='mm')
txt((OX + 56, OY + 27), 'Operations', 14, 'b', INK, anchor='lm')
for i, t in enumerate(['All jobs', 'Needs our action', 'Waiting on customer', 'Overdue']):
    tx = OX + 170 + i * 138
    if i == 0:
        rr((tx - 12, OY + 15, tx + tw(t, 11, 's') + 12, OY + 39), 12, fill=INK)
    txt((tx, OY + 27), t, 11, 's', PAPER if i == 0 else MUTED, anchor='lm')
rr((OX + OW - 250, OY + 14, OX + OW - 70, OY + 40), 13, fill=PAPER, outline=LINE)
txt((OX + OW - 238, OY + 27), 'Search order or customer', 10, 'r', FAINT, anchor='lm')
circle(OX + OW - 44, OY + 27, 13, fill=(214, 209, 202))
txt((OX + OW - 44, OY + 27), 'RS', 10, 'b', (110, 100, 90), anchor='mm')
line((OX, OY + 52), (OX + OW, OY + 52))

for i, (n, lbl, col) in enumerate([('18', 'live jobs', INK), ('4', 'waiting on customer', AMBER),
                                   ('2', 'overdue', RED), ('6', 'due this week', LEAF)]):
    sx = OX + 24 + i * 150
    txt((sx, OY + 74), n, 20, 'b', col)
    txt((sx + tw(n, 20, 'b') + 8, OY + 82), lbl, 11, 'r', MUTED)
line((OX, OY + 110), (OX + OW, OY + 110))

COLS = [('PRE-PRESS', 3), ('SAMPLE', 4), ('PRINTING', 5), ('FINISHING', 3), ('DISPATCH', 3)]
CW, GAP = 262, 12
CX0 = OX + 24
JOBS = {
    0: [('#MP-2455', 'Joviality', 'Cream jar labels · 5,000', 'Artwork due today', AMBER, 'ok')],
    1: [('#MP-2431', 'Carina', 'Garment bags · 3,000', 'Waiting 2 days', AMBER, 'wait'),
        ('#MP-2448', 'Taste Pure', 'Kraft bags · 1,000', 'Sample in progress', MUTED, 'ok')],
    2: [('#MP-2418', 'Nile Roasters', 'Zipper bags · 3,000', 'Printing today', ACCENT, 'now'),
        ('#MP-2402', 'Gomla Market', 'Corrugated · 2,000', 'Overdue by 1 day', RED, 'late')],
    3: [('#MP-2396', 'Sleekz', 'Hang tags · 4,000', 'Die-cut · today', MUTED, 'ok')],
    4: [('#MP-2390', 'Klevy', 'Kraft bags · 1,000', 'Courier booked', LEAF, 'ok')],
}
for ci, (cname, count) in enumerate(COLS):
    cx = CX0 + ci * (CW + GAP)
    txt((cx, OY + 128), cname, 10, 'b', MUTED)
    chip(cx + tw(cname, 10, 'b') + 8, OY + 122, str(count), (226, 221, 214), (110, 100, 90), 9, 6, 2)
    rr((cx, OY + 146, cx + CW, OY + OH - 20), 12, fill=(243, 240, 235))
    for ji, (num, cust, prod, note, col, kind) in enumerate(JOBS.get(ci, [])):
        jy = OY + 156 + ji * 92
        bg = REDSOFT if kind == 'late' else (AMBSOFT if kind == 'wait' else PAPER)
        bd = RED if kind == 'late' else (AMBER if kind == 'wait' else (ACCENT if kind == 'now' else LINE))
        rr((cx + 8, jy, cx + CW - 8, jy + 80), 10, fill=bg, outline=bd, w=1.5 if kind != 'ok' else 1)
        txt((cx + 20, jy + 13), num, 11, 'b', INK)
        txt((cx + CW - 20, jy + 13), cust, 11, 'r', MUTED, anchor='ra')
        txt((cx + 20, jy + 33), prod, 11, 'r', INK)
        circle(cx + 24, jy + 60, 4, fill=col)
        txt((cx + 34, jy + 60), note, 10, 's', col, anchor='lm')
        if kind == 'now':
            chip(cx + CW - 90, jy + 52, 'ADVANCE', ACCENT, WHITE, 9, 8, 3)
    shown = len(JOBS.get(ci, []))
    if count > shown:
        my = OY + 156 + shown * 92
        rr((cx + 8, my, cx + CW - 8, my + 34), 10, fill=(236, 232, 226))
        txt((cx + CW / 2, my + 17), '+ %d more in this phase' % (count - shown),
            10, 's', (140, 132, 124), anchor='mm')

# ============================================== SECTION C — PIPELINE
CY = OY + OH + 46
txt((AX, CY), 'C', 15, 'b', ACCENT)
txt((AX + 20, CY), 'THE PIPELINE', 15, 'b', INK)
txt((AX + 20 + tw('THE PIPELINE', 15, 'b') + 16, CY + 2),
    'Twelve phases. The two marked in amber are gates where the job stops until the customer acts — the whole point of the tracker.',
    12, 'r', MUTED)

py = CY + 40
px = AX
FLOW = [('Order\nconfirmed', 'n'), ('Artwork &\npre-press', 'n'), ('Artwork\napproved', 'g'),
        ('Sample\nproduced', 'n'), ('Sample\napproved', 'g'), ('Plates &\ntooling', 'n'),
        ('Printing', 'n'), ('Finishing\n& die-cut', 'n'), ('Quality\ncheck', 'n'),
        ('Packed', 'n'), ('Out for\ndelivery', 'n'), ('Delivered', 'd')]
BW = (W - AX * 2 - 11 * 14) / 12
for i, (name, kind) in enumerate(FLOW):
    bx = px + i * (BW + 14)
    if kind == 'g':
        rr((bx, py, bx + BW, py + 62), 10, fill=AMBSOFT, outline=AMBER, w=1.5)
        col = (140, 88, 6)
    elif kind == 'd':
        rr((bx, py, bx + BW, py + 62), 10, fill=LEAF)
        col = WHITE
    else:
        rr((bx, py, bx + BW, py + 62), 10, fill=PAPER, outline=LINE, w=1.5)
        col = INK
    d.multiline_text(((bx + BW / 2) * S, (py + 31) * S), name, font=f(11, 's'),
                     fill=col, anchor='mm', align='center', spacing=4 * S)
    if kind == 'g':
        chip(bx + BW / 2 - 30, py + 68, 'CUSTOMER', AMBER, WHITE, 9, 7, 2)
    if i < 11:
        ax0 = bx + BW + 3
        line((ax0, py + 31), (ax0 + 8, py + 31), fill=(196, 189, 180), w=1.5)
        d.polygon([((ax0 + 8) * S, (py + 27) * S), ((ax0 + 8) * S, (py + 35) * S),
                   ((ax0 + 12) * S, (py + 31) * S)], fill=(196, 189, 180))

txt((AX, H - 34), 'Concept mockup for discussion · Media Print Pack · not a live system',
    11, 'r', (150, 143, 136))

img.save('D:/mediaprint/docs/order-tracking-concept.png')
img.convert('RGB').save('D:/mediaprint/docs/order-tracking-concept.jpg', quality=93)
print('saved', img.size)
