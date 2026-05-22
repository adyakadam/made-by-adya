'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order, Product, InstagramTile } from '@/lib/types'

type Tab = 'orders' | 'products' | 'new-product' | 'home-grid'

const BLANK_TILE: InstagramTile = { image_url: '', link_url: '' }

function fmt(cents: number) { return `$${(cents / 100).toFixed(2)}` }

const BLANK_PRODUCT: Partial<Product> = {
  name: '', description: '', price: 0, images: [], emoji: '🧶', bg_color: '#f2d9d0',
  category: 'crochet', badge: 'Crochet', is_new: false, is_bestseller: false,
  stock: 1, rating: 5, review_count: 0, sizes: ['XS','S','M','L'], colors: ['#f2d9d0'], active: true,
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [newProduct, setNewProduct] = useState<Partial<Product>>(BLANK_PRODUCT)
  const [tiles, setTiles] = useState<InstagramTile[]>(Array(6).fill(null).map(() => ({ ...BLANK_TILE })))
  const [saving, setSaving] = useState(false)
  const [savingGrid, setSavingGrid] = useState(false)

  useEffect(() => {
    fetch('/api/admin/orders').then((r) => r.json()).then(setOrders).catch(() => null)
    fetch('/api/admin/products').then((r) => r.json()).then(setProducts).catch(() => null)
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => {
      if (d.instagram_tiles?.length) {
        setTiles(Array(6).fill(null).map((_, i) => d.instagram_tiles[i] ?? { ...BLANK_TILE }))
      }
    }).catch(() => null)
  }, [])

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  async function updateOrderStatus(id: string, status: string, tracking?: string) {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      body: JSON.stringify({ id, status, tracking_number: tracking }),
      headers: { 'Content-Type': 'application/json' },
    })
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: status as Order['status'], tracking_number: tracking ?? o.tracking_number } : o))
  }

  async function saveGrid() {
    setSavingGrid(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instagram_tiles: tiles }),
      })
      if (!res.ok) throw new Error('Failed to save')
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Home grid saved!' }))
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Error saving grid.' }))
    } finally {
      setSavingGrid(false)
    }
  }

  async function saveProduct() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        body: JSON.stringify(newProduct),
        headers: { 'Content-Type': 'application/json' },
      })
      const saved = await res.json()
      if (!res.ok) throw new Error(saved.error ?? 'Save failed')
      setProducts((prev) => {
        const i = prev.findIndex((p) => p.id === saved.id)
        return i >= 0 ? prev.map((p) => p.id === saved.id ? saved : p) : [saved, ...prev]
      })
      setNewProduct(BLANK_PRODUCT)
      setTab('products')
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Product saved!' }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h2>made by <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>adya</span></h2>
        {(['orders', 'products', 'new-product', 'home-grid'] as Tab[]).map((t) => (
          <button key={t} className={`admin-nav-link${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'orders' ? '📦 Orders' : t === 'products' ? '🛍️ Products' : t === 'new-product' ? '➕ New Product' : '🏠 Home Grid'}
          </button>
        ))}
        <button className="admin-nav-link" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,.1)' }} onClick={logout}>
          🚪 Log Out
        </button>
      </div>

      <div className="admin-content">
        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="admin-card">
            <h2>Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No orders yet. Share the shop link to get your first sale! 🎉</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 500 }}>{order.order_number}</td>
                      <td>
                        <div>{order.customer_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{order.customer_email}</div>
                      </td>
                      <td>{fmt(order.total)}</td>
                      <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                      <td style={{ color: 'var(--text-light)', fontSize: 12 }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => {
                            const newStatus = e.target.value
                            const tracking = newStatus === 'shipped' ? prompt('Enter tracking number (optional):') ?? undefined : undefined
                            updateOrderStatus(order.id, newStatus, tracking)
                          }}
                          style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, border: '1.5px solid var(--warm-sand)', background: 'var(--cream)' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'products' && (
          <div className="admin-card">
            <h2>Products ({products.length})</h2>
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Stock</th><th>Category</th><th>Status</th><th>Edit</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 52, borderRadius: 8, background: p.bg_color, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative' }}>
                          {p.images?.[0]
                            ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                            : p.emoji}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{p.name}</div>
                          {p.is_new && <span className="status-badge paid" style={{ fontSize: 10 }}>New</span>}
                          {p.is_bestseller && <span className="status-badge" style={{ fontSize: 10, background: 'var(--lavender)' }}>Bestseller</span>}
                        </div>
                      </div>
                    </td>
                    <td>{fmt(p.price)}</td>
                    <td style={{ color: p.stock <= 3 ? '#c0392b' : 'inherit' }}>{p.stock}</td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-mid)' }}>{p.category}</span></td>
                    <td><span className={`status-badge ${p.active ? 'paid' : 'cancelled'}`}>{p.active ? 'Active' : 'Hidden'}</span></td>
                    <td>
                      <button
                        className="btn-outline btn-outline-sm"
                        onClick={() => { setNewProduct(p); setTab('new-product') }}
                      >Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* NEW / EDIT PRODUCT */}
        {tab === 'new-product' && (
          <div className="admin-card">
            <h2>{newProduct.id ? `Edit: ${newProduct.name}` : 'New Product'}</h2>
            <div className="form-grid">
              <div className="form-group form-group-inline"><label>Name</label><input type="text" value={newProduct.name ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group form-group-inline">
                <label>Photos <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: 12 }}>(paste image URLs — first photo is the main one)</span></label>
                {(newProduct.images ?? []).map((url, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <input type="url" placeholder="https://..." value={url} style={{ flex: 1 }}
                      onChange={(e) => setNewProduct((p) => ({ ...p, images: (p.images ?? []).map((u, j) => j === i ? e.target.value : u) }))} />
                    {url && <img src={url} alt="" style={{ width: 40, height: 52, objectFit: 'cover', borderRadius: 6, border: '1.5px solid var(--warm-sand)', flexShrink: 0 }} />}
                    <button type="button" onClick={() => setNewProduct((p) => ({ ...p, images: (p.images ?? []).filter((_, j) => j !== i) }))}
                      style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn-outline btn-outline-sm" style={{ marginTop: 4 }}
                  onClick={() => setNewProduct((p) => ({ ...p, images: [...(p.images ?? []), ''] }))}>
                  + Add Photo
                </button>
              </div>
              <div className="form-group form-group-inline"><label>Description</label><textarea rows={2} value={newProduct.description ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} /></div>
              <div className="form-group"><label>Price (cents, e.g. 6800 = $68)</label><input type="number" value={newProduct.price ?? 0} onChange={(e) => setNewProduct((p) => ({ ...p, price: parseInt(e.target.value) }))} /></div>
              <div className="form-group"><label>Stock</label><input type="number" value={newProduct.stock ?? 0} onChange={(e) => setNewProduct((p) => ({ ...p, stock: parseInt(e.target.value) }))} /></div>
              <div className="form-group"><label>Emoji</label><input type="text" value={newProduct.emoji ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, emoji: e.target.value }))} /></div>
              <div className="form-group"><label>Background Color (hex)</label><input type="text" value={newProduct.bg_color ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, bg_color: e.target.value }))} /></div>
              <div className="form-group">
                <label>Category</label>
                <select value={newProduct.category ?? 'crochet'} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value as Product['category'] }))}>
                  <option value="crochet">Crochet</option>
                  <option value="sewn">Hand-Sewn</option>
                  <option value="sets">Sets</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
              <div className="form-group"><label>Badge Label</label><input type="text" value={newProduct.badge ?? ''} onChange={(e) => setNewProduct((p) => ({ ...p, badge: e.target.value }))} /></div>
              <div className="form-group"><label>Sizes (comma-separated)</label><input type="text" value={(newProduct.sizes ?? []).join(',')} onChange={(e) => setNewProduct((p) => ({ ...p, sizes: e.target.value.split(',').map((s) => s.trim()) }))} /></div>
              <div className="form-group"><label>Colors (hex, comma-separated)</label><input type="text" value={(newProduct.colors ?? []).join(',')} onChange={(e) => setNewProduct((p) => ({ ...p, colors: e.target.value.split(',').map((s) => s.trim()) }))} /></div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newProduct.is_new ?? false} onChange={(e) => setNewProduct((p) => ({ ...p, is_new: e.target.checked }))} /> New
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newProduct.is_bestseller ?? false} onChange={(e) => setNewProduct((p) => ({ ...p, is_bestseller: e.target.checked }))} /> Bestseller
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newProduct.active ?? true} onChange={(e) => setNewProduct((p) => ({ ...p, active: e.target.checked }))} /> Active
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn-primary" onClick={saveProduct} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</button>
              <button className="btn-outline btn-outline-sm" onClick={() => { setNewProduct(BLANK_PRODUCT); setTab('products') }}>Cancel</button>
            </div>
          </div>
        )}
        {/* HOME GRID */}
        {tab === 'home-grid' && (
          <div className="admin-card">
            <h2>Home Instagram Grid</h2>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 20 }}>
              Set the 6 photos shown on the home page. Paste a photo URL and the Instagram post link for each tile. Leave blank to show the default placeholder.
            </p>
            {tiles.map((tile, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16, padding: 16, background: 'var(--blush)', borderRadius: 12 }}>
                <div style={{ width: 64, height: 80, borderRadius: 10, overflow: 'hidden', background: 'var(--warm-sand)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, position: 'relative' }}>
                  {tile.image_url
                    ? <img src={tile.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : (i + 1)}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>Photo URL</label>
                    <input type="url" placeholder="https://..." value={tile.image_url}
                      onChange={(e) => setTiles((prev) => prev.map((t, j) => j === i ? { ...t, image_url: e.target.value } : t))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>Instagram Post Link</label>
                    <input type="url" placeholder="https://instagram.com/p/..." value={tile.link_url}
                      onChange={(e) => setTiles((prev) => prev.map((t, j) => j === i ? { ...t, link_url: e.target.value } : t))} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-primary" onClick={saveGrid} disabled={savingGrid}>
              {savingGrid ? 'Saving…' : 'Save Home Grid'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
