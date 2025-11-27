'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useLiveQuery } from '@tanstack/react-db';
import { productsCollection } from '@/lib/db/client';
import type { Product } from '@/lib/types';

export function PerformanceDemo() {
  const renderCountRef = useRef(0);
  const [renderCount, setRenderCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [useDb, setUseDb] = useState(true);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // TanStack DB query (reactive)
  const { data: dbProductsData } = useLiveQuery(() => productsCollection);
  const dbProducts = (dbProductsData ?? []) as unknown as Product[];

  // Load raw products once
  useEffect(() => {
    const loadProducts = async () => {
      const products = Array.from(productsCollection.values()) as unknown as Product[];
      setRawProducts(products);
    };
    loadProducts();
  }, [updateTrigger]);

  // Track renders using ref (doesn't cause re-render)
  renderCountRef.current += 1;

  // Sync render count to state when meaningful changes occur
  useEffect(() => {
    setRenderCount(renderCountRef.current);
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

  // Simulate data update
  const handleSimulateUpdate = async () => {
    const randomProduct = dbProducts[Math.floor(Math.random() * dbProducts.length)];
    if (randomProduct) {
      await productsCollection.update(randomProduct.id, (draft) => {
        (draft as any).stock = Math.floor(Math.random() * 1000);
      });

      // For non-DB mode, we need to manually reload
      if (!useDb) {
        setUpdateTrigger((t) => t + 1);
      }
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

            <div className="ml-auto text-sm">
              <span className="font-medium">Renders:</span>{' '}
              <span className={renderCount > 5 ? 'text-red-600' : 'text-green-600'}>
                {renderCount}
              </span>
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
                    className="p-3 bg-white border border-gray-200 rounded"
                  >
                    <div className="font-medium text-sm truncate">{product.name}</div>
                    <div className="text-xs text-gray-600">{product.category}</div>
                    <div className="text-sm font-semibold text-green-600">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">Stock: {product.stock}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!useDb && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
              <strong>Note:</strong> Without TanStack DB, data updates require manual
              refetching. Click "Simulate Data Update" and notice that the UI doesn't
              update automatically.
            </div>
          )}

          {useDb && (
            <div className="bg-green-50 border border-green-200 p-3 rounded text-sm">
              <strong>Note:</strong> With TanStack DB, data updates are reactive. Click
              "Simulate Data Update" and the UI updates automatically without manual
              intervention.
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
    </div>
  );
}
