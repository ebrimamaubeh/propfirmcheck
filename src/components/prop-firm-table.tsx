"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { PropFirm } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import StarRating from './star-rating';
import { Search, Filter, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

type FilterType = 'All' | 'Futures' | 'Forex';

export default function PropFirmTable({ firms }: { firms: PropFirm[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredFirms = useMemo(() => {
    return firms
      .filter(firm => {
        if (filterType === 'All') return true;
        return firm.type === filterType;
      })
      .filter(firm =>
        firm.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [firms, searchTerm, filterType]);

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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden w-full">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <div className="hidden md:flex items-center gap-1 p-1 bg-secondary rounded-lg">
                <Button variant={filterType === 'All' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterType('All')}>All</Button>
                <Button variant={filterType === 'Futures' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterType('Futures')}>Futures</Button>
                <Button variant={filterType === 'Forex' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterType('Forex')}>Forex</Button>
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
                        <Button className="flex-1" variant={filterType === 'All' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterType('All')}>All</Button>
                        <Button className="flex-1" variant={filterType === 'Futures' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterType('Futures')}>Futures</Button>
                        <Button className="flex-1" variant={filterType === 'Forex' ? 'default' : 'ghost'} size="sm" onClick={() => setFilterType('Forex')}>Forex</Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-center">Reviews</TableHead>
                <TableHead className="text-center hidden md:table-cell">Years</TableHead>
                <TableHead className="text-right hidden md:table-cell">Max Allocation</TableHead>
                <TableHead className="hidden sm:table-cell">Platform</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFirms.length > 0 ? (
                filteredFirms.map((firm) => (
                  <TableRow key={firm.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-semibold">{firm.name}</span>
                        <Badge variant="outline" className="w-fit mt-1">{firm.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                            <StarRating rating={firm.review.rating} />
                            <span className="text-xs text-muted-foreground mt-1">({firm.review.count})</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">{firm.yearsInBusiness}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">${firm.maxAllocation.toLocaleString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                            {firm.platform.slice(0, 2).map(p => <Badge key={p} variant="secondary">{p}</Badge>)}
                            {firm.platform.length > 2 && <Badge variant="secondary">+{firm.platform.length - 2}</Badge>}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/firm/${firm.id}`}>
                          More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
    </Card>
  );
}
