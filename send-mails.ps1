# Reemplaza "ruta/al/archivo.js" con la ruta real del archivo que deseas ejecutar
$rutaArchivo = "C:\Users\Inma\Desktop\enviar_emails\send-emails.js"

Write-Host $rutaArchivo

# Verifica si Node.js está instalado
If (!(Test-Path -Path "C:\Program Files\nodejs\node.exe")) {
  Write-Error "Node.js no está instalado. Instálalo antes de continuar."
  Exit
}

# Ejecuta el archivo .js con Node.js
Start-Process -FilePath "C:\Program Files\nodejs\node.exe" -ArgumentList "node --env-file=.env" $rutaArchivo 

#Cierra los blocks de notas abiertos
taskkill.exe /F /im notepad.exe