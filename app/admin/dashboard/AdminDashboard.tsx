'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Order, Product, InstagramTile, Review } from '@/lib/types'

function ColorPicker({ colors, onChange }: { colors: string[]; onChange: (c: string[]) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [manualHex, setManualHex] = useState('')

  function loadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImgSrc(URL.createObjectURL(file))
  }

  useEffect(() => {
    if (!imgSrc || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; ctx.drawImage(img, 0, 0) }
    img.src = imgSrc
  }, [imgSrc])

  function pickColor(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width))
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height))
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`
    if (!colors.includes(hex)) onChange([...colors, hex])
  }

  function previewColor(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width))
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height))
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    setHovered(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`)
  }

  function addManual() {
    const h = manualHex.startsWith('#') ? manualHex : `#${manualHex}`
    if (/^#[0-9a-fA-F]{6}$/.test(h) && !colors.includes(h)) { onChange([...colors, h]); setManualHex('') }
  }

  return (
    <div>
      {/* Current swatches */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {colors.map((c) => (
          <div key={c} title={c} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--cream)', borderRadius: 20, padding: '3px 10px 3px 6px', border: '1.5px solid var(--warm-sand)' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: c, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--text-mid)' }}>{c}</span>
            <button onClick={() => onChange(colors.filter((x) => x !== c))} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 13, lineHeight: 1, marginLeft: 2, padding: 0 }}>✕</button>
          </div>
        ))}
      </div>

      {/* Upload image to pick from */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--text-mid)', display: 'block', marginBottom: 6 }}>
          Upload a photo to pick yarn/fabric colours from it:
        </label>
        <input type="file" accept="image/*" onChange={loadFile} style={{ fontSize: 13 }} />
      </div>

      {imgSrc && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 6 }}>
            Click anywhere on the image to add that colour →{' '}
            {hovered && <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><span style={{ width:12, height:12, borderRadius:'50%', background:hovered, display:'inline-block', border:'1px solid #ccc' }} />{hovered}</span>}
          </p>
          <canvas
            ref={canvasRef}
            onClick={pickColor}
            onMouseMove={previewColor}
            style={{ cursor: 'crosshair', maxWidth: '100%', maxHeight: 240, borderRadius: 10, display: 'block', border: '1.5px solid var(--warm-sand)' }}
          />
        </div>
      )}

      {/* Manual hex fallback */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text" placeholder="#c4907a" value={manualHex}
          onChange={(e) => setManualHex(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addManual()}
          style={{ width: 110, fontSize: 13 }}
        />
        {manualHex && <div style={{ width: 20, height: 20, borderRadius: '50%', background: manualHex.startsWith('#') ? manualHex : `#${manualHex}`, border: '1px solid #ccc' }} />}
        <button type="button" className="btn-outline btn-outline-sm" onClick={addManual}>Add colour</button>
      </div>
    </div>
  )
}

type Tab = 'orders' | 'products' | 'new-product' | 'home-grid' | 'reviews'

const BLANK_REVIEW: Partial<Review> = {
  reviewer_name: '', avatar_letter: '', rating: 5, body: '', product_name: '',
}

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
  const [heroImage, setHeroImage] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [editingReview, setEditingReview] = useState<Partial<Review>>(BLANK_REVIEW)
  const [savingReview, setSavingReview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingGrid, setSavingGrid] = useState(false)

  useEffect(() => {
    fetch('/api/admin/orders').then((r) => r.json()).then(setOrders).catch(() => null)
    fetch('/api/admin/products').then((r) => r.json()).then(setProducts).catch(() => null)
    fetch('/api/admin/reviews').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setReviews(d) }).catch(() => null)
    fetch('/api/admin/settings').then((r) => r.json()).then((d) => {
      if (d.instagram_tiles?.length) {
        setTiles(Array(6).fill(null).map((_, i) => d.instagram_tiles[i] ?? { ...BLANK_TILE }))
      }
      if (d.hero_image_url) setHeroImage(d.hero_image_url)
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
        body: JSON.stringify({ instagram_tiles: tiles, hero_image_url: heroImage }),
      })
      if (!res.ok) throw new Error('Failed to save')
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Home page saved!' }))
    } catch {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: 'Error saving.' }))
    } finally {
      setSavingGrid(false)
    }
  }


  async function saveReview() {
    setSavingReview(true)
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingReview,
          avatar_letter: editingReview.reviewer_name?.[0]?.toUpperCase() ?? '?',
        }),
      })
      const saved = await res.json()
      if (!res.ok) throw new Error(saved.error ?? 'Save failed')
      setReviews((prev) => {
        const i = prev.findIndex((r) => r.id === saved.id)
        return i >= 0 ? prev.map((r) => r.id === saved.id ? saved : r) : [saved, ...prev]
      })
      setEditingReview(BLANK_REVIEW)
      window.dispatchEvent(new CustomEvent('show-toast', { detail: '✓ Review saved!' }))
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }))
    } finally {
      setSavingReview(false)
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review?')) return
    const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' })
    if (res.ok) setReviews((prev) => prev.filter((r) => r.id !== id))
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
        {(['orders', 'products', 'new-product', 'reviews', 'home-grid'] as Tab[]).map((t) => (
          <button key={t} className={`admin-nav-link${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t === 'orders' ? '📦 Orders' : t === 'products' ? '🛍️ Products' : t === 'new-product' ? '➕ New Product' : t === 'reviews' ? '⭐ Reviews' : '🏠 Home Grid'}
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
              <div className="form-group form-group-inline">
                <label>Yarn / Fabric Colours</label>
                <ColorPicker
                  colors={newProduct.colors ?? []}
                  onChange={(c) => setNewProduct((p) => ({ ...p, colors: c }))}
                />
              </div>
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
        {/* REVIEWS */}
        {tab === 'reviews' && (
          <div className="admin-card">
            <h2>Reviews</h2>

            {/* Add / Edit form */}
            <div style={{ background: 'var(--blush)', borderRadius: 12, padding: 20, marginBottom: 28 }}>
              <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>
                {editingReview.id ? 'Edit Review' : 'Add Review'}
              </h3>
              <div className="form-grid">
                <div className="form-group form-group-inline">
                  <label>Reviewer Name</label>
                  <input type="text" placeholder="Jane D." value={editingReview.reviewer_name ?? ''}
                    onChange={(e) => setEditingReview((r) => ({ ...r, reviewer_name: e.target.value }))} />
                </div>
                <div className="form-group form-group-inline">
                  <label>Product Name <span style={{ fontWeight: 400, color: 'var(--text-light)', fontSize: 12 }}>(what they bought)</span></label>
                  <input type="text" placeholder="Crochet Crop Top" value={editingReview.product_name ?? ''}
                    onChange={(e) => setEditingReview((r) => ({ ...r, product_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Rating (1–5)</label>
                  <input type="number" min={1} max={5} value={editingReview.rating ?? 5}
                    onChange={(e) => setEditingReview((r) => ({ ...r, rating: parseInt(e.target.value) }))} />
                </div>
                <div className="form-group form-group-inline">
                  <label>Review Text</label>
                  <textarea rows={3} placeholder="Write the review…" value={editingReview.body ?? ''}
                    onChange={(e) => setEditingReview((r) => ({ ...r, body: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button className="btn-primary" onClick={saveReview} disabled={savingReview}>
                  {savingReview ? 'Saving…' : editingReview.id ? 'Update Review' : 'Add Review'}
                </button>
                {editingReview.id && (
                  <button className="btn-outline btn-outline-sm" onClick={() => setEditingReview(BLANK_REVIEW)}>Cancel</button>
                )}
              </div>
            </div>

            {/* Existing reviews list */}
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No reviews yet. Add one above.</p>
            ) : (
              reviews.map((r) => (
                <div key={r.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 0', borderBottom: '1px solid var(--warm-sand)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, flexShrink: 0 }}>
                    {r.avatar_letter}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{r.reviewer_name} <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>— {r.product_name}</span></div>
                    <div style={{ color: '#e8b86d', fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4 }}>{r.body}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn-outline btn-outline-sm" onClick={() => setEditingReview(r)}>Edit</button>
                    <button className="btn-outline btn-outline-sm" style={{ color: '#c0392b', borderColor: '#c0392b' }} onClick={() => deleteReview(r.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* HOME GRID */}
        {tab === 'home-grid' && (
          <div className="admin-card">
            <h2>Home Page</h2>

            {/* Hero image */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Hero Photo</h3>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>
                The big photo on the left side of the home page banner.
              </p>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 100, height: 120, borderRadius: 10, overflow: 'hidden', background: 'var(--warm-sand)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, position: 'relative' }}>
                  {heroImage
                    ? <img src={heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    : '🧶'}
                </div>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Photo URL</label>
                  <input type="url" placeholder="https://..." value={heroImage} onChange={(e) => setHeroImage(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Instagram grid */}
            <h3 style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Instagram Grid</h3>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 4 }}>
              For each tile: paste the Instagram post link, and separately paste the photo URL.
            </p>
            <p style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 16, background: 'var(--blush)', padding: '10px 14px', borderRadius: 8 }}>
              💡 To get a photo URL from Instagram: open the post on desktop, right-click the photo → "Copy image address". Paste that URL in the Photo URL field.
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
                    <label style={{ fontSize: 12 }}>Instagram Post Link</label>
                    <input type="url" placeholder="https://instagram.com/p/..." value={tile.link_url}
                      onChange={(e) => setTiles((prev) => prev.map((t, j) => j === i ? { ...t, link_url: e.target.value } : t))} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: 12 }}>Photo URL</label>
                    <input type="url" placeholder="https://..." value={tile.image_url}
                      onChange={(e) => setTiles((prev) => prev.map((t, j) => j === i ? { ...t, image_url: e.target.value } : t))} />
                  </div>
                </div>
              </div>
            ))}
            <button className="btn-primary" onClick={saveGrid} disabled={savingGrid}>
              {savingGrid ? 'Saving…' : 'Save Home Page'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
