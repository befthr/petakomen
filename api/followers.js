// Jumlah follower @petakomen langsung dari Instagram.
// Token disimpan di Vercel → Settings → Environment Variables → IG_TOKEN (tidak pernah dikirim ke pengunjung).
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  const token = process.env.IG_TOKEN;
  if (!token) {
    res.statusCode = 503;
    return res.end(JSON.stringify({ error: 'IG_TOKEN belum diatur di Vercel' }));
  }
  try {
    const r = await fetch('https://graph.instagram.com/v23.0/me?fields=username,followers_count,media_count&access_token=' + encodeURIComponent(token));
    const j = await r.json();
    if (!r.ok || j.error) {
      res.statusCode = 502;
      return res.end(JSON.stringify({ error: (j.error && j.error.message) || 'Instagram error ' + r.status }));
    }
    // simpan di cache Vercel 10 menit supaya hemat kuota Instagram
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    res.end(JSON.stringify({ username: j.username, followers: j.followers_count, posts: j.media_count, at: new Date().toISOString() }));
  } catch (e) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(e && e.message || e) }));
  }
};
