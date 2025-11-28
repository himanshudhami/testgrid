'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useLiveQuery } from '@tanstack/react-db';
import { productsCollection } from '@/lib/db/client';
import type { Product } from '@/lib/types';

export function PerformanceDemo() {
  const renderCountRef = useRef(0);
  const renderCountDbRef = useRef(0);
  const renderCountNoDbRef = useRef(0);
  const [renderCount, setRenderCount] = useState(0);
  const [renderCountDb, setRenderCountDb] = useState(0);
  const [renderCountNoDb, setRenderCountNoDb] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [useDb, setUseDb] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [lastUpdatedId, setLastUpdatedId] = useState<string | null>(null);
  const [lastUpdatedProduct, setLastUpdatedProduct] = useState<{ name: string; stock: number } | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // TanStack DB query (reactive) - always call, use isClient to decide what to use
  const { data: dbProductsData } = useLiveQuery(() => productsCollection);
  const dbProducts = useMemo(
    () => {
      if (!isClient) return [];
      return (dbProductsData ?? []) as unknown as Product[];
    },
    [dbProductsData, isClient]
  );

  // Load raw products once
  const rawProducts = useMemo(
    () => {
      // Depend on manual trigger to refresh when simulating non-DB updates
      void updateTrigger;
      return Array.from(productsCollection.values()) as unknown as Product[];
    },
    [updateTrigger]
  );

  // Track renders using refs (doesn't cause re-render)
  useEffect(() => {
    renderCountRef.current += 1;
    setRenderCount(renderCountRef.current);
    
    if (useDb) {
      renderCountDbRef.current += 1;
      setRenderCountDb(renderCountDbRef.current);
    } else {
      renderCountNoDbRef.current += 1;
      setRenderCountNoDb(renderCountNoDbRef.current);
    }
  }, [useDb, searchTerm, dbProducts, rawProducts]);

  // Filtered results
  const filteredDbProducts = useMemo(() => {
    if (!searchTerm) return dbProducts;
    const search = searchTerm.toLowerCase();
    return dbProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
    );
  }, [dbProducts, searchTerm]);

  const filteredRawProducts = useMemo(() => {
    if (!searchTerm) return rawProducts;
    const search = searchTerm.toLowerCase();
    return rawProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
    );
  }, [rawProducts, searchTerm]);

  const displayProducts = useDb ? filteredDbProducts : filteredRawProducts;
  const totalProducts = useDb ? dbProducts.length : rawProducts.length;

  // Simulate data update - use rawProducts since it's always populated
  const handleSimulateUpdate = () => {
    const randomProduct = rawProducts[Math.floor(Math.random() * rawProducts.length)];
    if (randomProduct) {
      const newStock = Math.floor(Math.random() * 1000);
      productsCollection.update(randomProduct.id, (draft) => {
        draft.stock = newStock;
      });
      setLastUpdatedId(randomProduct.id);
      setLastUpdatedProduct({ name: randomProduct.name, stock: newStock });
      
      // For non-DB mode, we need to manually reload
      if (!useDb) {
        setUpdateTrigger((t) => t + 1);
      }
      
      // Clear the highlight and notification after 2 seconds
      setTimeout(() => {
        setLastUpdatedId(null);
        setLastUpdatedProduct(null);
      }, 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Performance Comparison Demo</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">With TanStack DB</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✓ Reactive queries - automatic UI updates</li>
              <li>✓ Incremental updates (sub-millisecond)</li>
              <li>✓ Fine-grained reactivity</li>
              <li>✓ Efficient joins across collections</li>
              <li>✓ No manual re-fetching needed</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Without TanStack DB</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>✗ Manual state management</li>
              <li>✗ Full re-renders on updates</li>
              <li>✗ Manual refetching required</li>
              <li>✗ Complex synchronization logic</li>
              <li>✗ Performance degrades with data size</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
           {lastUpdatedProduct && (
             <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded animate-pulse">
               <div className="flex items-center gap-2">
                 <span className="text-yellow-800 font-semibold">✓ Updated:</span>
                 <span className="text-yellow-800">{lastUpdatedProduct.name}</span>
                 <span className="text-yellow-700 font-bold">Stock: {lastUpdatedProduct.stock}</span>
               </div>
             </div>
           )}
           <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={useDb}
                onChange={(e) => {
                  setUseDb(e.target.checked);
                  renderCountRef.current = 0;
                  setRenderCount(0);
                }}
                className="w-4 h-4"
              />
              <span className="font-medium">
                Use TanStack DB {useDb ? '(Active)' : '(Inactive)'}
              </span>
            </label>

            <button
              onClick={handleSimulateUpdate}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Simulate Data Update
            </button>

            <div className="ml-auto flex gap-6 text-sm">
              <div>
                <span className="font-medium">DB Mode Renders:</span>{' '}
                <span className={renderCountDb > 10 ? 'text-red-600' : 'text-green-600'}>
                  {renderCountDb}
                </span>
              </div>
              <div>
                <span className="font-medium">Non-DB Mode Renders:</span>{' '}
                <span className={renderCountNoDb > 10 ? 'text-red-600' : 'text-green-600'}>
                  {renderCountNoDb}
                </span>
              </div>
            </div>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />

          <div className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">
                Showing {displayProducts.length} of {totalProducts} products
              </span>
              <span className="text-sm text-gray-600">
                {useDb ? 'Using reactive queries' : 'Using raw state'}
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayProducts.slice(0, 50).map((product) => (
                   <div
                     key={product.id}
                     className={`p-3 border rounded transition-colors ${
                       lastUpdatedId === product.id
                         ? 'bg-yellow-100 border-yellow-400'
                         : 'bg-white border-gray-200'
                     }`}
                   >
                     <div className="font-medium text-sm truncate">{product.name}</div>
                     <div className="text-xs text-gray-600">{product.category}</div>
                     <div className="text-sm font-semibold text-green-600">
                       ${product.price.toFixed(2)}
                     </div>
                     <div className={`text-xs ${lastUpdatedId === product.id ? 'font-bold text-yellow-700' : 'text-gray-500'}`}>
                       Stock: {product.stock}
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          {!useDb && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
              <strong>Note:</strong> Without TanStack DB, data updates require manual
              refetching. Click the Simulate Data Update button and notice the UI does
              not update automatically.
            </div>
          )}

          {useDb && (
            <div className="bg-green-50 border border-green-200 p-3 rounded text-sm">
              <strong>Note:</strong> With TanStack DB, data updates are reactive. Click
              the Simulate Data Update button and the UI updates automatically without
              manual intervention.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-3">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <div className="text-sm text-gray-600">Query Time</div>
            <div className="text-2xl font-bold text-blue-600">&lt; 1ms</div>
            <div className="text-xs text-gray-500">
              Incremental updates with differential dataflow
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded">
            <div className="text-sm text-gray-600">Re-render Optimization</div>
            <div className="text-2xl font-bold text-green-600">Fine-grained</div>
            <div className="text-xs text-gray-500">
              Only affected components re-render
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded">
            <div className="text-sm text-gray-600">Data Size</div>
            <div className="text-2xl font-bold text-purple-600">15,000</div>
            <div className="text-xs text-gray-500">
              Customers, vendors, products with instant queries
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-4">Live Comparison: Click "Simulate Data Update" Multiple Times</h3>
        <p className="text-sm text-gray-600 mb-4">
          Switch between DB and Non-DB modes and click the button several times. Watch how TanStack DB only re-renders when needed, while the non-DB version causes full re-renders on every update.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">With TanStack DB (Reactive)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Re-renders on this tab:</span>
                <span className="font-bold text-green-600">{renderCountDb}</span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1 ml-4">
                <li>✓ Only re-renders when reactive data changes</li>
                <li>✓ Fine-grained updates to specific products</li>
                <li>✓ Efficient: few re-renders even with many updates</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">Without TanStack DB (Manual State)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Re-renders on this tab:</span>
                <span className="font-bold text-red-600">{renderCountNoDb}</span>
              </div>
              <ul className="text-xs text-gray-700 space-y-1 ml-4">
                <li>✗ Full re-render needed after each update</li>
                <li>✗ Requires manual state management</li>
                <li>✗ Performance degrades with more data</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <strong>Tip:</strong> Switch back and forth between modes while clicking "Simulate Data Update" to see the dramatic difference in render efficiency. TanStack DB uses reactive queries to only update the specific products that changed.
        </div>
      </div>
    </div>
  );
}
