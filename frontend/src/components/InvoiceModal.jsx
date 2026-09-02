import { useState } from 'react';

const rupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function InvoiceModal({
  invoice,
  onClose,
}) {
  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  const date = invoice.createdAt
    ? new Date(invoice.createdAt).toLocaleString(
        'id-ID',
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        }
      )
    : new Date().toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  async function copyInvoice() {
    if (!invoice?.orderNumber) return;

    try {
      await navigator.clipboard.writeText(
        invoice.orderNumber
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        'Gagal menyalin invoice:',
        error
      );
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Tutup invoice"
        className="absolute inset-0"
        onClick={onClose}
      />

      <section className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[32px] border border-stone-200 bg-[#f8f6f1] shadow-2xl">

        {/* HEADER */}
        <div className="border-b border-stone-200 px-7 py-6">
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[.24em] text-amber-700">
                Rasa Nusa
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                Invoice Pesanan
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-lg text-stone-600 transition hover:bg-stone-100"
            >
              ×
            </button>

          </div>
        </div>

        <div className="px-7 py-6">

          {/* INVOICE + STATUS */}
          <div className="grid grid-cols-2 gap-4 rounded-3xl bg-stone-900 p-5 text-white">

            <div>
              <p className="text-xs uppercase tracking-[.16em] text-stone-400">
                Invoice
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">

                <p className="font-semibold">
                  {invoice.orderNumber}
                </p>

                <button
                  type="button"
                  onClick={copyInvoice}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  {copied ? 'Tersalin' : 'Copy'}
                </button>

              </div>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[.16em] text-stone-400">
                Status
              </p>

              <span className="mt-1 inline-block rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold capitalize text-amber-300">
                {invoice.status}
              </span>
            </div>

          </div>

          {/* INFO SIMPAN INVOICE */}
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">

            <p className="text-sm font-semibold text-amber-900">
              Simpan nomor invoice ini.
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-700">
              Nomor invoice digunakan untuk mengecek
              status pesanan melalui menu{' '}
              <span className="font-semibold">
                Cek Pesanan
              </span>
              .
            </p>

          </div>

          {/* CUSTOMER + DATE */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div>
              <p className="text-xs uppercase tracking-[.16em] text-stone-400">
                Nama Pemesan
              </p>

              <p className="mt-1 font-medium text-stone-900">
                {invoice.customerName}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-[.16em] text-stone-400">
                Waktu
              </p>

              <p className="mt-1 text-sm font-medium text-stone-900">
                {date}
              </p>
            </div>

          </div>

          {/* DETAIL PESANAN */}
          <div className="mt-7">

            <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-700">
              Detail Pesanan
            </p>

            <div className="mt-3 divide-y divide-stone-200 rounded-3xl border border-stone-200 bg-white px-5">

              {(invoice.items || []).map(
                (item, index) => (
                  <div
                    key={
                      item.menuItemId ||
                      index
                    }
                    className="flex justify-between gap-4 py-4"
                  >
                    <div>

                      <p className="font-medium text-stone-900">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        {item.quantity} ×{' '}
                        {rupiah(item.price)}
                      </p>

                    </div>

                    <p className="font-semibold text-stone-900">
                      {rupiah(
                        item.subtotal
                      )}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>

          {/* TOTAL */}
          <div className="mt-5 flex items-center justify-between rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4">

            <div>
              <p className="text-xs uppercase tracking-[.16em] text-amber-700">
                Total
              </p>

              <p className="mt-1 text-sm text-stone-600">
                Sumber:{' '}
                {invoice.source ||
                  'website'}
              </p>
            </div>

            <p className="text-2xl font-semibold text-stone-900">
              {rupiah(
                invoice.totalPrice
              )}
            </p>

          </div>

          {/* REMINDER */}
          <p className="mt-5 text-center text-sm leading-6 text-stone-500">
            Salin dan simpan nomor invoice agar kamu
            dapat mengecek perkembangan pesanan kapan
            saja.
          </p>

          {/* BUTTON SELESAI */}
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-full bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-amber-700"
          >
            Selesai
          </button>

        </div>
      </section>
    </div>
  );
}