module.exports = (req, res, next) => {
  const body = req.body || {};
  const kode = body.kode_paket || body.kode;
  const nama = body.nama || body.nm_perawatan;
  const kategori = body.kategori;
  const kode_pj = body.kode_pj || body.kd_pj;
  const kelas = body.kelas;

  if (req.method === 'PUT' && !kode) {
    return res.status(400).json({ error: "Parameter 'kode_paket' atau 'kode' harus diisi!" });
  }

  if (!nama) {
    return res.status(400).json({ error: "Parameter 'nama' atau 'nm_perawatan' harus diisi!" });
  }

  if (!kategori) {
    return res.status(400).json({ error: "Parameter 'kategori' harus diisi!" });
  }

  if (!kode_pj) {
    return res.status(400).json({ error: "Parameter 'kode_pj' atau 'kd_pj' harus diisi!" });
  }

  if (!kelas) {
    return res.status(400).json({ error: "Parameter 'kelas' harus diisi!" });
  }

  return next();
};
