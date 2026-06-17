const db = require('../../config/db');
const { logger } = require('../../middleware/logger');

const validateParams = require('../../middleware/validateParams');
const response = require('../../middleware/responseHandler');

exports.getDpjp = async (req, res) => {
  const { no_rawat } = req.query;
  const validateErrors = validateParams(req, res, { no_rawat });
  if (validateErrors) {
    return validateErrors;
  }
  const query =
    'SELECT dpjp_ranap.no_rawat,dpjp_ranap.kd_dokter,dpjp_ranap.pjranap_ke,dokter.nm_dokter FROM dpjp_ranap inner join dokter on dpjp_ranap.kd_dokter = dokter.kd_dokter WHERE dpjp_ranap.no_rawat = ? ORDER BY pjranap_ke ASC';
  const [result] = await db.execute(query, [no_rawat]);
  return response.ok(res, result);
};

exports.inputDpjp = async (req, res) => {
  const { no_rawat, kd_dokter, pjranap_ke } = req.body;

  if (!no_rawat || !Array.isArray(kd_dokter) || !Array.isArray(pjranap_ke)) {
    return response.badRequest(
      req,
      res,
      'Format data tidak valid. kd_dokter dan pjranap_ke harus berupa array.'
    );
  }

  if (kd_dokter.length !== pjranap_ke.length) {
    return response.badRequest(req, res, 'Jumlah dokter dan urutan prioritas tidak sinkron.');
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    await connection.execute('DELETE FROM dpjp_ranap WHERE no_rawat = ?', [no_rawat]);

    const values = kd_dokter.map((kd, index) => [no_rawat, kd, pjranap_ke[index]]);

    const query = 'INSERT INTO dpjp_ranap (no_rawat, kd_dokter, pjranap_ke) VALUES ?';

    await connection.query(query, [values]);

    await connection.commit();
    response.created(res, { message: 'Data DPJP berhasil disinkronkan', count: values.length });
  } catch (error) {
    await connection.rollback();
    logger.error('Transaction Error:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return response.badRequest(req, res, 'Terdapat duplikasi dokter pada nomor rawat ini.');
    }

    return response.internalError(req, res, error, 'Gagal menyimpan data ke server');
  } finally {
    connection.release();
  }
};

exports.updateDpjp = async (req, res) => {
  const { no_rawat, kd_dokter, pjranap_ke } = req.body;

  if (!no_rawat || !Array.isArray(kd_dokter) || !Array.isArray(pjranap_ke)) {
    return response.badRequest(req, res, 'Payload harus berisi array kd_dokter dan pjranap_ke');
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    await connection.execute('DELETE FROM dpjp_ranap WHERE no_rawat = ?', [no_rawat]);

    const values = kd_dokter.map((kd, index) => [no_rawat, kd, pjranap_ke[index]]);

    const query = 'INSERT INTO dpjp_ranap (no_rawat, kd_dokter, pjranap_ke) VALUES ?';
    await connection.query(query, [values]);

    await connection.commit();
    response.ok(res, { message: 'Susunan DPJP berhasil diperbarui' });
  } catch (error) {
    await connection.rollback();
    logger.error('Update Error:', error);
    return response.internalError(req, res, error, 'Gagal memperbarui susunan DPJP');
  } finally {
    connection.release();
  }
};

exports.deleteDpjp = async (req, res) => {
  const { no_rawat, kd_dokter } = req.body;

  if (!no_rawat || !kd_dokter) {
    return response.badRequest(req, res, 'no_rawat dan kd_dokter diperlukan');
  }

  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const [check] = await connection.execute(
      'SELECT * FROM dpjp_ranap WHERE no_rawat = ? AND kd_dokter = ?',
      [no_rawat, kd_dokter]
    );

    if (check.length === 0) {
      await connection.rollback();
      return response.noContent(res);
    }

    await connection.execute('DELETE FROM dpjp_ranap WHERE no_rawat = ? AND kd_dokter = ?', [
      no_rawat,
      kd_dokter,
    ]);
    const [remaining] = await connection.execute(
      'SELECT kd_dokter FROM dpjp_ranap WHERE no_rawat = ? ORDER BY pjranap_ke ASC',
      [no_rawat]
    );

    if (remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        await connection.execute(
          'UPDATE dpjp_ranap SET pjranap_ke = ? WHERE no_rawat = ? AND kd_dokter = ?',
          [(i + 1).toString(), no_rawat, remaining[i].kd_dokter]
        );
      }
    }

    await connection.commit();
    response.ok(res, { message: 'Dokter dihapus dan urutan diperbarui' });
  } catch (error) {
    await connection.rollback();
    logger.error('Delete Error:', error);
    return response.internalError(req, res, error, 'Terjadi kesalahan saat menghapus data');
  } finally {
    connection.release();
  }
};
