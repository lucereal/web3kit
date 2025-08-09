export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Resource Title</h1>
        <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground">Buy</button>
      </div>
      {/* TODO: Details & Activity feed */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-card border border-border h-48" />
        <div className="rounded-2xl bg-card border border-border h-48" />
      </div>
    </div>
  )
}
