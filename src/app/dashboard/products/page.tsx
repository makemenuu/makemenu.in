"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"

type Category = { id: string; name: string }

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

// ─── How many category pills to show at once per breakpoint ───
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

// ─── Toast ────────────────────────────────────────────────────────────────────
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
      <div
        style={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#fff",
          border: "1.5px solid #EBEBEB",
          borderLeft: "4px solid #EF233C",
          borderRadius: 12,
          padding: "12px 18px",
          boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
          fontFamily: "'DM Sans', -apple-system, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#111",
          animation: "toastIn 0.2s ease",
          minWidth: 220,
        }}
      >
        {/* brand-red checkmark */}
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: "#FFF1F2", display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l4 4 6-7" stroke="#EF233C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {message}

        <button
          onClick={onClose}
          style={{
            marginLeft: "auto", background: "none", border: "none",
            cursor: "pointer", color: "#aaa", fontSize: 16,
            lineHeight: 1, padding: "0 0 0 8px",
          }}
        >
          ×
        </button>
      </div>
    </>
  )
}

// ─── Category Pager Component ─────────────────────────────────────────────────
function CategoryPager({
  categories,
  activeCategory,
  onSelect,
  onEdit,
  onDelete,
  editingCategoryId,
  editingCategoryName,
  setEditingCategoryName,
  onUpdateCategory,
}: {
  categories: Category[]
  activeCategory: string
  onSelect: (id: string) => void
  onEdit: (c: Category) => void
  onDelete: (id: string) => void
  editingCategoryId: string | null
  editingCategoryName: string
  setEditingCategoryName: (v: string) => void
  onUpdateCategory: (id: string) => void
}) {
  const itemsPerPage = useItemsPerPage()
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(categories.length / itemsPerPage)
  const canPrev = page > 0
  const canNext = page < totalPages - 1

  useEffect(() => { setPage(0) }, [categories.length, itemsPerPage])

  const visibleCategories = categories.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  )

  return (
    <div className="flex items-center gap-2 border-b pb-3 select-none">

      {/* LEFT ARROW */}
      <button
        onClick={() => canPrev && setPage(p => p - 1)}
        aria-label="Previous categories"
        className={`
          flex-shrink-0 w-8 h-8 rounded-full border bg-white
          flex items-center justify-center text-xl leading-none
          transition-all duration-150
          ${canPrev
            ? "border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
            : "border-gray-200 text-gray-300 cursor-not-allowed opacity-40"
          }
        `}
      >
        ‹
      </button>

      {/* VISIBLE PILLS */}
      <div className="flex-1 flex gap-2 min-w-0">
        {visibleCategories.map(c => (
          <div
            key={c.id}
            className="flex items-center gap-1"
            style={{ flex: `0 0 calc(${100 / itemsPerPage}% - ${(itemsPerPage - 1) * 8 / itemsPerPage}px)` }}
          >
            {editingCategoryId === c.id ? (
              <input
                value={editingCategoryName}
                onChange={e => setEditingCategoryName(e.target.value)}
                onBlur={() => onUpdateCategory(c.id)}
                onKeyDown={e => e.key === "Enter" && onUpdateCategory(c.id)}
                className="border px-2 py-1 rounded text-sm w-full"
                autoFocus
              />
            ) : (
              <button
                onClick={() => onSelect(c.id)}
                className={`
                  w-full py-1.5 rounded-full border text-sm font-medium whitespace-nowrap
                  transition-all duration-150 truncate
                  ${activeCategory === c.id
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:text-red-500"
                  }
                `}
              >
                {c.name}
              </button>
            )}
            <button onClick={() => onEdit(c)} className="opacity-40 hover:opacity-100 flex-shrink-0">
              <img src="/icons/edit.png" className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(c.id)} className="opacity-40 hover:opacity-100 flex-shrink-0">
              <img src="/icons/delete.png" className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Empty placeholder slots */}
        {Array.from({ length: itemsPerPage - visibleCategories.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{ flex: `0 0 calc(${100 / itemsPerPage}% - ${(itemsPerPage - 1) * 8 / itemsPerPage}px)` }}
          />
        ))}
      </div>

      {/* RIGHT ARROW */}
      <button
        onClick={() => canNext && setPage(p => p + 1)}
        aria-label="Next categories"
        className={`
          flex-shrink-0 w-8 h-8 rounded-full border bg-white
          flex items-center justify-center text-xl leading-none
          transition-all duration-150
          ${canNext
            ? "border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
            : "border-gray-200 text-gray-300 cursor-not-allowed opacity-40"
          }
        `}
      >
        ›
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [categories, setCategories]                   = useState<Category[]>([])
  const [products, setProducts]                       = useState<Product[]>([])
  const [categoryName, setCategoryName]               = useState("")
  const [productName, setProductName]                 = useState("")
  const [description, setDescription]                 = useState("")
  const [price, setPrice]                             = useState("")
  const [selectedCategory, setSelectedCategory]       = useState("")
  const [type, setType]                               = useState<"veg" | "non-veg" | "">("")
  const [imageFile, setImageFile]                     = useState<File | null>(null)
  const [editingCategoryId, setEditingCategoryId]     = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState("")
  const [activeCategory, setActiveCategory]           = useState("")
  const [editingProduct, setEditingProduct]           = useState<Product | null>(null)
  const [newImage, setNewImage]                       = useState<File | null>(null)
  const [preview, setPreview]                         = useState("")

  // ── Toast state ────────────────────────────────────────────────
  const [toast, setToast] = useState("")

  const showToast = (msg: string) => {
    setToast(msg)
  }

  // ── FETCH ──────────────────────────────────────────────────────
  const fetchData = async () => {
    const { data: sessionData } = await supabase.auth.getSession()
    const user = sessionData.session?.user
    if (!user) return

    const { data: catData }  = await supabase.from("categories").select("*").eq("user_id", user.id)
    const { data: prodData } = await supabase.from("products").select("*").eq("user_id", user.id)

    const safeProducts = (prodData || []).map(p => ({
      ...p,
      description: p.description || "",
      image_url: p.image_url || null,
    }))

    setCategories(catData || [])
    setProducts(safeProducts)
    if (catData?.length) setActiveCategory(catData[0].id)
  }

  useEffect(() => { fetchData() }, [])

  // ── CATEGORY CRUD ──────────────────────────────────────────────
  const addCategory = async () => {
    if (!categoryName.trim()) return alert("Enter category name")
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert("Not logged in")
    const { error } = await supabase.from("categories").insert({ user_id: session.user.id, name: categoryName })
    if (error) return alert(error.message)
    setCategoryName("")
    fetchData()
    showToast(`Category "${categoryName.trim()}" created!`)
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
    const { error } = await supabase.from("categories").update({ name: editingCategoryName }).eq("id", id).eq("user_id", session.user.id)
    if (error) return alert(error.message)
    setEditingCategoryId(null)
    setEditingCategoryName("")
    fetchData()
  }

  // ── IMAGE ──────────────────────────────────────────────────────
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

  // ── PRODUCT CRUD ───────────────────────────────────────────────
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

      {/* ── Themed top-right toast ── */}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <h2 className="text-xl font-semibold">Add item and categories</h2>

      {/* FORM */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl space-y-3">
          <input
            placeholder="Category"
            value={categoryName}
            onChange={e => setCategoryName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCategory()}
            className="w-full border px-3 py-2 rounded-full"
          />
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
            <button
              onClick={() => setType("veg")}
              className={type === "veg" ? "bg-green-500 text-white px-3 py-1 rounded" : "bg-gray-200 px-3 py-1 rounded"}
            >
              Veg
            </button>
            <button
              onClick={() => setType("non-veg")}
              className={type === "non-veg" ? "bg-red-500 text-white px-3 py-1 rounded" : "bg-gray-200 px-3 py-1 rounded"}
            >
              Non-veg
            </button>
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full border px-3 py-2 rounded-full"
          >
            <option value="">Choose</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={addProduct} className="bg-red-500 text-white w-full py-2 rounded-full">
            Add item
          </button>
        </div>
      </div>

      {/* ── CATEGORY PAGER ── */}
      <CategoryPager
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        onEdit={c => { setEditingCategoryId(c.id); setEditingCategoryName(c.name) }}
        onDelete={deleteCategory}
        editingCategoryId={editingCategoryId}
        editingCategoryName={editingCategoryName}
        setEditingCategoryName={setEditingCategoryName}
        onUpdateCategory={updateCategory}
      />

      {/* PRODUCTS */}
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
              <p className="text-sm text-gray-500">{p.description}</p>
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
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
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