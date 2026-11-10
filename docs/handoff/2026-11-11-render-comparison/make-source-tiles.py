# Rasterise the existing opera-art-pass.js drawTiles pattern; no external imagery.
import math,struct,zlib,pathlib
S=512;N=6;h=S/N/2;q=h-max(.6,(S/512)*.9)
def rnd(i,j):
 v=math.sin(i*127.1+j*311.7)*43758.5453
 return v-math.floor(v)
def png(path,detail):
 pixels=bytearray(S*S*4)
 bg=(96,235,0,255) if detail else (207,200,184,255)
 for k in range(0,len(pixels),4):pixels[k:k+4]=bytes(bg)
 for j in range(2*N+1):
  for i in range(2*N+1):
   if (i+j)&1: continue
   x,y=i*h,j*h;r=rnd(i%(2*N),j%(2*N));v=240+r*12
   c=(int(200+r*40),int(95+r*50),0,255) if detail else (int(v),int(v-4),int(v-14),255)
   for yy in range(max(0,math.floor(y-q)),min(S,math.ceil(y+q+1))):
    for xx in range(max(0,math.floor(x-q)),min(S,math.ceil(x+q+1))):
     if abs(xx+.5-x)+abs(yy+.5-y)<=q:
      k=(yy*S+xx)*4;pixels[k:k+4]=bytes(c)
 raw=b''.join(b'\0'+pixels[y*S*4:(y+1)*S*4] for y in range(S))
 def chunk(tag,data):return struct.pack('>I',len(data))+tag+data+struct.pack('>I',zlib.crc32(tag+data)&0xffffffff)
 pathlib.Path(path).write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',S,S,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
png('trials/janction-opera/source-tiles.png',False)
png('trials/janction-opera/source-tile-detail.png',True)
print('Generated 512px color and data tiles from source algorithm')
