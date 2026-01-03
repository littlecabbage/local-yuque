import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';
import clsx from 'clsx';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentDocContent: string;
  lang: 'zh' | 'en';
}

export const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose, currentDocContent, lang }) => {
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize welcome message when lang changes
  useEffect(() => {
    const welcomeText = lang === 'zh' 
        ? '你好！我是你的 Yueque AI 助手。我可以帮你总结文档、润色内容或回答关于知识库的问题。'
        : 'Hello! I am your Yueque AI assistant. I can help you summarize this document, brainstorm ideas, or answer questions about your knowledge base.';
    
    setMessages([{ id: 'init', role: 'model', text: welcomeText, timestamp: Date.now() }]);
  }, [lang]);

  const t = {
      zh: {
          title: 'AI 助手',
          thinking: '思考中...',
          actions: {
              summarize: '总结文档',
              grammar: '修复语法',
              continue: '续写'
          },
          inputPlaceholder: '给 AI 发送消息...',
          disclaimer: 'AI 生成内容可能不准确，请理性参考。'
      },
      en: {
          title: 'AI Assistant',
          thinking: 'Thinking...',
          actions: {
              summarize: 'Summarize Doc',
              grammar: 'Fix Grammar',
              continue: 'Continue Writing'
          },
          inputPlaceholder: 'Ask AI anything...',
          disclaimer: 'AI can make mistakes. Review generated content.'
      }
  };
  const strings = t[lang];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Mock AI Response
    setTimeout(() => {
        const responseText = lang === 'zh'
            ? `我明白了，你正在写关于 "${currentDocContent.substring(0, 10)}..." 的内容。\n\n针对你的问题 **"${userMsg.text}"**，我的建议是...\n\n(这是一个模拟响应，实际应连接到 Gemini API)`
            : `I see you are writing about "${currentDocContent.substring(0, 20)}...". \n\nHere is a suggestion based on your input: **${userMsg.text}**. \n\n(This is a mock response. Integration with Gemini API would go here.)`;
        
        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsThinking(false);
    }, 1500);
  };

  const QuickAction = ({ text, onClick }: { text: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full hover:border-primary-400 hover:text-primary-600 transition-colors text-gray-600"
    >
        {text}
    </button>
  );

  return (
    <div 
        className={clsx(
            "fixed inset-y-0 right-0 w-96 bg-gray-50 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col z-40",
            isOpen ? "translate-x-0" : "translate-x-full"
        )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-800">
            <Sparkles size={18} className="text-primary-500" />
            <span className="font-semibold">{strings.title}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500">
            <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {messages.map(msg => (
            <div key={msg.id} className={clsx("flex space-x-3", msg.role === 'user' ? "flex-row-reverse space-x-reverse" : "")}>
                <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    msg.role === 'model' ? "bg-primary-100 text-primary-600" : "bg-gray-200 text-gray-600"
                )}>
                    {msg.role === 'model' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={clsx(
                    "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === 'model' ? "bg-white text-gray-800 rounded-tl-none border border-gray-100" : "bg-primary-600 text-white rounded-tr-none"
                )}>
                    {msg.text}
                </div>
            </div>
        ))}
        {isThinking && (
             <div className="flex space-x-3">
                 <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                    <RefreshCw size={14} className="animate-spin" />
                 </div>
                 <div className="text-xs text-gray-400 flex items-center">{strings.thinking}</div>
             </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 bg-gray-50 flex gap-2 flex-wrap">
        <QuickAction 
            text={strings.actions.summarize} 
            onClick={() => setInput(lang === 'zh' ? "帮我总结这份文档。" : "Summarize this document for me.")} 
        />
        <QuickAction 
            text={strings.actions.grammar} 
            onClick={() => setInput(lang === 'zh' ? "检查文档中的语法错误。" : "Check for grammar errors.")} 
        />
        <QuickAction 
            text={strings.actions.continue} 
            onClick={() => setInput(lang === 'zh' ? "帮我续写这段内容。" : "Help me continue writing this.")} 
        />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="relative">
            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={strings.inputPlaceholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-300 resize-none h-12 max-h-32"
            />
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="absolute right-2 top-2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <Send size={14} />
            </button>
        </div>
        <div className="text-center mt-2">
             <span className="text-[10px] text-gray-400">{strings.disclaimer}</span>
        </div>
      </div>
    </div>
  );
};
