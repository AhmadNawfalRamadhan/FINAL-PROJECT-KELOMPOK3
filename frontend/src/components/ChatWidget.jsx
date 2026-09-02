import { useState } from 'react';

import { api } from '../utils/api';

const rupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function ChatWidget({
  open,
  setOpen,
  prefill,
  setPrefill,
  onOrderCreated,
}) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Halo. Tanyakan menu, minta rekomendasi, atau pesan langsung dari sini.',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [pending, setPending] = useState(null);
  const [name, setName] = useState('');

  const [invoice, setInvoice] = useState(null);

  const [copied, setCopied] = useState(false);

  async function send(custom) {
    const text = (custom ?? input).trim();

    if (!text || loading) return;

    setInput('');

    setMessages((items) => [
      ...items,
      {
        role: 'user',
        text,
      },
    ]);

    setLoading(true);

    try {
      const data = await api('/api/chat/message', {
        method: 'POST',

        body: JSON.stringify({
          message: text,
        }),
      });

      setMessages((items) => [
        ...items,
        {
          role: 'ai',
          text: data.reply || 'Baik.',
        },
      ]);

      if (data.requiresConfirmation) {
        setPending(data);
      }
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          role: 'ai',
          text: error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (
      !name.trim() ||
      !pending?.items?.length
    ) {
      return;
    }

    setLoading(true);

    try {
      const data = await api('/api/chat/confirm', {
        method: 'POST',

        body: JSON.stringify({
          customerName: name.trim(),

          items: pending.items.map(
            (item) => ({
              menuItemId:
                item.menuItemId,

              quantity:
                item.quantity,
            })
          ),
        }),
      });

      setInvoice(data.order);

      /*
      |--------------------------------------------------------------------------
      | REFRESH STOK MENU
      |--------------------------------------------------------------------------
      | Setelah order dari AI berhasil dibuat,
      | beri tahu Home.jsx untuk mengambil stok terbaru.
      |--------------------------------------------------------------------------
      */
      if (onOrderCreated) {
        onOrderCreated();
      }

      setMessages((items) => [
        ...items,
        {
          role: 'ai',
          text:
            `Pesanan berhasil dibuat. ` +
            `Simpan nomor invoice ${data.order.orderNumber} untuk mengecek status pesanan.`,
        },
      ]);

      setPending(null);
      setName('');
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          role: 'ai',
          text: error.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function copyInvoice() {
    if (!invoice?.orderNumber) {
      return;
    }

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

  const currentPrefill =
    prefill || '';

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        type="button"
        onClick={() =>
          setOpen(!open)
        }
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-xl text-white shadow-2xl transition hover:bg-amber-700"
        aria-label="Buka AI Assistant"
      >
        ✦
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[620px] max-h-[76vh] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-2xl">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b p-5">

            <div>
              <p className="text-xs uppercase tracking-[.18em] text-amber-700">
                AI Assistant
              </p>

              <h3 className="font-semibold">
                Pesan & Tanya Menu
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="text-sm text-stone-400 hover:text-stone-900"
            >
              Tutup
            </button>

          </div>

          {/* CHAT CONTENT */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-stone-50 p-4">

            {/* MESSAGES */}
            {messages.map(
              (message, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role ===
                    'user'
                      ? 'ml-auto bg-stone-900 text-white'
                      : 'bg-white text-stone-700 shadow-sm'
                  }`}
                >
                  {message.text}
                </div>
              )
            )}

            {/* LOADING */}
            {loading && (
              <div className="text-sm text-stone-400">
                Sedang memproses...
              </div>
            )}

            {/* KONFIRMASI PESANAN */}
            {pending && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm">

                <p className="mb-2 font-semibold">
                  Konfirmasi pesanan
                </p>

                {pending.items.map(
                  (item) => (
                    <div
                      key={
                        item.menuItemId
                      }
                      className="flex justify-between gap-3 py-1"
                    >
                      <span>
                        {item.name} ×{' '}
                        {
                          item.quantity
                        }
                      </span>

                      <span>
                        {rupiah(
                          item.subtotal
                        )}
                      </span>
                    </div>
                  )
                )}

                <div className="mt-2 flex justify-between border-t border-amber-200 pt-2 font-semibold">
                  <span>
                    Total
                  </span>

                  <span>
                    {rupiah(
                      pending.total
                    )}
                  </span>
                </div>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target
                        .value
                    )
                  }
                  placeholder="Nama pemesan"
                  className="mt-3 w-full rounded-xl border bg-white px-3 py-2 outline-none"
                />

                <div className="mt-3 flex gap-2">

                  <button
                    type="button"
                    onClick={confirm}
                    disabled={
                      !name.trim() ||
                      loading
                    }
                    className="flex-1 rounded-xl bg-stone-900 py-2 text-white disabled:opacity-50"
                  >
                    Konfirmasi
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPending(
                        null
                      );

                      setName('');
                    }}
                    className="rounded-xl border px-3"
                  >
                    Batal
                  </button>

                </div>

              </div>
            )}

            {/* INVOICE */}
            {invoice && (
              <div className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">

                {/* INVOICE HEADER */}
                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-700">
                      Invoice
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">

                      <p className="font-semibold text-stone-900">
                        {
                          invoice.orderNumber
                        }
                      </p>

                      <button
                        type="button"
                        onClick={
                          copyInvoice
                        }
                        className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700 transition hover:bg-stone-100"
                      >
                        {copied
                          ? 'Tersalin'
                          : 'Copy'}
                      </button>

                    </div>

                  </div>

                  <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium capitalize text-amber-700">
                    {
                      invoice.status
                    }
                  </span>

                </div>

                {/* ITEMS */}
                <div className="mt-4 space-y-2 border-t border-stone-100 pt-3">

                  {invoice.items?.map(
                    (item) => (
                      <div
                        key={
                          item.menuItemId
                        }
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="text-stone-600">
                          {
                            item.name
                          }{' '}
                          ×{' '}
                          {
                            item.quantity
                          }
                        </span>

                        <span className="font-medium">
                          {rupiah(
                            item.subtotal
                          )}
                        </span>
                      </div>
                    )
                  )}

                </div>

                {/* TOTAL */}
                <div className="mt-3 flex justify-between border-t border-stone-200 pt-3 font-semibold">

                  <span>
                    Total
                  </span>

                  <span>
                    {rupiah(
                      invoice.totalPrice
                    )}
                  </span>

                </div>

                {/* INFO COPY */}
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">

                  <p className="text-sm font-semibold text-amber-900">
                    Simpan nomor invoice ini.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Salin nomor invoice
                    untuk mengecek status
                    pesanan melalui menu{' '}
                    <span className="font-semibold">
                      Cek Pesanan
                    </span>
                    .
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* PREFILL */}
          {currentPrefill && (
            <button
              type="button"
              onClick={() => {
                setInput(
                  currentPrefill
                );

                setPrefill('');
              }}
              className="mx-4 mt-3 rounded-xl bg-amber-50 px-3 py-2 text-left text-xs text-amber-900"
            >
              Gunakan:{' '}
              {currentPrefill}
            </button>
          )}

          {/* INPUT FORM */}
          <form
            onSubmit={(event) => {
              event.preventDefault();

              send();
            }}
            className="flex gap-2 border-t p-4"
          >

            <input
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              placeholder="Contoh: pesan nasi goreng 2..."
              className="min-w-0 flex-1 rounded-full border px-4 py-3 text-sm outline-none focus:border-stone-500"
            />

            <button
              type="submit"
              disabled={
                loading ||
                !input.trim()
              }
              className="rounded-full bg-stone-900 px-5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Kirim
            </button>

          </form>

        </div>
      )}
    </>
  );
}