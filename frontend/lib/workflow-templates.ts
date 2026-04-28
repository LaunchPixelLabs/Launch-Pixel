// Workflow Templates for all agent presets
// Each template is a complete ReactFlow state with nodes + edges

const E = (id: string, s: string, t: string, dash = false) => ({
  id, source: s, target: t, animated: true,
  style: { stroke: '#FEED01', strokeWidth: dash ? 2 : 3, ...(dash ? { strokeDasharray: '5,5' } : {}) }
});

const entry = (id: string, x: number, y: number, type = 'inbound') => ({ id, type: 'entry' as const, position: { x, y }, data: { type } });
const resp = (id: string, x: number, y: number, label: string) => ({ id, type: 'response' as const, position: { x, y }, data: { label } });
const kw = (id: string, x: number, y: number, keyword: string) => ({ id, type: 'keyword' as const, position: { x, y }, data: { keyword } });
const rej = (id: string, x: number, y: number, trigger: string, response: string) => ({ id, type: 'rejection' as const, position: { x, y }, data: { trigger, response } });
const act = (id: string, x: number, y: number, icon: string, title: string, desc: string) => ({ id, type: 'action' as const, position: { x, y }, data: { icon, title, description: desc } });

export const WORKFLOW_TEMPLATES: Record<string, { name: string; nodes: any[]; edges: any[] }> = {
  receptionist: {
    name: 'Virtual Receptionist',
    nodes: [
      entry('1', 400, 0, 'inbound'),
      resp('2', 350, 140, 'Welcome! Thank you for calling [Business Name]. This is your virtual receptionist. How may I direct your call today?'),
      // Intent branches
      kw('3', 0, 340, 'pricing|cost|quote|rates|how much'),
      kw('4', 300, 340, 'appointment|book|schedule|meeting|visit'),
      kw('5', 600, 340, 'complaint|issue|problem|broken|wrong'),
      kw('6', 900, 340, 'human|person|manager|speak|transfer'),
      // Actions & responses
      act('7', 0, 540, 'knowledge', 'Pricing Lookup', 'Search knowledge base for pricing, packages, and rate information.'),
      act('8', 300, 540, 'schedule', 'Book Appointment', 'Check availability and schedule a meeting or visit.'),
      resp('9', 300, 720, 'Great! I\'ve scheduled that for you. You\'ll receive a confirmation shortly. Is there anything else I can help with?'),
      act('10', 600, 540, 'knowledge', 'Issue Resolution', 'Search knowledge base for troubleshooting steps and solutions.'),
      resp('11', 600, 720, 'I understand your concern. Let me look into that for you right away.'),
      act('12', 900, 540, 'transfer', 'Human Handoff', 'Transfer the call to a live team member immediately.'),
      act('13', 900, 720, 'whatsapp_admin', 'Alert Admin', 'Notify the business owner about this call via WhatsApp.'),
      // Edge cases
      rej('14', 150, 900, 'spam|sell|offer|marketing', 'I appreciate you reaching out, but we\'re not interested at this time. Thank you for calling!'),
      resp('15', 500, 900, 'Is there anything else I can help you with today? I want to make sure all your questions are answered.'),
      kw('16', 0, 900, 'angry|frustrated|unacceptable|ridiculous'),
      resp('17', 0, 1080, 'I completely understand your frustration, and I sincerely apologize for the inconvenience. Let me connect you with someone who can resolve this immediately.'),
    ],
    edges: [
      E('e1-2', '1', '2'), E('e2-3', '2', '3', true), E('e2-4', '2', '4', true),
      E('e2-5', '2', '5', true), E('e2-6', '2', '6', true),
      E('e3-7', '3', '7'), E('e4-8', '4', '8'), E('e8-9', '8', '9'),
      E('e5-10', '5', '10'), E('e10-11', '10', '11'),
      E('e6-12', '6', '12'), E('e6-13', '6', '13'),
      E('e11-15', '11', '15'), E('e2-16', '2', '16', true),
      E('e16-17', '16', '17'), E('e17-12', '17', '12'),
    ],
  },

  sales_closer: {
    name: 'Sales Closer',
    nodes: [
      entry('1', 400, 0, 'outbound'),
      resp('2', 350, 140, 'Hi [Name], this is Alex from [Business]. I noticed your interest in our solution and wanted to personally reach out. Do you have 2 minutes?'),
      // Interest detection
      kw('3', 0, 340, 'yes|sure|okay|interested|tell me|go ahead'),
      kw('4', 400, 340, 'busy|later|not now|call back'),
      kw('5', 800, 340, 'no|not interested|stop|remove'),
      // YES branch - Value + Close
      resp('6', 0, 540, 'Excellent! Let me share how we\'ve helped businesses like yours achieve [key result]. What\'s your biggest challenge right now?'),
      act('7', 0, 720, 'knowledge', 'Solution Matching', 'Search knowledge base for case studies and solutions matching their pain points.'),
      kw('8', -200, 900, 'price|cost|expensive|budget|afford'),
      kw('9', 200, 900, 'competitor|already using|alternative'),
      resp('10', -200, 1080, 'I understand budget is important. Here\'s the ROI breakdown: our clients typically see [X]x return within [timeframe]. Plus, we offer flexible plans.'),
      act('11', -200, 1260, 'knowledge', 'ROI Data', 'Pull ROI statistics, case studies, and pricing tiers from knowledge base.'),
      resp('12', 200, 1080, 'Great question! Unlike [competitor], we offer [unique value]. Our clients switched because of [differentiator]. Let me show you the comparison.'),
      act('13', 200, 1260, 'knowledge', 'Competitor Intel', 'Search competitive analysis and differentiation points.'),
      // Close
      resp('14', 0, 1440, 'Based on everything we discussed, I think [plan/solution] is perfect for you. Shall I set up a deep-dive demo this week?'),
      act('15', 0, 1620, 'schedule', 'Book Demo', 'Schedule a product demo or strategy session.'),
      act('16', 200, 1620, 'whatsapp_admin', 'Deal Alert', 'Alert admin about hot lead ready to close.'),
      // BUSY branch
      act('17', 400, 540, 'schedule', 'Schedule Callback', 'Set up a callback at their preferred time.'),
      resp('18', 400, 720, 'Absolutely! When works best for you? I\'ll make sure to call at exactly that time. You\'ll get a WhatsApp reminder too.'),
      // NO branch - Objection handling
      rej('19', 800, 540, 'no|not interested|don\'t need', 'I respect that. Before I go — just curious, what solution are you currently using for [problem]? Many clients initially felt the same way.'),
      rej('20', 800, 720, 'stop calling|do not call|remove me', 'I completely understand. I\'ll remove you from our list right away. If you ever reconsider, we\'re here. Have a great day!'),
      // Edge cases
      kw('21', 600, 340, 'manager|decision maker|boss|authority'),
      resp('22', 600, 540, 'Totally understand! Could you share the best way to reach the decision maker? I\'d love to present this opportunity to them directly.'),
      act('23', 600, 720, 'whatsapp_admin', 'Lead Intel', 'Save lead info and decision-maker contact for follow-up.'),
    ],
    edges: [
      E('e1-2', '1', '2'), E('e2-3', '2', '3', true), E('e2-4', '2', '4', true),
      E('e2-5', '2', '5', true), E('e2-21', '2', '21', true),
      E('e3-6', '3', '6'), E('e6-7', '6', '7'), E('e7-8', '7', '8', true),
      E('e7-9', '7', '9', true), E('e8-10', '8', '10'), E('e10-11', '10', '11'),
      E('e9-12', '9', '12'), E('e12-13', '12', '13'),
      E('e11-14', '11', '14'), E('e13-14', '13', '14'),
      E('e14-15', '14', '15'), E('e14-16', '14', '16'),
      E('e4-17', '4', '17'), E('e17-18', '17', '18'),
      E('e5-19', '5', '19'), E('e19-20', '19', '20'),
      E('e21-22', '21', '22'), E('e22-23', '22', '23'),
    ],
  },

  appointment_setter: {
    name: 'Appointment Setter',
    nodes: [
      entry('1', 400, 0, 'outbound'),
      resp('2', 350, 140, 'Hi [Name], this is Jordan from [Business]. I\'m reaching out because we have limited strategy session slots this week. Can I take 60 seconds to see if it\'s a fit?'),
      // Qualification
      kw('3', 0, 340, 'yes|sure|okay|go ahead|what is it'),
      kw('4', 400, 340, 'busy|not now|later|call back'),
      kw('5', 800, 340, 'no|not interested|don\'t need'),
      // Qualify path
      resp('6', 0, 540, 'Quick question — are you currently handling [problem area] in-house, or are you looking for a better solution?'),
      kw('7', -200, 740, 'in-house|ourselves|internal|DIY'),
      kw('8', 200, 740, 'looking|need|want|searching|open'),
      resp('9', -200, 920, 'Most of our best clients started that way! They found our approach saved them [X hours/dollars]. Worth a 15-min look?'),
      resp('10', 200, 920, 'Perfect timing! We specialize in exactly that. Let me grab a slot for you this week.'),
      act('11', 0, 1100, 'schedule', 'Book Strategy Session', 'Check calendar and book a 15-30 minute strategy session.'),
      resp('12', 0, 1280, 'You\'re all set for [date/time]! I\'ll send a confirmation to your WhatsApp right now. Looking forward to it!'),
      act('13', 200, 1280, 'whatsapp_admin', 'Booking Confirmation', 'Send WhatsApp confirmation with meeting details.'),
      // Busy path
      act('14', 400, 540, 'schedule', 'Schedule Callback', 'Book a callback at their preferred time.'),
      resp('15', 400, 720, 'No problem at all! When\'s a better time? I\'ll call you at exactly that time — I respect your schedule.'),
      // No path
      rej('16', 800, 540, 'no|not interested|waste of time', 'I completely understand! Just so you know, we helped [similar company] achieve [result] in just [timeframe]. Can I send you a quick case study via WhatsApp?'),
      resp('17', 800, 740, 'Fair enough! If anything changes, here\'s my direct line. Wishing you the best!'),
      // Edge cases
      kw('18', -200, 340, 'cancel|reschedule|change'),
      resp('19', -200, 540, 'Absolutely! Let me find a new time that works perfectly for you.'),
      act('20', -200, 720, 'schedule', 'Reschedule', 'Find alternative appointment time and reschedule.'),
      kw('21', 600, 740, 'how much|cost|free|price'),
      resp('22', 600, 920, 'The strategy session is completely complimentary — no strings attached. It\'s our way of showing you the value first.'),
    ],
    edges: [
      E('e1-2', '1', '2'), E('e2-3', '2', '3', true), E('e2-4', '2', '4', true),
      E('e2-5', '2', '5', true), E('e2-18', '2', '18', true),
      E('e3-6', '3', '6'), E('e6-7', '6', '7', true), E('e6-8', '6', '8', true),
      E('e7-9', '7', '9'), E('e8-10', '8', '10'),
      E('e9-11', '9', '11'), E('e10-11', '10', '11'),
      E('e11-12', '11', '12'), E('e12-13', '12', '13'),
      E('e4-14', '4', '14'), E('e14-15', '14', '15'),
      E('e5-16', '5', '16'), E('e16-17', '16', '17'),
      E('e18-19', '18', '19'), E('e19-20', '19', '20'),
      E('e6-21', '6', '21', true), E('e21-22', '21', '22'), E('e22-11', '22', '11'),
    ],
  },

  support: {
    name: 'Customer Support',
    nodes: [
      entry('1', 400, 0, 'inbound'),
      resp('2', 350, 140, 'Hi! I\'m Casey, your support specialist. I\'m here to solve any issue you\'re facing. What\'s going on?'),
      // Issue classification
      kw('3', -100, 340, 'broken|error|bug|crash|not working|down|fail'),
      kw('4', 250, 340, 'billing|charge|refund|payment|invoice'),
      kw('5', 600, 340, 'how to|setup|configure|install|help with'),
      kw('6', 950, 340, 'cancel|delete|close account|unsubscribe'),
      // Technical issue path
      resp('7', -100, 540, 'I\'m sorry you\'re experiencing that! Let me look into it right away. Can you tell me exactly what error you\'re seeing?'),
      act('8', -100, 720, 'knowledge', 'Technical KB', 'Search troubleshooting guides, known issues, and fix documentation.'),
      resp('9', -100, 900, 'Based on what I found, here\'s the step-by-step fix: [solution]. Did that resolve the issue?'),
      kw('10', -300, 1080, 'yes|fixed|working|solved|thank'),
      kw('11', 100, 1080, 'no|still|didn\'t work|same problem'),
      resp('12', -300, 1260, 'Wonderful! Glad I could help! Is there anything else I can assist with today?'),
      act('13', 100, 1260, 'transfer', 'Escalate to Engineer', 'Connect to technical team for advanced troubleshooting.'),
      act('14', 100, 1440, 'whatsapp_admin', 'Priority Ticket', 'Create priority support ticket and alert admin.'),
      // Billing path
      act('15', 250, 540, 'knowledge', 'Billing Info', 'Search billing policies, refund rules, and account info.'),
      resp('16', 250, 720, 'I\'ve pulled up your billing information. Here\'s what I see: [details]. How would you like to proceed?'),
      // How-to path
      act('17', 600, 540, 'knowledge', 'Help Guides', 'Search setup guides, tutorials, and how-to documentation.'),
      resp('18', 600, 720, 'Here\'s a step-by-step guide for that. I\'ll walk you through it now.'),
      // Cancel path (retention)
      resp('19', 950, 540, 'I\'m sorry to hear you\'re considering that. May I ask what prompted this? I\'d love the chance to make things right.'),
      rej('20', 950, 740, 'just cancel|don\'t care|now', 'I understand. I\'ll process that for you. Before I do — would a [discount/free month] change your mind?'),
      act('21', 950, 920, 'whatsapp_admin', 'Churn Alert', 'URGENT: Customer requesting cancellation. Intervention needed.'),
      // Angry customer
      kw('22', -300, 340, 'angry|furious|worst|terrible|sue|lawyer'),
      resp('23', -300, 540, 'I completely understand your frustration, and I sincerely apologize. This is absolutely not the experience we want you to have. Let me personally make sure this gets resolved right now.'),
      act('24', -300, 720, 'whatsapp_admin', 'VIP Escalation', 'CRITICAL: Angry customer needs immediate attention from management.'),
    ],
    edges: [
      E('e1-2', '1', '2'), E('e2-3', '2', '3', true), E('e2-4', '2', '4', true),
      E('e2-5', '2', '5', true), E('e2-6', '2', '6', true), E('e2-22', '2', '22', true),
      E('e3-7', '3', '7'), E('e7-8', '7', '8'), E('e8-9', '8', '9'),
      E('e9-10', '9', '10', true), E('e9-11', '9', '11', true),
      E('e10-12', '10', '12'), E('e11-13', '11', '13'), E('e13-14', '13', '14'),
      E('e4-15', '4', '15'), E('e15-16', '15', '16'),
      E('e5-17', '5', '17'), E('e17-18', '17', '18'),
      E('e6-19', '6', '19'), E('e19-20', '19', '20'), E('e20-21', '20', '21'),
      E('e22-23', '22', '23'), E('e23-24', '23', '24'), E('e24-13', '24', '13'),
    ],
  },

  debt_collector: {
    name: 'Recovery Specialist',
    nodes: [
      entry('1', 400, 0, 'outbound'),
      resp('2', 350, 140, 'Hello [Name], this is Morgan calling regarding your account with [Business]. I\'m reaching out about an outstanding balance. Do you have a moment to discuss?'),
      // Response branches
      kw('3', 0, 340, 'yes|okay|sure|what balance|how much'),
      kw('4', 350, 340, 'busy|later|not now|call back'),
      kw('5', 700, 340, 'wrong person|not me|wrong number'),
      kw('6', 1050, 340, 'paid|already paid|check cleared'),
      // Balance discussion
      resp('7', 0, 540, 'Your current outstanding balance is [amount], which was due on [date]. We want to help you resolve this today. What would work best for you?'),
      kw('8', -200, 740, 'pay now|pay today|settle|credit card'),
      kw('9', 150, 740, 'can\'t afford|tight|difficult|hardship|struggling'),
      kw('10', 500, 740, 'dispute|disagree|wrong|not mine|error'),
      // Pay now
      act('11', -200, 920, 'knowledge', 'Payment Link', 'Generate secure payment link for immediate settlement.'),
      resp('12', -200, 1100, 'Excellent! I\'m sending a secure payment link to your phone right now. Once processed, your account will be marked as settled immediately.'),
      act('13', -200, 1280, 'whatsapp_admin', 'Payment Received', 'Notify admin of successful payment collection.'),
      // Hardship - payment plan
      resp('14', 150, 920, 'I completely understand. We have flexible options. We can split this into [2/3/6] monthly installments. Which would work best?'),
      act('15', 150, 1100, 'schedule', 'Payment Schedule', 'Set up recurring payment plan with agreed installments.'),
      resp('16', 150, 1280, 'Perfect. Your first payment of [amount] is due on [date]. I\'ll send you a reminder before each payment.'),
      act('17', 150, 1460, 'whatsapp_admin', 'Plan Agreed', 'Log payment plan agreement and notify admin.'),
      // Dispute
      resp('18', 500, 920, 'I take disputes seriously. Can you tell me specifically what doesn\'t look right? I\'ll investigate this immediately.'),
      act('19', 500, 1100, 'knowledge', 'Account Records', 'Pull transaction history and account records for verification.'),
      act('20', 500, 1280, 'whatsapp_admin', 'Dispute Filed', 'Escalate dispute to admin for review with all details.'),
      // Busy
      act('21', 350, 540, 'schedule', 'Schedule Follow-up', 'Book a specific callback time to discuss the balance.'),
      resp('22', 350, 720, 'When would be the best time to reach you? This is time-sensitive, so I want to make sure we connect soon.'),
      // Wrong person
      resp('23', 700, 540, 'I apologize for the confusion. Could you help me verify — is [Name] available at this number, or do you have a better contact?'),
      // Already paid
      resp('24', 1050, 540, 'Thank you for letting me know! Can you share the payment date or reference number so I can verify and update your account?'),
      act('25', 1050, 720, 'knowledge', 'Payment Verification', 'Check payment records against claimed payment.'),
      // Angry/hostile
      rej('26', -200, 340, 'harassing|sue|lawyer|illegal|reported', 'I understand your frustration. We\'re required to reach out about outstanding balances, but I want to work WITH you. Let\'s find a solution that works.'),
    ],
    edges: [
      E('e1-2', '1', '2'), E('e2-3', '2', '3', true), E('e2-4', '2', '4', true),
      E('e2-5', '2', '5', true), E('e2-6', '2', '6', true), E('e2-26', '2', '26', true),
      E('e3-7', '3', '7'), E('e7-8', '7', '8', true), E('e7-9', '7', '9', true),
      E('e7-10', '7', '10', true),
      E('e8-11', '8', '11'), E('e11-12', '11', '12'), E('e12-13', '12', '13'),
      E('e9-14', '9', '14'), E('e14-15', '14', '15'), E('e15-16', '15', '16'), E('e16-17', '16', '17'),
      E('e10-18', '10', '18'), E('e18-19', '18', '19'), E('e19-20', '19', '20'),
      E('e4-21', '4', '21'), E('e21-22', '21', '22'),
      E('e5-23', '5', '23'), E('e6-24', '6', '24'), E('e24-25', '24', '25'),
    ],
  },
};

export type WorkflowTemplateKey = keyof typeof WORKFLOW_TEMPLATES;
