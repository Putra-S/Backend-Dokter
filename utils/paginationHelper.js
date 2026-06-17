const parsePagination = (query, defaultLimit = 10) => {
  const limit = Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit);
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const offset = (page - 1) * limit;
  return { limit, page, offset };
};

const buildSimpleOrder = (order, columnExpr, defaultOrder = '') => {
  if (order && ['ASC', 'DESC'].includes(order.toUpperCase())) {
    return ` ORDER BY ${columnExpr} ${order.toUpperCase()}`;
  }
  return defaultOrder ? ` ORDER BY ${defaultOrder}` : '';
};

const buildOrderClause = (orderby, sort, aliasMap, defaultClause) => {
  const validDirections = ['asc', 'desc'];
  if (!orderby) return defaultClause ? ` ORDER BY ${defaultClause}` : '';

  const cols = orderby.split(',').map((c) => c.trim());
  const dirs = sort ? sort.split(',').map((d) => d.trim()) : [];
  const parts = cols
    .filter((col) => aliasMap[col])
    .map((col, i) => {
      const dir = dirs[i] && validDirections.includes(dirs[i]) ? dirs[i] : 'asc';
      return `${aliasMap[col]} ${dir}`;
    });

  return parts.length > 0
    ? ` ORDER BY ${parts.join(', ')}`
    : defaultClause
      ? ` ORDER BY ${defaultClause}`
      : '';
};

module.exports = { parsePagination, buildSimpleOrder, buildOrderClause };
