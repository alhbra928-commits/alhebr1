import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  private channels: RealtimeChannel[] = [];

  initialize() {
    console.log('🚀 Initializing Live Financial System...');

    this.setupRealtimeChannels();
    this.loadInitialData();
  }

  private setupRealtimeChannels() {
    const farmFinancesChannel = supabase
      .channel('farm-finances-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'smart_farm_finances'
        },
        (payload) => {
          console.log('💰 Farm Finance Change:', payload);
          this.handleFarmFinanceChange(payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Farm Finances Channel:', status);
        this.updateConnectionState(status === 'SUBSCRIBED');
      });

    const platformWalletChannel = supabase
      .channel('platform-wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_wallet'
        },
        (payload) => {
          console.log('🏛️ Platform Wallet Change:', payload);
          this.handlePlatformWalletChange(payload);
        }
      )
      .subscribe();

    const charityWalletChannel = supabase
      .channel('charity-wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'charity_wallet'
        },
        (payload) => {
          console.log('🤍 Charity Wallet Change:', payload);
          this.handleCharityWalletChange(payload);
        }
      )
      .subscribe();

    const investorsWalletChannel = supabase
      .channel('investors-wallet-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investors_wallet'
        },
        (payload) => {
          console.log('💼 Investors Wallet Change:', payload);
          this.handleInvestorsWalletChange(payload);
        }
      )
      .subscribe();

    const reservationsChannel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('📝 Reservation Change:', payload);
          this.handleReservationChange(payload);
        }
      )
      .subscribe();

    this.channels = [
      farmFinancesChannel,
      platformWalletChannel,
      charityWalletChannel,
      investorsWalletChannel,
      reservationsChannel
    ];
  }

  private async loadInitialData() {
    try {
      const [farmFinances, platformWallet, charityWallet, investorsWallets] = await Promise.all([
        supabase.from('smart_farm_finances').select('*').is('deleted_at', null),
        supabase.from('platform_wallet').select('*').eq('id', '00000000-0000-0000-0000-000000000002').single(),
        supabase.from('charity_wallet').select('*').eq('id', '00000000-0000-0000-0000-000000000001').single(),
        supabase.from('investors_wallet').select('*')
      ]);

      if (farmFinances.data) {
        farmFinances.data.forEach(farm => {
          this.state.farmFinances.set(farm.farm_code, farm);
        });
      }

      if (platformWallet.data) {
        this.state.platformWallet = platformWallet.data;
      }

      if (charityWallet.data) {
        this.state.charityWallet = charityWallet.data;
      }

      if (investorsWallets.data) {
        investorsWallets.data.forEach(wallet => {
          this.state.investorsWallets.set(wallet.farm_code, wallet);
        });
      }

      this.state.lastUpdate = new Date();
      this.notifyListeners();

      console.log('✅ Initial financial data loaded');
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    }
  }

  private handleFarmFinanceChange(payload: any) {
    if (payload.new) {
      this.state.farmFinances.set(payload.new.farm_code, payload.new);
    } else if (payload.old) {
      this.state.farmFinances.delete(payload.old.farm_code);
    }

    this.state.lastUpdate = new Date();
    this.notifyListeners();
  }

  private handlePlatformWalletChange(payload: any) {
    if (payload.new) {
      this.state.platformWallet = payload.new;
      this.state.lastUpdate = new Date();
      this.notifyListeners();
    }
  }

  private handleCharityWalletChange(payload: any) {
    if (payload.new) {
      this.state.charityWallet = payload.new;
      this.state.lastUpdate = new Date();
      this.notifyListeners();
    }
  }

  private handleInvestorsWalletChange(payload: any) {
    if (payload.new) {
      this.state.investorsWallets.set(payload.new.farm_code, payload.new);
    } else if (payload.old) {
      this.state.investorsWallets.delete(payload.old.farm_code);
    }

    this.state.lastUpdate = new Date();
    this.notifyListeners();
  }

  private async handleReservationChange(payload: any) {
    if (payload.new && payload.new.booking_status === 'approved') {
      const { data: farm } = await supabase
        .from('farms')
        .select('farm_code')
        .eq('id', payload.new.farm_id)
        .single();

      if (farm) {
        const { data: finance } = await supabase
          .from('smart_farm_finances')
          .select('*')
          .eq('farm_code', farm.farm_code)
          .single();

        if (finance) {
          this.state.farmFinances.set(farm.farm_code, finance);
          this.state.lastUpdate = new Date();
          this.notifyListeners();
        }
      }
    }
  }

  private updateConnectionState(connected: boolean) {
    this.state.isConnected = connected;
    this.notifyListeners();
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

    callback({ ...this.state });

    return () => {
      this.listeners.delete(callback);
    };
  }

  getState(): LiveFinancialState {
    return { ...this.state };
  }

  cleanup() {
    console.log('🧹 Cleaning up Live Financial System...');
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels = [];
    this.listeners.clear();
  }
}

export const LiveFinancialSystem = new LiveFinancialSystemService();
