import { Button } from '@/components/ui/button';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

const topics = [
  {
    title: 'UPI & Payments',
    description: 'Payments, UPI and digital banking',
  },
  {
    title: 'Credit Score',
    description: 'Understand and improve your score',
  },
  {
    title: 'Loans & EMI',
    description: 'Loans, interest and EMI calculations',
  },
];

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="min-h-screen bg-[#f7f8f4] text-[#17201a]">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#176b45] text-lg font-semibold text-white">
            ₹
          </div>

          <div>
            <div className="text-lg font-semibold tracking-tight">FinSaathi</div>
            <div className="text-xs text-[#68736c]">Financial Assistant</div>
          </div>
        </div>

        <div className="rounded-full border border-[#dce2dc] bg-white px-4 py-2 text-xs font-medium text-[#4d5a52]">
          English · हिंदी · Hinglish
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-5xl flex-col items-center px-6 pt-12 pb-16 md:px-10 md:pt-16">
        <div className="w-full max-w-3xl text-center">
          <p className="text-sm font-medium text-[#176b45]">Simple financial guidance</p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            What can I help you with?
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#68736c] md:text-lg">
            Talk naturally about your money, banking and financial decisions.
          </p>
        </div>

        {/* Topic cards */}
        <div className="mt-12 grid w-full max-w-3xl gap-3 md:grid-cols-3">
          {topics.map((topic) => (
            <div
              key={topic.title}
              className="rounded-2xl border border-[#dde3dd] bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-8 flex size-9 items-center justify-center rounded-lg bg-[#edf5ef] text-[#176b45]">
                ✓
              </div>

              <h2 className="font-medium">{topic.title}</h2>

              <p className="mt-2 text-sm leading-5 text-[#758078]">{topic.description}</p>
            </div>
          ))}
        </div>

        {/* Voice CTA */}
        <div className="mt-10 flex flex-col items-center">
          <Button
            size="lg"
            onClick={onStartCall}
            className="h-14 w-64 rounded-full bg-[#176b45] text-sm font-semibold text-white shadow-sm hover:bg-[#125b3b]"
          >
            {startButtonText}
          </Button>

          <p className="mt-4 text-xs text-[#7a847d]">Ask a question and start a conversation</p>
        </div>

        {/* Trust / product statement */}
        <div className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#7a847d]">
          <span>Voice-first</span>
          <span>•</span>
          <span>Simple explanations</span>
          <span>•</span>
          <span>Financial safety focused</span>
        </div>
      </main>
    </div>
  );
};
