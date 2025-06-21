// Updated Arta Nusa Shop with auto-open cart on add
import React, { useState, useEffect } from "react";
import { PRODUCTS } from "./products"; // External product data file
export default function App() {
  const [items, setItems] = useState({});
  const [selected, setSelected] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("Singapore");
  const [rates, setRates] = useState({ SGD: 1, MYR: 3.1, IDR: 11500 });
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetch("https://ipapi.co/json")
      .then(res => res.json())
      .then(data => {
        if (data.country_name === "Malaysia") setCountry("Malaysia");
        else if (data.country_name === "Indonesia") setCountry("Indonesia");
        else setCountry("Singapore");
      });

    fetch("https://open.er-api.com/v6/latest/IDR")
      .then(res => res.json())
      .then(data => {
        const r = data.rates;
        setRates({ SGD: r.SGD || 0.00009, MYR: r.MYR || 0.0003, IDR: 1 });
      });
  }, []);

  const toCurrency = (value, country) => {
    const currencyMap = {
      Singapore: { code: "SGD", locale: "en-SG" },
      Malaysia: { code: "MYR", locale: "en-MY" },
      Indonesia: { code: "IDR", locale: "id-ID" },
    };
    const currency = currencyMap[country] || currencyMap["Singapore"];
    const rate = rates[currency.code] || 1;
    const converted = value * rate;
    return new Intl.NumberFormat(currency.locale, {
      style: "currency",
      currency: currency.code,
      minimumFractionDigits: 0,
    }).format(converted);
  };

  const add = (id) => {
    setItems(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setShowCart(true); // Auto-open cart when adding
  };

  const remove = (id) => {
    const next = { ...items };
    if (next[id] > 1) next[id]--;
    else delete next[id];
    setItems(next);
  };
  const clearCart = () => setItems({});

  const total = Object.entries(items).reduce((sum, [id, qty]) => {
    const variant = PRODUCTS.flatMap(p => p.variants).find(v => v.id === id);
    return sum + (variant?.price ?? 0) * qty;
  }, 0);

  const shipping = country === "Malaysia" ? 30000 : country === "Indonesia" ? 20000 : 15000;
  const grandTotal = total + shipping;
  const categories = ["All", ...new Set(PRODUCTS.map(p => p.category))];
  const filteredProducts = category === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category === category);

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800 p-4 font-serif">
      <header className="text-center mb-6 relative">
        <img src="/images/brand.jpg" alt="Arta Nusa Logo" className="absolute top-4 left-4 w-16 h-16 rounded-full object-contain shadow-md" />
        <div className="py-10 px-4 bg-pink-100 bg-opacity-70 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-amber-800 drop-shadow-md">Arta Nusa</h1>
          <div className="mt-4 flex justify-center gap-4">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-1 border rounded bg-white text-black">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="px-3 py-1 border rounded bg-white text-black">
              <option value="Singapore">🇸🇬 Singapore</option>
              <option value="Malaysia">🇲🇾 Malaysia</option>
              <option value="Indonesia">🇮🇩 Indonesia</option>
            </select>
          </div>
        </div>
      </header>

      <main className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map(p => (
          <div key={p.id} onClick={() => { setSelected(p); setSelectedVariant(p.variants[0]); }} className="bg-white rounded shadow cursor-pointer hover:scale-105 transition-transform duration-300">
            <img src={p.variants[0].img} alt={p.name} className="w-full h-60 object-contain p-4 rounded-t" />
            <div className="p-4">
              <h2 className="font-semibold text-lg">{p.name}</h2>
              <p className="text-amber-600 font-bold">{toCurrency(p.variants[0].price, country)}</p>
            </div>
          </div>
        ))}
      </main>

{selected && selectedVariant && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
      <img src={selectedVariant.img} alt={selectedVariant.name} className="w-full h-48 object-contain p-2 rounded bg-white" />
      <h2 className="text-xl font-bold mt-4">{selectedVariant.name}</h2>
      <p className="text-amber-600 font-semibold mb-2">{toCurrency(selectedVariant.price, country)}</p>
      
      {/* Variant selector dropdown */}
      <label className="block text-sm mb-1 text-gray-600">Select Variant:</label>
      <select
        value={selectedVariant.id}
        onChange={(e) => {
          const newVar = selected.variants.find(v => v.id === e.target.value);
          if (newVar) setSelectedVariant(newVar);
        }}
        className="mb-4 w-full border px-2 py-1 rounded"
      >
        {selected.variants.map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>

      <ul className="list-disc ml-5 text-sm text-gray-700 mb-4">
        {selectedVariant.benefits?.map((b, i) => <li key={i}>{b}</li>)}
      </ul>

      <div className="mt-4 flex justify-end gap-2">
        <button onClick={() => add(selectedVariant.id)} className="bg-amber-500 text-white px-4 py-2 rounded">Add to Cart</button>
        <button onClick={() => setSelected(null)} className="bg-gray-300 px-4 py-2 rounded">Close</button>
      </div>
    </div>
  </div>
)}


      {showCart && (
        <div className="fixed top-0 right-0 bg-white p-4 border-l shadow-lg w-80 h-screen z-50 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Your Cart</h3>
            <button onClick={clearCart} title="Clear Cart" className="text-red-600 text-xl hover:text-red-800">🗑️</button>
          </div>
          {Object.entries(items).length === 0 ? <p>Your cart is empty</p> : (
            Object.entries(items).map(([id, qty]) => {
              const variant = PRODUCTS.flatMap(p => p.variants).find(v => v.id === id);
              return (
                <div key={id} className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-semibold">{variant?.name}</p>
                    <p className="text-sm text-gray-600">Qty: {qty}</p>
                  </div>
                  <button onClick={() => remove(id)} className="text-red-600 font-bold">Remove</button>
                </div>
              );
            })
          )}
          <p className="mt-4 font-semibold">Shipping: {toCurrency(shipping, country)}</p>
          <p className="font-bold">Total: {toCurrency(grandTotal, country)}</p>
          <a
            href={`https://wa.me/6581262876?text=${encodeURIComponent(`Order from ${country}\nTotal: ${toCurrency(grandTotal, country)}\nItems: ${Object.entries(items).map(([id, qty]) => { const variant = PRODUCTS.flatMap(p => p.variants).find(v => v.id === id); return `${variant?.name} x${qty}` }).join(", ")}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 bg-green-600 text-white px-4 py-2 rounded text-center"
          >
            Checkout via WhatsApp
          </a>
        </div>
      )}

      <button onClick={() => setShowCart(!showCart)} title="Open Cart" className="fixed bottom-20 right-6 bg-amber-700 text-white p-4 rounded-full z-50 shadow-xl text-2xl">
        🛒
      </button>
    </div>
  );
}
