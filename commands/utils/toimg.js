import { webp2mp4 } from '../../lib/webp2mp4.js'

export default {
    command: ['toimg', 'tovideo', 'tomp4'],
    category: 'tools',
    run: async (client, m, { usedPrefix, command }) => {
        const q = m.quoted ? m.quoted : m
        const mime = (q.msg || q).mimetype || ''

        if (!/webp/.test(mime)) return client.reply(m.chat, `《✧》 Responde a un sticker.`, m)

        await m.react('🕒')
        try {
            let media = await q.download()
            const isAnimated = q.isAnimated || q.msg?.isAnimated

            if (isAnimated) {
                // Intentamos convertir a video
                try {
                    // Usamos una API directa para evitar problemas de memoria en el contenedor
                    let videoUrl = `https://api.lolhuman.xyz/api/convert/webptomp4?apikey=GataDios&img=${encodeURIComponent(media.toString('base64'))}`
                    
                    await client.sendMessage(m.chat, { 
                        video: { url: videoUrl }, 
                        caption: 'ꕥ *Aquí tienes tu video ฅ^•ﻌ•^ฅ*' 
                    }, { quoted: m })
                    await m.react('✔️')
                } catch (err) {
                    // Si el video falla, enviamos la imagen (fallback)
                    await client.sendMessage(m.chat, { image: media, caption: '⚠️ *No pude procesar el video, pero aquí tienes la imagen:*' }, { quoted: m })
                    await m.react('✔️')
                }
            } else {
                // Sticker estático
                await client.sendMessage(m.chat, { image: media, caption: 'ꕥ *Aquí tienes tu imagen ฅ^•ﻌ•^ฅ*' }, { quoted: m })
                await m.react('✔️')
            }
        } catch (e) {
            console.error(e)
            await m.react('✖️')
            client.reply(m.chat, `《✧》 Error crítico al descargar el sticker.`, m)
        }
    }
}
