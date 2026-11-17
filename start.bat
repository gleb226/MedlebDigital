@echo off
title Medleb Digital Start Server
echo Starting Medleb Digital Web Server...
start "Medleb Web Server" cmd /k "npm start"
echo Starting Medleb Digital Telegram Bot...
start "Medleb TG Bot" cmd /k "cd bot && venv\Scripts\activate || python main.py"
echo All services started! You can close this window.
