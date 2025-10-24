import { supabase } from '../../lib/supabase';
import type { Wallet, WalletTransaction } from '../../types/database.types';

interface ProcessTransactionParams {
  wallet_id: string;
  transaction_type: WalletTransaction['transaction_type'];
  amount: number;
  description_ar: string;
  description_en: string;
  reference_id?: string;
  reference_type?: string;
}

export class WalletsService {
  static async getByUser(userId: string, userType: 'investor' | 'owner') {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('user_type', userType)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data as Wallet | null;
  }

  static async createWallet(userId: string, userType: 'investor' | 'owner') {
    const { data, error } = await supabase
      .from('wallets')
      .insert([{
        user_id: userId,
        user_type: userType,
        balance: 0,
        total_deposits: 0,
        total_withdrawals: 0,
        currency: 'SAR',
        status: 'active'
      }])
      .select()
      .single();

    if (error) throw error;
    return data as Wallet;
  }

  static async getOrCreateWallet(userId: string, userType: 'investor' | 'owner') {
    let wallet = await this.getByUser(userId, userType);

    if (!wallet) {
      wallet = await this.createWallet(userId, userType);
    }

    return wallet;
  }

  static async getTransactions(walletId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('wallet_id', walletId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as WalletTransaction[];
  }

  static async processTransactionSafe(params: ProcessTransactionParams) {
    const { data, error } = await supabase.rpc('process_wallet_transaction_safe', {
      p_wallet_id: params.wallet_id,
      p_transaction_type: params.transaction_type,
      p_amount: params.amount,
      p_description_ar: params.description_ar,
      p_description_en: params.description_en,
      p_reference_id: params.reference_id || null,
      p_reference_type: params.reference_type || null
    });

    if (error) throw error;
    return data;
  }

  static async getBalance(walletId: string): Promise<number> {
    const { data, error } = await supabase
      .from('wallets')
      .select('balance')
      .eq('id', walletId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) throw error;
    return data?.balance || 0;
  }

  static async updateStatus(walletId: string, status: Wallet['status']) {
    const { data, error } = await supabase
      .from('wallets')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', walletId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data as Wallet;
  }

  static async getStatistics() {
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('balance, total_deposits, total_withdrawals, status, user_type')
      .is('deleted_at', null);

    if (walletsError) throw walletsError;

    const { data: transactions, error: transactionsError } = await supabase
      .from('wallet_transactions')
      .select('transaction_type, amount, status')
      .is('deleted_at', null);

    if (transactionsError) throw transactionsError;

    const stats = {
      totalWallets: wallets.length,
      activeWallets: wallets.filter(w => w.status === 'active').length,
      frozenWallets: wallets.filter(w => w.status === 'frozen').length,
      totalBalance: wallets.reduce((sum, w) => sum + Number(w.balance), 0),
      totalDeposits: wallets.reduce((sum, w) => sum + Number(w.total_deposits), 0),
      totalWithdrawals: wallets.reduce((sum, w) => sum + Number(w.total_withdrawals), 0),
      investorWallets: wallets.filter(w => w.user_type === 'investor').length,
      ownerWallets: wallets.filter(w => w.user_type === 'owner').length,
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(t => t.status === 'completed').length,
      pendingTransactions: transactions.filter(t => t.status === 'pending').length,
    };

    return stats;
  }
}
