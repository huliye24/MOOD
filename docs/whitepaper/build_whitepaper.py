"""Build the bilingual MOOD Protocol Paper and its diagram assets.

The Markdown files are the editorial sources. This script creates deterministic
PNG/SVG diagrams, archival LaTeX sources, and locally rendered PDF editions.
"""

from __future__ import annotations

import html
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate, Frame, Image as RLImage, KeepTogether, PageTemplate,
    PageBreak, Paragraph, Spacer,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont


ROOT = Path(__file__).resolve().parent
FIG = ROOT / "figures"
FIG.mkdir(parents=True, exist_ok=True)

INK = "#17212B"
MUTED = "#5B6875"
BLUE = "#2F6BFF"
TEAL = "#20A39E"
GOLD = "#E0A02B"
PALE = "#F3F6FA"
WHITE = "#FFFFFF"


def font(size: int, bold: bool = False):
    choices = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
    ]
    for item in choices:
        if item.exists():
            return ImageFont.truetype(str(item), size)
    return ImageFont.load_default()


def canvas(title: str, subtitle: str):
    image = Image.new("RGB", (1800, 1020), WHITE)
    draw = ImageDraw.Draw(image)
    draw.text((90, 60), title, font=font(48, True), fill=INK)
    draw.text((92, 125), subtitle, font=font(24), fill=MUTED)
    draw.line((90, 175, 1710, 175), fill="#D9E0E8", width=3)
    return image, draw


def rounded(draw, xy, label, fill=PALE, outline="#AAB6C3", width=3, text=INK):
    draw.rounded_rectangle(xy, radius=24, fill=fill, outline=outline, width=width)
    box = draw.textbbox((0, 0), label, font=font(27, True))
    x = (xy[0] + xy[2] - (box[2] - box[0])) / 2
    y = (xy[1] + xy[3] - (box[3] - box[1])) / 2 - 4
    draw.text((x, y), label, font=font(27, True), fill=text)


def arrow(draw, start, end, color=BLUE, width=7):
    draw.line((*start, *end), fill=color, width=width)
    x, y = end
    if abs(end[0] - start[0]) > abs(end[1] - start[1]):
        pts = [(x, y), (x - 22 if x > start[0] else x + 22, y - 14),
               (x - 22 if x > start[0] else x + 22, y + 14)]
    else:
        pts = [(x, y), (x - 14, y - 22 if y > start[1] else y + 22),
               (x + 14, y - 22 if y > start[1] else y + 22)]
    draw.polygon(pts, fill=color)


def save_figure(name: str, image: Image.Image, svg_body: str):
    image.save(FIG / f"{name}.png", quality=95)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1020" '
           f'viewBox="0 0 1800 1020"><rect width="1800" height="1020" fill="white"/>'
           f'{svg_body}</svg>')
    (FIG / f"{name}.svg").write_text(svg, encoding="utf-8")


def make_figures():
    specs = []

    im, d = canvas("From Platform Activity to Protocol State", "Records become portable only when evidence and policy remain attached")
    labels = ["WEB 1\nREAD", "WEB 2\nREAD + WRITE", "AI ERA\nCREATE + COLLABORATE", "MOOD\nVERIFY + REMEMBER"]
    xs = [100, 520, 940, 1360]
    for i, (x, label) in enumerate(zip(xs, labels)):
        rounded(d, (x, 345, x + 330, 570), label, fill=WHITE if i < 3 else "#EAF0FF", outline=BLUE if i == 3 else "#AAB6C3")
        if i < 3:
            arrow(d, (x + 330, 457), (xs[i + 1] - 25, 457), color=TEAL)
    d.text((385, 710), "Platform-owned records", font=font(28), fill=MUTED)
    arrow(d, (755, 728), (1030, 728), color=GOLD)
    d.text((1080, 710), "Evidence-bearing state", font=font(28, True), fill=INK)
    specs.append(("mood-vs-web2", im))

    im, d = canvas("MOOD Protocol Architecture", "Authority flows downward; evidence flows upward")
    layers = [("CANON", "Meaning and boundaries"), ("SPECIFICATION", "Objects, policies, transitions"),
              ("CONTRIBUTION REGISTRY", "Signed claims and evidence commitments"), ("PROOF ENGINE", "Policy-bound verification"),
              ("REPUTATION SNAPSHOTS", "Deterministic derived state"), ("NETWORK + SETTLEMENT", "Replication and optional anchoring")]
    for i, (a, b) in enumerate(layers):
        y = 215 + i * 120
        rounded(d, (290, y, 820, y + 82), a, fill="#EAF0FF" if i < 2 else PALE, outline=BLUE if i < 2 else "#AAB6C3")
        d.text((900, y + 25), b, font=font(25), fill=INK)
        if i < len(layers) - 1:
            arrow(d, (555, y + 82), (555, y + 112), color=TEAL, width=5)
    specs.append(("mood-network-architecture", im))

    im, d = canvas("Contribution Proof Flow", "Proof is a traceable decision path, not a synonym for consensus")
    labels = ["CLAIM", "EVIDENCE", "OBSERVATIONS", "DECISION", "FINALIZED RECORD"]
    xs = [75, 420, 765, 1110, 1455]
    for i, (x, label) in enumerate(zip(xs, labels)):
        rounded(d, (x, 375, x + 270, 555), label, fill="#EAF0FF" if i in (0, 4) else PALE, outline=BLUE if i in (0, 4) else "#AAB6C3")
        if i < 4:
            arrow(d, (x + 270, 465), (xs[i + 1] - 20, 465), color=TEAL)
    d.text((110, 690), "Schema + Signature", font=font(24, True), fill=INK)
    d.text((610, 690), "Verifier + Policy Version", font=font(24, True), fill=INK)
    d.text((1200, 690), "Digest + Audit Trail", font=font(24, True), fill=INK)
    specs.append(("contribution-proof-flow", im))

    im, d = canvas("Reputation as Derived State", "Domain, time, policy and confidence remain visible")
    inputs = ["CODE", "RESEARCH", "DATA", "COMPUTE", "COMMUNITY"]
    for i, label in enumerate(inputs):
        rounded(d, (70, 225 + i * 135, 390, 315 + i * 135), label)
        arrow(d, (390, 270 + i * 135), (650, 515), color="#91A3B5", width=4)
    rounded(d, (650, 390, 1100, 640), "POLICY-BOUND\nAGGREGATION", fill="#EAF0FF", outline=BLUE)
    arrow(d, (1100, 515), (1320, 515), color=TEAL)
    rounded(d, (1320, 390, 1730, 640), "VERSIONED\nSNAPSHOT", fill="#E8F7F5", outline=TEAL)
    d.text((1190, 720), "Reproducible, scoped, non-transferable", font=font(25), fill=MUTED)
    specs.append(("reputation-engine", im))

    im, d = canvas("Human-AI Agent Accountability", "Identity links do not collapse responsibility")
    rounded(d, (100, 390, 420, 600), "HUMAN\nOPERATOR", fill="#FFF6E5", outline=GOLD)
    rounded(d, (740, 250, 1060, 460), "AI AGENT", fill="#EAF0FF", outline=BLUE)
    rounded(d, (740, 610, 1060, 820), "NODE", fill="#E8F7F5", outline=TEAL)
    rounded(d, (1380, 390, 1700, 600), "CONTRIBUTION\nOBJECT", fill=PALE)
    arrow(d, (420, 470), (740, 355), color=GOLD)
    arrow(d, (420, 550), (740, 715), color=GOLD)
    arrow(d, (1060, 355), (1380, 470), color=BLUE)
    arrow(d, (1060, 715), (1380, 550), color=TEAL)
    d.text((450, 300), "authorization + revocation", font=font(22), fill=MUTED)
    d.text((1120, 295), "execution receipt", font=font(22), fill=MUTED)
    specs.append(("ai-agent-network", im))

    im, d = canvas("Optional Settlement Boundary", "Protocol truth is not created by token ownership")
    rounded(d, (120, 300, 650, 680), "MOOD PROTOCOL STATE\n\nContribution objects\nVerification decisions\nReputation snapshots", fill="#EAF0FF", outline=BLUE)
    rounded(d, (1120, 300, 1650, 680), "SETTLEMENT ADAPTERS\n\nDigest anchoring\nAuthorized grants\nExplicit transfers", fill="#FFF6E5", outline=GOLD)
    arrow(d, (650, 490), (1120, 490), color=TEAL)
    d.text((760, 415), "finalized intent", font=font(23, True), fill=INK)
    d.text((755, 545), "human approval gate", font=font(23, True), fill=INK)
    d.line((885, 580, 885, 760), fill="#D34E4E", width=5)
    d.text((665, 795), "No automatic: token -> reputation -> authority", font=font(27, True), fill="#A22F2F")
    specs.append(("blockchain-settlement", im))

    im, d = canvas("Genesis and the First Verifiable Transition", "Independent nodes must derive the same starting digest")
    rounded(d, (90, 320, 520, 700), "GENESIS MANIFEST\n\nProtocol version\nCanon digest\nPolicy set\nNode keys", fill="#FFF6E5", outline=GOLD)
    arrow(d, (520, 510), (740, 510), color=TEAL)
    rounded(d, (740, 365, 1100, 655), "SIGNED\nCONTRIBUTION", fill="#EAF0FF", outline=BLUE)
    arrow(d, (1100, 510), (1320, 510), color=TEAL)
    rounded(d, (1320, 365, 1710, 655), "EPOCH 1\nSNAPSHOT DIGEST", fill="#E8F7F5", outline=TEAL)
    d.text((660, 790), "Node A = Node B = Node C", font=font(35, True), fill=INK)
    specs.append(("genesis-state", im))

    for name, image in specs:
        # The SVG is a source companion; the publication PDF embeds the high-res PNG.
        save_figure(name, image, f'<image href="{name}.png" width="1800" height="1020"/>')


def register_fonts():
    candidates = {
        "MoodSerif": "C:/Windows/Fonts/georgia.ttf",
        "MoodSerifBold": "C:/Windows/Fonts/georgiab.ttf",
        "MoodCJK": "C:/Windows/Fonts/msyh.ttc",
        "MoodCJKBold": "C:/Windows/Fonts/msyhbd.ttc",
        "MoodMono": "C:/Windows/Fonts/consola.ttf",
    }
    for name, path in candidates.items():
        if Path(path).exists():
            pdfmetrics.registerFont(TTFont(name, path, subfontIndex=0))


def parse_markdown(path: Path):
    raw = path.read_text(encoding="utf-8")
    raw = re.sub(r"^---\n.*?\n---\n", "", raw, flags=re.S)
    blocks = []
    in_code = False
    code = []
    paragraph = []

    def flush():
        nonlocal paragraph
        if paragraph:
            blocks.append(("p", " ".join(x.strip() for x in paragraph)))
            paragraph = []

    for line in raw.splitlines():
        if line.startswith("```"):
            flush()
            if in_code:
                blocks.append(("code", "\n".join(code)))
                code = []
            in_code = not in_code
            continue
        if in_code:
            code.append(line)
            continue
        if not line.strip():
            flush()
        elif line.startswith("!["):
            flush()
            m = re.match(r"!\[(.*?)\]\((.*?)\)", line)
            if m:
                blocks.append(("image", (m.group(1), m.group(2))))
        elif line.startswith("# "):
            flush(); blocks.append(("h1", line[2:]))
        elif line.startswith("## "):
            flush(); blocks.append(("h2", line[3:]))
        elif line.startswith("**Keywords:") or line.startswith("**关键词："):
            flush(); blocks.append(("keywords", line.replace("**", "")))
        elif line.startswith("\\[") or (paragraph and paragraph[0].startswith("\\[")):
            paragraph.append(line)
            if line.endswith("\\]"):
                flush()
        else:
            paragraph.append(line)
    flush()
    return blocks


def inline_markup(text: str):
    text = text.replace("\\(", "").replace("\\)", "")
    text = text.replace("\\rightarrow", "→").replace("\\in", "∈").replace("\\sum", "Σ")
    text = text.replace("\\delta", "δ").replace("\\tau", "τ")
    text = re.sub(r"\\([A-Za-z]+)", r"\1", text)
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    text = re.sub(r"`(.+?)`", r"<font name='MoodMono'>\1</font>", text)
    text = text.replace("\\[", "").replace("\\]", "")
    return text


class PaperDoc(BaseDocTemplate):
    def __init__(self, filename, title, lang):
        super().__init__(filename, pagesize=A4, leftMargin=24*mm, rightMargin=24*mm,
                         topMargin=24*mm, bottomMargin=22*mm, title=title, author="MOOD Project Contributors")
        self.paper_title = title
        self.lang = lang
        frame = Frame(self.leftMargin, self.bottomMargin, self.width, self.height, id="main")
        self.addPageTemplates(PageTemplate(id="paper", frames=frame, onPage=self.decorate))

    def decorate(self, canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#D9E0E8"))
        canvas.line(24*mm, 18*mm, A4[0]-24*mm, 18*mm)
        canvas.setFont("MoodCJK" if self.lang == "cn" else "MoodSerif", 8)
        canvas.setFillColor(colors.HexColor(MUTED))
        canvas.drawString(24*mm, 12*mm, "MOOD PROTOCOL PAPER · v0.1 DRAFT")
        canvas.drawRightString(A4[0]-24*mm, 12*mm, str(doc.page))
        canvas.restoreState()


def build_pdf(md: Path, pdf: Path, lang: str):
    serif = "MoodCJK" if lang == "cn" else "MoodSerif"
    bold = "MoodCJKBold" if lang == "cn" else "MoodSerifBold"
    styles = getSampleStyleSheet()
    body = ParagraphStyle("Body", parent=styles["BodyText"], fontName=serif, fontSize=9.4,
                          leading=14.2, alignment=TA_LEFT if lang == "cn" else TA_JUSTIFY, textColor=colors.HexColor(INK),
                          spaceAfter=7)
    h1 = ParagraphStyle("H1", parent=body, fontName=bold, fontSize=17, leading=22,
                        spaceBefore=13, spaceAfter=8, textColor=colors.HexColor(INK))
    h2 = ParagraphStyle("H2", parent=body, fontName=bold, fontSize=13, leading=18,
                        spaceBefore=10, spaceAfter=6, textColor=colors.HexColor(BLUE))
    cap = ParagraphStyle("Caption", parent=body, fontSize=7.8, leading=11, alignment=TA_CENTER,
                         textColor=colors.HexColor(MUTED), spaceAfter=9)
    code_style = ParagraphStyle("Code", parent=body, fontName="MoodMono", fontSize=7.3, leading=10,
                                leftIndent=8, rightIndent=8, borderColor=colors.HexColor("#D9E0E8"),
                                borderWidth=0.5, borderPadding=7, backColor=colors.HexColor(PALE))
    story = []
    title = "MOOD 协议" if lang == "cn" else "MOOD Protocol"
    subtitle = "一个基于贡献证明的人机协作网络" if lang == "cn" else "A Contribution-Based Network for Human-AI Collaboration"
    story += [Spacer(1, 35*mm), Paragraph(title, ParagraphStyle("Title", parent=h1, fontSize=30, leading=36, alignment=TA_CENTER)),
              Spacer(1, 6*mm), Paragraph(subtitle, ParagraphStyle("Sub", parent=body, fontName=bold, fontSize=16, leading=23, alignment=TA_CENTER)),
              Spacer(1, 15*mm), Paragraph("Protocol Paper · v0.1 Draft · 2026-09-02", ParagraphStyle("Meta", parent=body, alignment=TA_CENTER, textColor=colors.HexColor(MUTED))),
              Spacer(1, 55*mm), Paragraph("MOOD Project Contributors", ParagraphStyle("Author", parent=body, fontName=bold, alignment=TA_CENTER)), PageBreak()]
    for kind, value in parse_markdown(md):
        if kind == "h1":
            story.append(Paragraph(inline_markup(value), h1))
        elif kind == "h2":
            story.append(Paragraph(inline_markup(value), h2))
        elif kind == "keywords":
            story.append(Paragraph(f"<b>{inline_markup(value)}</b>", body))
        elif kind == "p":
            story.append(Paragraph(inline_markup(value), body))
        elif kind == "code":
            story.append(Paragraph(html.escape(value).replace("\n", "<br/>"), code_style))
            story.append(Spacer(1, 3*mm))
        elif kind == "image":
            caption, rel = value
            image_path = ROOT / rel
            if image_path.exists():
                image = RLImage(str(image_path), width=160*mm, height=90.67*mm)
                story.append(KeepTogether([Spacer(1, 3*mm), image, Paragraph(inline_markup(caption), cap)]))
    PaperDoc(str(pdf), title + ": " + subtitle, lang).build(story)


def make_tex(md: Path, tex: Path, lang: str):
    body = md.read_text(encoding="utf-8")
    body = re.sub(r"^---\n.*?\n---\n", "", body, flags=re.S)
    body = body.replace("&", r"\&").replace("%", r"\%").replace("#", r"\#")
    body = re.sub(r"^# (.+)$", r"\\section{\1}", body, flags=re.M)
    body = re.sub(r"^## (.+)$", r"\\subsection{\1}", body, flags=re.M)
    body = re.sub(r"!\[(.*?)\]\((.*?)\)", r"\\begin{figure}[ht]\\centering\\includegraphics[width=.94\\linewidth]{\2}\\caption{\1}\\end{figure}", body)
    preamble = r"""\documentclass[10pt,a4paper]{article}
\usepackage[margin=24mm]{geometry}
\usepackage{graphicx,amsmath,hyperref,xurl}
\usepackage{fontspec}
"""
    if lang == "cn":
        preamble += "\\usepackage{xeCJK}\n\\setCJKmainfont{Microsoft YaHei}\n"
    preamble += r"""\setmainfont{Georgia}
\title{MOOD Protocol Paper v0.1 Draft}
\author{MOOD Project Contributors}
\date{2026-09-02}
\begin{document}
\maketitle
"""
    tex.write_text(preamble + body + "\n\\end{document}\n", encoding="utf-8")


def main():
    register_fonts()
    make_figures()
    for suffix, lang in (("EN", "en"), ("CN", "cn")):
        md = ROOT / f"MOOD_Protocol_Whitepaper_{suffix}.md"
        make_tex(md, ROOT / f"MOOD_Protocol_Whitepaper_{suffix}.tex", lang)
        build_pdf(md, ROOT / f"MOOD_Protocol_Whitepaper_{suffix}.pdf", lang)
    print("Built bilingual MOOD Protocol Paper and seven figures.")


if __name__ == "__main__":
    main()
