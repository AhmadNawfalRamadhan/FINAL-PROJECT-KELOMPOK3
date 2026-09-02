import { useEffect, useMemo, useState } from 'react';

import { api } from '../utils/api';
import MenuCard from '../components/MenuCard';
import ChatWidget from '../components/ChatWidget';
import CartDrawer from '../components/CartDrawer';
import InvoiceModal from '../components/InvoiceModal';
import TrackOrderModal from '../components/TrackOrderModal';

export default function Home() {
  const [menus, setMenus] = useState([]);
  const [category, setCategory] = useState('semua');

  const [chatOpen, setChatOpen] = useState(false);
  const [prefill, setPrefill] = useState('');

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [invoice, setInvoice] = useState(null);

  const [trackOpen, setTrackOpen] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  function refreshMenus() {
    api('/api/menus')
      .then(setMenus)
      .catch(console.error);
  }

  useEffect(() => {
    refreshMenus();
  }, []);

  const filtered = useMemo(() => {
    return category === 'semua'
      ? menus
      : menus.filter((menu) => menu.category === category);
  }, [menus, category]);

  const cartCount = useMemo(() => {
    return cart.reduce(
      (total, item) => total + Number(item.quantity),
      0
    );
  }, [cart]);

  function order(item) {
    setPrefill(`Saya mau pesan ${item.name} 1`);
    setChatOpen(true);
  }

  function addToCart(item) {
    setCart((previousCart) => {
      const existing = previousCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existing) {
        return previousCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...previousCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });

    setCheckoutError('');
    setCartOpen(true);
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function removeFromCart(id) {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id)
    );
  }

  async function checkout(customerName) {
    if (!cart.length || !customerName?.trim()) {
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError('');

    try {
      const data = await api('/api/orders', {
        method: 'POST',

        body: JSON.stringify({
          customerName: customerName.trim(),
          source: 'cart',

          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      setInvoice(data.order);

      setCart([]);
      setCartOpen(false);

      refreshMenus();
    } catch (error) {
      setCheckoutError(
        error.message ||
          'Checkout gagal. Silakan coba lagi.'
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-stone-900">

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-[#f8f6f1]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <a
            href="/"
            className="flex shrink-0 items-center gap-3 text-stone-900"
          >

            <span className="whitespace-nowrap text-sm font-bold tracking-[.30em]">
              RASA NUSA
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm md:flex">

            <a
              href="#menu"
              className="transition hover:text-amber-700"
            >
              Menu
            </a>

            <a
              href="#about"
              className="transition hover:text-amber-700"
            >
              Tentang
            </a>

            <button
              type="button"
              onClick={() => setTrackOpen(true)}
              className="transition hover:text-amber-700"
            >
              Cek Pesanan
            </button>

            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="transition hover:text-amber-700"
            >
              AI Assistant
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 transition hover:text-amber-700"
            >
              <span>
                Keranjang
              </span>

              {cartCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-stone-900 px-2 text-xs font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>

          </nav>

        </div>
      </header>

      <main>

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-stone-200/70 bg-[url('/images/bg.jpeg')] bg-cover bg-center">

          <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-[1.05fr_.95fr]">

            <div className="relative z-10">

              <p className="mb-5 text-xs font-semibold uppercase tracking-[.28em] text-amber-800">
                Indonesian Contemporary Dining
              </p>

              <h1 className="max-w-3xl text-5xl font-medium leading-[1.02] tracking-tight md:text-7xl">
                Rasa Indonesia,
                <br />
                disajikan dengan cara
                <br />
                yang lebih modern.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-stone-600">
                Jelajahi menu, lihat foto hidangan, minta rekomendasi AI,
                lalu pesan langsung dari percakapan atau keranjang.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <a
                  href="#menu"
                  className="rounded-full bg-stone-900 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800"
                >
                  Lihat Menu
                </a>

                <button
                  type="button"
                  onClick={() => setChatOpen(true)}
                  className="rounded-full border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
                >
                  Tanya AI
                </button>

                <button
                  type="button"
                  onClick={() => setTrackOpen(true)}
                  className="rounded-full border border-stone-300 bg-white px-6 py-3.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-100"
                >
                  Cek Pesanan
                </button>

              </div>

            </div>

            {/* HERO IMAGE */}
            <div className="relative overflow-hidden rounded-[34px] shadow-2xl">

              <img
                src="/images/hero.jpeg"
                alt="Hidangan Indonesia"
                className="aspect-[4/3] h-full w-full object-cover"
              />

              <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-4 backdrop-blur-md">

                <p className="text-xs uppercase tracking-[.18em] text-stone-500">
                  Smart Ordering
                </p>

                <p className="mt-1 font-medium text-stone-900">
                  Pesan beberapa menu cukup dengan satu kalimat.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* MENU */}
        <section
          id="menu"
          className="mx-auto max-w-7xl px-5 py-12"
        >

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <h2 className="text-4xl font-medium tracking-tight">
                Menu pilihan hari ini
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto">

              {[
                'semua',
                'utama',
                'minuman',
                'dessert',
              ].map((itemCategory) => (

                <button
                  type="button"
                  key={itemCategory}
                  onClick={() => setCategory(itemCategory)}
                  className={`rounded-full px-4 py-2 text-sm capitalize transition ${
                    category === itemCategory
                      ? 'bg-stone-900 text-white'
                      : 'border border-stone-300 bg-white hover:bg-stone-100'
                  }`}
                >
                  {itemCategory}
                </button>

              ))}

            </div>

          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {filtered.length > 0 ? (

              filtered.map((item) => (

                <MenuCard
                  key={item.id}
                  item={item}
                  onOrder={order}
                  onAddToCart={addToCart}
                />

              ))

            ) : (

              <div className="col-span-full rounded-3xl border border-stone-200 bg-white p-10 text-center">

                <p className="font-semibold text-stone-800">
                  Menu belum tersedia.
                </p>

                <p className="mt-2 text-sm text-stone-500">
                  Silakan pilih kategori lain atau tambahkan menu melalui dashboard admin.
                </p>

              </div>

            )}

          </div>

        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="border-y border-stone-200 bg-stone-900 text-white"
        >

          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2">

            <div>

              <p className="text-xs uppercase tracking-[.25em] text-amber-300">
                Experience
              </p>

              <h2 className="mt-3 text-4xl font-semibold">
                Ga Perlu Pindah Halaman,
                <span className="block">
                  Biar Bot Kami yang Pusing.
                </span>
              </h2>

            </div>

            <p className="self-end leading-8 text-stone-300">
              Biarkan asisten virtual kami yang mikir keras. Dia baca data admin
              cuma buat ngasih lu rekomendasi menu dan harga yang paling update.
              Tinggal tap-tap, masukin keranjang layaknya sultan lagi borong
              makanan. Sat set sat set, tau-tau kenyang!
            </p>

          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-10 text-sm text-stone-500 sm:flex-row">

        <span>
          © 2026 Rasa Nusa
        </span>

        <span>
          Final Project PAW · Kelompok 3
        </span>

      </footer>

      {/* CART */}
      <CartDrawer
        open={cartOpen}
        setOpen={setCartOpen}
        cart={cart}
        setCart={setCart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={checkout}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
      />

      {/* CHAT */}
      <ChatWidget
        open={chatOpen}
        setOpen={setChatOpen}
        prefill={prefill}
        setPrefill={setPrefill}
        onOrderCreated={refreshMenus}
      />

      {/* INVOICE */}
      <InvoiceModal
        invoice={invoice}
        onClose={() => setInvoice(null)}
      />

      {/* TRACK ORDER */}
      <TrackOrderModal
        open={trackOpen}
        onClose={() => setTrackOpen(false)}
      />

    </div>
  );
}