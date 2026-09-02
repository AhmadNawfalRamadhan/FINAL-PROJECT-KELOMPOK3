import { useEffect, useMemo, useState } from 'react';

const rupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export default function CartDrawer({
  open,
  setOpen,
  cart,
  setCart,
  updateQuantity,
  removeFromCart,
  onCheckout,
  checkoutLoading,
  checkoutError,
}) {
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (!open) setCustomerName('');
  }, [open]);

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      ),
    [cart]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Tutup keranjang"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#f8f6f1] shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-amber-700">
              Pesanan
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-stone-900">Keranjang</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-lg transition hover:bg-stone-100"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="flex min-h-[350px] h-full items-center justify-center">
              <div className="max-w-xs text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-200 text-2xl">
                  ◻
                </div>
                <h3 className="mt-5 text-lg font-semibold text-stone-900">
                  Keranjang masih kosong
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Pilih menu yang kamu inginkan lalu tambahkan ke keranjang.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-5 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Pilih Menu
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => {
                const subtotal = Number(item.price) * Number(item.quantity);
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[.15em] text-amber-700">
                          {item.category}
                        </p>
                        <h3 className="mt-1 truncate text-base font-semibold text-stone-900">
                          {item.name}
                        </h3>
                        <p className="mt-1 text-sm text-stone-500">
                          {rupiah(item.price)} / item
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-medium text-red-500 transition hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-stone-300 bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-l-full text-lg transition hover:bg-stone-200"
                        >
                          -
                        </button>
                        <span className="min-w-10 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center rounded-r-full text-lg transition hover:bg-stone-200"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-stone-400">Subtotal</p>
                        <p className="font-semibold text-stone-900">{rupiah(subtotal)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setCart([])}
                className="w-full rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
              >
                Kosongkan Keranjang
              </button>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-stone-200 bg-white px-6 py-5">
            <label className="block text-sm font-medium text-stone-700">
              Nama pemesan
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Masukkan nama"
                className="mt-2 w-full rounded-2xl border border-stone-300 px-4 py-3 outline-none transition focus:border-stone-500"
              />
            </label>

            {checkoutError && (
              <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {checkoutError}
              </div>
            )}

            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500">Total Pesanan</p>
                <p className="mt-1 text-xs text-stone-400">Harga dihitung dari database</p>
              </div>
              <p className="text-xl font-semibold text-stone-900">{rupiah(total)}</p>
            </div>

            <button
              onClick={() => onCheckout(customerName)}
              disabled={checkoutLoading || !customerName.trim()}
              className="mt-5 w-full rounded-full bg-stone-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checkoutLoading ? 'Memproses...' : 'Checkout Sekarang'}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
