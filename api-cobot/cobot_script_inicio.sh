#!/bin/bash
# Iniciar redís
sudo systemctl stop redis-server &
redis-server

# Iniciar Celery
cd /home/aria/Documentos/Dev/cobot-hdi-feature-api-Asynchronism/api-cobot
celery -A api_cobot worker --loglevel=INFO --concurrency=1

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

