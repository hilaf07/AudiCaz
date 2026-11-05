"""Puente local de entrada de audio. No reproduce, graba ni modifica la consola."""
import json
import os
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
import numpy as np
import sounddevice as sd

lock=threading.RLock()
stream=None
session=None
latest=None
last_callback=0.0
last_error=''
label=''
rate=0

# Autoriza únicamente los dominios HTTPS exactos indicados por quien ejecuta el puente.
allowed_sites={x.strip().rstrip('/') for x in os.environ.get('AUDICAZ_ALLOWED_ORIGINS','').split(',') if x.strip()}

def origin_allowed(origin):
    if not origin:return True
    p=urlparse(origin)
    if origin in allowed_sites and p.scheme=='https' and p.hostname and not p.username and not p.password and p.path in ('','/') and not p.query and not p.fragment:return True
    return p.scheme=='http' and p.hostname in ('localhost','127.0.0.1') and p.port in (5173,5174,5175,4173)

def db(value):return float(max(-120.0,min(12.0,20*np.log10(max(float(value),1e-6)))))

def stop_capture():
    global stream,latest,last_callback,session
    if stream is not None:
        stream.stop();stream.close();stream=None
    latest=None;last_callback=0;session=None

def devices():
    apis=sd.query_hostapis()
    return [{'id':i,'name':d['name']+' / '+apis[d['hostapi']]['name'],'maxChannels':int(d['max_input_channels'])} for i,d in enumerate(sd.query_devices()) if d['max_input_channels']>0]

def start_capture(body):
    global stream,session,latest,last_callback,last_error,label,rate
    device=int(body['device']);count=int(body['channels']);token=body['session']
    if not isinstance(token,str) or len(token)>80:raise ValueError('Sesión inválida')
    info=sd.query_devices(device,'input')
    if count<1 or count>18 or count>info['max_input_channels']:raise ValueError('Ese controlador no ofrece la cantidad de entradas solicitada. Selecciona el dispositivo multicanal correcto.')
    sample_rate=float(info['default_samplerate'])
    sd.check_input_settings(device=device,channels=count,samplerate=sample_rate,dtype='float32')
    stop_capture();session=token;label=info['name'];rate=sample_rate;last_error=''
    def callback(indata,frames,timing,status):
        global latest,last_callback,last_error
        # No lock aquí: PortAudio puede esperar durante stop(); asignaciones atómicas de objetos.
        if status:last_error=str(status)
        values=np.nan_to_num(indata,copy=True,nan=0.0,posinf=0.0,neginf=0.0)
        peaks=np.max(np.abs(values),axis=0);rms=np.sqrt(np.mean(values*values,axis=0))
        latest=[{'peak':db(p),'rms':db(r)} for p,r in zip(peaks,rms)]
        last_callback=time.monotonic()
    try:
        stream=sd.InputStream(device=device,channels=count,samplerate=sample_rate,dtype='float32',blocksize=1024,callback=callback)
        stream.start()
    except Exception:
        stop_capture();raise
    return {'started':True,'session':session,'sampleRate':rate,'channels':count}

class Handler(BaseHTTPRequestHandler):
    def log_message(self,*args):pass
    def permitted(self):
        host=self.headers.get('Host','')
        return host in ('127.0.0.1:8765','localhost:8765') and origin_allowed(self.headers.get('Origin'))
    def reply(self,code,data):
        payload=json.dumps(data,allow_nan=False).encode()
        self.send_response(code)
        origin=self.headers.get('Origin')
        if origin and origin_allowed(origin):self.send_header('Access-Control-Allow-Origin',origin)
        self.send_header('Vary','Origin');self.send_header('Cache-Control','no-store')
        self.send_header('Content-Type','application/json');self.send_header('Content-Length',str(len(payload)))
        self.end_headers();self.wfile.write(payload)
    def do_OPTIONS(self):
        if not self.permitted():return self.reply(403,{'error':'Origen no permitido'})
        self.send_response(204);self.send_header('Access-Control-Allow-Origin',self.headers.get('Origin','http://localhost:5173'))
        self.send_header('Access-Control-Allow-Methods','GET, POST, OPTIONS');self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.end_headers()
    def do_GET(self):
        if not self.permitted():return self.reply(403,{'error':'Origen no permitido'})
        try:
            with lock:
                if self.path in ('/','/health'):return self.reply(200,{'status':'ok','service':'AUDICAZ audio bridge','version':2})
                if self.path=='/devices':return self.reply(200,devices())
                if self.path=='/state':
                    active=bool(stream is not None and stream.active and latest is not None and time.monotonic()-last_callback<1.5)
                    return self.reply(200,{'connected':active,'channels':latest if active else [],'session':session,'sampleRate':rate,'label':label,'error':last_error if active else 'Sin muestras recientes. Comprueba el dispositivo y reconecta.'})
            self.reply(404,{'error':'Ruta desconocida'})
        except Exception as exc:self.reply(400,{'error':str(exc)})
    def do_POST(self):
        if not self.permitted():return self.reply(403,{'error':'Origen no permitido'})
        if self.headers.get('Content-Type')!='application/json':return self.reply(415,{'error':'Se requiere JSON'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if not 0<length<=4096:raise ValueError('Solicitud inválida')
            body=json.loads(self.rfile.read(length))
            with lock:
                if self.path=='/start':
                    if stream is not None and body.get('session')!=session:return self.reply(409,{'error':'Ya hay una captura abierta. Desconecta en la otra pestaña o reinicia el puente.'})
                    return self.reply(200,start_capture(body))
                if self.path=='/stop':
                    if body.get('session')==session:stop_capture()
                    return self.reply(200,{'stopped':True})
            self.reply(404,{'error':'Ruta desconocida'})
        except Exception as exc:self.reply(400,{'error':str(exc)})

if __name__=='__main__':
    print('AUDICAZ: puente local en http://127.0.0.1:8765. Ctrl+C para detener.')
    server=ThreadingHTTPServer(('127.0.0.1',8765),Handler)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:
        server.server_close()
        with lock:stop_capture()
