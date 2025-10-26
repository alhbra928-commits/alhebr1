import React, { useState, useEffect, useCallback } from 'react';
import { BookingsService } from '../bookingsService';
import { ArrowRight, Calendar, CheckCircle, Clock } from 'lucide-react';
import { BookingCard3D } from './BookingCard3D';
import { BookingDetailsPanel } from './BookingDetailsPanel';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface AdvancedBookingsViewProps {
  onBack: () => void;
}

export function AdvancedBookingsView({ onBack }: AdvancedBookingsViewProps) {
  const { isAdmin, canCreate, canEdit, canDelete } = usePermissions();
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const hasCreatePermission = isAdmin || canCreate('reservations');
  const hasEditPermission = isAdmin || canEdit('reservations');
  const hasDeletePermission = isAdmin || canDelete('reservations');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        BookingsService.getAll(),
        BookingsService.getStatistics()
      ]);

      const bookingsResult = results[0].status === 'fulfilled' ? results[0].value : { data: [], count: 0 };
      const statsResult = results[1].status === 'fulfilled' ? results[1].value : { total: 0, pending: 0, approved: 0, rejected: 0, documented: 0 };

      setBookings(bookingsResult.data || []);
      setStats(statsResult);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setBookings([]);
      setStats({ total: 0, pending: 0, approved: 0, rejected: 0, documented: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, statusFilter]);

  const applyFilters = () => {
    if (!Array.isArray(bookings)) {
      setFilteredBookings([]);
      return;
    }
    let filtered = [...bookings];
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.investor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.booking_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.booking_status === statusFilter);
    }
    setFilteredBookings(filtered);
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowDetailsPanel(true);
  };

  const handleApprove = async (booking: any) => {
    try {
      await BookingsService.approve(booking.id);
      await loadData();
    } catch (err) {
      console.error('Error approving:', err);
    }
  };

  const handleReject = async (booking: any) => {
    try {
      await BookingsService.reject(booking.id);
      await loadData();
    } catch (err) {
      console.error('Error rejecting:', err);
    }
  };

  const handleDelete = async (booking: any) => {
    if (!confirm('هل أنت متأكد؟')) return;
    try {
      await BookingsService.deletePermanently(booking.id);
      await loadData();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleIssueCertificate = async (booking: any) => {
    try {
      await BookingsService.issueCertificate(booking.id);
      await loadData();
    } catch (err) {
      console.error('Error issuing certificate:', err);
    }
  };

  const groupedBookings = {
    pending: filteredBookings.filter(b => b.booking_status === 'pending'),
    approved: filteredBookings.filter(b => b.booking_status === 'approved'),
    documented: filteredBookings.filter(b => b.booking_status === 'documented'),
    rejected: filteredBookings.filter(b => b.booking_status === 'rejected'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowRight className="w-5 h-5" />
          <span>رجوع</span>
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">إدارة الحجوزات</h1>

        {groupedBookings.pending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-yellow-600 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6" />
              قيد المراجعة ({groupedBookings.pending.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBookings.pending.map((booking) => (
                <BookingCard3D
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onApprove={hasEditPermission ? handleApprove : undefined}
                  onReject={hasEditPermission ? handleReject : undefined}
                  onDelete={hasDeletePermission ? handleDelete : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {groupedBookings.approved.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              معتمدة ({groupedBookings.approved.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedBookings.approved.map((booking) => (
                <BookingCard3D
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  onIssueCertificate={hasCreatePermission ? handleIssueCertificate : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">لا توجد حجوزات</p>
          </div>
        )}
      </div>

      <BookingDetailsPanel
        booking={selectedBooking}
        isOpen={showDetailsPanel}
        onClose={() => setShowDetailsPanel(false)}
        onApprove={hasEditPermission ? handleApprove : undefined}
        onReject={hasEditPermission ? handleReject : undefined}
        onDelete={hasDeletePermission ? handleDelete : undefined}
        onIssueCertificate={hasCreatePermission ? handleIssueCertificate : undefined}
      />
    </div>
  );
}
