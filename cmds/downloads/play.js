import fetch from 'node-fetch'
import yts from 'yt-search'

export default {
  command: ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4'],
  category: 'downloader',
  run: async (client, m, { args, command, text }) => {
    let query = text || args.join(" ")
    
    if (!query || query.trim() === "") {
      return m.reply(`《✧》 Por favor, ingresa el nombre o link de YouTube.`)
    }

    try {
      await m.react('🌸')

      const videoMatch = query.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const searchQuery = videoMatch ? 'https://youtu.be/' + videoMatch[1] : query
      const search = await yts(searchQuery)
      const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]

      if (!result) return m.reply('《✧》 No se encontraron resultados.')

      const { title, thumbnail, timestamp, views, url, author } = result

      const info = `
🌸 *𝙻𝚎𝚘𝚗𝚎𝚕 𝚢 𝚂𝚞𝚖𝚒 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚛* 🌸
─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───

🌈 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}
📺 *𝙲𝙰𝙽𝙰𝙻:* ${author.name}
⏳ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${timestamp}
👁️ *𝚅𝙸𝚂𝚃𝙰𝚂:* ${views.toLocaleString()}
🔗 *𝙻𝙸𝙽𝙺:* ${url}

─── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ───
> ✨ *¡𝐏𝐫𝐨𝐜𝐞𝐬𝐚𝐧𝐝𝐨 𝐭𝐮 𝐚𝐫𝐜𝐡𝐢𝐯𝐨, 𝐞𝐬𝐩𝐞𝐫𝐚!*`.trim()

      await client.sendMessage(m.chat, { 
        image: { url: thumbnail }, 
        caption: info,
        footer: "🌸 𝙻𝚎𝚘𝚗𝚎𝚕 𝚢 𝚂𝚞𝚖𝚒 🌸" 
      }, { quoted: m })

      const isAudio = /play|yta|ytmp3|playaudio/i.test(command)
      const data = await getYouTubeMedia(url, isAudio)
      
      if (!data || !data.download) {
        throw new Error('No se pudo obtener el enlace de descarga.')
      }

      if (isAudio) {
        await client.sendMessage(m.chat, { 
          audio: { url: data.download }, 
          fileName: `${title}.mp3`, 
          mimetype: 'audio/mpeg' 
        }, { quoted: m })
      } else {
        await client.sendMessage(m.chat, { 
          video: { url: data.download }, 
          caption: `🌸 *Aquí tienes tu video*\n> ✨ ${title}`,
          mimetype: 'video/mp4',
          fileName: `${title}.mp4` 
        }, { quoted: m })
      }

      await m.react('💖')

    } catch (e) {
      await m.react('❌')
      await m.reply(`> Ocurrió un error inesperado.\n> [Error: *${e.message}*]`)
    }
  }
}

async function getYouTubeMedia(url, isAudio) {
  const apis = [
    { 
      endpoint: `https://api.delirius.store/download/${isAudio ? 'ytmp3v2' : 'ytmp4'}?url=${encodeURIComponent(url)}`, 
      extractor: res => {
        if (isAudio) {
          return res.success && res.data?.download ? { download: res.data.download } : null
        } else {
          return res.status && res.data?.download ? { download: res.data.download } : null
        }
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const response = await fetch(endpoint, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' }
      })
      const res = await response.json()
      const result = extractor(res)
      if (result) return result
    } catch (err) { }
    await new Promise(r => setTimeout(r, 500))
  }
  return null
}