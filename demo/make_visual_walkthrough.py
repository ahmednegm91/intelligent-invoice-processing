"""Render a self-contained, SILENT screen-based walkthrough from supplied screenshots.
No external services. Requires Pillow, PyMuPDF, numpy, opencv-python and FFmpeg.
This is not a live recording of running n8n.
"""
from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import cv2
import fitz
import subprocess

ROOT=Path(__file__).resolve().parents[1]
DEMO=ROOT/'demo'
OUT=DEMO/'invoice-processing-visual-walkthrough.mp4'
STORY=DEMO/'storyboard'
STORY.mkdir(parents=True,exist_ok=True)
WIDTH,HEIGHT=1280,720
FPS=24
BG='#071420'; CARD='#122333'; WHITE='#F3F9FD'; MUTED='#9FBDCD'; ACCENT='#47E6C1'; CYAN='#75D4F0'; WARNING='#FFD384'
FONT_DIR=Path('/usr/share/fonts/opentype/inter')

def font(sz,bold=False):
    if bold:
        for name in ['Inter-Bold.otf','Inter-SemiBold.otf']:
            if (FONT_DIR/name).exists():return ImageFont.truetype(str(FONT_DIR/name),sz)
    return ImageFont.truetype(str(FONT_DIR/'Inter-Regular.otf'),sz)

F_TINY=font(17); F_BODY=font(23); F_SUB=font(28); F_HEAD=font(44,True); F_HUGE=font(66,True); F_MINI=font(14); F_LABEL=font(19,True)

def base(page):
    im=Image.new('RGB',(WIDTH,HEIGHT),BG)
    px=im.load()
    for y in range(HEIGHT):
        for x in range(WIDTH):
            dx=(x-WIDTH*.82)/WIDTH;dy=(y-HEIGHT*.18)/HEIGHT
            glow=max(0,1-math.sqrt(dx*dx+dy*dy)*1.8)
            px[x,y]=(7+int(glow*9),20+int(glow*22),32+int(glow*22))
    d=ImageDraw.Draw(im)
    for x in range(0,WIDTH,52):d.line((x,0,x,HEIGHT),fill=(18,36,49),width=1)
    for y in range(0,HEIGHT,52):d.line((0,y,WIDTH,y),fill=(18,36,49),width=1)
    d.rounded_rectangle((48,34,232,67),radius=16,fill=(25,54,63),outline=(35,95,101),width=1)
    d.text((63,42),'n8n  /  PORTFOLIO',font=F_TINY,fill=ACCENT)
    d.text((1160,43),f'{page:02}',font=F_LABEL,fill=MUTED)
    d.line((46,90,1234,90),fill=(45,82,100),width=1)
    return im

def title(im,heading,sub=None):
    d=ImageDraw.Draw(im);d.text((53,108),heading,font=F_HEAD,fill=WHITE)
    if sub: d.text((57,169),sub,font=F_BODY,fill=MUTED)

def card(im,box,fill=CARD,radius=18,outline=(51,78,95)):
    d=ImageDraw.Draw(im)
    d.rounded_rectangle(box,radius=radius,fill=fill,outline=outline,width=1)

def screenshot(im,relative,box):
    pic=Image.open(ROOT/relative).convert('RGB')
    x1,y1,x2,y2=box
    availw=x2-x1;availh=y2-y1
    s=min(availw/pic.width,availh/pic.height)
    pic=pic.resize((round(pic.width*s),round(pic.height*s)),Image.Resampling.LANCZOS)
    ox=x1+(availw-pic.width)//2;oy=y1+(availh-pic.height)//2
    shadow=Image.new('RGBA',im.size,(0,0,0,0));mask=Image.new('L',(pic.width+24,pic.height+24),0)
    md=ImageDraw.Draw(mask);md.rounded_rectangle((12,12,pic.width+11,pic.height+11),radius=15,fill=160)
    shadow.paste((0,0,0,0),(0,0,im.width,im.height));
    large=Image.new('L',im.size,0);large.paste(mask,(ox-12,oy-12))
    shadow.putalpha(large.filter(ImageFilter.GaussianBlur(15)))
    im.paste(Image.alpha_composite(im.convert('RGBA'),shadow).convert('RGB')) if False else None
    im.paste(pic,(ox,oy))
    return ox,oy,ox+pic.width,oy+pic.height

def chip(im,x,y,message,fill=(23,68,68),fg=ACCENT):
    d=ImageDraw.Draw(im)
    tw=d.textbbox((0,0),message,font=F_TINY)[2]
    d.rounded_rectangle((x,y,x+tw+24,y+36),radius=11,fill=fill)
    d.text((x+12,y+8),message,font=F_TINY,fill=fg)

def bottom(im,msg):
    d=ImageDraw.Draw(im);d.line((46,663,1234,663),fill=(42,78,97),width=1)
    d.text((51,676),msg,font=F_TINY,fill=MUTED)
    d.text((996,677),'SYNTHETIC DEMO',font=F_MINI,fill=(110,159,172))

def render_pdf_thumbnail(p):
    doc=fitz.open(ROOT/'samples'/p)
    pix=doc[0].get_pixmap(matrix=fitz.Matrix(1.1,1.1),alpha=False)
    doc.close()
    return Image.frombytes('RGB',[pix.width,pix.height],pix.samples)

slides=[]
im=base(1);d=ImageDraw.Draw(im)
chip(im,54,160,'DOCUMENT AUTOMATION')
d.text((54,235),'INTELLIGENT',font=F_HUGE,fill=WHITE)
d.text((54,318),'INVOICE PROCESSING',font=F_HUGE,fill=ACCENT)
d.text((60,424),'Arabic + English  |  n8n  |  Gemini AI  |  Financial Checks',font=F_SUB,fill=MUTED)
card(im,(58,527,823,602),fill=(15,48,62));d.text((82,549),'Screen-based walkthrough of an actual portfolio prototype',font=F_BODY,fill=WHITE)
bottom(im,'Visual walkthrough - not a live screen recording');slides.append(im)

im=base(2);title(im,'01  /  Invoice intake and routing','File upload, validation, invoice registry and clear user feedback')
card(im,(46,224,1233,589));screenshot(im,'screenshots/main-workflow.PNG',(61,236,1218,576))
chip(im,72,605,'MAIN WORKFLOW');bottom(im,'One document per submission | PDF / JPG / JPEG / PNG');slides.append(im)

im=base(3);title(im,'02  /  Modular AI extraction','A separate PDF/image engine with retry and model fallback')
card(im,(70,221,1210,610));screenshot(im,'screenshots/ai-engine.PNG',(80,239,1200,591))
chip(im,76,616,'PRIMARY + BACKUP MODELS');bottom(im,'Both demo models use Google Gemini; provider-independent fallback is optional');slides.append(im)

im=base(4);title(im,'03  /  Arabic and English invoices','Two realistic but entirely fictional examples')
for img_fn,xpos in [('Invoice_01_English_Bilingual_Valid.pdf',206),('Invoice_02_Arabic_Bilingual_Valid.pdf',770)]:
    thumb=render_pdf_thumbnail(img_fn)
    thumb.thumbnail((388,404),Image.Resampling.LANCZOS)
    card(im,(xpos-26,214,xpos+thumb.width+26,658),radius=14)
    im.paste(thumb,(xpos,226))
    d=ImageDraw.Draw(im)
    d.text((xpos+15,635),'English / Arabic' if '01' in img_fn else 'Arabic / English',font=F_TINY,fill=ACCENT)
bottom(im,'Multilingual field extraction | Western digits (0-9)');slides.append(im)

im=base(5);title(im,'04  /  Deterministic financial checks','Independent arithmetic detects inconsistent totals')
card(im,(66,225,1204,602));
d=ImageDraw.Draw(im)
chip(im,95,252,'SAMPLE INVOICE 03  /  DELIBERATE ERROR',fill=(64,57,33),fg=WARNING)
d.text((104,332),'Printed total',font=F_BODY,fill=MUTED);d.text((100,367),'4,507.30',font=F_HEAD,fill=WARNING)
d.text((610,332),'Expected total',font=F_BODY,fill=MUTED);d.text((609,367),'4,497.30',font=F_HEAD,fill=ACCENT)
d.line((101,462,1156,462),fill=(44,80,98),width=2)
screenshot(im,'screenshots/financial-error.PNG',(333,482,958,578))
chip(im,96,610,'STATUS: NEEDS_REVIEW',fill=(66,56,29),fg=WARNING)
bottom(im,'Calculated subtotal + tax differs from the total printed on the PDF');slides.append(im)

im=base(6);title(im,'05  /  Duplicate detection','Repeated supplier + invoice number? Do not insert a second record.')
card(im,(49,220,1230,606));screenshot(im,'screenshots/duplicate-detection.PNG',(65,230,1211,597))
chip(im,68,610,'DUPLICATE ROUTE');bottom(im,'Lookup-based deduplication | Transactional uniqueness is a production enhancement');slides.append(im)

im=base(7);title(im,'06  /  Error handling and fallback','Clear feedback for invalid files and unrecoverable AI failures')
card(im,(50,218,1230,607));screenshot(im,'screenshots/APIProcessFailed.PNG',(68,237,1210,588))
chip(im,71,609,'UPLOAD LIMIT: 10 MiB',fill=(50,54,37),fg=WARNING)
chip(im,318,609,'EXTENSION / MIME CHECK')
chip(im,624,609,'AI ERROR HANDLER')
bottom(im,'A model error may trigger a backup model; final failures return a clear message');slides.append(im)

im=base(8);title(im,'07  /  Result and pending status','Arithmetic validation is not the same as financial approval')
card(im,(55,227,1223,612));screenshot(im,'screenshots/successful-processing.PNG',(76,248,1204,588))
chip(im,77,609,'PENDING_REVIEW: NOT APPROVED',fill=(50,54,37),fg=WARNING)
bottom(im,'Human / AI approval is an optional future add-on, not implemented here');slides.append(im)

im=base(9);title(im,'08  /  Built for customization','Client-specific extensions are proposed, not included in this demo')
entries=[('APPROVAL OPTIONS','Human / AI / dual review'),('CLOUD OR PRIVATE','Client-controlled data and AI'),('ACCOUNTING / ERP','QuickBooks, Odoo, Xero, etc.'),('AUTOMATED INTAKE','Email, Drive, webhooks'),('ADVANCED CONTROLS','PO matching, VAT, audit logs'),('ANALYTICS','Dashboards, exceptions, costs')]
for i,(head,sub) in enumerate(entries):
    col=i%2;row=i//2
    x=59+col*590;y=234+row*127
    card(im,(x,y,x+558,y+104),fill=(18,43,56),radius=18)
    d=ImageDraw.Draw(im);d.ellipse((x+22,y+29,x+34,y+41),fill=ACCENT)
    d.text((x+50,y+21),head,font=F_LABEL,fill=ACCENT)
    d.text((x+50,y+57),sub,font=F_TINY,fill=WHITE)
bottom(im,'Features require separate scoping, integration, security and acceptance tests');slides.append(im)

im=base(10);d=ImageDraw.Draw(im)
d.text((70,176),'MODULAR.',font=F_HUGE,fill=WHITE)
d.text((70,266),'MULTILINGUAL.',font=F_HUGE,fill=ACCENT)
d.text((70,356),'EXTENSIBLE.',font=F_HUGE,fill=WHITE)
d.text((77,497),'Ahmed Negm  |  AI Automation & n8n Workflows',font=F_SUB,fill=MUTED)
chip(im,78,562,'PORTFOLIO DEMONSTRATION  /  FICTIONAL INVOICES')
bottom(im,'Source exports, bilingual documentation, tests, and sample PDFs are included');slides.append(im)

for i,im in enumerate(slides,1):im.save(STORY/f'scene-{i:02}.png',optimize=True)
# Encode as 24 fps with gentle crossfades, from a single source-aware storyboard.
frame_count_per=5*FPS
fade_n=11
vw=cv2.VideoWriter(str(DEMO/'_visual_temp.mp4'),cv2.VideoWriter_fourcc(*'mp4v'),FPS,(WIDTH,HEIGHT))
if not vw.isOpened():raise RuntimeError('Cannot initialize video writer')
arrays=[np.asarray(im).astype(np.uint8) for im in slides]
frames_out=0
for k,arr in enumerate(arrays):
    for f in range(frame_count_per):
        if k>0 and f<fade_n:
            alpha=f/fade_n
            frame=cv2.addWeighted(arrays[k-1],1-alpha,arr,alpha,0)
        else:frame=arr
        if k==0 and f<10:frame=cv2.convertScaleAbs(frame,alpha=(f+1)/10,beta=0)
        if k==len(arrays)-1 and f>=frame_count_per-12:frame=cv2.convertScaleAbs(frame,alpha=max(0,(frame_count_per-f)/12),beta=0)
        vw.write(cv2.cvtColor(frame,cv2.COLOR_RGB2BGR));frames_out+=1
vw.release()
# Re-encode as H.264 in universally compatible yuv420p MP4. No fabricated narration.
cmd=['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(DEMO/'_visual_temp.mp4'),'-c:v','libx264','-preset','medium','-crf','23','-pix_fmt','yuv420p','-movflags','+faststart','-an',str(OUT)]
subprocess.run(cmd,check=True)
(DEMO/'_visual_temp.mp4').unlink(missing_ok=True)
print(f'Produced {len(slides)} screenshot-based scenes, {frames_out/FPS:.1f} seconds: {OUT.name} ({OUT.stat().st_size/1024/1024:.2f} MiB)')
