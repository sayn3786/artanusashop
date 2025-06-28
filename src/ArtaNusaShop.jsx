// Updated Arta Nusa Shop with animated intro, variant carousel, mobile compatibility, and top-right cart display
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PRODUCTS } from "./products";

export default function App() {
  const [items, setItems] = useState({});
  const [category, setCategory] = useState("All");
  const [country, setCountry] = useState("Singapore");
  const [rates, setRates] = useState({ SGD: 1, MYR: 3.1, IDR: 11500 });
  const [showCart, setShowCart] = useState(false);
  const [variantIndexes, setVariantIndexes] = useState({});

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
    setShowCart(true);
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
    <div className="min-h-screen bg-[#FBEFF3] text-gray-800 p-4 font-serif relative">
      {/* Cart UI */}
      <div className="fixed top-4 right-4 z-50">
        <button onClick={() => setShowCart(!showCart)} className="relative bg-white shadow-lg border border-amber-400 p-3 rounded-full hover:scale-105 transition-transform">
          🛒
          {Object.keys(items).length > 0 && (
            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
              {Object.values(items).reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
        {showCart && (
          <div className="mt-2 p-4 bg-white rounded shadow-md w-64 animate-fade-in">
            <h4 className="font-bold text-lg mb-2">Your Cart</h4>
            {Object.entries(items).length === 0 ? <p>No items</p> : (
              <ul className="text-sm">
                {Object.entries(items).map(([id, qty]) => {
                  const variant = PRODUCTS.flatMap(p => p.variants).find(v => v.id === id);
                  return (
                    <li key={id} className="mb-1 flex justify-between">
                      <span>{variant?.name} x{qty}</span>
                      <span>{toCurrency((variant?.price ?? 0) * qty, country)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-2 text-sm text-gray-600">Shipping: {toCurrency(shipping, country)}</p>
            <p className="text-md font-bold">Total: {toCurrency(grandTotal, country)}</p>
            <button onClick={clearCart} className="text-xs text-red-500 underline mt-2">Clear Cart</button>
            <a href={`https://wa.me/6582938821?text=${encodeURIComponent(`Order from ${country}\nTotal: ${toCurrency(grandTotal, country)}\nItems: ${Object.entries(items).map(([id, qty]) => { const p = PRODUCTS.flatMap(p => p.variants).find(v => v.id === id); return `${p?.name} x${qty}` }).join(", ")}`)}`} target="_blank" rel="noopener noreferrer" className="mt-3 block bg-green-600 text-white text-center px-4 py-2 rounded">Checkout via WhatsApp</a>
          </div>
        )}
      </div>

      {/* Store Description */}
      <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-center pt-40 sm:pt-8 px-6 bg-[#FADFEF] rounded-lg shadow-md mb-6 relative">
        <img src="/images/brand.jpg" alt="Arta Nusa Logo" className="absolute top-2 left-2 w-36 h-36 sm:w-44 sm:h-44 rounded-full object-contain shadow-md" />
        <h2 className="text-2xl font-bold text-accent mb-2">Welcome to Arta Nusa</h2>
        <p className="text-gray-700 text-md max-w-2xl mx-auto leading-relaxed">
          🌸 Arta Nusa celebrates the soulful craftsmanship of Indonesia. From handwoven rattan mirrors to traditional herbal teas,
          every item reflects our cultural roots. Whether you're shopping for home décor, artisan souvenirs, or natural treats—
          we bring the islands to your doorstep.
        </p>
      </motion.section>

      <header className="text-center mb-6">
        <div className="py-6 px-4 bg-[#FADFEF] rounded-lg shadow-md">
          <h1 className="text-4xl font-bold text-accent">Arta Nusa</h1>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
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
        {filteredProducts.map((p, index) => {
          const currentIndex = variantIndexes[p.id] || 0;
          const setIndex = (newIndex) => setVariantIndexes(prev => ({ ...prev, [p.id]: newIndex }));
          const variant = p.variants[currentIndex];

          const next = () => setIndex((currentIndex + 1) % p.variants.length);
          const prev = () => setIndex((currentIndex - 1 + p.variants.length) % p.variants.length);

          return (
            <motion.div key={p.id} className="bg-white rounded shadow p-4 hover:scale-105 transition-transform duration-300" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <img src={variant.img} alt={variant.name} className="w-full h-56 object-contain rounded mb-2" />
              <h2 className="font-semibold text-lg mb-1">{p.name}</h2>
              <p className="text-sm text-gray-600">{variant.name}</p>
              <p className="text-amber-600 font-bold">{toCurrency(variant.price, country)}</p>
              <div className="flex justify-between items-center mt-2">
                <button onClick={prev} className="text-xs text-gray-600 hover:text-amber-600">← Prev</button>
                <button onClick={() => add(variant.id)} className="bg-amber-500 text-white text-sm px-3 py-1 rounded">Add</button>
                <button onClick={next} className="text-xs text-gray-600 hover:text-amber-600">Next →</button>
              </div>
            </motion.div>
          );
        })}
      </main>
    </div>
  );
}
