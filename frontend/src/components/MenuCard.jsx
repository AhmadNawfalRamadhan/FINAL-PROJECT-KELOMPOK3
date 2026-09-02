import { API_URL } from '../utils/api';

const rupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

export default function MenuCard({
  item,
  onOrder,
  onAddToCart,
}) {
  const image = item.image
    ? `${API_URL}${item.image}`
    : null;

  const stock = Number(item.stock || 0);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">

        {image ? (
          <img
            src={image}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-stone-400">
            Foto menu belum tersedia
          </div>
        )}

        {/* CATEGORY BADGE */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[.16em] text-stone-700 shadow-sm backdrop-blur">
            {item.category}
          </span>
        </div>

        {/* STOCK BADGE */}
        <div className="absolute right-4 top-4">
          <span
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur ${
              stock > 0
                ? 'bg-stone-900/90 text-white'
                : 'bg-red-600/90 text-white'
            }`}
          >
            {stock > 0
              ? `Stok ${stock}`
              : 'Habis'}
          </span>
        </div>

      </div>

      {/* CONTENT */}
      <div className="p-5">

        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <h3 className="text-xl font-semibold leading-snug text-stone-900">
              {item.name}
            </h3>

            {item.origin && (
              <p className="mt-1 text-xs uppercase tracking-[.12em] text-amber-700">
                {item.origin}
              </p>
            )}

          </div>

          <span className="whitespace-nowrap text-base font-semibold text-stone-900">
            {rupiah(item.price)}
          </span>

        </div>

        <p className="mt-3 min-h-[48px] text-sm leading-6 text-stone-500">
          {item.description || 'Deskripsi menu belum tersedia.'}
        </p>

        {/* DETAIL */}
        <div className="mt-4 flex flex-wrap gap-2">

          {item.taste && (
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-600">
              {item.taste}
            </span>
          )}

          {stock > 0 ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
              Tersedia
            </span>
          ) : (
            <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs text-red-700">
              Tidak tersedia
            </span>
          )}

        </div>

        {/* BUTTONS */}
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">

          <button
            type="button"
            onClick={() => onAddToCart(item)}
            disabled={stock <= 0}
            className="rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {stock > 0
              ? 'Tambah Keranjang'
              : 'Stok Habis'}
          </button>

          <button
            type="button"
            onClick={() => onOrder(item)}
            disabled={stock <= 0}
            className="rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition hover:border-stone-900 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
          >
            Pesan via AI
          </button>

        </div>

      </div>

    </article>
  );
}