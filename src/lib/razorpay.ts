/**
 * Razorpay checkout helper.
 *
 * Loads the Razorpay checkout script and opens the payment modal. In production
 * you create an order server-side using the secret key (NEVER in the frontend),
 * then pass that `order_id` here so Razorpay can verify the signature on its end.
 *
 * Structure kept here so the integration works the moment real keys are added;
 * in demo mode (no keys) it simulates a successful payment so the flow can be
 * exercised end-to-end.
 */

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptPromise: Promise<void> | null = null

function loadRazorpay(): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
  return scriptPromise
}

export interface RazorpayOptions {
  amount: number // in paise
  orderId?: string // created server-side in production
  name: string
  description: string
  prefill: { name: string; email: string; contact: string }
  onSuccess: (response: { razorpay_payment_id: string; razorpay_order_id?: string; razorpay_signature?: string }) => void
  onFailure?: (error: any) => void
}

export async function openRazorpayCheckout(opts: RazorpayOptions) {
  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID
  const hasRealKey = keyId && !keyId.includes('yourkeyid')

  // Demo mode: simulate payment success
  if (!hasRealKey) {
    setTimeout(() => {
      opts.onSuccess({
        razorpay_payment_id: `pay_demo_${Date.now()}`,
        razorpay_order_id: opts.orderId,
        razorpay_signature: 'demo_signature',
      })
    }, 900)
    return
  }

  await loadRazorpay()
  const Razorpay = (window as any).Razorpay
  const rzp = new Razorpay({
    key: keyId,
    amount: opts.amount,
    currency: 'INR',
    name: opts.name,
    description: opts.description,
    order_id: opts.orderId,
    prefill: opts.prefill,
    theme: { color: '#646F4B' },
    handler: (response: any) => opts.onSuccess(response),
    modal: { ondismiss: () => opts.onFailure?.({ reason: 'dismissed' }) },
  })
  rzp.on('payment.failed', (resp: any) => opts.onFailure?.(resp.error))
  rzp.open()
}
