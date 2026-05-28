import { Injectable } from '@angular/core';

export interface LoyaltyVoucher {
  contractorId: number;
  contractorName: string;
  amount: number;       // zł
  points: number;       // ile pkt zostało pobrane
  date: string;         // kiedy wystawiony
}

@Injectable({ providedIn: 'root' })
export class LoyaltyVoucherService {
  private KEY = 'loyalty_vouchers';

  private load(): Record<number, LoyaltyVoucher> {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  private save(vouchers: Record<number, LoyaltyVoucher>) {
    localStorage.setItem(this.KEY, JSON.stringify(vouchers));
  }

  set(voucher: LoyaltyVoucher) {
    const all = this.load();
    // jeśli już jest bon, dodaj kwotę (może mieć kilka nieużytych)
    if (all[voucher.contractorId]) {
      all[voucher.contractorId].amount += voucher.amount;
      all[voucher.contractorId].points += voucher.points;
    } else {
      all[voucher.contractorId] = voucher;
    }
    this.save(all);
  }

  get(contractorId: number): LoyaltyVoucher | null {
    return this.load()[contractorId] ?? null;
  }

  clear(contractorId: number) {
    const all = this.load();
    delete all[contractorId];
    this.save(all);
  }
}
