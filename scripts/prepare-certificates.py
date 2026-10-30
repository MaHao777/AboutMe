"""Create raster-only certificate display copies; never publish raw score PDFs.

Run with bundled Python. Redaction is applied in PDF coordinates before rendering.
The temporary document stays in memory; only rendered previews enter public/.
"""
from io import BytesIO
from pathlib import Path
import shutil

from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
import pypdfium2 as pdfium
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'images' / 'certificates'


def render_redacted(page, masks, destination, crop=None):
    width, height = float(page.mediabox.width), float(page.mediabox.height)
    overlay = BytesIO()
    pen = canvas.Canvas(overlay, pagesize=(width, height))
    pen.setFillColorRGB(.88, .90, .91)
    for left, top, right, bottom in masks:
        pen.rect(left * width, (1 - bottom) * height,
                 (right - left) * width, (bottom - top) * height,
                 stroke=0, fill=1)
    pen.save()
    page.merge_page(PdfReader(overlay).pages[0])
    if crop:
        page.cropbox = RectangleObject(crop)
    writer = PdfWriter()
    writer.add_page(page)
    memory = BytesIO()
    writer.write(memory)
    with pdfium.PdfDocument(memory.getvalue()) as document:
        bitmap = document[0].render(scale=min(2.5, 1800 / float(page.cropbox.width)))
        bitmap.to_pil().save(destination)
        bitmap.close()


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    exams = Path('D:/个人信息/英语考试成绩证明')
    # Normalized source-document rectangles; cover full numbers, QR and checks.
    masks = [(.045, .398, .455, .438), (.047, .499, .238, .537),
             (.045, .705, .306, .741), (.035, .785, .280, .962)]
    for code in ['CET4', 'CET6']:
        page = PdfReader(next(exams.glob(f'{code}*.pdf'))).pages[0]
        height = float(page.mediabox.height)
        width = float(page.mediabox.width)
        render_redacted(page, masks, OUT / f'{code.lower()}.png',
                        [0, 0, width * .49, height])

    awards = Path('D:/个人信息/奖项证明')
    # Treat the scanned certificate as a document and mask both identifier rows.
    image = ImageReader(str(next((awards / '蓝桥杯').glob('*省一.jpg'))))
    width, height = image.getSize()
    document = BytesIO()
    pen = canvas.Canvas(document, pagesize=(width, height))
    pen.drawImage(image, 0, 0, width, height)
    pen.save()
    render_redacted(PdfReader(document).pages[0],
                    [(.22, .570, .78, .638)], OUT / 'lanqiao-first.png')
    shutil.copyfile(awards / 'OPC大赛' / '金鸡湖OPC大赛获奖证书.jpg', OUT / 'opc.jpg')
    shutil.copyfile(awards / '光电设计竞赛' / '光电设计竞赛获奖证书.jpg', OUT / 'optoelectronics.jpg')
    print('Prepared 5 certificate display copies; raw score PDFs remain external.')


if __name__ == '__main__':
    main()
