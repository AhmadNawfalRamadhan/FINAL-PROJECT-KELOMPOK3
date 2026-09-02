export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export async function api(path, options={}) {
  const res = await fetch(`${API_URL}${path}`, { credentials:'include', ...options, headers:{ ...(options.body instanceof FormData ? {} : {'Content-Type':'application/json'}), ...(options.headers||{}) } });
  const data = await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data.message || 'Request gagal');
  return data;
}
