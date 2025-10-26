import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Building2, RefreshCw, Users, TreeDeciduous, Sparkles, Heart, BarChart3, Zap } from 'lucide-react';
import { BackButton } from '../../../components/common/BackButton';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { Phase1FinanceService, FarmFinancePhase1 } from '../services/phase1FinanceService';
import { SimpleLoader } from '../../../components/common/SimpleLoader';
import { ExpandableFinancialCard } from './ExpandableFinancialCard';
import { SettlementService } from '../services/settlementService';
import { SmartFinancialAnalyticsDashboard } from './SmartFinancialAnalyticsDashboard';
import { ModernFinancialInterface } from './ModernFinancialInterface';
import { usePermissions } from '../../../contexts/PermissionsContext';

interface SmartFinancialDashboardProps {
  onBack?: () => void;
}

export function SmartFinancialDashboard({ onBack }: SmartFinancialDashboardProps) {
  const [finances, setFinances] = useState<FarmFinancePhase1[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showModernInterface, setShowModernInterface] = useState(false);

  const { isAdmin, canEdit } = usePermissions();

  const hasEditPermission = isAdmin || canEdit('finance');

  const [stats, setStats] = useState({
    totalFarms: 0,
    totalMarketingAmount: 0,
    totalActualAmount: 0,
    totalInvested: 0,
    totalRevenueCollected: 0,
    averageCoverage: 0,
    averageCompletion: 0,
    syncedFarms: 0,
    readyForSettlement: 0
  });
  const [settlementStats, setSettlementStats] = useState({
    farms_ready_for_settlement: 0,
    farms_settled: 0,
    farms_owned_by_platform: 0,
    platform_wallet_balance: 0,
    charity_wallet_balance: 0,
    charity_percentage: 25
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [financesData, statsData, settlementStatsData] = await Promise.all([
        Phase1FinanceService.getAllFarmFinances(),
        Phase1FinanceService.getStats(),
        SettlementService.getSettlementStatistics()
      ]);

      setFinances(financesData);
      setStats(statsData);
      setSettlementStats(settlementStatsData);
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return <SimpleLoader message="جاري تحميل النظام المالي الذكي..." />;
  }

  if (showAnalyticsDashboard) {
    return <SmartFinancialAnalyticsDashboard onBack={() => setShowAnalyticsDashboard(false)} />;
  }

  return <ModernFinancialInterface onBack={onBack} />;
}
