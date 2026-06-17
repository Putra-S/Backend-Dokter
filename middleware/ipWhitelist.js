const response = require('./responseHandler');

function ipInCIDR(ip, cidr) {
  const [range, bitsStr = '32'] = cidr.split('/');
  const bits = parseInt(bitsStr, 10);
  const mask = ~(2 ** (32 - bits) - 1);
  
  const ipParts = ip.split('.').map(Number);
  const rangeParts = range.split('.').map(Number);
  
  if (ipParts.some(isNaN) || rangeParts.some(isNaN)) return false;
  
  const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const rangeNum = (rangeParts[0] << 24) + (rangeParts[1] << 16) + (rangeParts[2] << 8) + rangeParts[3];
  
  return (ipNum & mask) === (rangeNum & mask);
}

module.exports = async (c, next) => {
  const xForwardedFor = c.req.header('x-forwarded-for');
  let clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : c.req.raw?.socket?.remoteAddress || '127.0.0.1';

  if (clientIp.startsWith('::ffff:')) {
    clientIp = clientIp.substring(7);
  }

  const allowedSubnets = (process.env.DISPLAY_IP_WHITELIST || '127.0.0.1,::1,192.168.0.0/16,10.0.0.0/8,172.16.0.0/12')
    .split(',')
    .map(s => s.trim());

  let isAllowed = false;

  for (const subnet of allowedSubnets) {
    if (subnet === clientIp) {
      isAllowed = true;
      break;
    }
    if (subnet.includes('/')) {
      try {
        if (ipInCIDR(clientIp, subnet)) {
          isAllowed = true;
          break;
        }
      } catch (err) {

      }
    }
  }

  if (!isAllowed) {
    console.warn(`[Blocked Access] IP ${clientIp} mencoba mengakses API display.`);
    return c.json({
      code: 403,
      success: false,
      message: `Akses ditolak: Alamat IP Anda (${clientIp}) berada di luar jaringan lokal Rumah Sakit.`
    }, 403);
  }

  await next();
};
