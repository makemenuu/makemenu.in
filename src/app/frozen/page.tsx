export default function FrozenPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>🔒 Account Frozen</h1>
      <p style={{ color: "#666" }}>Your account has been suspended. Please contact support.</p>
    </div>
  )
}