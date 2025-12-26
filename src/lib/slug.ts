/**
 * 将标签转换为 URL 安全的 Base64 编码
 * 使用 Base64 URL-safe 编码，替换 +/= 字符
 */
export function tagToSlug(tag: string): string {
  // 对于纯英文和数字的标签，直接返回
  if (/^[a-zA-Z0-9\-_]+$/.test(tag)) {
    return tag;
  }
  
  // 对于包含中文、空格或特殊字符的标签，使用 Base64 编码
  const encoded = Buffer.from(tag, 'utf8').toString('base64');
  // 使用 URL-safe Base64：替换 + 为 -, / 为 _, 移除 =
  return 'b64_' + encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * 从 slug 恢复原始标签名
 */
export function slugToTag(slug: string): string {
  // 如果不是 Base64 编码的 slug，直接返回
  if (!slug.startsWith('b64_')) {
    return slug;
  }
  
  try {
    // 移除前缀并恢复 Base64 格式
    let base64 = slug.substring(4).replace(/-/g, '+').replace(/_/g, '/');
    
    // 添加必要的 padding
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // 解码
    return Buffer.from(base64, 'base64').toString('utf8');
  } catch (error) {
    // 如果解码失败，返回原始 slug
    return slug;
  }
}