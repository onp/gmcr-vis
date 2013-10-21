import http.server
import socketserver
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000

Handler = http.server.CGIHTTPRequestHandler

#httpd = socketserver.TCPServer(("",PORT),Handler)
httpd = http.server.HTTPServer(("",PORT),Handler)

print("now serving:   " + os.getcwd())

httpd.serve_forever()