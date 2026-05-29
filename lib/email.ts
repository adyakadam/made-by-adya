import { Resend } from 'resend'
import { randomUUID } from 'crypto'
import { saveReviewToken } from './supabase'
import type { Order, OrderItem, ShippingAddress } from './types'

// ─── Resend client (lazy — only used server-side) ────────────────────────────
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}

const FROM = 'Made by Adya <hello@madebyadya.com>'
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://madebyadya.com'

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  cream: '#fdf8f5',
  blush: '#f5e6df',
  accent: '#c4907a',
  accentDark: '#a8705a',
  border: '#e8d8d0',
  text: '#3a2e28',
  textMid: '#7a6058',
  textLight: '#a89088',
  white: '#ffffff',
}

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function layout(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Made by Adya</title>
</head>
<body style="margin:0;padding:0;background:${C.cream};font-family:Georgia,'Times New Roman',serif;color:${C.text};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;" cellpadding="0" cellspacing="0">

          <!-- HEADER -->
          <tr>
            <td style="background:${C.blush};border-radius:16px 16px 0 0;padding:32px 40px 24px;text-align:center;border-bottom:2px solid ${C.accent};">
              <div style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:${C.accentDark};letter-spacing:0.08em;">
                made by <em style="font-style:italic;color:${C.accent};">adya</em>
              </div>
              <div style="font-size:11px;color:${C.textLight};letter-spacing:0.12em;text-transform:uppercase;margin-top:4px;">
                handcrafted with love
              </div>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:${C.white};padding:36px 40px;border-left:1px solid ${C.border};border-right:1px solid ${C.border};">
              ${bodyContent}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:${C.blush};border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid ${C.border};border:1px solid ${C.border};border-top:none;">
              <p style="margin:0 0 8px;font-size:12px;color:${C.textMid};">
                Questions? Reply to this email or visit our
                <a href="${BASE_URL}/policies" style="color:${C.accent};text-decoration:none;">policies page</a>.
              </p>
              <p style="margin:0;font-size:12px;color:${C.textLight};">
                Follow along on Instagram
                <a href="https://www.instagram.com/madebyadya" style="color:${C.accent};text-decoration:none;">@madebyadya</a>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:${C.textLight};">
                © ${new Date().getFullYear()} Made by Adya · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function cents(n: number) {
  return `$${(n / 100).toFixed(2)}`
}

function itemsTable(items: OrderItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${C.border};font-size:14px;color:${C.text};">
          <strong>${item.name}</strong>
          <span style="font-size:12px;color:${C.textLight};display:block;margin-top:2px;">
            ${[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' · ')}
          </span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${C.border};text-align:center;font-size:13px;color:${C.textMid};white-space:nowrap;">
          × ${item.qty}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid ${C.border};text-align:right;font-size:14px;color:${C.text};white-space:nowrap;">
          ${cents(item.price * item.qty)}
        </td>
      </tr>`
    )
    .join('')

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <thead>
      <tr>
        <th style="text-align:left;font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid ${C.border};">Item</th>
        <th style="text-align:center;font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid ${C.border};">Qty</th>
        <th style="text-align:right;font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid ${C.border};">Price</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

function addressBlock(addr: ShippingAddress): string {
  return `
  <div style="background:${C.cream};border:1px solid ${C.border};border-radius:10px;padding:16px 20px;margin-top:8px;font-size:13px;color:${C.textMid};line-height:1.7;">
    ${addr.first_name} ${addr.last_name}<br/>
    ${addr.street}<br/>
    ${addr.city}, ${addr.state} ${addr.zip}<br/>
    ${addr.country}
  </div>`
}

function totalsBlock(subtotal: number, tax: number, total: number, giftWrap: boolean): string {
  const giftRow = giftWrap
    ? `<tr>
        <td style="padding:4px 0;font-size:13px;color:${C.textMid};">Gift wrap</td>
        <td style="padding:4px 0;text-align:right;font-size:13px;color:${C.textMid};">${cents(500)}</td>
       </tr>`
    : ''
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 0;">
    <tr>
      <td style="padding:4px 0;font-size:13px;color:${C.textMid};">Subtotal</td>
      <td style="padding:4px 0;text-align:right;font-size:13px;color:${C.textMid};">${cents(subtotal)}</td>
    </tr>
    ${giftRow}
    <tr>
      <td style="padding:4px 0;font-size:13px;color:${C.textMid};">Tax</td>
      <td style="padding:4px 0;text-align:right;font-size:13px;color:${C.textMid};">${cents(tax)}</td>
    </tr>
    <tr>
      <td style="padding:10px 0 4px;font-size:15px;font-weight:bold;color:${C.text};border-top:2px solid ${C.border};">Total</td>
      <td style="padding:10px 0 4px;text-align:right;font-size:15px;font-weight:bold;color:${C.accent};border-top:2px solid ${C.border};">${cents(total)}</td>
    </tr>
  </table>`
}

// ─── ORDER CONFIRMATION ───────────────────────────────────────────────────────
export async function sendOrderConfirmation(order: {
  customer_email: string
  customer_name: string
  order_number: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  gift_wrap: boolean
  shipping_address: ShippingAddress
}) {
  const resend = getResend()
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping order confirmation email')
    return
  }

  const body = `
    <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:300;margin:0 0 6px;color:${C.text};">
      Order confirmed 🌸
    </h2>
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      Hi ${order.customer_name || 'there'}, thank you so much for your order!
      I'll start working on your piece right away.
    </p>

    <div style="background:${C.blush};border-radius:10px;padding:14px 20px;margin-bottom:24px;display:inline-block;width:100%;box-sizing:border-box;">
      <span style="font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;">Order number</span>
      <div style="font-size:20px;font-family:Georgia,serif;font-weight:300;color:${C.accentDark};margin-top:4px;letter-spacing:0.05em;">${order.order_number}</div>
    </div>

    <h3 style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${C.textLight};margin:0 0 4px;">Your items</h3>
    ${itemsTable(order.items)}
    ${totalsBlock(order.subtotal, order.tax, order.total, order.gift_wrap)}

    <div style="height:24px;"></div>

    <h3 style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${C.textLight};margin:0 0 8px;">Shipping to</h3>
    ${addressBlock(order.shipping_address)}

    <div style="margin-top:28px;padding:16px 20px;background:${C.blush};border-radius:10px;border-left:3px solid ${C.accent};">
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.7;">
        🕐 <strong style="color:${C.text};">Estimated dispatch:</strong> within 2–3 business days.<br/>
        You'll receive a shipping confirmation with tracking once your order is on its way.
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your Made by Adya order ${order.order_number} is confirmed 🌸`,
    html: layout(body),
  })

  if (error) {
    console.error('Failed to send order confirmation email:', error)
  }
}

// ─── SHIPPING NOTIFICATION ────────────────────────────────────────────────────
export async function sendShippingNotification(order: Pick<Order, 'customer_email' | 'customer_name' | 'order_number' | 'tracking_number'>) {
  const resend = getResend()
  if (!resend) {
    console.warn('RESEND_API_KEY not set — skipping shipping notification email')
    return
  }

  const trackingNumber = order.tracking_number
  const uspsLink = trackingNumber
    ? `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${encodeURIComponent(trackingNumber)}`
    : null

  const trackingBlock = trackingNumber
    ? `
    <div style="margin:24px 0;text-align:center;">
      <div style="font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${C.textLight};margin-bottom:6px;">Tracking number</div>
      <div style="font-family:Georgia,serif;font-size:18px;color:${C.accentDark};letter-spacing:0.06em;">${trackingNumber}</div>
      <a href="${uspsLink}"
        style="display:inline-block;margin-top:12px;padding:10px 24px;background:${C.accent};color:${C.white};text-decoration:none;border-radius:24px;font-size:13px;letter-spacing:0.04em;">
        Track on USPS →
      </a>
    </div>`
    : `<p style="font-size:13px;color:${C.textMid};margin:16px 0;">Tracking information will be available soon via USPS.</p>`

  const body = `
    <h2 style="font-family:Georgia,serif;font-size:22px;font-weight:300;margin:0 0 6px;color:${C.text};">
      Your order is on its way! 📦
    </h2>
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      Hi ${order.customer_name || 'there'}! Great news — your Made by Adya piece has been packed with care
      and handed off to USPS. I hope you love it as much as I loved making it 🌸
    </p>

    <div style="background:${C.blush};border-radius:10px;padding:14px 20px;margin-bottom:24px;box-sizing:border-box;">
      <span style="font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;">Order number</span>
      <div style="font-size:20px;font-family:Georgia,serif;font-weight:300;color:${C.accentDark};margin-top:4px;letter-spacing:0.05em;">${order.order_number}</div>
    </div>

    ${trackingBlock}

    <div style="margin-top:24px;padding:16px 20px;background:${C.blush};border-radius:10px;border-left:3px solid ${C.accent};">
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.7;">
        When it arrives, I'd love to see you wearing it! Tag me on Instagram
        <a href="https://www.instagram.com/madebyadya" style="color:${C.accent};text-decoration:none;">@madebyadya</a>
        so I can share your look 💕
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your Made by Adya order is on its way! 📦`,
    html: layout(body),
  })

  if (error) {
    console.error('Failed to send shipping notification email:', error)
  }
}

// ─── Delivery + Review Request Email ─────────────────────────────────────────
export async function sendDeliveryNotification(order: {
  customer_email: string
  customer_name?: string
  order_number: string
  items?: { product_id: string; name: string }[]
}) {
  const resend = getResend()
  if (!resend) return

  // Generate a unique one-time review token
  const token = randomUUID()
  await saveReviewToken(token, {
    order_number: order.order_number,
    customer_name: order.customer_name ?? '',
    customer_email: order.customer_email,
    items: order.items ?? [],
  })
  const reviewUrl = `${BASE_URL}/review/${token}`

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      Hi ${order.customer_name || 'there'}! Your Made by Adya piece should have arrived by now 🎀
      I hope you absolutely love it — it was made with so much care just for you.
    </p>

    <div style="background:${C.blush};border-radius:10px;padding:14px 20px;margin-bottom:24px;box-sizing:border-box;">
      <span style="font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;">Order number</span>
      <div style="font-size:20px;font-family:Georgia,serif;font-weight:300;color:${C.accentDark};margin-top:4px;letter-spacing:0.05em;">${order.order_number}</div>
    </div>

    <div style="margin-bottom:24px;">
      <p style="font-size:15px;font-family:Georgia,serif;color:${C.accentDark};margin:0 0 10px;">Would you leave a review? 🌸</p>
      <p style="font-size:13px;color:${C.textMid};margin:0 0 16px;line-height:1.7;">
        Reviews mean the world to a small handmade business. It only takes a minute and helps other people
        find pieces they'll love too. Thank you so much! 💕
      </p>
      <a href="${reviewUrl}" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;letter-spacing:0.04em;">
        Leave a Review
      </a>
    </div>

    <div style="padding:16px 20px;background:${C.blush};border-radius:10px;border-left:3px solid ${C.accent};">
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.7;">
        Don't forget to tag me on Instagram
        <a href="https://www.instagram.com/madebyadya" style="color:${C.accent};text-decoration:none;">@madebyadya</a>
        — I love seeing you in your pieces! 📸
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your Made by Adya order has arrived! Leave a review 🌸`,
    html: layout(body),
  })

  if (error) {
    console.error('Failed to send delivery notification email:', error)
  }
}

// ─── Custom Order: Accepted ───────────────────────────────────────────────────
export async function sendCustomOrderAccepted(order: {
  customer_email: string
  customer_name: string
  piece_type: string
  estimated_time?: string
}) {
  const resend = getResend()
  if (!resend) return

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      Hi ${order.customer_name || 'there'}! I'm so excited to share that I've reviewed your custom order
      request and would love to make your piece 🌸 Here are the details:
    </p>

    <div style="background:${C.blush};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <div style="margin-bottom:10px;">
        <span style="font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;">Piece</span>
        <div style="font-size:16px;color:${C.accentDark};font-family:Georgia,serif;margin-top:2px;">${order.piece_type}</div>
      </div>
      ${order.estimated_time ? `
      <div>
        <span style="font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;">Estimated Completion</span>
        <div style="font-size:16px;color:${C.accentDark};font-family:Georgia,serif;margin-top:2px;">${order.estimated_time}</div>
      </div>` : ''}
    </div>

    <div style="padding:16px 20px;background:${C.blush};border-radius:10px;border-left:3px solid ${C.accent};margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.7;">
        I'll be in touch with any questions as I work on your piece. Once it's ready to ship, you'll
        receive a shipping notification with tracking info. Thank you so much for trusting me with this! 💕
      </p>
    </div>

    <p style="font-size:13px;color:${C.textMid};margin:0;line-height:1.7;">
      If you have any questions, just reply to this email or reach out on Instagram
      <a href="https://www.instagram.com/madebyadya" style="color:${C.accent};text-decoration:none;">@madebyadya</a>.
    </p>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your custom Made by Adya order has been accepted! 🌸`,
    html: layout(body),
  })
  if (error) console.error('Failed to send custom order accepted email:', error)
}

// ─── Custom Order: In Progress ────────────────────────────────────────────────
export async function sendCustomOrderInProgress(order: {
  customer_email: string
  customer_name: string
  piece_type: string
}) {
  const resend = getResend()
  if (!resend) return

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      Hi ${order.customer_name || 'there'}! Just wanted to let you know that I've started working on your
      custom piece — I'm so excited to bring your vision to life! 🧶
    </p>

    <div style="background:${C.blush};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <span style="font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;">Your Piece</span>
      <div style="font-size:16px;color:${C.accentDark};font-family:Georgia,serif;margin-top:2px;">${order.piece_type}</div>
    </div>

    <div style="padding:16px 20px;background:${C.blush};border-radius:10px;border-left:3px solid ${C.accent};">
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.7;">
        I'll send you another update once it's shipped. In the meantime, feel free to reach out if you
        have any questions — I love hearing from my customers! 💕
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Adya has started making your custom piece! 🧶`,
    html: layout(body),
  })
  if (error) console.error('Failed to send custom order in-progress email:', error)
}

// ─── Custom Order: Shipped ────────────────────────────────────────────────────
export async function sendCustomOrderShipped(order: {
  customer_email: string
  customer_name: string
  piece_type: string
  tracking_number?: string
}) {
  const resend = getResend()
  if (!resend) return

  const trackingBlock = order.tracking_number
    ? `
    <div style="background:${C.blush};border-radius:10px;padding:16px 20px;margin-bottom:20px;">
      <span style="font-size:11px;color:${C.textLight};letter-spacing:0.1em;text-transform:uppercase;">Tracking Number</span>
      <div style="font-size:18px;font-family:Georgia,serif;color:${C.accentDark};margin:6px 0 10px;letter-spacing:0.05em;">${order.tracking_number}</div>
      <a href="https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.tracking_number}"
        style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;letter-spacing:0.04em;">
        Track on USPS →
      </a>
    </div>`
    : ''

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      Hi ${order.customer_name || 'there'}! Your custom <strong>${order.piece_type}</strong> has been
      finished and is on its way to you! I put so much love into making it — I hope you adore it 🌸
    </p>
    ${trackingBlock}
    <div style="padding:16px 20px;background:${C.blush};border-radius:10px;border-left:3px solid ${C.accent};">
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.7;">
        When it arrives, I'd love to see you wearing it! Tag me on Instagram
        <a href="https://www.instagram.com/madebyadya" style="color:${C.accent};text-decoration:none;">@madebyadya</a>
        so I can share your look 💕
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your custom Made by Adya piece is on its way! 📦`,
    html: layout(body),
  })
  if (error) console.error('Failed to send custom order shipped email:', error)
}

// ─── Custom Order: Delivered ──────────────────────────────────────────────────
export async function sendCustomOrderDelivered(order: {
  customer_email: string
  customer_name: string
  piece_type: string
}) {
  const resend = getResend()
  if (!resend) return

  // Generate a unique one-time review token
  const token = randomUUID()
  await saveReviewToken(token, {
    order_number: `Custom — ${order.piece_type}`,
    customer_name: order.customer_name ?? '',
    customer_email: order.customer_email,
    items: [],
  })
  const reviewUrl = `${BASE_URL}/review/${token}`

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      Hi ${order.customer_name || 'there'}! Your custom <strong>${order.piece_type}</strong> should have
      arrived by now 🎀 I hope you absolutely love it — it was made with so much care just for you.
    </p>

    <div style="margin-bottom:24px;">
      <p style="font-size:15px;font-family:Georgia,serif;color:${C.accentDark};margin:0 0 10px;">Would you leave a review? 🌸</p>
      <p style="font-size:13px;color:${C.textMid};margin:0 0 16px;line-height:1.7;">
        Reviews mean the world to a small handmade business and only take a minute. Thank you so much! 💕
      </p>
      <a href="${reviewUrl}" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;letter-spacing:0.04em;">
        Leave a Review
      </a>
    </div>

    <div style="padding:16px 20px;background:${C.blush};border-radius:10px;border-left:3px solid ${C.accent};">
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.7;">
        Don't forget to tag me on Instagram
        <a href="https://www.instagram.com/madebyadya" style="color:${C.accent};text-decoration:none;">@madebyadya</a>
        — I love seeing you in your pieces! 📸
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your custom Made by Adya piece has arrived! Leave a review 🌸`,
    html: layout(body),
  })
  if (error) console.error('Failed to send custom order delivered email:', error)
}

// ─── Custom Order: Payment Request ───────────────────────────────────────────
export async function sendCustomOrderPaymentRequest(order: {
  customer_email: string
  customer_name: string
  piece_type: string
  amount: number // in cents
  payment_type: 'full' | 'deposit'
  payment_link: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const formattedAmount = `$${(order.amount / 100).toFixed(2)}`
  const label = order.payment_type === 'deposit' ? '50% deposit' : 'full payment'

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      Hi ${order.customer_name || 'there'}! Great news — I've reviewed your custom <strong>${order.piece_type}</strong>
      request and I'm ready to make it for you 🌸
    </p>

    <div style="background:${C.blush};border-radius:12px;padding:24px;margin-bottom:24px;border:1.5px solid ${C.border};text-align:center;">
      <p style="margin:0 0 6px;font-size:13px;color:${C.textLight};text-transform:uppercase;letter-spacing:0.1em;">Amount due (${label})</p>
      <p style="margin:0;font-size:36px;font-family:Georgia,serif;color:${C.accentDark};font-weight:300;">${formattedAmount}</p>
    </div>

    <div style="text-align:center;margin-bottom:28px;">
      <a href="${order.payment_link}" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;letter-spacing:0.04em;">
        Pay Now 💳
      </a>
    </div>

    <div style="padding:16px 20px;background:${C.blush};border-radius:10px;border:1.5px solid ${C.border};margin-bottom:20px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:${C.accentDark};">Prefer to pay another way?</p>
      <p style="margin:0 0 4px;font-size:13px;color:${C.textMid};"><strong>Venmo:</strong> @heyadya</p>
      <p style="margin:0 0 12px;font-size:13px;color:${C.textMid};"><strong>Zelle:</strong> 510-980-3566</p>
      <p style="margin:0;font-size:12px;color:${C.textLight};line-height:1.6;">
        Just send the payment and reply to this email so I can confirm.
      </p>
    </div>

    <div style="padding:16px 20px;background:${C.blush};border-radius:10px;border-left:3px solid ${C.accent};">
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.7;">
        ${order.payment_type === 'deposit'
          ? `This is a 50% deposit to confirm your order. The remaining balance will be due before shipping.`
          : `This covers the full cost of your piece. I'll get started as soon as payment is received!`}
      </p>
    </div>

    <p style="font-size:12px;color:${C.textLight};margin-top:20px;line-height:1.6;">
      If you have any questions, just reply to this email. I'll be in touch within 2 business days after payment. 🌷
    </p>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Your custom piece is ready to be confirmed 🌸`,
    html: layout(body),
  })
  if (error) console.error('Failed to send custom order payment request email:', error)
}

// ─── Custom Order: Payment Confirmation (to customer) ────────────────────────
export async function sendCustomOrderPaymentConfirmation(order: {
  customer_email: string
  customer_name: string
  piece_type: string
  amount_paid: number // in cents
  payment_type: 'full' | 'deposit'
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const formattedAmount = `$${(order.amount_paid / 100).toFixed(2)}`
  const label = order.payment_type === 'deposit' ? '50% deposit' : 'full payment'

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      Hi ${order.customer_name || 'there'}! I've received your ${label} of <strong>${formattedAmount}</strong>
      for your custom <strong>${order.piece_type}</strong> 🧶
    </p>

    <div style="background:${C.blush};border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1.5px solid ${C.border};">
      <p style="margin:0 0 8px;font-size:14px;color:${C.accentDark};font-weight:500;">What happens next?</p>
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.8;">
        I'll reach out soon with updates as I start working on your piece.
        You'll get another email when it's in progress, when it ships, and when it's delivered. 💕
      </p>
    </div>

    <div style="padding:16px 20px;background:${C.blush};border-radius:10px;border-left:3px solid ${C.accent};">
      <p style="margin:0;font-size:13px;color:${C.textMid};line-height:1.7;">
        Questions? Just reply to this email anytime —
        <a href="https://madebyadya.com" style="color:${C.accent};text-decoration:none;">madebyadya.com</a>
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: order.customer_email,
    subject: `Payment received — I'll get started! 🧶`,
    html: layout(body),
  })
  if (error) console.error('Failed to send custom order payment confirmation email:', error)
}

// ─── Custom Order: Admin Notification (payment received) ─────────────────────
export async function sendAdminCustomOrderPaid(order: {
  customer_name: string
  customer_email: string
  piece_type: string
  amount_paid: number // in cents
  order_id: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const adminEmail = process.env.ADMIN_EMAIL ?? 'adyakadam@berkeley.edu'
  const formattedAmount = `$${(order.amount_paid / 100).toFixed(2)}`

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      A customer just paid for their custom order! 🎉
    </p>

    <div style="background:${C.blush};border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1.5px solid ${C.border};">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="font-size:13px;color:${C.textLight};padding-bottom:8px;">Customer</td><td style="font-size:13px;color:${C.text};font-weight:500;">${order.customer_name} (${order.customer_email})</td></tr>
        <tr><td style="font-size:13px;color:${C.textLight};padding-bottom:8px;">Piece</td><td style="font-size:13px;color:${C.text};">${order.piece_type}</td></tr>
        <tr><td style="font-size:13px;color:${C.textLight};padding-bottom:8px;">Amount Paid</td><td style="font-size:15px;color:${C.accentDark};font-weight:500;">${formattedAmount}</td></tr>
      </table>
    </div>

    <div style="text-align:center;">
      <a href="${BASE_URL}/admin" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;">
        View in Admin →
      </a>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `💸 Custom order payment received — ${order.customer_name}`,
    html: layout(body),
  })
  if (error) console.error('Failed to send admin custom order paid email:', error)
}

// ─── Admin: New Shop Order Notification ──────────────────────────────────────
export async function sendAdminNewOrder(order: {
  order_number: string
  customer_name: string
  customer_email: string
  total: number // in cents
  items: { name: string; qty: number; size?: string; color?: string }[]
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const adminEmail = process.env.ADMIN_EMAIL ?? 'adyakadam@berkeley.edu'
  const formattedTotal = `$${(order.total / 100).toFixed(2)}`

  const itemRows = order.items.map((i) =>
    `<tr><td style="font-size:13px;color:${C.text};padding:4px 0;">${i.name}${i.size ? ` (${i.size})` : ''}${i.color ? ` [${i.color}]` : ''}</td><td style="font-size:13px;color:${C.textMid};padding:4px 0;text-align:right;">x${i.qty}</td></tr>`
  ).join('')

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      You have a new shop order!
    </p>

    <div style="background:${C.blush};border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1.5px solid ${C.border};">
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:12px;">
        <tr><td style="font-size:13px;color:${C.textLight};padding-bottom:6px;">Order</td><td style="font-size:13px;color:${C.text};font-weight:500;">${order.order_number}</td></tr>
        <tr><td style="font-size:13px;color:${C.textLight};padding-bottom:6px;">Customer</td><td style="font-size:13px;color:${C.text};">${order.customer_name} (${order.customer_email})</td></tr>
        <tr><td style="font-size:13px;color:${C.textLight};padding-bottom:6px;">Total</td><td style="font-size:15px;color:${C.accentDark};font-weight:500;">${formattedTotal}</td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" width="100%">
        ${itemRows}
      </table>
    </div>

    <div style="text-align:center;">
      <a href="${BASE_URL}/admin" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;">
        View in Admin →
      </a>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `New order ${order.order_number} — ${order.customer_name} — ${formattedTotal}`,
    html: layout(body),
  })
  if (error) console.error('Failed to send admin new order email:', error)
}

// ─── Admin: New Custom Order Request Notification ────────────────────────────
export async function sendAdminNewCustomOrder(order: {
  customer_name: string
  customer_email: string
  piece_type: string
  budget: string
  vision: string
}): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const adminEmail = process.env.ADMIN_EMAIL ?? 'adyakadam@berkeley.edu'

  const body = `
    <p style="font-size:14px;color:${C.textMid};margin:0 0 20px;line-height:1.6;">
      You have a new custom order request!
    </p>

    <div style="background:${C.blush};border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1.5px solid ${C.border};">
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="font-size:13px;color:${C.textLight};padding-bottom:6px;">Customer</td><td style="font-size:13px;color:${C.text};font-weight:500;">${order.customer_name} (${order.customer_email})</td></tr>
        <tr><td style="font-size:13px;color:${C.textLight};padding-bottom:6px;">Piece</td><td style="font-size:13px;color:${C.text};">${order.piece_type}</td></tr>
        <tr><td style="font-size:13px;color:${C.textLight};padding-bottom:6px;">Budget</td><td style="font-size:13px;color:${C.text};">${order.budget}</td></tr>
        <tr><td style="font-size:13px;color:${C.textLight};padding-top:8px;vertical-align:top;">Vision</td><td style="font-size:13px;color:${C.text};padding-top:8px;line-height:1.6;">${order.vision}</td></tr>
      </table>
    </div>

    <div style="text-align:center;">
      <a href="${BASE_URL}/admin" style="display:inline-block;background:${C.accent};color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;">
        View in Admin →
      </a>
    </div>
  `

  const { error } = await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `New custom order request — ${order.customer_name} — ${order.piece_type}`,
    html: layout(body),
  })
  if (error) console.error('Failed to send admin new custom order email:', error)
}
