#!/bin/bash
# Iniciar redís
redis-server

# Iniciar Celery
cd /ruta/a/tu/proyecto
celery -A myapp worker -l info &

# Iniciar Django
python manage.py runserver &

# Iniciar ngrok (reemplaza 'tu_token_ngrok' con tu token real)
#./ngrok authtoken tu_token_ngrok
ngrok http 8000

#Comandos
#Permisos de ejecución
#1. sudo chmod +x /etc/init.d/mi_script_inicio.sh
#Habilitar Script
#2. sudo update-rc.d mi_script_inicio.sh defaults

