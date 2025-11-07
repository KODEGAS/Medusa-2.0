/**
 * Get real client IP address
 * Handles IPv6 loopback (::1) and proxy forwarding
 */
export const getRealIP = (req) => {
  // Check for forwarded IP (from proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, get the first one
    const ips = forwarded.split(',').map(ip => ip.trim());
    return ips[0];
  }

  // Check for real IP header (some proxies use this)
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }

  // Get IP from request
  let ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

  // Convert IPv6 loopback to IPv4
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  // Remove IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip && ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  return ip || 'Unknown';
};

export default getRealIP;
