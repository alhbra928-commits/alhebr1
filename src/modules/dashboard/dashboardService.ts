import { supabase } from '../../lib/supabase';
import { FarmsService } from '../farms/farmsService';
import { ReservationsService } from '../reservations/reservationsService';
import { WalletsService } from '../wallets/walletsService';
import { DocumentationService } from '../documentation/documentationService';

export class DashboardService {
  static async getOverallStatistics() {
    try {
      const results = await Promise.allSettled([
        supabase.from('farms').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('reservations').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('investors').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('farm_owners').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('documentation').select('*', { count: 'exact', head: true }), // documentation doesn't have deleted_at
        supabase.from('reservations').select('booking_status').is('deleted_at', null),
        supabase.from('reservations').select('total_amount').eq('payment_status', 'completed').is('deleted_at', null),
        supabase.from('admin_users').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true }),
        supabase.from('farms').select('tree_type, total_trees').is('deleted_at', null)
      ]);

      const farmsCount = results[0].status === 'fulfilled' ? results[0].value.count || 0 : 0;
      const reservationsCount = results[1].status === 'fulfilled' ? results[1].value.count || 0 : 0;
      const investorsCount = results[2].status === 'fulfilled' ? results[2].value.count || 0 : 0;
      const ownersCount = results[3].status === 'fulfilled' ? results[3].value.count || 0 : 0;
      const documentationCount = results[4].status === 'fulfilled' ? results[4].value.count || 0 : 0;

      const reservationsData = results[5].status === 'fulfilled' ? results[5].value.data || [] : [];
      const pendingCount = reservationsData.filter((r: any) => r.booking_status === 'pending').length;
      const approvedCount = reservationsData.filter((r: any) => r.booking_status === 'approved').length;
      const documentedCount = reservationsData.filter((r: any) => r.booking_status === 'documented').length;

      const revenueData = results[6].status === 'fulfilled' ? results[6].value.data || [] : [];
      const totalRevenue = revenueData.reduce((sum: number, r: any) => sum + (Number(r.total_amount) || 0), 0);

      const adminsCount = results[7].status === 'fulfilled' ? results[7].value.count || 0 : 0;
      const whatsappCount = results[8].status === 'fulfilled' ? results[8].value.count || 0 : 0;

      const farmsData = results[9].status === 'fulfilled' ? results[9].value.data || [] : [];
      const palmFarms = farmsData.filter((f: any) => f.tree_type === 'نخيل' || f.tree_type === 'palm').length;
      const oliveFarms = farmsData.filter((f: any) => f.tree_type === 'زيتون' || f.tree_type === 'olive').length;
      const totalTrees = farmsData.reduce((sum: number, f: any) => sum + (Number(f.total_trees) || 0), 0);

      return {
        farms: {
          total: farmsCount || 0,
          active: farmsCount || 0,
          palmFarms: palmFarms || 0,
          oliveFarms: oliveFarms || 0,
          totalTrees: totalTrees || 0
        },
        reservations: {
          total: reservationsCount || 0,
          pending: pendingCount || 0,
          approved: approvedCount || 0,
          documented: documentedCount || 0,
          confirmed: approvedCount + documentedCount || 0,
          cancelled: 0
        },
        wallets: {
          totalBalance: 0
        },
        documentation: {
          total: documentationCount || 0
        },
        owners: {
          total: ownersCount || 0
        },
        users: {
          totalInvestors: investorsCount || 0,
          totalOwners: ownersCount || 0
        },
        admins: {
          total: adminsCount || 0
        },
        whatsapp: {
          total: whatsappCount || 0
        },
        revenue: {
          total: totalRevenue || 0,
          paid: totalRevenue || 0,
          platformBalance: 0,
          netProfit: 0
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      return {
        farms: { total: 0, active: 0, palmFarms: 0, oliveFarms: 0, totalTrees: 0 },
        reservations: { total: 0, pending: 0, approved: 0, documented: 0, confirmed: 0, cancelled: 0 },
        wallets: { totalBalance: 0 },
        documentation: { total: 0 },
        owners: { total: 0 },
        users: { totalInvestors: 0, totalOwners: 0 },
        admins: { total: 0 },
        whatsapp: { total: 0 },
        revenue: { total: 0, paid: 0, platformBalance: 0, netProfit: 0 }
      };
    }
  }

  static async getRecentActivities(limit: number = 20) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('operation_timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getSystemLogs(
    logLevel?: string,
    logType?: string,
    limit: number = 50
  ) {
    let query = supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (logLevel) {
      query = query.eq('log_level', logLevel);
    }

    if (logType) {
      query = query.eq('log_type', logType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  static async getRevenueByMonth() {
    const { data, error } = await supabase
      .from('reservations')
      .select('created_at, total_amount, payment_status')
      .eq('payment_status', 'paid')
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (error) throw error;

    const revenueByMonth: { [key: string]: number } = {};

    data.forEach(reservation => {
      const date = new Date(reservation.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = 0;
      }

      revenueByMonth[monthKey] += Number(reservation.total_amount);
    });

    return Object.entries(revenueByMonth).map(([month, amount]) => ({
      month,
      amount
    }));
  }

  static async getTopFarms(limit: number = 5) {
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select(`
        farm_id,
        number_of_trees,
        total_amount,
        farms:farm_id(name_ar, name_en, tree_type)
      `)
      .is('deleted_at', null);

    if (error) throw error;

    const farmStats: {
      [key: string]: {
        farm: any;
        totalReservations: number;
        totalTrees: number;
        totalRevenue: number;
      };
    } = {};

    reservations.forEach(res => {
      if (!res.farm_id) return;

      if (!farmStats[res.farm_id]) {
        farmStats[res.farm_id] = {
          farm: res.farms,
          totalReservations: 0,
          totalTrees: 0,
          totalRevenue: 0,
        };
      }

      farmStats[res.farm_id].totalReservations++;
      farmStats[res.farm_id].totalTrees += res.number_of_trees;
      farmStats[res.farm_id].totalRevenue += Number(res.total_amount);
    });

    return Object.values(farmStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }
}
