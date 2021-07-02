#Use to create local host
import SimpleHTTPServer
import SocketServer


Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    ".js": "application/javascript",
});

httpd = SocketServer.TCPServer(("", 8000), Handler)

print("Serving at port", 8000)
print(Handler.extensions_map[".js"])
httpd.serve_forever()