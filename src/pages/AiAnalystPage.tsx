import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.ts';
import { 
  Sparkles, 
  Send, 
  Coffee, 
  Trash2, 
  RefreshCw, 
  Database,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AiAnalystPageProps {
  onOpenDemoModal?: () => void;
  onRefreshAnalytics?: () => void;
}

// Simple, robust markdown renderer for AI responses
const FormattedMessage: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Section header (e.g. ### Header or **Header:**)
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className="font-bold text-sm text-[#241812] pt-1 pb-0.5 font-display">
              {headerText}
            </h4>
          );
        }

        // Bullet point (e.g. • or - or * )
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const bulletContent = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6F4E37] shrink-0 mt-1.5" />
              <span>{renderInlineFormatting(bulletContent)}</span>
            </div>
          );
        }

        return <p key={idx}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
};

function renderInlineFormatting(text: string): React.ReactNode {
  // Split on **bold** text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-[#241812]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const AiAnalystPage: React.FC<AiAnalystPageProps> = ({ onOpenDemoModal, onRefreshAnalytics }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What was my revenue and net profit this month?",
    "Which product generated the highest profit?",
    "Which products are underperforming or have low stock?",
    "What are my biggest expenses and where can I save?",
    "What should I promote next week to maximize margin?",
    "Give me an executive business health check of my café.",
  ];

  const handleInstantSeed = async () => {
    try {
      setSeeding(true);
      await api.demo.seed();
      onRefreshAnalytics?.();
      await fetchHistory();
      handleSendMessage("Which product gave me the highest profit margin?");
    } catch (err) {
      console.error('Failed to load starter records:', err);
    } finally {
      setSeeding(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setInitialLoading(true);
      const history = await api.ai.getHistory();
      setMessages(history);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    setInputMessage('');
    const optimisticUserMsg = {
      id: Date.now(),
      role: 'user',
      message: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setLoading(true);

    try {
      const response = await api.ai.sendMessage(query);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          message: response.message,
          createdAt: response.createdAt || new Date().toISOString(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          message: `Error retrieving analysis: ${err.message || 'Unable to connect to AI Analyst service.'}`,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all conversation history with Brewlytics AI Analyst?')) {
      return;
    }
    try {
      await api.ai.clearHistory();
      setMessages([]);
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-[#FFFCF7] border border-[#EADBCE] rounded-3xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-[#241812] text-white flex items-center justify-between border-b border-[#38261c]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6F4E37] text-white flex items-center justify-center shadow-md shadow-[#6F4E37]/30">
            <Sparkles className="w-5 h-5 text-[#7A9E65]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-display text-white">
                Brewlytics AI Business Analyst
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#7A9E65]/20 text-[#7A9E65] border border-[#7A9E65]/30">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-[#9B8778]">
              Reasoning strictly grounded in your PostgreSQL café data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDemoModal && (
            <button
              onClick={onOpenDemoModal}
              className="px-3 py-1.5 bg-[#38261c] hover:bg-[#4d3527] text-[#e0cfbe] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dataset</span>
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-2 text-[#9B8778] hover:text-red-400 hover:bg-[#38261c] rounded-xl transition-colors"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full text-xs text-[#9B8778]">
            Loading conversation history...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto space-y-4 p-6">
            <div className="w-14 h-14 rounded-3xl bg-[#6F4E37]/10 text-[#6F4E37] flex items-center justify-center">
              <Coffee className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-[#241812]">
                Hello {user?.name ? user.name.split(' ')[0] : 'Café Partner'}
              </h3>
              <p className="text-xs text-[#9B8778] mt-1 leading-relaxed">
                I am your specialized coffee business intelligence partner. I examine your actual sales receipts, recipe costs, and operational expenses in PostgreSQL to answer business questions.
              </p>
            </div>

            {/* Starter dataset quick card */}
            <div className="w-full p-3 bg-linear-to-r from-[#FAF3EA] to-[#F3E8DB] border border-[#E0D2C0] rounded-2xl flex items-center justify-between gap-3 text-left shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">☕</span>
                <div>
                  <p className="text-xs font-bold text-[#241812]">Need sample café data to explore?</p>
                  <p className="text-[11px] text-[#6F4E37]">Load 15 specialty orders, recipe margins & expenses</p>
                </div>
              </div>
              <button
                onClick={handleInstantSeed}
                disabled={seeding}
                className="px-3.5 py-1.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
              >
                {seeding ? 'Loading...' : 'Load & Test'}
              </button>
            </div>

            {/* Clickable suggested prompts */}
            <div className="w-full space-y-2 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9B8778] text-left">
                Suggested questions to ask:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="p-3 bg-[#F7F1E8] hover:bg-[#EADBCE] border border-[#EADBCE] rounded-2xl text-xs font-semibold text-[#241812] transition-colors leading-snug"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#6F4E37] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Coffee className="w-4 h-4 text-[#FFFCF7]" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-3xl p-4 text-xs leading-relaxed space-y-2 shadow-xs ${
                    isUser
                      ? 'bg-[#241812] text-white rounded-tr-xs'
                      : 'bg-[#F7F1E8] text-[#241812] border border-[#EADBCE] rounded-tl-xs'
                  }`}
                >
                  <FormattedMessage content={msg.message} isUser={isUser} />
                  {!isUser && msg.message && msg.message.toLowerCase().includes("don't have enough") && (
                    <div className="pt-2">
                      <button
                        onClick={handleInstantSeed}
                        disabled={seeding}
                        className="px-3.5 py-1.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <span>⚡</span>
                        <span>{seeding ? 'Loading Starter Café...' : 'Load Starter Café & Analyze Now'}</span>
                      </button>
                    </div>
                  )}
                  <div
                    className={`text-[9px] pt-1 flex justify-end ${
                      isUser ? 'text-[#9B8778]' : 'text-[#9B8778]'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#241812] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-[#6F4E37] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-4 h-4 animate-spin text-[#7A9E65]" />
            </div>
            <div className="bg-[#F7F1E8] border border-[#EADBCE] rounded-3xl rounded-tl-xs p-4 text-xs text-[#6F4E37] flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-[#6F4E37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-[#6F4E37] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-[#6F4E37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="font-semibold text-[11px]">Computing SQL database aggregates & reasoning with Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Pills Bar if messages exist */}
      {messages.length > 0 && (
        <div className="px-6 py-2 bg-[#F7F1E8]/60 border-t border-[#EADBCE] overflow-x-auto flex gap-2 shrink-0">
          {suggestedQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={loading}
              className="px-3 py-1 bg-white hover:bg-[#EADBCE] border border-[#EADBCE] rounded-full text-[11px] font-semibold text-[#6F4E37] whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-4 bg-[#FFFCF7] border-t border-[#EADBCE]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            placeholder="Ask about revenue trends, product margins, low stock, or expense anomalies..."
            className="flex-1 px-4 py-3 bg-[#F7F1E8] border border-[#EADBCE] rounded-2xl text-xs text-[#241812] placeholder-[#9B8778] focus:outline-hidden focus:border-[#6F4E37] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-3 bg-[#241812] hover:bg-[#38261c] text-[#FFFCF7] rounded-2xl transition-all shadow-sm disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-[#9B8778] mt-2">
          Brewlytics AI will never invent numbers. Answers are strictly calculated from your café's database records.
        </p>
      </div>
    </div>
  );
};
