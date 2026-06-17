module.exports = (req, res, next) => {
  const body = req.body || {};
  const kode = body.kode || body.kd_jenis_prw;
  const nama = body.nama || body.nm_perawatan;
  const kategori = body.kategori || body.kd_kategori;
  const material = body.material;
  const bhp = body.bhp;
  const tindakandr = body.tindakandr !== undefined ? body.tindakandr : body.tarif_tindakandr;
  const tindakanpr = body.tindakanpr !== undefined ? body.tindakanpr : body.tarif_tindakanpr;
  const kso = body.kso;
  const menejemen = body.menejemen;
  const kode_pj = body.kode_pj || body.kd_pj;
  const kode_poli = body.kode_poli || body.kd_poli;

  if (req.method === 'PUT' && !kode) {
    return res.status(400).json({ error: "Parameter 'kode' atau 'kd_jenis_prw' harus diisi!" });
  }

  if (!nama) {
    return res.status(400).json({ error: "Parameter 'nama' atau 'nm_perawatan' harus diisi!" });
  }

  if (!kategori) {
    return res.status(400).json({ error: "Parameter 'kategori' atau 'kd_kategori' harus diisi!" });
  }

  if (material === undefined) {
    return res.status(400).json({ error: "Parameter 'material' harus diisi!" });
  }

  if (bhp === undefined) {
    return res.status(400).json({ error: "Parameter 'bhp' harus diisi!" });
  }

  if (tindakandr === undefined) {
    return res.status(400).json({ error: "Parameter 'tindakandr' atau 'tarif_tindakandr' harus diisi!" });
  }

  if (tindakanpr === undefined) {
    return res.status(400).json({ error: "Parameter 'tindakanpr' atau 'tarif_tindakanpr' harus diisi!" });
  }

  if (kso === undefined) {
    return res.status(400).json({ error: "Parameter 'kso' harus diisi!" });
  }

  if (menejemen === undefined) {
    return res.status(400).json({ error: "Parameter 'menejemen' harus diisi!" });
  }

  if (!kode_pj) {
    return res.status(400).json({ error: "Parameter 'kode_pj' atau 'kd_pj' harus diisi!" });
  }

  if (!kode_poli) {
    return res.status(400).json({ error: "Parameter 'kode_poli' atau 'kd_poli' harus diisi!" });
  }
  return next();
};
