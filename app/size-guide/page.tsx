import Link from 'next/link'

export default function SizeGuidePage() {
  return (
    <div className="size-guide-page">
      <h1>Size Guide</h1>
      <p style={{ fontSize: 14, color: 'var(--text-light)', marginBottom: 36 }}>
        All measurements are in inches. If you're between sizes, size up for a relaxed fit.
      </p>
      <table className="size-table">
        <thead>
          <tr><th>Size</th><th>Bust</th><th>Waist</th><th>Hip</th><th>Best For</th></tr>
        </thead>
        <tbody>
          <tr><td>XS</td><td>32–33</td><td>24–25</td><td>34–35</td><td>US 0–2</td></tr>
          <tr><td>S</td><td>34–35</td><td>26–27</td><td>36–37</td><td>US 4–6</td></tr>
          <tr><td>M</td><td>36–37</td><td>28–29</td><td>38–39</td><td>US 8–10</td></tr>
          <tr><td>L</td><td>38–40</td><td>30–32</td><td>40–42</td><td>US 12–14</td></tr>
          <tr><td>XL</td><td>41–43</td><td>33–35</td><td>43–45</td><td>US 16–18</td></tr>
        </tbody>
      </table>
      <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 36 }}>
        💡 Crochet pieces have natural stretch. Sewn pieces follow standard sizing more closely.
      </p>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, marginBottom: 20 }}>
        Care Instructions
      </h2>
      <div className="care-grid">
        {[
          { icon: '🧊', title: 'Cold Water Wash',  desc: 'Always wash in cold water on a gentle cycle to preserve shape and color.' },
          { icon: '🪴', title: 'Lay Flat to Dry',  desc: 'Reshape while damp and dry flat. Never tumble dry crochet pieces.' },
          { icon: '♨️', title: 'Low Heat Iron',    desc: 'Sewn pieces can be lightly ironed on low. Use a cloth barrier for crochet.' },
          { icon: '🚫', title: 'No Bleach',         desc: 'Avoid bleach and harsh detergents — they\'ll damage the fibers and fade the color.' },
          { icon: '🛍️', title: 'Store Folded',     desc: 'Fold knits and crochet; don\'t hang them as it stretches the fibers over time.' },
          { icon: '🌸', title: 'Spot Clean First',  desc: 'For small stains, spot clean with mild soap before a full wash.' },
        ].map((c) => (
          <div key={c.title} className="care-card">
            <div className="care-icon">{c.icon}</div>
            <div className="care-title">{c.title}</div>
            <div className="care-desc">{c.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 36, textAlign: 'center' }}>
        <Link href="/shop" className="btn-primary">Shop the Collection</Link>
      </div>
    </div>
  )
}
