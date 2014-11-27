Instalación
===========================
- Correr el servicio de mongodb
- Correr el script App/app.js con el comando "node app.js"
- Correr el script Server/websocket-server.js con el comando "node websocket-server.js"
- Modificar el script que se encuentra en la ruta App/public/js/videocall/video.js
	- En la linea 5: var socket = new WebSocket('ws://10.43.23.208:8000/');
	- Colocar la ip del equipo que ejecuta el script websocket-server.js conservando el puesto 8000
- Para utilizar el login con redes sociales se debe entrar a la aplicación desde localhost:8000