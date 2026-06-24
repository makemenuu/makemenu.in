"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type Category = { id: string; name: string; takeaway_charge?: number }

type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category_id: string
  type: string
  is_available?: boolean
}

type AddonItem = {
  id: string
  group_id: string
  name: string
  price: number
}

type AddonGroup = {
  id: string
  product_id: string
  name: string
  max_selections: number
  is_required: boolean
  items: AddonItem[]
}

const ITEMS_DESKTOP = 6
const ITEMS_TABLET  = 4
const ITEMS_MOBILE  = 2

function useItemsPerPage() {
  const [items, setItems] = useState(ITEMS_DESKTOP)
  useEffect(() => {
    const calc = () => {
      if (window.innerWidth < 640)       setItems(ITEMS_MOBILE)
      else if (window.innerWidth < 1024) setItems(ITEMS_TABLET)
      else                               setItems(ITEMS_DESKTOP)
    }
    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
  }, [])
  return items
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{
        position: "fixed", top: 24, right: 24, zIndex: 9999,
        display: "flex", alignItems: "center", gap: 10,
        background: "#fff", border: "1.5px solid #EBEBEB",
        borderLeft: "4px solid #EF233C", borderRadius: 12,
        padding: "12px 18px", boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
        fontFamily: "'DM Sans', -apple-system, sans-serif",
        fontSize: 14, fontWeight: 600, color: "#111",
        animation: "toastIn 0.2s ease", minWidth: 220,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%", background: "#FFF1F2",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l4 4 6-7" stroke="#EF233C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {message}
        <button onClick={onClose} style={{
          marginLeft: "auto", background: "none", border: "none",
          cursor: "pointer", color: "#aaa", fontSize: 16, lineHeight: 1, padding: "0 0 0 8px",
        }}>×</button>
      </div>
    </>
  )
}

function CategoryPager({
  categories, activeCategory, onSelect, onEdit, onDelete,
  editingCategoryId, editingCategoryName, setEditingCategoryName,
  editingTakeawayCharge, setEditingTakeawayCharge, onUpdateCategory,
}: {
  categories: Category[]
  activeCategory: string
  onSelect: (id: string) => void
  onEdit: (c: Category) => void
  onDelete: (id: string) => void
  editingCategoryId: string | null
  editingCategoryName: string
  setEditingCategoryName: (v: string) => void
  editingTakeawayCharge: string
  setEditingTakeawayCharge: (v: string) => void
  onUpdateCategory: (id: string) => void
}) {
  const itemsPerPage = useItemsPerPage()
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(categories.length / itemsPerPage)
  const canPrev = page > 0
  const canNext = page < totalPages - 1

  useEffect(() => { setPage(0) }, [categories.length, itemsPerPage])

  const visibleCategories = categories.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage)

  return (
    <div className="flex items-center gap-2 border-b pb-3 select-none">
      <button
        onClick={() => canPrev && setPage(p => p - 1)}
        className={`flex-shrink-0 w-8 h-8 rounded-full border bg-white flex items-center justify-center text-xl leading-none transition-all duration-150 ${canPrev ? "border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer" : "border-gray-200 text-gray-300 cursor-not-allowed opacity-40"}`}
      >‹</button>

      <div className="flex-1 flex gap-2 min-w-0">
        {visibleCategories.map(c => (
          <div
            key={c.id}
            className="flex flex-col items-center gap-1"
            style={{ flex: `0 0 calc(${100 / itemsPerPage}% - ${(itemsPerPage - 1) * 8 / itemsPerPage}px)` }}
          >
            {editingCategoryId === c.id ? (
              <div className="flex flex-col gap-1 w-full">
                <input
                  value={editingCategoryName}
                  onChange={e => setEditingCategoryName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && onUpdateCategory(c.id)}
                  className="border px-2 py-1 rounded text-sm w-full"
                  placeholder="Category name"
                  autoFocus
                />
                <input
                  type="number"
                  value={editingTakeawayCharge}
                  onChange={e => setEditingTakeawayCharge(e.target.value)}
                  onBlur={() => onUpdateCategory(c.id)}
                  onKeyDown={e => e.key === "Enter" && onUpdateCategory(c.id)}
                  className="border px-2 py-1 rounded text-sm w-full"
                  placeholder="Takeaway ₹/item"
                  min="0"
                />
              </div>
            ) : (
              <div className="w-full">
                <button
                  onClick={() => onSelect(c.id)}
                  className={`w-full py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-all duration-150 truncate ${activeCategory === c.id ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:text-red-500"}`}
                >
                  {c.name}
                </button>
                {(c.takeaway_charge ?? 0) > 0 && (
                  <div className="text-center text-xs text-gray-400 mt-0.5">
                    +₹{c.takeaway_charge}/item takeaway
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-center gap-2 mt-1">
              <button onClick={() => onEdit(c)}>
                <img src="/icons/edit.png" className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(c.id)}>
                <img src="/icons/delete.png" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: itemsPerPage - visibleCategories.length }).map((_, i) => (
          <div key={`empty-${i}`} style={{ flex: `0 0 calc(${100 / itemsPerPage}% - ${(itemsPerPage - 1) * 8 / itemsPerPage}px)` }} />
        ))}
      </div>

      <button
        onClick={() => canNext && setPage(p => p + 1)}
        className={`flex-shrink-0 w-8 h-8 rounded-full border bg-white flex items-center justify-center text-xl leading-none transition-all duration-150 ${canNext ? "border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer" : "border-gray-200 text-gray-300 cursor-not-allowed opacity-40"}`}
      >›</button>
    </div>
  )
}

// ── Addon Manager ─────────────────────────────────────────────────────────────
function AddonManager({ product, userId }: { product: Product; userId: string }) {
  const [groups, setGroups]           = useState<AddonGroup[]>([])
  const [loading, setLoading]         = useState(true)
  const [expanded, setExpanded]       = useState(false)
  const [addingGroup, setAddingGroup] = useState(false)
  const [newGroupName, setNewGroupName]   = useState("")
  const [newGroupMax, setNewGroupMax]     = useState("1")
  const [newGroupReq, setNewGroupReq]     = useState(false)
  // per-group new-item state
  const [newItemName, setNewItemName]     = useState<Record<string, string>>({})
  const [newItemPrice, setNewItemPrice]   = useState<Record<string, string>>({})
  // per-group edit state
  const [editGroupId, setEditGroupId]   = useState<string | null>(null)
  const [editGroupName, setEditGroupName] = useState("")
  const [editGroupMax, setEditGroupMax]   = useState("1")
  const [editGroupReq, setEditGroupReq]   = useState(false)

  const fetchGroups = async () => {
    const { data: gData } = await supabase
      .from("addon_groups")
      .select("*, addon_items(*)")
      .eq("product_id", product.id)
      .order("created_at", { ascending: true })
    setGroups((gData || []).map(g => ({ ...g, items: g.addon_items || [] })))
    setLoading(false)
  }

  useEffect(() => { fetchGroups() }, [product.id])

  const createGroup = async () => {
    if (!newGroupName.trim()) return
    await supabase.from("addon_groups").insert({
      user_id: userId,
      product_id: product.id,
      name: newGroupName.trim(),
      max_selections: Number(newGroupMax) || 1,
      is_required: newGroupReq,
    })
    setNewGroupName(""); setNewGroupMax("1"); setNewGroupReq(false); setAddingGroup(false)
    fetchGroups()
  }

  const updateGroup = async (id: string) => {
    await supabase.from("addon_groups").update({
      name: editGroupName,
      max_selections: Number(editGroupMax) || 1,
      is_required: editGroupReq,
    }).eq("id", id)
    setEditGroupId(null)
    fetchGroups()
  }

  const deleteGroup = async (id: string) => {
    if (!confirm("Delete this addon group and all its items?")) return
    await supabase.from("addon_items").delete().eq("group_id", id)
    await supabase.from("addon_groups").delete().eq("id", id)
    fetchGroups()
  }

  const addItem = async (groupId: string) => {
    const name  = (newItemName[groupId] || "").trim()
    const price = Number(newItemPrice[groupId] || 0)
    if (!name) return
    await supabase.from("addon_items").insert({ group_id: groupId, name, price })
    setNewItemName(p  => ({ ...p, [groupId]: "" }))
    setNewItemPrice(p => ({ ...p, [groupId]: "" }))
    fetchGroups()
  }

  const deleteItem = async (itemId: string) => {
    await supabase.from("addon_items").delete().eq("id", itemId)
    fetchGroups()
  }

  const totalGroups = groups.length

  return (
    <div style={{
      borderTop: "1px dashed #e5e7eb",
      marginTop: 8,
      paddingTop: 8,
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: expanded ? "#FFF1F2" : "#f9fafb",
          border: "1px solid",
          borderColor: expanded ? "#fecdd3" : "#e5e7eb",
          borderRadius: 8, padding: "7px 12px",
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          fontSize: 12, fontWeight: 700, color: expanded ? "#E8192C" : "#555",
          transition: "all 0.15s",
        }}
      >
        <span>
          🧩 Addons
          {totalGroups > 0 && (
            <span style={{
              marginLeft: 6, background: "#EF233C", color: "#fff",
              borderRadius: 20, padding: "1px 7px", fontSize: 10, fontWeight: 800,
            }}>{totalGroups}</span>
          )}
        </span>
        <span style={{ fontSize: 14 }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div style={{ fontSize: 12, color: "#aaa", textAlign: "center", padding: "8px 0" }}>Loading...</div>
          ) : groups.length === 0 && !addingGroup ? (
            <div style={{ fontSize: 12, color: "#aaa", textAlign: "center", padding: "8px 0" }}>
              No addon groups yet
            </div>
          ) : null}

          {/* Existing groups */}
          {groups.map(group => (
            <div key={group.id} style={{
              border: "1px solid #e5e7eb", borderRadius: 10,
              overflow: "hidden", background: "#fafafa",
            }}>
              {/* Group header */}
              <div style={{
                background: "#f3f4f6", padding: "8px 12px",
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
              }}>
                {editGroupId === group.id ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <input
                      value={editGroupName}
                      onChange={e => setEditGroupName(e.target.value)}
                      style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: 12, width: "100%" }}
                      placeholder="Group name"
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <label style={{ fontSize: 11, color: "#666" }}>Max select:</label>
                      <input
                        type="number" min="1" value={editGroupMax}
                        onChange={e => setEditGroupMax(e.target.value)}
                        style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: 12, width: 52 }}
                      />
                      <label style={{ fontSize: 11, color: "#666", display: "flex", alignItems: "center", gap: 4 }}>
                        <input type="checkbox" checked={editGroupReq} onChange={e => setEditGroupReq(e.target.checked)} />
                        Required
                      </label>
                      <button
                        onClick={() => updateGroup(group.id)}
                        style={{ marginLeft: "auto", background: "#EF233C", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                      >Save</button>
                      <button
                        onClick={() => setEditGroupId(null)}
                        style={{ background: "#e5e7eb", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}
                      >✕</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{group.name}</div>
                      <div style={{ fontSize: 10, color: "#888", marginTop: 1 }}>
                        Select up to {group.max_selections} · {group.is_required ? "Required" : "Optional"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => {
                          setEditGroupId(group.id)
                          setEditGroupName(group.name)
                          setEditGroupMax(String(group.max_selections))
                          setEditGroupReq(group.is_required)
                        }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}
                      >
                        <img src="/icons/edit.png" style={{ width: 14, height: 14 }} />
                      </button>
                      <button onClick={() => deleteGroup(group.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                        <img src="/icons/delete.png" style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Items list */}
              <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                {group.items.map(item => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8,
                    padding: "6px 10px",
                  }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#222" }}>{item.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#EF233C", fontWeight: 700 }}>
                        {item.price > 0 ? `+₹${item.price}` : "Free"}
                      </span>
                      <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>
                        <img src="/icons/delete.png" style={{ width: 12, height: 12 }} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add item row */}
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                  <input
                    value={newItemName[group.id] || ""}
                    onChange={e => setNewItemName(p => ({ ...p, [group.id]: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addItem(group.id)}
                    placeholder="Item name"
                    style={{
                      flex: 1, border: "1px dashed #d1d5db", borderRadius: 7,
                      padding: "5px 8px", fontSize: 12, outline: "none",
                    }}
                  />
                  <div style={{ position: "relative", width: 72 }}>
                    <span style={{ position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#888" }}>₹</span>
                    <input
                      type="number" min="0"
                      value={newItemPrice[group.id] || ""}
                      onChange={e => setNewItemPrice(p => ({ ...p, [group.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addItem(group.id)}
                      placeholder="0"
                      style={{
                        width: "100%", border: "1px dashed #d1d5db", borderRadius: 7,
                        padding: "5px 6px 5px 18px", fontSize: 12, outline: "none",
                      }}
                    />
                  </div>
                  <button
                    onClick={() => addItem(group.id)}
                    style={{
                      background: "#EF233C", color: "#fff", border: "none",
                      borderRadius: 7, padding: "5px 10px", fontSize: 11,
                      fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                    }}
                  >+ Add</button>
                </div>
              </div>
            </div>
          ))}

          {/* New group form */}
          {addingGroup && (
            <div style={{
              border: "1.5px dashed #EF233C", borderRadius: 10,
              padding: "12px", background: "#fff8f8",
              display: "flex", flexDirection: "column", gap: 8,
            }}>
              <input
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Group name (e.g. Starters, Beverages)"
                style={{ border: "1px solid #fca5a5", borderRadius: 7, padding: "7px 10px", fontSize: 12, outline: "none", width: "100%" }}
                autoFocus
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <label style={{ fontSize: 11, color: "#666", whiteSpace: "nowrap" }}>Max selections:</label>
                  <input
                    type="number" min="1" value={newGroupMax}
                    onChange={e => setNewGroupMax(e.target.value)}
                    style={{ border: "1px solid #fca5a5", borderRadius: 7, padding: "5px 8px", fontSize: 12, width: 52, outline: "none" }}
                  />
                </div>
                <label style={{ fontSize: 11, color: "#666", display: "flex", alignItems: "center", gap: 4 }}>
                  <input type="checkbox" checked={newGroupReq} onChange={e => setNewGroupReq(e.target.checked)} />
                  Required
                </label>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={createGroup}
                  style={{ flex: 1, background: "#EF233C", color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >Create Group</button>
                <button
                  onClick={() => { setAddingGroup(false); setNewGroupName(""); setNewGroupMax("1"); setNewGroupReq(false) }}
                  style={{ background: "#e5e7eb", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}
                >Cancel</button>
              </div>
            </div>
          )}

          {!addingGroup && (
            <button
              onClick={() => setAddingGroup(true)}
              style={{
                width: "100%", border: "1.5px dashed #EF233C", borderRadius: 8,
                background: "none", color: "#EF233C", fontSize: 12, fontWeight: 700,
                padding: "8px", cursor: "pointer",
              }}
            >+ Add Addon Group</button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [categories, setCategories]                       = useState<Category[]>([])
  const [products, setProducts]                           = useState<Product[]>([])
  const [userId, setUserId]                               = useState<string>("")
  const [categoryName, setCategoryName]                   = useState("")
  const [takeawayCharge, setTakeawayCharge]               = useState("")
  const [productName, setProductName]                     = useState("")
  const [description, setDescription]                     = useState("")
  const [price, setPrice]                                 = useState("")
  const [selectedCategory, setSelectedCategory]           = useState("")
  const [type, setType]                                   = useState<"veg" | "non-veg" | "">("")
  const [imageFile, setImageFile]                         = useState<File | null>(null)
  const [editingCategoryId, setEditingCategoryId]         = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName]     = useState("")
  const [editingTakeawayCharge, setEditingTakeawayCharge] = useState("")
  const [activeCategory, setActiveCategory]               = useState("")
  const [editingProduct, setEditingProduct]               = useState<Product | null>(null)
  const [newImage, setNewImage]                           = useState<File | null>(null)
  const [preview, setPreview]                             = useState("")
  const [toast, setToast]                                 = useState("")

  const showToast = (msg: string) => setToast(msg)

  const fetchData = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user
    if (!user) return
    setUserId(user.id)
    const { data: catData }  = await supabase.from("categories").select("*").eq("user_id", user.id)
    const { data: prodData } = await supabase.from("products").select("*").eq("user_id", user.id)
    const safeProducts = (prodData || []).map(p => ({
      ...p, description: p.description || "", image_url: p.image_url || null,
    }))
    setCategories(catData || [])
    setProducts(safeProducts)
    if (catData?.length) setActiveCategory(prev => prev || catData[0].id)
  }

  useEffect(() => { fetchData() }, [])

  const addCategory = async () => {
    if (!categoryName.trim()) return alert("Enter category name")
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert("Not logged in")
    const { error } = await supabase.from("categories").insert({
      user_id: session.user.id,
      name: categoryName,
      takeaway_charge: Number(takeawayCharge) || 0,
    })
    if (error) return alert(error.message)
    const added = categoryName.trim()
    setCategoryName("")
    setTakeawayCharge("")
    fetchData()
    showToast(`Category "${added}" created!`)
  }

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete category?")) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from("categories").delete().eq("id", id).eq("user_id", session.user.id)
    fetchData()
  }

  const updateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { error } = await supabase.from("categories")
      .update({
        name: editingCategoryName,
        takeaway_charge: Number(editingTakeawayCharge) || 0,
      })
      .eq("id", id).eq("user_id", session.user.id)
    if (error) return alert(error.message)
    setEditingCategoryId(null)
    setEditingCategoryName("")
    setEditingTakeawayCharge("")
    fetchData()
  }

  const uploadImage = async (file: File) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    const path = `${session.user.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from("product-images").upload(path, file)
    if (error) { alert(error.message); return null }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path)
    return data.publicUrl
  }

  const handleImageChange = (file: File) => {
    setNewImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const addProduct = async () => {
    if (!productName || !price || !selectedCategory || !type) return alert("Fill all fields")
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert("Not logged in")
    const imageUrl = imageFile ? await uploadImage(imageFile) : null
    const { error } = await supabase.from("products").insert({
      user_id: session.user.id, name: productName, description,
      price: Number(price), category_id: selectedCategory,
      type, image_url: imageUrl, is_available: true,
    })
    if (error) return alert(error.message)
    const addedName = productName.trim()
    setProductName(""); setDescription(""); setPrice("")
    setSelectedCategory(""); setType(""); setImageFile(null)
    fetchData()
    showToast(`"${addedName}" added to menu!`)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete product?")) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from("products").delete().eq("id", id).eq("user_id", session.user.id)
    fetchData()
  }

  const toggleAvailability = async (p: Product) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from("products").update({ is_available: !p.is_available }).eq("id", p.id).eq("user_id", session.user.id)
    fetchData()
  }

  const updateProduct = async () => {
    if (!editingProduct) return
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    let imageUrl = editingProduct.image_url
    if (newImage) imageUrl = await uploadImage(newImage)
    const { error } = await supabase.from("products").update({
      name: editingProduct.name, description: editingProduct.description,
      price: editingProduct.price, image_url: imageUrl,
    }).eq("id", editingProduct.id).eq("user_id", session.user.id)
    if (error) return alert(error.message)
    setEditingProduct(null); setNewImage(null); setPreview("")
    fetchData()
  }

  const filtered = products.filter(p => p.category_id === activeCategory)

  return (
    <div className="bg-gray-100 min-h-screen p-4 space-y-6">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
      <h2 className="text-xl font-semibold">Add item and categories</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl space-y-3">
          <input
            placeholder="Category name"
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCategory()}
            className="w-full border px-3 py-2 rounded-full"
          />
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <input
              type="text"
              inputMode="numeric"
              value={takeawayCharge}
              onChange={(e) => setTakeawayCharge(e.target.value)}
              placeholder="Takeaway charge (₹/item)"
              className="w-full border rounded-full pl-10 pr-4 py-2"
            />
          </div>
          <button onClick={addCategory} className="bg-red-500 text-white px-4 py-2 rounded-full">
            Add category
          </button>

          <input
            placeholder="Product name"
            value={productName}
            onChange={e => setProductName(e.target.value)}
            className="w-full border px-3 py-2 rounded-full"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full border px-3 py-2 rounded-full"
          />
        </div>

        <div className="bg-white p-4 rounded-xl space-y-3">
          <input
            type="file"
            onChange={e => setImageFile(e.target.files?.[0] || null)}
            className="w-full border px-3 py-2 rounded-full"
          />
          <div className="flex gap-2">
            <button onClick={() => setType("veg")} className={type === "veg" ? "bg-green-500 text-white px-3 py-1 rounded" : "bg-gray-200 px-3 py-1 rounded"}>Veg</button>
            <button onClick={() => setType("non-veg")} className={type === "non-veg" ? "bg-red-500 text-white px-3 py-1 rounded" : "bg-gray-200 px-3 py-1 rounded"}>Non-veg</button>
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full border px-3 py-2 rounded-full"
          >
            <option value="">Choose category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{(c.takeaway_charge ?? 0) > 0 ? ` (+₹${c.takeaway_charge}/item takeaway)` : ""}
              </option>
            ))}
          </select>
          <button onClick={addProduct} className="bg-red-500 text-white w-full py-2 rounded-full">
            Add item
          </button>
        </div>
      </div>

      <CategoryPager
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        onEdit={c => {
          setEditingCategoryId(c.id)
          setEditingCategoryName(c.name)
          setEditingTakeawayCharge(String(c.takeaway_charge ?? 0))
        }}
        onDelete={deleteCategory}
        editingCategoryId={editingCategoryId}
        editingCategoryName={editingCategoryName}
        setEditingCategoryName={setEditingCategoryName}
        editingTakeawayCharge={editingTakeawayCharge}
        setEditingTakeawayCharge={setEditingTakeawayCharge}
        onUpdateCategory={updateCategory}
      />

      <div className="grid md:grid-cols-3 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="bg-white p-3 rounded-xl space-y-2">
            <div className="relative">
              <div className="w-full aspect-[16/9] bg-gray-100 rounded overflow-hidden">
                {p.image_url
                  ? <img src={p.image_url} className="w-full h-full object-cover" />
                  : <div className="flex items-center justify-center h-full">No Image</div>}
              </div>
              <div className="absolute top-2 left-2 bg-white p-1 rounded">
                <img src={p.type === "veg" ? "/icons/veg.png" : "/icons/nonveg.png"} className="w-5 h-5" />
              </div>
              <div
                onClick={() => toggleAvailability(p)}
                className={`absolute top-2 right-2 w-10 h-5 rounded-full cursor-pointer ${p.is_available ? "bg-green-500" : "bg-gray-300"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 ${p.is_available ? "right-0.5" : "left-0.5"}`} />
              </div>
            </div>
            <div>
              <h4 className="font-semibold">{p.name}</h4>
              <p
                className="text-sm text-gray-500 break-words line-clamp-2"
                style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
              >
                {p.description}
              </p>
              <div className="flex justify-between items-center mt-1">
                ₹{p.price}
                <div className="flex gap-2">
                  <button onClick={() => { setEditingProduct(p); setPreview(""); setNewImage(null) }}>
                    <img src="/icons/edit.png" className="w-5 h-5" />
                  </button>
                  <button onClick={() => deleteProduct(p.id)}>
                    <img src="/icons/delete.png" className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Addon Manager ── */}
            {userId && <AddonManager product={p} userId={userId} />}
          </div>
        ))}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-md space-y-3">
            <div className="w-full aspect-[16/9] bg-gray-100 rounded overflow-hidden">
              {(preview || editingProduct.image_url)
                ? <img src={preview || editingProduct.image_url!} className="w-full h-full object-cover" />
                : <div className="flex items-center justify-center h-full">No Image</div>}
            </div>
            <input type="file" onChange={e => e.target.files && handleImageChange(e.target.files[0])} />
            <input
              value={editingProduct.name}
              onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
              className="w-full border px-3 py-2 rounded-full"
            />
            <textarea
              value={editingProduct.description}
              onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="number"
              value={editingProduct.price}
              onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
              className="w-full border px-3 py-2 rounded-full"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditingProduct(null)} className="bg-gray-200 px-3 py-1 rounded-full">Cancel</button>
              <button onClick={updateProduct} className="bg-red-500 text-white px-3 py-1 rounded-full">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}