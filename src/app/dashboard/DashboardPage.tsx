

export default function DashboardPage(){
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="border border-neutral-800 rounded-2xl p-4 bg-neutral-900">
        <div className="text-neutral-400 text-sm">Unpaid invoices</div>
        <div className="text-3xl font-extrabold">€ 0</div>
      </div>
      <div className="border border-neutral-800 rounded-2xl p-4 bg-neutral-900">
        <div className="text-neutral-400 text-sm">This week</div>
        <ul className="list-disc list-inside text-neutral-300">
          <li>Example task</li>
        </ul>
      </div>
    </div>
  )
}
