import React, { useState, useEffect } from 'react';
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { CommercialPlanItem } from '../../types';
import { CANONICAL_PLANS, CanonicalPlanConfig } from './landingData';

interface PricingSectionProps {
  onSelectPlan?: (planId?: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [plans, setPlans] = useState<CommercialPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchPricing() {
      try {
        setIsLoading(true);
        const data = await api.getPublicPlans();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPlans(data);
          setApiError(null);
        }
      } catch (err: any) {
        console.warn('Could not fetch dynamic plans, fallback to canonical data:', err);
        if (isMounted) {
          setApiError(err?.message || 'Failed to fetch dynamic plans');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchPricing();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge backend data with display metadata
  const displayPlans = plans.length > 0
    ? plans
        .filter((p) => p.isActive && p.isPriceVisible)
        .map((p) => {
          const matchingCanonical = CANONICAL_PLANS.find(
            (c) => c.id.toLowerCase() === p.planCode.toLowerCase()
          );
          const baseMonthly = p.price ?? matchingCanonical?.monthlyPriceIdr ?? 0;
          const baseAnnual = Math.round(baseMonthly * 0.8);
          return {
            id: p.planCode,
            name: p.planName,
            monthlyPriceIdr: baseMonthly,
            annualPriceIdr: baseAnnual,
            description: matchingCanonical?.description ?? `Paket ${p.planName} untuk otomatisasi workforce.`,
            aiWorkforceCount: p.aiAgentLimit,
            humanSeatsCount: p.humanSeatLimit,
            taskMonthlyLimit: p.creditAllocation ? `${p.creditAllocation.toLocaleString('id-ID')} Kredit Tugas` : 'Sesuai SLA',
            isPopular: p.planCode.toLowerCase() === 'growth',
            badge: matchingCanonical?.badge ?? (p.planCode.toLowerCase() === 'growth' ? 'Paling Populer' : undefined),
            features: matchingCanonical?.features ?? [
              `${p.aiAgentLimit} Staf AI Aktif Otomatis`,
              `${p.humanSeatLimit} Akun Staf Manusia`,
              'Isolasi Multi-Tenant Enkripsi Penuh',
              'Akses Company Brain & Memory Vault',
              'Dukungan SLA Standard',
            ],
          };
        })
    : CANONICAL_PLANS;

  const handleConsultation = (planName: string) => {
    const faqElem = document.getElementById('faq');
    if (faqElem) {
      faqElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-[#071226] via-[#0B1835] to-[#071226] text-white border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/5 border border-[#08B85C]/30 text-xs font-semibold text-[#08B85C] mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRANSPARENT ENTERPRISE PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Investasi Terjangkau untuk Skala Produktivitas 10x Lipat
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300">
            Pilih paket yang sesuai dengan tahapan bisnis Anda. Seluruh paket mencakup isolasi multi-tenant terenkripsi, integrasi WhatsApp, dan akses Company Brain.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white/20 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tagihan Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-2 ${
                billingCycle === 'annual'
                  ? 'bg-gradient-to-r from-[#08B85C] to-[#1976E8] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Tagihan Tahunan</span>
              <span className="px-2 py-0.5 rounded-full bg-black/30 text-white text-[10px] uppercase font-mono">
                Hemat 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPlans.map((plan) => {
            const price = billingCycle === 'annual' ? plan.annualPriceIdr : plan.monthlyPriceIdr;
            return (
              <div
                key={plan.id}
                className={`p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between relative ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-[#0B1835] to-[#071226] border-[#08B85C] shadow-2xl shadow-[#08B85C]/20 ring-1 ring-[#08B85C]'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.05]'
                }`}
              >
                {/* Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#08B85C] to-[#1976E8] text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-extrabold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 leading-snug min-h-[36px]">{plan.description}</p>
                  </div>

                  {/* Price Block */}
                  <div className="mt-6 pb-6 border-b border-white/10">
                    {price && price > 0 ? (
                      <>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-xs font-semibold text-slate-400">Rp</span>
                          <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                            {price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block mt-1">
                          / bulan {billingCycle === 'annual' ? '(ditagih tahunan)' : ''}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                            Hubungi Sales
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block mt-1">
                          Kustom SLA & Infrastruktur Dedicated
                        </span>
                      </>
                    )}
                  </div>

                  {/* Limits Summary */}
                  <div className="py-4 space-y-2 text-xs font-mono border-b border-white/10">
                    <div className="flex justify-between text-slate-300">
                      <span>Staf AI Aktif:</span>
                      <strong className="text-[#08B85C]">{plan.aiWorkforceCount} Agen</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Kapasitas Human:</span>
                      <strong className="text-[#1976E8]">{plan.humanSeatsCount} Akun</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Batas Tugas:</span>
                      <strong className="text-white">{plan.taskMonthlyLimit}</strong>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="pt-5 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Fitur Termasuk:
                    </span>
                    <ul className="space-y-2 text-xs text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <Check className="w-4 h-4 text-[#08B85C] shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Informational CTA / Trial Selector */}
                <div className="pt-8">
                  <button
                    onClick={() => {
                      if (onSelectPlan) {
                        const backendPlan = plans.find((p) => p.planCode.toLowerCase() === plan.id.toLowerCase());
                        onSelectPlan(backendPlan?.id || plan.id);
                      } else {
                        handleConsultation(plan.name);
                      }
                    }}
                    className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-[#08B85C] via-[#16B7D9] to-[#1976E8] text-white shadow-xl shadow-[#08B85C]/25 hover:brightness-110'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                  >
                    <span>Pilih Paket & Seleksi Trial {plan.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
