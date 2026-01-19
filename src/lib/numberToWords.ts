const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

function terbilangHelper(n: number): string {
  if (n < 12) {
    return satuan[n];
  } else if (n < 20) {
    return satuan[n - 10] + ' Belas';
  } else if (n < 100) {
    return satuan[Math.floor(n / 10)] + ' Puluh ' + satuan[n % 10];
  } else if (n < 200) {
    return 'Seratus ' + terbilangHelper(n - 100);
  } else if (n < 1000) {
    return satuan[Math.floor(n / 100)] + ' Ratus ' + terbilangHelper(n % 100);
  } else if (n < 2000) {
    return 'Seribu ' + terbilangHelper(n - 1000);
  } else if (n < 1000000) {
    return terbilangHelper(Math.floor(n / 1000)) + ' Ribu ' + terbilangHelper(n % 1000);
  } else if (n < 1000000000) {
    return terbilangHelper(Math.floor(n / 1000000)) + ' Juta ' + terbilangHelper(n % 1000000);
  } else if (n < 1000000000000) {
    return terbilangHelper(Math.floor(n / 1000000000)) + ' Milyar ' + terbilangHelper(n % 1000000000);
  } else if (n < 1000000000000000) {
    return terbilangHelper(Math.floor(n / 1000000000000)) + ' Triliun ' + terbilangHelper(n % 1000000000000);
  }
  return '';
}

export function terbilang(n: number): string {
  if (n === 0) return 'Nol Rupiah';
  const result = terbilangHelper(Math.floor(n)).trim().replace(/\s+/g, ' ');
  return result + ' Rupiah';
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
