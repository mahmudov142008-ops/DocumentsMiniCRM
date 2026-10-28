import React, { useState } from 'react';
import { Sparkles, X, FileText, Send, Lightbulb, Copy, Check } from 'lucide-react';
import { Customer, Deal, CustomerNote } from '../../types/crm';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  deal?: Deal;
  notes?: CustomerNote[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  customer,
  deal,
  notes = [],
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'email' | 'actions'>('summary');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 1. Note summary extraction
  const generateSummary = () => {
    if (!notes || notes.length === 0) {
      return `No notes recorded yet for ${customer?.name || 'this customer'}. Add customer notes to generate intelligent interaction summaries.`;
    }
    const totalWords = notes.reduce((sum, n) => sum + n.content.split(/\s+/).length, 0);
    const keyPoints = notes.map((n, i) => `• Interaction ${i + 1} (${new Date(n.created_at).toLocaleDateString()}): ${n.content.trim()}`);
    return `Summary for ${customer?.name || 'Customer'} (${customer?.company || 'Company'}):\nTotal Logged Notes: ${notes.length} interactions (~${totalWords} words).\n\nKey Takeaways:\n${keyPoints.join('\n')}`;
  };

  // 2. Draft follow-up email
  const generateEmailDraft = () => {
    const recipient = customer?.name || 'Valued Partner';
    const company = customer?.company || 'your team';
    const dealTitle = deal?.title || 'our recent discussion';
    const stage = deal?.stage || 'Contacted';

    if (stage === 'Proposal') {
      return `Subject: Following up on proposal for ${dealTitle}\n\nHi ${recipient},\n\nI hope your week is off to a great start. Following our recent presentation regarding ${dealTitle}, I wanted to check in and see if your stakeholders had any questions regarding the scope or delivery timeline.\n\nWe are enthusiastic about partnering with ${company} to accomplish your strategic goals. Would you have 15 minutes this Thursday or Friday for a quick sync?\n\nBest regards,\n[Your Name]\nMiniCRM Team`;
    } else if (stage === 'Negotiation') {
      return `Subject: Next steps & finalizing agreement — ${dealTitle}\n\nHi ${recipient},\n\nThank you for the constructive feedback during our last discussion. We have reviewed the terms for ${dealTitle} to ensure it delivers optimal value for ${company}.\n\nLet me know if we can schedule a brief call tomorrow to finalize the remaining details.\n\nWarm regards,\n[Your Name]`;
    } else {
      return `Subject: Touching base regarding ${dealTitle}\n\nHi ${recipient},\n\nI hope you're doing well! I'm following up on our previous conversation regarding ${dealTitle} at ${company}.\n\nDo you have some time later this week for a brief conversation to explore how we can assist with your upcoming milestones?\n\nLooking forward to speaking,\n[Your Name]`;
    }
  };

  // 3. Recommended next actions
  const getNextActions = () => {
    const stage = deal?.stage || 'Lead';
    switch (stage) {
      case 'Lead':
        return [
          { title: 'Qualify Needs & Budget', desc: 'Schedule a 20-minute discovery call to identify core pain points and decision criteria.' },
          { title: 'Verify Company Profile', desc: `Check ${customer?.company || 'company'} size, industry trends, and tech stack.` },
          { title: 'Log First Contact Note', desc: 'Record key conversation takeaways to maintain relationship continuity.' },
        ];
      case 'Contacted':
        return [
          { title: 'Schedule Product Walkthrough', desc: 'Book a tailored demonstration focused on high-priority customer workflows.' },
          { title: 'Send Introductory One-Pager', desc: 'Share concise customer success stories and pricing benchmarks.' },
          { title: 'Set Due Task in CRM', desc: 'Create a follow-up reminder for 48 hours after meeting.' },
        ];
      case 'Qualified':
      case 'Proposal':
        return [
          { title: 'Deliver Tailored Proposal', desc: 'Send customized pricing tiers with clear deliverables and ROI estimations.' },
          { title: 'Confirm Decision Makers', desc: 'Ensure legal and procurement stakeholders are included in the review cycle.' },
          { title: 'Set Calendar Reminder', desc: 'Book proposal review meeting 3 business days following submission.' },
        ];
      case 'Negotiation':
        return [
          { title: 'Finalize Contract Revisions', desc: 'Address legal redlines and confirm payment terms with customer.' },
          { title: 'Prepare Onboarding Roadmap', desc: 'Draft initial implementation kickoff schedule to accelerate time-to-value.' },
        ];
      default:
        return [
          { title: 'Check In With Client', desc: 'Maintain regular contact to ensure ongoing satisfaction and renewal readiness.' },
          { title: 'Explore Expansion Opportunities', desc: 'Evaluate additional service lines or enterprise team seats.' },
        ];
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-subtle)',
                border: '1px solid var(--primary-border)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="modal-title" style={{ fontSize: '1.0625rem' }}>AI CRM Intelligence Assistant</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {customer ? `${customer.name} (${customer.company})` : 'Contextual CRM Suggestions'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-card-subtle)',
            padding: '4px 16px 0',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: activeTab === 'summary' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'summary' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            <FileText size={15} /> Interaction Summary
          </button>
          <button
            onClick={() => setActiveTab('email')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: activeTab === 'email' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'email' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            <Send size={15} /> Draft Follow-up
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: activeTab === 'actions' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'actions' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            <Lightbulb size={15} /> Recommended Next Steps
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ minHeight: '260px' }}>
          {activeTab === 'summary' && (
            <div>
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  whiteSpace: 'pre-line',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                }}
              >
                {generateSummary()}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleCopy(generateSummary())}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Summary'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  whiteSpace: 'pre-line',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  fontFamily: 'inherit',
                }}
              >
                {generateEmailDraft()}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleCopy(generateEmailDraft())}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                  {copied ? 'Copied to Clipboard' : 'Copy Email Draft'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {getNextActions().map((action, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {action.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '28px' }}>
                    {action.desc}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Client-side intelligent inference engine
          </span>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '7px 16px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
