export default function Page() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form className="space-y-4">
        {/* TODO: Zod + RHF form fields */}
        <div className="rounded-2xl bg-card border border-border p-4">Form</div>
      </form>
      <div className="rounded-2xl bg-card border border-border p-4">Preview</div>
    </div>
  )
}
