import React, { useState } from 'react';
import { aiAssistantService } from '../../services/api';
import { Sparkles, Send, Bot, User, X, MessageSquare, AlertCircle } from 'lucide-react';

interface AIAssistantDrawerProps {
  campaignId?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  source?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ campaignId, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your Life Share Turnout Intelligence Assistant. Ask me about expected turnout, slot bottlenecks, waitlist promotions, or campaign summaries.',
      source: 'ollama_qwen'
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    'How many donors are expected to attend?',
    'Summarize this campaign mobilisation status.',
    'How many waitlisted donors can fill available slots?',
    'What happened after the last cancellation?'
  ];

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const data = await aiAssistantService.queryAssistant(prompt, campaignId);
      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: data.reply,
        source: data.source
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'I could not reach the intelligence engine right now. Please verify backend connectivity.',
          source: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-600 text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">AI Campaign Assistant</h3>
            <p className="text-[10px] text-slate-400">Turnout & Mobilisation Intelligence</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-1.5">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-[10px] font-medium bg-white hover:bg-brand-50 hover:text-brand-700 text-slate-600 border border-slate-200 px-2 py-1 rounded-full transition-colors text-left disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
              m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-brand-100 text-brand-700'
            }`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
              m.sender === 'user'
                ? 'bg-brand-600 text-white font-medium rounded-tr-none'
                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60 leading-relaxed'
            }`}>
              <p className="whitespace-pre-line">{m.text}</p>
              {m.source && (
                <span className="block mt-1 text-[9px] opacity-60 font-mono">
                  Engine: {m.source}
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-spin" />
            <span>Analyzing turnout data & generating response...</span>
          </div>
        )}
      </div>

      {/* Non-medical boundary tag */}
      <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        Life Share AI answers campaign logistics and expected turnout. No medical advice provided.
      </div>

      {/* Chat Input */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI about campaign turnout..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading || !inputPrompt.trim()}
            className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
