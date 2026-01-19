/**
 * Maps database errors to user-friendly messages
 * Prevents leaking sensitive database structure information
 */
export function mapDatabaseError(error: unknown): string {
  // Log full error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('Database error:', error);
  }

  // Type guard for error object
  const errorObj = error as { code?: string; message?: string };

  // Map PostgreSQL error codes to user-friendly messages
  if (errorObj.code === '23505') {
    return 'Data ini sudah ada dalam sistem.';
  }
  if (errorObj.code === '23503') {
    return 'Tidak dapat menghapus data yang masih digunakan.';
  }
  if (errorObj.code === '23502') {
    return 'Data yang diperlukan belum lengkap.';
  }
  if (errorObj.code === '42501' || errorObj.message?.includes('RLS')) {
    return 'Anda tidak memiliki akses untuk melakukan operasi ini.';
  }
  if (errorObj.code === '42P01') {
    return 'Terjadi kesalahan konfigurasi. Silakan hubungi administrator.';
  }
  if (errorObj.message?.includes('network') || errorObj.message?.includes('fetch')) {
    return 'Koneksi gagal. Periksa koneksi internet Anda.';
  }

  // Generic fallback - never expose technical details
  return 'Terjadi kesalahan. Silakan coba lagi atau hubungi administrator.';
}
