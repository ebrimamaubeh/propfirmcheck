
"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { PropFirm } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import StarRating from './star-rating';
import { Search, Filter, ArrowRight, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { useLoading } from '@/context/loading-context';

const FIRM_TYPES = ['Futures', 'Forex'];
const FIRMS_PER_PAGE = 5;

type SortKey = 'name' | 'review.rating' | 'yearsInBusiness' | 'maxAllocation';
type SortDirection = 'ascending' | 'descending';

export default function PropFirmTable({ firms }: { firms: PropFirm[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'name', direction: 'ascending' });
  const { setIsLoading } = useLoading();


  const handleLinkClick = () => {
    setIsLoading(true);
  };
  
  const toggleFilter = (type: string) => {
    setCurrentPage(1);
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }

  const sortedAndFilteredFirms = useMemo(() => {
    let sortableFirms = [...firms];

    if (sortConfig !== null) {
      sortableFirms.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'review.rating') {
          aValue = a.review.rating;
          bValue = b.review.rating;
        } else {
          aValue = a[sortConfig.key as keyof PropFirm];
          bValue = b[sortConfig.key as keyof PropFirm];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableFirms
      .filter(firm => {
        if (activeFilters.length === 0) return true;
        const firmTypes = Array.isArray(firm.type) ? firm.type : [firm.type];
        return activeFilters.some(filter => firmTypes.includes(filter));
      })
      .filter(firm =>
        firm.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [firms, searchTerm, activeFilters, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(sortedAndFilteredFirms.length / FIRMS_PER_PAGE);
  const paginatedFirms = sortedAndFilteredFirms.slice(
    (currentPage - 1) * FIRMS_PER_PAGE,
    currentPage * FIRMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const allFilters = ['All', ...FIRM_TYPES];

  const handleAllClick = () => {
    setActiveFilters([]);
    setCurrentPage(1);
  }

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <Card className="w-full shadow-lg">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search firms by name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <div className="hidden md:flex items-center gap-1 p-1 bg-secondary rounded-lg">
                <Button variant={activeFilters.length === 0 ? 'default' : 'ghost'} size="sm" onClick={handleAllClick}>All</Button>
                {FIRM_TYPES.map(type => (
                    <Button key={type} variant={activeFilters.includes(type) ? 'default' : 'ghost'} size="sm" onClick={() => toggleFilter(type)}>{type}</Button>
                ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
            {showFilters && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-4 md:hidden"
                >
                    <div className="flex items-center justify-center gap-2 p-1 bg-secondary rounded-lg">
                        <Button className="flex-1" variant={activeFilters.length === 0 ? 'default' : 'ghost'} size="sm" onClick={handleAllClick}>All</Button>
                        {FIRM_TYPES.map(type => (
                            <Button key={type} className="flex-1" variant={activeFilters.includes(type) ? 'default' : 'ghost'} size="sm" onClick={() => toggleFilter(type)}>{type}</Button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => requestSort('name')}>
                    Name {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                   <Button variant="ghost" onClick={() => requestSort('review.rating')}>
                    Reviews {getSortIcon('review.rating')}
                  </Button>
                </TableHead>
                <TableHead className="text-center hidden md:table-cell">
                   <Button variant="ghost" onClick={() => requestSort('yearsInBusiness')}>
                    Years {getSortIcon('yearsInBusiness')}
                  </Button>
                </TableHead>
                <TableHead className="text-right hidden md:table-cell">
                    <Button variant="ghost" onClick={() => requestSort('maxAllocation')}>
                        Max Allocation {getSortIcon('maxAllocation')}
                    </Button>
                </TableHead>
                <TableHead className="hidden sm:table-cell">Platform</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFirms.length > 0 ? (
                paginatedFirms.map((firm) => {
                    const firmTypes = Array.isArray(firm.type) ? firm.type : [firm.type];
                    return (
                        <TableRow key={firm.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                            <div className="flex flex-col">
                                <span className="font-semibold">{firm.name}</span>
                                <div className="flex gap-1 mt-1">
                                {firmTypes.map(t => <Badge variant="outline" key={t}>{t}</Badge>)}
                                </div>
                            </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <div className="flex flex-col items-center">
                                    <StarRating rating={firm.review.rating} />
                                    <span className="text-xs text-muted-foreground mt-1">({firm.review.count})</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">{firm.yearsInBusiness}</TableCell>
                            <TableCell className="text-right hidden md:table-cell">
                                {firm.maxAllocation ? `$${firm.maxAllocation.toLocaleString()}` : 'N/A'}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <div className="flex flex-wrap gap-1">
                                    {firm.platform.slice(0, 2).map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                                    {firm.platform.length > 2 && <Badge variant="secondary">+{firm.platform.length - 2}</Badge>}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                                <Link href={`/firm/${firm.id}`} onClick={handleLinkClick}>
                                More <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            </TableCell>
                        </TableRow>
                    );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No firms found. Try adjusting your search or filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between pt-4">
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Previous Page</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Next Page</span>
                </Button>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
