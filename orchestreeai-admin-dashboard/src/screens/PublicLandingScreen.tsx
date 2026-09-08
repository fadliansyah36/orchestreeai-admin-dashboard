import React, { useState } from 'react';
import { LandingHeader } from '../components/landing/LandingHeader';
import { HeroSection } from '../components/landing/HeroSection';
import { WorkforceUniverseDiagram } from '../components/landing/WorkforceUniverseDiagram';
import { HumanAiCollaborationSection } from '../components/landing/HumanAiCollaborationSection';
import { AiEmployeeShowcase } from '../components/landing/AiEmployeeShowcase';
import { WorkforcePerformanceSection } from '../components/landing/WorkforcePerformanceSection';
import { ProblemSolutionSection } from '../components/landing/ProblemSolutionSection';
import { HowItWorksSteps } from '../components/landing/HowItWorksSteps';
import { SocialCreativeWorkforceSection } from '../components/landing/SocialCreativeWorkforceSection';
import { CompanyBrainWorkspaceSection } from '../components/landing/CompanyBrainWorkspaceSection';
import { RealtimeCockpitPreview } from '../components/landing/RealtimeCockpitPreview';
import { DayInTheLifeSection } from '../components/landing/DayInTheLifeSection';
import { RoiCalculatorSection } from '../components/landing/RoiCalculatorSection';
import { UseCasesSection } from '../components/landing/UseCasesSection';
import { PricingSection } from '../components/landing/PricingSection';
import { SecurityTrustSection } from '../components/landing/SecurityTrustSection';
import { FaqSection } from '../components/landing/FaqSection';
import { FooterCtaSection } from '../components/landing/FooterCtaSection';
import { ProspectRegistrationForm } from '../components/landing/ProspectRegistrationForm';
import { InterestOptionType } from '../types';

export const PublicLandingScreen: React.FC = () => {
  const [prospectModalOpen, setProspectModalOpen] = useState(false);
  const [selectedPlanForProspect, setSelectedPlanForProspect] = useState<string | undefined>(undefined);
  const [selectedInterestOption, setSelectedInterestOption] = useState<InterestOptionType>('direct_trial_or_subscription');

  const handleOpenProspectForm = (planId?: string, interestOption: InterestOptionType = 'direct_trial_or_subscription') => {
    setSelectedPlanForProspect(planId);
    setSelectedInterestOption(interestOption);
    setProspectModalOpen(true);
  };

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#071226] text-white selection:bg-[#08B85C]/30 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* 1. Header (Sticky navigation, 0 Auth triggers) */}
      <LandingHeader
        onScrollToSection={handleScrollToSection}
        onOpenProspectForm={() => handleOpenProspectForm(undefined, 'direct_trial_or_subscription')}
      />

      {/* 2. Hero Section (Headline, Value Proposition & Orchestration Simulation) */}
      <HeroSection
        onScrollToSection={handleScrollToSection}
        onOpenProspectForm={(interest) =>
          handleOpenProspectForm(undefined, (interest as InterestOptionType) || 'direct_trial_or_subscription')
        }
      />

      {/* 3. Workforce Universe Diagram (Visual Org Topology & Staf AI Matrix) */}
      <WorkforceUniverseDiagram />

      {/* 4. Human + AI Collaboration Flow (Closed-Loop Delegation & Approval Gate) */}
      <HumanAiCollaborationSection />

      {/* 5. 16 Autonomous AI Employees Showcase */}
      <AiEmployeeShowcase />

      {/* 6. Realtime Performance Scoring & Leaderboard */}
      <WorkforcePerformanceSection />

      {/* 7. Problem vs Solution Comparison */}
      <ProblemSolutionSection />

      {/* 8. 4-Step Onboarding Workflow */}
      <HowItWorksSteps />

      {/* 9. Social & Creative Media Studio AI */}
      <SocialCreativeWorkforceSection />

      {/* 10. Company Brain & Long-Term Memory Vault */}
      <CompanyBrainWorkspaceSection />

      {/* 11. Live Interactive Cockpit Preview */}
      <RealtimeCockpitPreview />

      {/* 12. Day in the Life Timeline Comparison */}
      <DayInTheLifeSection />

      {/* 13. Dynamic Operational ROI Calculator */}
      <RoiCalculatorSection />

      {/* 14. Real Industry Use Cases */}
      <UseCasesSection />

      {/* 15. Dynamic Enterprise Pricing Matrix (Fetched from /api/v1/plans) */}
      <PricingSection
        onSelectPlan={(planId) => handleOpenProspectForm(planId, 'direct_trial_or_subscription')}
      />

      {/* 16. Security, Compliance & Data Sovereignty Guarantees (UU PDP 2024) */}
      <SecurityTrustSection />

      {/* 17. Frequently Asked Questions (FAQ) */}
      <FaqSection />

      {/* 18. Informational Footer & Regulatory Disclosures */}
      <FooterCtaSection
        onOpenProspectForm={() => handleOpenProspectForm(undefined, 'direct_trial_or_subscription')}
      />

      {/* Modal: Prospect Registration & Lead Capture Form (Fase 127) */}
      {prospectModalOpen && (
        <ProspectRegistrationForm
          isOpen={prospectModalOpen}
          onClose={() => setProspectModalOpen(false)}
          preselectedPlanId={selectedPlanForProspect}
          preselectedInterestOption={selectedInterestOption}
        />
      )}
    </div>
  );
};
