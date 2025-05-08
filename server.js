import express from 'express';
import { exec } from 'child_process';
import util from 'util';

const app = express();
const execAsync = util.promisify(exec); // ✅ Fix untuk line 29

app.use(express.json());

app.post('/download', async (req, res) => {
  try {
    const { url, quality = '720p' } = req.body;

    if (!url?.includes('dailymotion.com')) {
      return res.status(400).json({ error: 'URL tidak valid!' });
    }

    const qualityMap = {
      '360p': 'best[height<=360]',
      '480p': 'best[height<=480]',
      '720p': 'best[height<=720]',
      '1080p': 'best[height<=1080]',
      'best': 'best'
    };

    const selectedQuality = qualityMap[quality] || 'best';
    const command = './yt-dlp --force-ipv4 --geo-bypass -f "${selectedQuality}" -g "${url}"';

    console.log('executing: ${command}');

    // ✅ Solusi untuk line 29:
    const { stdout, stderr } = await execAsync(command); 
    const downloadUrl = stdout.trim();

    res.json({ 
      success: true,
      url: downloadUrl,
      quality
    });

  } catch (error) {
    console.error('Error:', error.stderr || error.message);
    res.status(500).json({ 
      error: 'Gagal memproses permintaan',
      details: error.stderr || error.message
    });
  }
});

app.listen(3000, () => console.log('Server berjalan di port 3000'));