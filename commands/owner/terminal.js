import { exec } from 'child_process'

export default {
    command: ['$', 'exec', 'terminal'],
    category: 'owner', // Solo para el dueño
    run: async (client, m, { text, isOwner }) => {
        // 1. Protección: Solo el dueño del bot puede ejecutar comandos de sistema
        if (!isOwner) return client.reply(m.chat, `《✧》 Este comando es solo para mi creador.`, m)
        
        // 2. Verificar si hay texto después del comando
        if (!text) return client.reply(m.chat, `《✧》 Indica el comando a ejecutar. Ej: *$ ls* o *$ npm install ffmpeg*`, m)

        await m.react('💻')

        // 3. Ejecutar el comando en la consola del servidor
        exec(text, (err, stdout, stderr) => {
            // Si hay un error de ejecución (comando mal escrito, etc)
            if (err) {
                return client.reply(m.chat, `*─── [ ERROR ] ───*\n\n\`\`\`${err.message}\`\`\``, m)
            }
            
            // Si hay una salida de error estándar (warnings)
            if (stderr) {
                return client.reply(m.chat, `*─── [ STDERR ] ───*\n\n\`\`\`${stderr}\`\`\``, m)
            }

            // Enviar la respuesta de la consola (stdout)
            if (stdout) {
                client.reply(m.chat, `*─── [ SALIDA ] ───*\n\n\`\`\`${stdout}\`\`\``, m)
            } else {
                client.reply(m.chat, `《✧》 Comando ejecutado con éxito (sin salida de texto).`, m)
            }
        })
    }
}
