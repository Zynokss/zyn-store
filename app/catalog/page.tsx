'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronUp, ChevronDown, Plus, Check, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/store/CartDrawer';
import { SearchModal } from '@/components/store/SearchModal';
import { ProductCard } from '@/components/store/ProductCard';
import { PriceSlider } from '@/components/store/PriceSlider';
import { useCart } from '@/lib/CartContext';
import { Product as CatalogProduct } from '@/lib/types';

const ITEMS_PER_PAGE = 12;

// Standard Color Name to Hex Map
const COLOR_HEX_MAP: Record<string, string> = {
  black: '#000000',
  white: '#ffffff',
  red: '#ef4444',
  blue: '#3b82f6',
  navy: '#1e293b',
  green: '#22c55e',
  yellow: '#eab308',
  grey: '#6b7280',
  gray: '#6b7280',
  brown: '#78350f',
  beige: '#f5f5dc',
  cream: '#fffdd0',
  pink: '#ec4899',
  purple: '#a855f7',
  orange: '#f97316',
  olive: '#808000',
};

const parsePrice = (val: unknown): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, isOpen, onToggle, children }) => (
  <div className="border-b border-zinc-200 dark:border-zinc-800 py-4">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between text-left font-black text-xs uppercase tracking-wider text-zinc-900 dark:text-white cursor-pointer py-1"
    >
      <span>{title}</span>
      {isOpen ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
    </button>
    {isOpen && <div className="mt-3 space-y-2">{children}</div>}
  </div>
);

function CatalogGridContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, isFavorite, updateQuantity, removeFromCart } = useCart();

  const topRef = useRef<HTMLDivElement>(null);

  const initialCategory = searchParams.get('category') || 'All Items';
  const initialQuery = searchParams.get('q') || '';
  const initialSort = (searchParams.get('sort') as 'featured' | 'low-to-high' | 'high-to-low') || 'featured';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'low-to-high' | 'high-to-low'>(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Accordion Toggle States
  const [openSections, setOpenSections] = useState({
    categories: true,
    size: true,
    brand: true,
    colour: true,
    price: true,
  });

  // Active Multi-select Filter States
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);

  // Price Range States
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);

  // Show More Toggle States
  const [showAllSizes, setShowAllSizes] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllColours, setShowAllColours] = useState(false);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  };

  const updateQueryParams = useCallback(
    (cat: string, q: string, sort: string, page: number) => {
      const params = new URLSearchParams();
      if (cat !== 'All Items') params.set('category', cat);
      if (q.trim()) params.set('q', q.trim());
      if (sort !== 'featured') params.set('sort', sort);
      if (page > 1) params.set('page', page.toString());
      const queryString = params.toString();
      router.push(queryString ? `/catalog?${queryString}` : '/catalog', { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    const controller = new AbortController();
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products', {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const productList = Array.isArray(data) ? data : data?.products;
        if (Array.isArray(productList)) {
          setProducts(productList);

          const prices = productList.map((p: CatalogProduct) => parsePrice(p.price));
          const highest = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 2000;
          const ceiling = highest > 0 ? highest : 2000;

          setMinPrice(0);
          setMaxPrice(ceiling);
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to load products:', error);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
    return () => controller.abort();
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category ? String(p.category).trim() : 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  const dynamicCategories = useMemo(() => ['All Items', ...Object.keys(categoryCounts)], [categoryCounts]);

  const availableSizes = useMemo(() => {
    const sizeMap: Record<string, number> = {};
    products.forEach((p) => {
      const item = p as Record<string, any>;
      if (Array.isArray(item.sizes)) {
        item.sizes.forEach((s: string) => {
          sizeMap[s] = (sizeMap[s] || 0) + 1;
        });
      }
    });
    return Object.entries(sizeMap).map(([name, count]) => ({ name, count }));
  }, [products]);

  const availableBrands = useMemo(() => {
    const brandMap: Record<string, number> = {};
    products.forEach((p) => {
      const item = p as Record<string, any>;
      const brand = item.brand ? String(item.brand).trim() : 'ZYN';
      brandMap[brand] = (brandMap[brand] || 0) + 1;
    });
    return Object.entries(brandMap).map(([name, count]) => ({ name, count }));
  }, [products]);

  const availableColours = useMemo(() => {
    const colourMap: Record<string, { count: number; hex?: string }> = {};
    products.forEach((p) => {
      const item = p as Record<string, any>;
      if (Array.isArray(item.colors)) {
        item.colors.forEach((c: any) => {
          const colorName = typeof c === 'string' ? c : c && typeof c === 'object' ? c.name : '';
          const hex = typeof c === 'object' && c !== null ? c.hex : undefined;
          if (colorName) {
            if (!colourMap[colorName]) {
              colourMap[colorName] = { count: 0, hex };
            }
            colourMap[colorName].count += 1;
          }
        });
      }
    });

    return Object.entries(colourMap).map(([name, data]) => {
      const lowerName = name.toLowerCase().trim();
      const resolvedHex = data.hex || COLOR_HEX_MAP[lowerName] || lowerName;
      return {
        name,
        count: data.count,
        hex: resolvedHex,
      };
    });
  }, [products]);

  const ceilingPrice = useMemo(() => {
    if (products.length === 0) return 2000;
    const prices = products.map((p) => parsePrice(p.price));
    const highest = Math.ceil(Math.max(...prices));
    return highest > 0 ? highest : 2000;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const selCat = selectedCategory.toLowerCase().trim();

    return products
      .filter((product) => {
        const item = product as Record<string, any>;
        const pCategory = item.category ? String(item.category).toLowerCase().trim() : '';
        const pName = item.name ? String(item.name).toLowerCase() : '';
        const pBrand = item.brand ? String(item.brand).toLowerCase().trim() : 'zyn';
        const pPrice = parsePrice(item.price);

        const matchesCategory = selectedCategory === 'All Items' || pCategory === selCat;
        const matchesSearch = !query || pName.includes(query) || pCategory.includes(query) || pBrand.includes(query);
        const matchesFav = !showFavoritesOnly || isFavorite(item.id);

        const matchesSize =
          selectedSizes.length === 0 ||
          (Array.isArray(item.sizes) && item.sizes.some((s: string) => selectedSizes.includes(s)));

        const matchesBrand =
          selectedBrands.length === 0 || selectedBrands.some((b) => b.toLowerCase() === pBrand);

        const matchesColour =
          selectedColours.length === 0 ||
          (Array.isArray(item.colors) &&
            item.colors.some((c: any) => {
              const cName = typeof c === 'string' ? c : c && typeof c === 'object' ? c.name : '';
              return selectedColours.includes(cName);
            }));

        const matchesPrice = pPrice >= minPrice && pPrice <= maxPrice;

        return matchesCategory && matchesSearch && matchesFav && matchesSize && matchesBrand && matchesColour && matchesPrice;
      })
      .sort((a, b) => {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);
        if (sortBy === 'low-to-high') return priceA - priceB;
        if (sortBy === 'high-to-low') return priceB - priceA;
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }, [
    products,
    selectedCategory,
    searchQuery,
    showFavoritesOnly,
    isFavorite,
    selectedSizes,
    selectedBrands,
    selectedColours,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setShowFavoritesOnly(false);
    setCurrentPage(1);
    updateQueryParams(cat, searchQuery, sortBy, 1);
  };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
    updateQueryParams(selectedCategory, q, sortBy, 1);
  };

  const handleSortChange = (sortVal: 'featured' | 'low-to-high' | 'high-to-low') => {
    setSortBy(sortVal);
    setCurrentPage(1);
    updateQueryParams(selectedCategory, searchQuery, sortVal, 1);
  };

  const toggleSizeFilter = (sizeName: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeName) ? prev.filter((s) => s !== sizeName) : [...prev, sizeName]
    );
    setCurrentPage(1);
  };

  const toggleBrandFilter = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName) ? prev.filter((b) => b !== brandName) : [...prev, brandName]
    );
    setCurrentPage(1);
  };

  const toggleColourFilter = (colourName: string) => {
    setSelectedColours((prev) =>
      prev.includes(colourName) ? prev.filter((c) => c !== colourName) : [...prev, colourName]
    );
    setCurrentPage(1);
  };

  const resetAllFilters = () => {
    setSelectedCategory('All Items');
    setSearchQuery('');
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSelectedColours([]);
    setMinPrice(0);
    setMaxPrice(ceilingPrice);
    setSortBy('featured');
    setCurrentPage(1);
    updateQueryParams('All Items', '', 'featured', 1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased selection:bg-[#9ae600] selection:text-black">
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleFavoritesFilter={() => setShowFavoritesOnly((p) => !p)}
        isFavoritesFilterActive={showFavoritesOnly}
      />

      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-5 py-2.5 shadow-xl text-xs font-medium tracking-wide rounded-full">
          {toastMsg}
        </div>
      )}

      <main ref={topRef} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb Trail */}
        <div className="text-xs text-zinc-500 mb-3 flex items-center gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>
            Home
          </span>
          <span>&gt;</span>
          <span className="font-bold text-zinc-900 dark:text-white uppercase">{selectedCategory}</span>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black uppercase text-zinc-900 dark:text-white tracking-tight">
            {selectedCategory === 'All Items' ? "Men's Fashion" : selectedCategory}{' '}
            <span className="text-xs font-semibold text-zinc-500 font-mono">({filteredProducts.length} Products)</span>
          </h1>
        </div>

        {/* Top Horizontal Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
          {dynamicCategories.map((catName) => {
            const isActive = selectedCategory === catName && !showFavoritesOnly;
            return (
              <button
                key={catName}
                type="button"
                onClick={() => handleCategoryChange(catName)}
                className={`px-4 py-2 text-xs font-extrabold uppercase border rounded-md transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                {catName}
              </button>
            );
          })}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filter Controls */}
          <aside className="space-y-2">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filter and sort
              </h3>
              {(selectedSizes.length > 0 || selectedBrands.length > 0 || selectedColours.length > 0 || searchQuery || minPrice > 0 || maxPrice < ceilingPrice) && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-[11px] font-bold text-[#9ae600] underline uppercase cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Clear
                </button>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 py-4">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white block mb-2">
                Sort By
              </label>
              <select
                aria-label="Sort products by"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'featured' | 'low-to-high' | 'high-to-low')}
                className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-2 px-3 text-xs font-bold uppercase text-zinc-800 dark:text-zinc-200 rounded-md focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 py-4">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white block mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search styles..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 py-2 pl-8 pr-3 text-xs rounded-md focus:outline-none"
                />
              </div>
            </div>

            {/* Categories Accordion */}
            <FilterSection title="Categories" isOpen={openSections.categories} onToggle={() => toggleSection('categories')}>
              <div className="space-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <div
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex items-center justify-between cursor-pointer py-1 hover:text-black dark:hover:text-white ${
                      selectedCategory === cat ? 'font-bold text-black dark:text-white' : ''
                    }`}
                  >
                    <span>{cat}</span>
                    <span className="text-zinc-400 font-mono text-[11px]">{count}</span>
                  </div>
                ))}
              </div>
            </FilterSection>

            {/* Size Accordion */}
            {availableSizes.length > 0 && (
              <FilterSection title="Size" isOpen={openSections.size} onToggle={() => toggleSection('size')}>
                <div className="space-y-2">
                  {(showAllSizes ? availableSizes : availableSizes.slice(0, 4)).map((s) => {
                    const isChecked = selectedSizes.includes(s.name);
                    return (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => toggleSizeFilter(s.name)}
                        className={`w-full flex items-center justify-between p-2 rounded-md border text-xs transition-colors cursor-pointer ${
                          isChecked
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${isChecked ? 'bg-white text-black border-white' : 'border-zinc-400'}`}>
                            {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <span className="uppercase font-mono">{s.name}</span>
                        </div>
                        <span className="text-[11px] opacity-60 font-mono">({s.count})</span>
                      </button>
                    );
                  })}
                  {availableSizes.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllSizes((p) => !p)}
                      className="text-xs font-extrabold uppercase text-zinc-900 dark:text-white flex items-center gap-1 mt-2 cursor-pointer hover:underline"
                    >
                      <span>{showAllSizes ? 'Show less' : 'Show more'}</span>
                      <Plus className={`h-3.5 w-3.5 transition-transform ${showAllSizes ? 'rotate-45' : ''}`} />
                    </button>
                  )}
                </div>
              </FilterSection>
            )}

            {/* Brand Accordion */}
            {availableBrands.length > 0 && (
              <FilterSection title="Brand" isOpen={openSections.brand} onToggle={() => toggleSection('brand')}>
                <div className="space-y-2">
                  {(showAllBrands ? availableBrands : availableBrands.slice(0, 4)).map((b) => {
                    const isChecked = selectedBrands.includes(b.name);
                    return (
                      <button
                        key={b.name}
                        type="button"
                        onClick={() => toggleBrandFilter(b.name)}
                        className={`w-full flex items-center justify-between p-2 rounded-md border text-xs transition-colors cursor-pointer ${
                          isChecked
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 border rounded flex items-center justify-center ${isChecked ? 'bg-white text-black border-white' : 'border-zinc-400'}`}>
                            {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                          </div>
                          <span>{b.name}</span>
                        </div>
                        <span className="text-[11px] opacity-60 font-mono">({b.count})</span>
                      </button>
                    );
                  })}
                  {availableBrands.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllBrands((p) => !p)}
                      className="text-xs font-extrabold uppercase text-zinc-900 dark:text-white flex items-center gap-1 mt-2 cursor-pointer hover:underline"
                    >
                      <span>{showAllBrands ? 'Show less' : 'Show more'}</span>
                      <Plus className={`h-3.5 w-3.5 transition-transform ${showAllBrands ? 'rotate-45' : ''}`} />
                    </button>
                  )}
                </div>
              </FilterSection>
            )}

            {/* Colour Accordion */}
            {availableColours.length > 0 && (
              <FilterSection title="Colour" isOpen={openSections.colour} onToggle={() => toggleSection('colour')}>
                <div className="space-y-2">
                  {(showAllColours ? availableColours : availableColours.slice(0, 4)).map((c) => {
                    const isChecked = selectedColours.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggleColourFilter(c.name)}
                        className={`w-full flex items-center justify-between p-2 rounded-md border text-xs transition-colors cursor-pointer ${
                          isChecked
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="capitalize">{c.name}</span>
                        </div>
                        <span className="text-[11px] opacity-60 font-mono">({c.count})</span>
                      </button>
                    );
                  })}
                  {availableColours.length > 4 && (
                    <button
                      type="button"
                      onClick={() => setShowAllColours((p) => !p)}
                      className="text-xs font-extrabold uppercase text-zinc-900 dark:text-white flex items-center gap-1 mt-2 cursor-pointer hover:underline"
                    >
                      <span>{showAllColours ? 'Show less' : 'Show more'}</span>
                      <Plus className={`h-3.5 w-3.5 transition-transform ${showAllColours ? 'rotate-45' : ''}`} />
                    </button>
                  )}
                </div>
              </FilterSection>
            )}

            {/* Price Slider Section */}
            <FilterSection title="Price" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
              <PriceSlider
                minPrice={minPrice}
                maxPrice={maxPrice}
                ceilingPrice={ceilingPrice}
                onPriceChange={(min, max) => {
                  setMinPrice(min);
                  setMaxPrice(max);
                }}
                onPageReset={() => setCurrentPage(1)}
              />
            </FilterSection>
          </aside>

          {/* Right Product Cards Display */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-16 border border-zinc-200 dark:border-zinc-800 text-center space-y-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30">
                <p className="text-xs font-semibold text-zinc-500">No products match your current active filters.</p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="text-xs font-bold underline text-zinc-900 dark:text-white cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpenCart={() => setIsCartOpen(true)}
                      onToast={showToast}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 pt-8 mt-12 text-xs">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 font-bold uppercase rounded-full disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <span className="font-bold text-zinc-500 font-mono">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 font-bold uppercase rounded-full disabled:opacity-40 cursor-pointer"
                    >
                      Continue <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        query={searchQuery}
        setQuery={setSearchQuery}
        products={products}
      />
      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-zinc-950 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" />}>
      <CatalogGridContent />
    </Suspense>
  );
}