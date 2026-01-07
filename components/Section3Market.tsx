'use client';

import { TradeData } from '@/lib/types';
import { MOCK_COMP_DATA } from '@/lib/constants';
import { formatCurrency } from '@/lib/calculations';

interface Section3Props {
  data: TradeData;
  onUpdate: (updates: Partial<TradeData>) => void;
  isLocked: boolean;
}

export default function Section3Market({
  data,
  onUpdate,
  isLocked,
}: Section3Props) {
  // Generate RV Trader link
  const generateRVTraderLink = () => {
    const query = new URLSearchParams({
      make: data.make || 'RV',
      model: data.model || 'Unit',
      year: data.year?.toString() || '',
    }).toString();
    return `https://www.rvtrader.com/search?${query}`;
  };

  return (
    <div className="relative">
      <div className={`bg-white p-4 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 h-full ${isLocked ? 'pointer-events-none select-none' : ''}`}>
      
      {isLocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-gray-100/95 backdrop-blur-md z-20 rounded-xl flex items-center justify-center pointer-events-auto">
          <div className="text-center border-2 border-dashed border-gray-400 rounded-lg p-4 bg-white/70 shadow-lg">
            <div className="text-3xl font-black text-gray-300 mb-1">3</div>
            <p className="text-lg font-bold text-gray-600">
              Complete Step 1 to unlock
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Finish Unit Lookup first
            </p>
          </div>
        </div>
      )}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            3
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            Market Data Reference
          </h2>
        </div>
        <div className="space-y-2">
          {/* Average Listing Price Input */}
          <div>
            <label htmlFor="avg-listing-price" className="block text-xs font-semibold text-gray-700 mb-0.5">
              Average Listing Price
            </label>
            <input
              type="number"
              id="avg-listing-price"
              className="mt-0.5 block w-full rounded-md border border-gray-200 shadow-sm p-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-blue-300"
              placeholder="e.g., 52000"
              value={data.avgListingPrice || ''}
              onChange={(e) => onUpdate({ avgListingPrice: e.target.value ? parseFloat(e.target.value) : 0 })}
            />
          </div>

          {/* Bish's Comparable Inventory - READ-ONLY TABLE */}
          <div>
            <p className="text-xs font-bold text-gray-800 pt-1 mb-2">
              Bish&apos;s Comparable Inventory{' '}
              <span className="font-normal text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {MOCK_COMP_DATA.length} Comps
              </span>
            </p>
            <div className="mt-0.5 bg-white rounded-lg border border-gray-200 shadow-inner h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10">
                  <tr>
                    <th scope="col" className="px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Dealership
                    </th>
                    <th scope="col" className="px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Location
                    </th>
                    <th scope="col" className="px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Listed Price
                    </th>
                    <th scope="col" className="px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Sold Price
                    </th>
                    <th scope="col" className="px-2 py-1.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                      Sold Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {MOCK_COMP_DATA.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs">
                        <a
                          href={comp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium"
                        >
                          {comp.dealership}
                        </a>
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-600 font-medium">
                        {comp.location}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs font-bold text-gray-900">
                        {comp.listedPrice ? formatCurrency(comp.listedPrice) : '----'}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs font-bold text-green-700">
                        {comp.soldPrice ? formatCurrency(comp.soldPrice) : '----'}
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-gray-600">
                        {comp.soldDate || '----'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RV Trader Link */}
          <div className="mt-2 p-2 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200 text-center hover:shadow-md transition-all">
            <a
              href={generateRVTraderLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-bold underline text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span>🔍 RV Trader Search for {data.year || ''} {data.make || ''} {data.model || ''}</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
