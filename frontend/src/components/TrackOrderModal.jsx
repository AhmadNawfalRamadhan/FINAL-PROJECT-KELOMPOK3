import { useState } from 'react';

import { api } from '../utils/api';

const rupiah = (value) =>
  `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

function statusLabel(status) {
  const labels = {
    menunggu: 'Pesanan diterima',
    diproses: 'Sedang disiapkan',
    selesai: 'Pesanan selesai',
    dibatalkan: 'Pesanan dibatalkan',
  };

  return labels[status] || status;
}

function statusClass(status) {
  const classes = {
    menunggu:
      'border-amber-200 bg-amber-50 text-amber-800',

    diproses:
      'border-blue-200 bg-blue-50 text-blue-700',

    selesai:
      'border-green-200 bg-green-50 text-green-700',

    dibatalkan:
      'border-red-200 bg-red-50 text-red-700',
  };

  return (
    classes[status] ||
    'border-stone-200 bg-stone-100 text-stone-700'
  );
}

export default function TrackOrderModal({
  open,
  onClose,
}) {
  const [orderNumber, setOrderNumber] =
    useState('');

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  if (!open) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanOrderNumber =
      orderNumber.trim();

    if (!cleanOrderNumber) {
      setError(
        'Masukkan nomor invoice terlebih dahulu.'
      );

      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const data = await api(
        `/api/orders/track/${encodeURIComponent(
          cleanOrderNumber
        )}`
      );

      setOrder(data);
    } catch (error) {
      setError(
        error.message ||
          'Pesanan tidak ditemukan.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOrderNumber('');
    setOrder(null);
    setError('');
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-stone-200 bg-white p-6 shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
        >
          ×
        </button>

        {/* HEADER */}
        <div className="pr-12">
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-amber-700">
            Tracking Order
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
            Cek status pesanan
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-500">
            Masukkan nomor invoice yang
            kamu dapatkan setelah melakukan
            pemesanan.
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="mt-6"
        >
          <label
            htmlFor="orderNumber"
            className="text-sm font-medium text-stone-700"
          >
            Nomor Invoice
          </label>

          <input
            id="orderNumber"
            type="text"
            value={orderNumber}
            onChange={(event) => {
              setOrderNumber(
                event.target.value
              );

              setError('');
            }}
            placeholder="Contoh: INV-20260902-69060"
            className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-600 focus:ring-2 focus:ring-amber-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full rounded-2xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Mengecek...'
              : 'Cek Pesanan'}
          </button>
        </form>

        {/* ERROR */}
        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ORDER RESULT */}
        {order && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200">

            {/* ORDER HEADER */}
            <div className="bg-stone-50 p-5">

              <div className="flex flex-wrap items-start justify-between gap-3">

                <div>
                  <p className="text-xs font-medium uppercase tracking-[.16em] text-stone-400">
                    Nomor Invoice
                  </p>

                  <p className="mt-1 font-semibold text-stone-900">
                    {order.orderNumber}
                  </p>
                </div>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass(
                    order.status
                  )}`}
                >
                  {statusLabel(
                    order.status
                  )}
                </span>

              </div>

            </div>

            {/* ORDER DETAIL */}
            <div className="p-5">

              <div>
                <p className="text-xs uppercase tracking-[.15em] text-stone-400">
                  Pelanggan
                </p>

                <p className="mt-1 font-medium text-stone-900">
                  {order.customerName}
                </p>
              </div>

              {/* ITEMS */}
              <div className="mt-5 border-t border-stone-200 pt-5">

                <p className="text-xs uppercase tracking-[.15em] text-stone-400">
                  Detail Pesanan
                </p>

                <div className="mt-3 space-y-3">

                  {order.items?.length >
                  0 ? (
                    order.items.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-4"
                        >
                          <div>
                            <p className="text-sm font-medium text-stone-800">
                              {item
                                .menuItem
                                ?.name ||
                                'Menu'}
                            </p>

                            <p className="mt-1 text-xs text-stone-500">
                              {
                                item.quantity
                              }{' '}
                              ×{' '}
                              {rupiah(
                                item.price
                              )}
                            </p>
                          </div>

                          <p className="text-sm font-medium text-stone-900">
                            {rupiah(
                              item.subtotal
                            )}
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-sm text-stone-500">
                      Detail menu tidak
                      tersedia.
                    </p>
                  )}

                </div>

              </div>

              {/* TOTAL */}
              <div className="mt-5 flex items-center justify-between border-t border-stone-200 pt-5">

                <span className="font-medium text-stone-600">
                  Total
                </span>

                <span className="text-lg font-semibold text-stone-900">
                  {rupiah(
                    order.totalPrice
                  )}
                </span>

              </div>

              {/* STATUS INFO */}
              <div className="mt-5 rounded-2xl bg-stone-50 p-4">

                <p className="text-xs uppercase tracking-[.15em] text-stone-400">
                  Status Saat Ini
                </p>

                <p className="mt-1 font-semibold text-stone-900">
                  {statusLabel(
                    order.status
                  )}
                </p>

                <p className="mt-1 text-sm leading-6 text-stone-500">

                  {order.status ===
                    'menunggu' &&
                    'Pesanan sudah masuk dan menunggu diproses oleh restoran.'}

                  {order.status ===
                    'diproses' &&
                    'Pesanan sedang disiapkan oleh restoran.'}

                  {order.status ===
                    'selesai' &&
                    'Pesanan sudah selesai diproses.'}

                  {order.status ===
                    'dibatalkan' &&
                    'Pesanan telah dibatalkan.'}

                </p>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}