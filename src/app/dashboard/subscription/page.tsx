export default function SubscriptionPage() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-bold text-lg">Basic</h3>
        <p className="my-2">₹499 / month</p>
        <ul className="text-sm">
          <li>✔ Orders</li>
          <li>✔ Products</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded shadow border-2 border-black">
        <h3 className="font-bold text-lg">Pro</h3>
        <p className="my-2">₹999 / month</p>
        <ul className="text-sm">
          <li>✔ Analytics</li>
          <li>✔ Unlimited tables</li>
        </ul>
      </div>
    </div>
  )
}