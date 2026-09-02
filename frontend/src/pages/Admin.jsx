import { useEffect, useState } from 'react';
import { api, API_URL } from '../utils/api';

const rupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

const empty = {
  name: '',
  category: 'utama',
  price: '',
  stock: '',
  ingredients: '',
  taste: '',
  origin: '',
  description: '',
  isAvailable: true,
};

export default function Admin() {
  const [me, setMe] = useState(null);
  const [email, setEmail] = useState('admin@restaurant.local');
  const [password, setPassword] = useState('admin12345');

  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);

  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);

  const [error, setError] = useState('');

  const load = async () => {
    setMenus(
      await api('/api/menus')
    );

    try {
      setOrders(
        await api('/api/orders')
      );
    } catch {
      // Abaikan ketika admin belum login
    }
  };

 useEffect(() => {
  api('/api/auth/me')
    .then(setMe)
    .then(load)
    .catch(() => load());

  const interval = setInterval(() => {
    load();
  }, 3000);

  return () => {
    clearInterval(interval);
  };
}, []);

  async function login(e) {
    e.preventDefault();

    try {
      const data = await api(
        '/api/auth/login',
        {
          method: 'POST',

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      setMe(data.admin);
      setError('');

      load();
    } catch (error) {
      setError(error.message);
    }
  }

  async function save(e) {
    e.preventDefault();

    const fd = new FormData();

    Object.entries(form).forEach(
      ([key, value]) => {
        fd.append(key, value);
      }
    );

    if (file) {
      fd.append('image', file);
    }

    await api(
      editId
        ? `/api/menus/${editId}`
        : '/api/menus',
      {
        method: editId
          ? 'PUT'
          : 'POST',

        body: fd,
      }
    );

    clearForm();

    load();
  }

  function edit(menu) {
    setEditId(menu.id);

    setForm({
      name: menu.name || '',
      category:
        menu.category || 'utama',
      price:
        menu.price ?? '',
      stock:
        menu.stock ?? '',
      ingredients:
        menu.ingredients || '',
      taste:
        menu.taste || '',
      origin:
        menu.origin || '',
      description:
        menu.description || '',
      isAvailable:
        menu.isAvailable ??
        true,
    });

    setFile(null);

    scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  /*
  |--------------------------------------------------------------------------
  | CLEAR FORM
  |--------------------------------------------------------------------------
  */

  function clearForm() {
    setForm({
      ...empty,
    });

    setFile(null);
    setEditId(null);

    // reset input file HTML
    const fileInput =
      document.getElementById(
        'menu-image'
      );

    if (fileInput) {
      fileInput.value = '';
    }
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-stone-950 px-5 py-20 text-white">

        <form
          onSubmit={login}
          className="mx-auto max-w-md rounded-[28px] border border-stone-800 bg-stone-900 p-8"
        >
          <p className="text-xs uppercase tracking-[.2em] text-amber-400">
            Restaurant Admin
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Masuk dashboard
          </h1>

          {error && (
            <p className="mt-4 rounded-xl bg-red-950 p-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <input
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="mt-7 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
            placeholder="Email"
          />

          <input
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            type="password"
            className="mt-3 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
            placeholder="Password"
          />

          <button className="mt-5 w-full rounded-xl bg-amber-500 py-3 font-semibold text-stone-950">
            Login
          </button>

          <a
            href="/"
            className="mt-5 block text-center text-sm text-stone-400"
          >
            Kembali ke website
          </a>

        </form>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">

      {/* HEADER */}
      <header className="bg-stone-950 text-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">

          <div>
            <p className="text-xs text-amber-400">
              ADMIN PANEL
            </p>

            <h1 className="text-xl font-semibold">
              Rasa Nusa
            </h1>
          </div>

          <div className="flex gap-3">

            <a
              href="/"
              className="rounded-full border border-stone-700 px-4 py-2 text-sm"
            >
              Website
            </a>

            <button
              type="button"
              onClick={async () => {
                await api(
                  '/api/auth/logout',
                  {
                    method:
                      'POST',
                  }
                );

                location.reload();
              }}
              className="text-sm text-stone-400"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-5 py-10">

        {/* MENU SECTION */}
        <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">

          {/* FORM */}
          <form
            onSubmit={save}
            className="rounded-3xl bg-white p-6 shadow-sm"
          >

            <h2 className="text-xl font-semibold">
              {editId
                ? 'Edit menu'
                : 'Tambah menu'}
            </h2>

            <div className="mt-5 grid gap-3">

              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name:
                      e.target
                        .value,
                  })
                }
                className="rounded-xl border px-4 py-3"
                placeholder="Nama menu"
              />

              <select
                value={
                  form.category
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    category:
                      e.target
                        .value,
                  })
                }
                className="rounded-xl border px-4 py-3"
              >
                <option value="utama">
                  Makanan utama
                </option>

                <option value="minuman">
                  Minuman
                </option>

                <option value="dessert">
                  Dessert
                </option>
              </select>

              <div className="grid grid-cols-2 gap-3">

                <input
                  required
                  type="number"
                  min="0"
                  value={
                    form.price
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price:
                        e.target
                          .value,
                    })
                  }
                  className="rounded-xl border px-4 py-3"
                  placeholder="Harga"
                />

                <input
                  required
                  type="number"
                  min="0"
                  value={
                    form.stock
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      stock:
                        e.target
                          .value,
                    })
                  }
                  className="rounded-xl border px-4 py-3"
                  placeholder="Stok"
                />

              </div>

              <input
                value={
                  form.ingredients
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    ingredients:
                      e.target
                        .value,
                  })
                }
                className="rounded-xl border px-4 py-3"
                placeholder="Bahan"
              />

              <div className="grid grid-cols-2 gap-3">

                <input
                  value={
                    form.taste
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      taste:
                        e.target
                          .value,
                    })
                  }
                  className="rounded-xl border px-4 py-3"
                  placeholder="Rasa"
                />

                <input
                  value={
                    form.origin
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      origin:
                        e.target
                          .value,
                    })
                  }
                  className="rounded-xl border px-4 py-3"
                  placeholder="Daerah asal"
                />

              </div>

              <textarea
                value={
                  form.description
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    description:
                      e.target
                        .value,
                  })
                }
                className="min-h-24 rounded-xl border px-4 py-3"
                placeholder="Deskripsi"
              />

              <label className="rounded-xl border border-dashed p-4 text-sm text-stone-500">

                Foto menu
                (JPG/PNG/WEBP maks. 5 MB)

                <input
                  id="menu-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    setFile(
                      e.target
                        .files[0] ||
                        null
                    )
                  }
                  className="mt-2 block w-full"
                />

              </label>

              {/* BUTTONS */}
              <div className="grid grid-cols-2 gap-3">

                <button
                  type="submit"
                  className="rounded-xl bg-stone-900 py-3 font-semibold text-white transition hover:bg-amber-700"
                >
                  {editId
                    ? 'Simpan perubahan'
                    : 'Tambah menu'}
                </button>

                <button
                  type="button"
                  onClick={
                    clearForm
                  }
                  className="rounded-xl border border-stone-300 bg-white py-3 font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  Clear
                </button>

              </div>

              {editId && (
                <p className="text-center text-xs text-stone-400">
                  Clear juga akan
                  membatalkan mode edit.
                </p>
              )}

            </div>

          </form>

          {/* DAFTAR MENU */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-semibold">
                Daftar menu
              </h2>

              <span className="text-sm text-stone-500">
                {menus.length}{' '}
                menu
              </span>

            </div>

            <div className="mt-5 space-y-3">

              {menus.map(
                (menu) => (
                  <div
                    key={
                      menu.id
                    }
                    className="flex items-center gap-4 rounded-2xl border p-3"
                  >

                    {menu.image ? (
                      <img
                        src={`${API_URL}${menu.image}`}
                        alt={
                          menu.name
                        }
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-stone-100" />
                    )}

                    <div className="min-w-0 flex-1">

                      <p className="font-semibold">
                        {
                          menu.name
                        }
                      </p>

                      <p className="text-sm text-stone-500">
                        {rupiah(
                          menu.price
                        )}{' '}
                        · stok{' '}
                        {
                          menu.stock
                        }
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        edit(menu)
                      }
                      className="text-sm"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          confirm(
                            'Hapus menu ini?'
                          )
                        ) {
                          await api(
                            `/api/menus/${menu.id}`,
                            {
                              method:
                                'DELETE',
                            }
                          );

                          load();
                        }
                      }}
                      className="text-sm text-red-600"
                    >
                      Hapus
                    </button>

                  </div>
                )
              )}

            </div>

          </div>

        </section>

        {/* ORDERS */}
        <section className="rounded-3xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-semibold">
            Pesanan masuk
          </h2>

          <div className="mt-5 overflow-x-auto">

            <table className="w-full min-w-[760px] text-left text-sm">

              <thead className="text-stone-500">
                <tr>
                  <th className="py-3">
                    Order
                  </th>

                  <th>
                    Pelanggan
                  </th>

                  <th>
                    Item
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>

                {orders.map(
                  (order) => (
                    <tr
                      key={
                        order.id
                      }
                      className="border-t"
                    >

                      <td className="py-4 font-medium">
                        {
                          order.orderNumber
                        }
                      </td>

                      <td>
                        {
                          order.customerName
                        }
                      </td>

                      <td>
                        {order.items
                          ?.map(
                            (
                              item
                            ) =>
                              `${item.menuItem?.name} × ${item.quantity}`
                          )
                          .join(
                            ', '
                          )}
                      </td>

                      <td>
                        {rupiah(
                          order.totalPrice
                        )}
                      </td>

                      <td>

                        <select
                          value={
                            order.status
                          }
                          onChange={async (
                            e
                          ) => {
                            await api(
                              `/api/orders/${order.id}/status`,
                              {
                                method:
                                  'PATCH',

                                body: JSON.stringify(
                                  {
                                    status:
                                      e
                                        .target
                                        .value,
                                  }
                                ),
                              }
                            );

                            load();
                          }}
                          className="rounded-lg border px-3 py-2"
                        >
                          <option value="menunggu">
                            Menunggu
                          </option>

                          <option value="diproses">
                            Diproses
                          </option>

                          <option value="selesai">
                            Selesai
                          </option>

                          <option value="dibatalkan">
                            Dibatalkan
                          </option>

                        </select>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  );
}