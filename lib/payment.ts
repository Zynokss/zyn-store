export interface BankTransferDetails {
  bankName: string;
  accountHolder: string;
  rib: string;
  whatsappProof: string;
}

// Returns null if bank transfer isn't configured — callers must not fall back to a
// hardcoded account number, since that would silently point real customer payments
// at an account nobody is actively monitoring (or that isn't even the operator's).
export function getBankTransferDetails(): BankTransferDetails | null {
  const { CIH_BANK_NAME, CIH_ACCOUNT_HOLDER, CIH_RIB, CIH_WHATSAPP } = process.env;
  if (!CIH_BANK_NAME || !CIH_ACCOUNT_HOLDER || !CIH_RIB) return null;

  return {
    bankName: CIH_BANK_NAME,
    accountHolder: CIH_ACCOUNT_HOLDER,
    rib: CIH_RIB,
    whatsappProof: CIH_WHATSAPP || '',
  };
}
