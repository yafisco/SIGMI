// Composant FilterBar réutilisable pour la recherche et les filtres
// Utilisé dans les pages de liste

import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterConfig[];
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Rechercher...',
  filters = [],
  showFilters = false,
  onToggleFilters,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {filters.length > 0 && (
          <Button
            variant="outline"
            onClick={onToggleFilters}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </Button>
        )}
      </div>

      {showFilters && filters.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <select
                key={index}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
