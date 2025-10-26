import { supabase } from '../lib/supabase';

export interface LiveFinancialState {
  isConnected: boolean;
  lastUpdate: Date | null;
  farmFinances: Map<string, any>;
  platformWallet: any;
  charityWallet: any;
  investorsWallets: Map<string, any>;
}

export type FinancialUpdateCallback = (state: LiveFinancialState) => void;

class LiveFinancialSystemService {
  private state: LiveFinancialState = {
    isConnected: false,
    lastUpdate: null,
    farmFinances: new Map(),
    platformWallet: null,
    charityWallet: null,
    investorsWallets: new Map()
  };

  private listeners: Set<FinancialUpdateCallback> = new Set();
  private initialized = false;

  initialize() {
    // تجنب التهيئة المتعددة
    if (this.initialized) {
      console.log('⚠️ Live Financial System already initialized');
      return;
    }
    this.initialized = true;
    console.log('🚀 Initializing Live Financial System (Lightweight)...');

    // تحميل البيانات فقط - بدون Realtime
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      // تحميل بسيط وسريع
      const [farmFinances, platformWallet] = await Promise.all([
        supabase
          .from('smart_farm_finances')
          .select('farm_code, collected_from_investors')
          .is('deleted_at', null)
          .limit(10),
        supabase
          .from('platform_wallet')
          .select('total_balance, net_profit')
          .eq('id', '00000000-0000-0000-0000-000000000002')
          .maybeSingle()
      ]);

      if (farmFinances.data) {
        farmFinances.data.forEach(farm => {
          this.state.farmFinances.set(farm.farm_code, farm);
        });
      }

      if (platformWallet.data) {
        this.state.platformWallet = platformWallet.data;
      }

      this.state.isConnected = true;
      this.state.lastUpdate = new Date();
      this.notifyListeners();

      console.log('✅ Financial data loaded (lightweight mode)');
    } catch (error) {
      console.error('❌ Error loading financial data:', error);
      this.state.isConnected = false;
    }
  }

  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback({ ...this.state });
      } catch (error) {
        console.error('Error in financial listener:', error);
      }
    });
  }

  subscribe(callback: FinancialUpdateCallback): () => void {
    this.listeners.add(callback);

    // Send current state immediately
    try {
      callback({ ...this.state });
    } catch (error) {
      console.error('Error in initial callback:', error);
    }

    return () => {
      this.listeners.delete(callback);
    };
  }

  getState(): LiveFinancialState {
    return { ...this.state };
  }

  getFarmFinance(farmCode: string): any {
    return this.state.farmFinances.get(farmCode);
  }

  getPlatformWallet(): any {
    return this.state.platformWallet;
  }

  getCharityWallet(): any {
    return this.state.charityWallet;
  }

  getInvestorWallet(farmCode: string): any {
    return this.state.investorsWallets.get(farmCode);
  }

  async refresh() {
    console.log('🔄 Refreshing financial data...');
    await this.loadInitialData();
  }

  cleanup() {
    console.log('🧹 Cleaning up Live Financial System...');
    this.listeners.clear();
    this.state.farmFinances.clear();
    this.state.investorsWallets.clear();
    this.initialized = false;
  }
}

export const LiveFinancialSystem = new LiveFinancialSystemService();
