'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Package, Plus, Menu, X, Send, Image, Film, Layout, Code, Wand2, Play, RefreshCw, GitCompare, Trash2, Pencil, Check, Clock, BarChart3, Network, PieChart } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useChatStore } from '@/lib/store/chat-store';
import { formatDate } from '@/lib/utils';

const P5Canvas = dynamic(() => import('@/components/p5/P5Canvas'), { ssr: false });
const D3Canvas = dynamic(() => import('@/components/d3/D3Canvas'), { ssr: false });
const CodeDiff = dynamic(() => import('@/components/p5/CodeDiff'), { ssr: false });

// Types
type RendererType = 'p5' | 'd3';

interface Artifact {
  id: string;
  chatId: string;
  chatTitle: string;
  code: string;
  renderer: RendererType;
  createdAt: Date;
}

// Helper function to extract code and detect renderer from AI response
const extractCode = (content: string): { code: string; renderer: RendererType } | null => {
  const codeBlockRegex = /```(?:javascript|js)\n([\s\S]*?)```/;
  const match = content.match(codeBlockRegex);
  if (!match) return null;

  const code = match[1].trim();
  // Detect renderer from comment on first line
  if (code.startsWith('// renderer: d3')) {
    return { code, renderer: 'd3' };
  }
  return { code, renderer: 'p5' };
};

// Helper to load artifacts from localStorage
const loadArtifacts = (): Artifact[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('genesis-artifacts');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) }));
    }
  } catch {}
  return [];
};

const saveArtifacts = (artifacts: Artifact[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('genesis-artifacts', JSON.stringify(artifacts));
};

const GenesisApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [messages, setMessages] = useState<{ type: string; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('preview');
  const [p5Code, setP5Code] = useState<string>('');
  const [editableCode, setEditableCode] = useState<string>('');
  const [activeRenderer, setActiveRenderer] = useState<RendererType>('p5');
  const [isLoading, setIsLoading] = useState(false);
  const [showArtifact, setShowArtifact] = useState(false);
  const [previousCode, setPreviousCode] = useState<string>('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [hydrated, setHydrated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zustand store
  const chatStore = useChatStore();

  // Hydration guard + seed dummy data on first load
  useEffect(() => {
    setHydrated(true);
    setArtifacts(loadArtifacts());

    // Seed dummy chats if store is empty
    if (chatStore.chats.length === 0) {
      const dummyChats = [
        {
          title: 'Bouncing Ball Animation',
          userMsg: 'Create a bouncing ball animation',
          aiMsg: 'Here\'s a bouncing ball animation!\n\n```javascript\nlet x, y, xSpeed, ySpeed;\n\nfunction setup() {\n  createCanvas(400, 400);\n  x = 200; y = 200;\n  xSpeed = 3; ySpeed = 2;\n}\n\nfunction draw() {\n  background(30, 30, 50);\n  x += xSpeed; y += ySpeed;\n  if (x > width - 20 || x < 20) xSpeed *= -1;\n  if (y > height - 20 || y < 20) ySpeed *= -1;\n  fill(255, 100, 150);\n  noStroke();\n  ellipse(x, y, 40, 40);\n}\n```',
          code: 'let x, y, xSpeed, ySpeed;\n\nfunction setup() {\n  createCanvas(400, 400);\n  x = 200; y = 200;\n  xSpeed = 3; ySpeed = 2;\n}\n\nfunction draw() {\n  background(30, 30, 50);\n  x += xSpeed; y += ySpeed;\n  if (x > width - 20 || x < 20) xSpeed *= -1;\n  if (y > height - 20 || y < 20) ySpeed *= -1;\n  fill(255, 100, 150);\n  noStroke();\n  ellipse(x, y, 40, 40);\n}',
          ago: 2 * 60 * 60 * 1000,
        },
        {
          title: 'Particle System',
          userMsg: 'Create a particle system with colorful particles',
          aiMsg: 'Here\'s a particle system!\n\n```javascript\nlet particles = [];\n\nfunction setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20, 20, 40, 25);\n  particles.push({x: mouseX, y: mouseY, vx: random(-2,2), vy: random(-2,2), life: 255, col: [random(255), random(255), random(255)]});\n  for (let i = particles.length - 1; i >= 0; i--) {\n    let p = particles[i];\n    p.x += p.vx; p.y += p.vy; p.life -= 3;\n    fill(p.col[0], p.col[1], p.col[2], p.life);\n    noStroke();\n    ellipse(p.x, p.y, 8);\n    if (p.life <= 0) particles.splice(i, 1);\n  }\n}\n```',
          code: 'let particles = [];\n\nfunction setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(20, 20, 40, 25);\n  particles.push({x: mouseX, y: mouseY, vx: random(-2,2), vy: random(-2,2), life: 255, col: [random(255), random(255), random(255)]});\n  for (let i = particles.length - 1; i >= 0; i--) {\n    let p = particles[i];\n    p.x += p.vx; p.y += p.vy; p.life -= 3;\n    fill(p.col[0], p.col[1], p.col[2], p.life);\n    noStroke();\n    ellipse(p.x, p.y, 8);\n    if (p.life <= 0) particles.splice(i, 1);\n  }\n}',
          ago: 24 * 60 * 60 * 1000,
        },
        {
          title: 'Fractal Tree',
          userMsg: 'Create a fractal tree',
          aiMsg: 'Here\'s a fractal tree!\n\n```javascript\nlet angle;\n\nfunction setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  angle = map(mouseX, 0, width, 0, PI/3);\n  stroke(255);\n  translate(200, height);\n  branch(100);\n}\n\nfunction branch(len) {\n  strokeWeight(map(len, 0, 100, 1, 4));\n  stroke(map(len, 0, 100, 100, 255), 200, 100);\n  line(0, 0, 0, -len);\n  translate(0, -len);\n  if (len > 4) {\n    push(); rotate(angle); branch(len * 0.67); pop();\n    push(); rotate(-angle); branch(len * 0.67); pop();\n  }\n}\n```',
          code: 'let angle;\n\nfunction setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(30);\n  angle = map(mouseX, 0, width, 0, PI/3);\n  stroke(255);\n  translate(200, height);\n  branch(100);\n}\n\nfunction branch(len) {\n  strokeWeight(map(len, 0, 100, 1, 4));\n  stroke(map(len, 0, 100, 100, 255), 200, 100);\n  line(0, 0, 0, -len);\n  translate(0, -len);\n  if (len > 4) {\n    push(); rotate(angle); branch(len * 0.67); pop();\n    push(); rotate(-angle); branch(len * 0.67); pop();\n  }\n}',
          ago: 2 * 24 * 60 * 60 * 1000,
        },
        {
          title: 'Wave Pattern',
          userMsg: 'Create a wave pattern animation',
          aiMsg: 'Here\'s a wave pattern!\n\n```javascript\nfunction setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(10, 10, 30);\n  noFill();\n  for (let j = 0; j < 10; j++) {\n    stroke(100 + j * 15, 100, 255 - j * 20, 180);\n    strokeWeight(2);\n    beginShape();\n    for (let x = 0; x < width; x += 5) {\n      let y = 200 + sin(x * 0.02 + frameCount * 0.03 + j * 0.5) * (40 + j * 8);\n      vertex(x, y);\n    }\n    endShape();\n  }\n}\n```',
          code: 'function setup() {\n  createCanvas(400, 400);\n}\n\nfunction draw() {\n  background(10, 10, 30);\n  noFill();\n  for (let j = 0; j < 10; j++) {\n    stroke(100 + j * 15, 100, 255 - j * 20, 180);\n    strokeWeight(2);\n    beginShape();\n    for (let x = 0; x < width; x += 5) {\n      let y = 200 + sin(x * 0.02 + frameCount * 0.03 + j * 0.5) * (40 + j * 8);\n      vertex(x, y);\n    }\n    endShape();\n  }\n}',
          ago: 3 * 24 * 60 * 60 * 1000,
        },
        {
          title: 'Color Gradient',
          userMsg: 'Create a dynamic color gradient',
          aiMsg: 'Here\'s a color gradient!\n\n```javascript\nfunction setup() {\n  createCanvas(400, 400);\n  noStroke();\n}\n\nfunction draw() {\n  for (let y = 0; y < height; y++) {\n    let r = map(sin(y * 0.01 + frameCount * 0.02), -1, 1, 50, 255);\n    let g = map(cos(y * 0.015 + frameCount * 0.01), -1, 1, 50, 200);\n    let b = map(sin(y * 0.02 + frameCount * 0.03), -1, 1, 100, 255);\n    stroke(r, g, b);\n    line(0, y, width, y);\n  }\n}\n```',
          code: 'function setup() {\n  createCanvas(400, 400);\n  noStroke();\n}\n\nfunction draw() {\n  for (let y = 0; y < height; y++) {\n    let r = map(sin(y * 0.01 + frameCount * 0.02), -1, 1, 50, 255);\n    let g = map(cos(y * 0.015 + frameCount * 0.01), -1, 1, 50, 200);\n    let b = map(sin(y * 0.02 + frameCount * 0.03), -1, 1, 100, 255);\n    stroke(r, g, b);\n    line(0, y, width, y);\n  }\n}',
          ago: 7 * 24 * 60 * 60 * 1000,
        },
        {
          title: 'Monthly Sales Chart',
          userMsg: 'Create a bar chart showing monthly sales data using D3.js',
          aiMsg: 'Here\'s a bar chart with D3.js!\n\n```javascript\n// renderer: d3\nconst data = [\n  { month: \"Jan\", sales: 65 }, { month: \"Feb\", sales: 59 },\n  { month: \"Mar\", sales: 80 }, { month: \"Apr\", sales: 81 },\n  { month: \"May\", sales: 56 }, { month: \"Jun\", sales: 95 },\n];\nconst margin = { top: 40, right: 30, bottom: 50, left: 60 };\nconst width = window.innerWidth - margin.left - margin.right;\nconst height = window.innerHeight - margin.top - margin.bottom;\nconst svg = d3.select(\"#chart\").append(\"svg\").attr(\"width\", width + margin.left + margin.right).attr(\"height\", height + margin.top + margin.bottom).append(\"g\").attr(\"transform\", `translate(${margin.left},${margin.top})`);\nconst x = d3.scaleBand().domain(data.map(d => d.month)).range([0, width]).padding(0.3);\nconst y = d3.scaleLinear().domain([0, d3.max(data, d => d.sales)]).nice().range([height, 0]);\nsvg.append(\"g\").attr(\"transform\", `translate(0,${height})`).call(d3.axisBottom(x)).selectAll(\"text\").style(\"fill\", \"#ccc\");\nsvg.append(\"g\").call(d3.axisLeft(y)).selectAll(\"text\").style(\"fill\", \"#ccc\");\nconst color = d3.scaleOrdinal(d3.schemeTableau10);\nsvg.selectAll(\".bar\").data(data).enter().append(\"rect\").attr(\"x\", d => x(d.month)).attr(\"width\", x.bandwidth()).attr(\"y\", height).attr(\"height\", 0).attr(\"fill\", (d, i) => color(i)).attr(\"rx\", 4).transition().duration(800).delay((d, i) => i * 100).attr(\"y\", d => y(d.sales)).attr(\"height\", d => height - y(d.sales));\nsvg.append(\"text\").attr(\"x\", width / 2).attr(\"y\", -10).attr(\"text-anchor\", \"middle\").style(\"fill\", \"#eee\").style(\"font-size\", \"16px\").text(\"Monthly Sales 2025\");\n```',
          code: '// renderer: d3\nconst data = [\n  { month: "Jan", sales: 65 }, { month: "Feb", sales: 59 },\n  { month: "Mar", sales: 80 }, { month: "Apr", sales: 81 },\n  { month: "May", sales: 56 }, { month: "Jun", sales: 95 },\n];\nconst margin = { top: 40, right: 30, bottom: 50, left: 60 };\nconst width = window.innerWidth - margin.left - margin.right;\nconst height = window.innerHeight - margin.top - margin.bottom;\nconst svg = d3.select("#chart").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", `translate(${margin.left},${margin.top})`);\nconst x = d3.scaleBand().domain(data.map(d => d.month)).range([0, width]).padding(0.3);\nconst y = d3.scaleLinear().domain([0, d3.max(data, d => d.sales)]).nice().range([height, 0]);\nsvg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x)).selectAll("text").style("fill", "#ccc");\nsvg.append("g").call(d3.axisLeft(y)).selectAll("text").style("fill", "#ccc");\nconst color = d3.scaleOrdinal(d3.schemeTableau10);\nsvg.selectAll(".bar").data(data).enter().append("rect").attr("x", d => x(d.month)).attr("width", x.bandwidth()).attr("y", height).attr("height", 0).attr("fill", (d, i) => color(i)).attr("rx", 4).transition().duration(800).delay((d, i) => i * 100).attr("y", d => y(d.sales)).attr("height", d => height - y(d.sales));\nsvg.append("text").attr("x", width / 2).attr("y", -10).attr("text-anchor", "middle").style("fill", "#eee").style("font-size", "16px").text("Monthly Sales 2025");',
          ago: 5 * 24 * 60 * 60 * 1000,
        },
      ];

      const dummyArtifacts: Artifact[] = [];

      dummyChats.forEach((dc) => {
        const chatId = chatStore.createChat(dc.title);
        chatStore.addMessage(chatId, { role: 'user', content: dc.userMsg, tokens: Math.ceil(dc.userMsg.length / 4) });
        chatStore.addMessage(chatId, { role: 'assistant', content: dc.aiMsg, tokens: Math.ceil(dc.aiMsg.length / 4) });

        // Detect renderer from code
        const renderer: RendererType = dc.code.startsWith('// renderer: d3') ? 'd3' : 'p5';

        dummyArtifacts.push({
          id: Date.now().toString() + chatId,
          chatId,
          chatTitle: dc.title,
          code: dc.code,
          renderer,
          createdAt: new Date(Date.now() - dc.ago),
        });
      });

      setArtifacts(dummyArtifacts);
      saveArtifacts(dummyArtifacts);
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const creationTools = [
    // p5.js templates
    { name: 'Canvas', icon: Layout, prompt: 'Create a colorful animated canvas' },
    { name: 'Animation', icon: Film, prompt: 'Create a smooth animation' },
    { name: 'Art', icon: Image, prompt: 'Create generative art' },
    { name: 'Game', icon: Play, prompt: 'Create a simple interactive game' },
    { name: 'Pattern', icon: Code, prompt: 'Create a mesmerizing pattern' },
    // D3.js templates
    { name: 'Bar Chart', icon: BarChart3, prompt: 'Create an interactive bar chart with sample sales data using D3.js' },
    { name: 'Network', icon: Network, prompt: 'Create a force-directed network graph using D3.js' },
    { name: 'Pie Chart', icon: PieChart, prompt: 'Create an animated pie chart with sample data using D3.js' },
  ];

  const addArtifact = (chatId: string, chatTitle: string, code: string, renderer: RendererType = 'p5') => {
    const newArtifact: Artifact = {
      id: Date.now().toString(),
      chatId,
      chatTitle,
      code,
      renderer,
      createdAt: new Date(),
    };
    const updated = [newArtifact, ...artifacts];
    setArtifacts(updated);
    saveArtifacts(updated);
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const messageToSend = customPrompt || inputMessage;
    if (!messageToSend.trim()) return;

    const userMessage = messageToSend;
    const newMessages = [...messages, { type: 'user', content: userMessage }];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);
    setCurrentView('chat');
    setShowArtifact(true);

    // Create chat in store if this is a new conversation
    let chatId = activeChatId;
    if (!chatId) {
      const title = userMessage.length > 40 ? userMessage.substring(0, 40) + '...' : userMessage;
      chatId = chatStore.createChat(title);
      setActiveChatId(chatId);
    }

    // Save user message to store
    chatStore.addMessage(chatId, {
      role: 'user',
      content: userMessage,
      tokens: Math.ceil(userMessage.length / 4),
    });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content,
          })),
          model: 'gemini-3-flash',
          currentCode: editableCode || '',
        }),
      });

      const data = await response.json();

      if (data.error) {
        const errContent = `Error: ${data.error}`;
        setMessages(prev => [...prev, { type: 'ai', content: errContent }]);
        chatStore.addMessage(chatId, { role: 'assistant', content: errContent, tokens: 10 });
      } else {
        const aiContent = data.message?.content || 'No response received';
        setMessages(prev => [...prev, { type: 'ai', content: aiContent }]);
        chatStore.addMessage(chatId, {
          role: 'assistant',
          content: aiContent,
          tokens: Math.ceil(aiContent.length / 4),
        });

        const extracted = extractCode(aiContent);
        if (extracted) {
          if (p5Code) setPreviousCode(p5Code);
          setP5Code(extracted.code);
          setEditableCode(extracted.code);
          setActiveRenderer(extracted.renderer);
          setActiveTab('preview');

          // Save as artifact
          const chat = chatStore.chats.find(c => c.id === chatId);
          addArtifact(chatId, chat?.title || 'Untitled', extracted.code, extracted.renderer);
        }
      }
    } catch {
      const errMsg = 'Failed to connect to AI service. Please try again.';
      setMessages(prev => [...prev, { type: 'ai', content: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCode = () => {
    setP5Code(editableCode);
    setActiveTab('preview');
  };

  const startNewChat = () => {
    setCurrentView('home');
    setActiveChatId(null);
    setMessages([]);
    setP5Code('');
    setEditableCode('');
    setPreviousCode('');
    setShowArtifact(false);
  };

  const selectChat = (chatId: string) => {
    const chat = chatStore.chats.find(c => c.id === chatId);
    if (!chat) return;

    setActiveChatId(chatId);
    setCurrentView('chat');

    // Rebuild messages from store
    const loadedMessages = chat.messages.map(msg => ({
      type: msg.role === 'user' ? 'user' : 'ai',
      content: msg.content,
    }));
    setMessages(loadedMessages);

    // Find last code and detect renderer
    let lastCode = '';
    let prevCode = '';
    let detectedRenderer: RendererType = 'p5';
    for (const msg of chat.messages) {
      if (msg.role === 'assistant') {
        const extracted = extractCode(msg.content);
        if (extracted) {
          prevCode = lastCode;
          lastCode = extracted.code;
          detectedRenderer = extracted.renderer;
        }
      }
    }

    if (lastCode) {
      setP5Code(lastCode);
      setEditableCode(lastCode);
      setPreviousCode(prevCode);
      setActiveRenderer(detectedRenderer);
      setShowArtifact(true);
    } else {
      setP5Code('');
      setEditableCode('');
      setPreviousCode('');
      setShowArtifact(true);
    }
  };

  const deleteChat = (chatId: string) => {
    chatStore.deleteChat(chatId);
    // Remove related artifacts
    const updated = artifacts.filter(a => a.chatId !== chatId);
    setArtifacts(updated);
    saveArtifacts(updated);

    if (activeChatId === chatId) {
      startNewChat();
    }
  };

  const startRename = (chatId: string, currentTitle: string) => {
    setRenamingChatId(chatId);
    setRenameValue(currentTitle);
  };

  const confirmRename = () => {
    if (renamingChatId && renameValue.trim()) {
      chatStore.renameChat(renamingChatId, renameValue.trim());
      setRenamingChatId(null);
      setRenameValue('');
    }
  };

  const loadArtifactCode = (artifact: Artifact) => {
    setP5Code(artifact.code);
    setEditableCode(artifact.code);
    setActiveRenderer(artifact.renderer || 'p5');
    setShowArtifact(true);
    setCurrentView('chat');
    setActiveTab('preview');
  };

  const openGallery = () => {
    setCurrentView('gallery');
    setShowArtifact(false);
  };

  const deleteArtifact = (artifactId: string) => {
    const updated = artifacts.filter(a => a.id !== artifactId);
    setArtifacts(updated);
    saveArtifacts(updated);
  };

  const sortedChats = hydrated
    ? [...chatStore.chats].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : [];

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0`}>
        <div className="p-4 w-64 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                G
              </div>
              <span className="font-semibold text-lg">Genesis</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-2 mb-4">
            <button
              onClick={startNewChat}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
            >
              <Plus size={20} />
              <span>New Creation</span>
            </button>
            <div
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700"
            >
              <MessageSquare size={20} />
              <span>Chat History</span>
              {hydrated && sortedChats.length > 0 && (
                <span className="ml-auto text-xs bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded-full">{sortedChats.length}</span>
              )}
            </div>
            <button
              onClick={openGallery}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === 'gallery' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-200'}`}
            >
              <Package size={20} />
              <span>Artifacts</span>
              {artifacts.length > 0 && (
                <span className="ml-auto text-xs bg-gray-300 text-gray-700 px-1.5 py-0.5 rounded-full">{artifacts.length}</span>
              )}
            </button>
          </div>

          {/* Sidebar Content - Always show chat history */}
          <div className="border-t border-gray-200 pt-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-xs font-semibold text-gray-500 mb-2 px-3 flex items-center gap-1">
              <Clock size={12} /> RECENT CREATIONS
            </h3>
            <div className="space-y-1 overflow-y-auto flex-1">
              {!hydrated ? (
                <div className="text-sm text-gray-400 px-3 py-2">Loading...</div>
              ) : sortedChats.length === 0 ? (
                <div className="text-sm text-gray-400 px-3 py-6 text-center">
                  <MessageSquare size={24} className="mx-auto mb-2 opacity-40" />
                  <p>No chats yet</p>
                  <p className="text-xs mt-1">Start a new creation!</p>
                </div>
              ) : (
                sortedChats.map(chat => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-1 px-2 py-2 rounded-lg transition-colors cursor-pointer ${activeChatId === chat.id && currentView === 'chat' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  >
                    {renamingChatId === chat.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && confirmRename()}
                          className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black"
                          autoFocus
                        />
                        <button onClick={confirmRename} className="p-1 hover:bg-gray-300 rounded">
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0" onClick={() => selectChat(chat.id)}>
                          <div className="text-sm font-medium truncate">{chat.title}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(chat.updatedAt)} · {chat.messages.length} msgs
                          </div>
                        </div>
                        <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); startRename(chat.id, chat.title); }}
                            className="p-1 hover:bg-gray-300 rounded text-gray-500"
                            title="Rename"
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                            className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Powered by Gemini 3 Flash</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Chat Area */}
          <div className={`flex-1 flex flex-col min-w-0 ${showArtifact ? 'w-1/2' : 'w-full'}`}>
            {currentView === 'home' ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl mb-6">
                  G
                </div>
                <h1 className="text-4xl font-bold mb-4">Welcome to Genesis</h1>
                <p className="text-gray-600 mb-8 text-center max-w-md">Create stunning visual content with AI. Describe what you want, and watch it come to life in real-time.</p>

                <div className="w-full max-w-2xl">
                  <div className="relative mb-6">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Describe what you want to create..."
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      className="absolute right-2 top-2 p-2 bg-black text-white rounded-lg hover:bg-gray-800"
                    >
                      <Wand2 size={20} />
                    </button>
                  </div>

                  <div className="text-center mb-4">
                    <span className="text-sm text-gray-500">Quick start with these templates:</span>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {creationTools.map((tool, index) => {
                      const Icon = tool.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(tool.prompt)}
                          className="flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-black hover:bg-gray-50 transition-all"
                        >
                          <Icon size={24} className="text-gray-700" />
                          <span className="text-sm">{tool.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : currentView === 'gallery' ? (
              /* Artifacts Gallery View */
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Package size={28} />
                        Artifacts Gallery
                      </h1>
                      <p className="text-gray-500 mt-1">{artifacts.length} creation{artifacts.length !== 1 ? 's' : ''} saved</p>
                    </div>
                  </div>

                  {artifacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <Package size={64} className="text-gray-300 mb-4" />
                      <h2 className="text-xl font-semibold text-gray-400 mb-2">No artifacts yet</h2>
                      <p className="text-gray-400">Start creating with AI and your p5.js / D3.js creations will appear here</p>
                      <button onClick={startNewChat} className="mt-6 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <Plus size={18} /> New Creation
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {artifacts.map(artifact => (
                        <div
                          key={artifact.id}
                          className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer"
                          onClick={() => loadArtifactCode(artifact)}
                        >
                          {/* Live Preview */}
                          <div className="aspect-square bg-gray-900 relative overflow-hidden">
                            {(artifact.renderer || 'p5') === 'd3'
                              ? <D3Canvas code={artifact.code} width={300} height={300} />
                              : <P5Canvas code={artifact.code} width={300} height={300} />
                            }
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                <button
                                  onClick={(e) => { e.stopPropagation(); loadArtifactCode(artifact); }}
                                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 flex items-center gap-1"
                                >
                                  <Play size={14} /> Open
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteArtifact(artifact.id); }}
                                  className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                          {/* Card info */}
                          <div className="p-4">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate flex-1">{artifact.chatTitle}</h3>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${(artifact.renderer || 'p5') === 'd3' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                                {(artifact.renderer || 'p5') === 'd3' ? 'D3.js' : 'p5.js'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(artifact.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Start creating</h2>
                        <p className="text-gray-600">Describe what you want to visualize</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-3xl mx-auto">
                      {messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 rounded-xl ${msg.type === 'user'
                              ? 'bg-black text-white'
                              : 'bg-gray-100 text-gray-900'
                              }`}
                          >
                            <div className="whitespace-pre-wrap">
                              {msg.type === 'ai' ? (
                                msg.content.replace(/```(?:javascript|js)\n[\s\S]*?```/g, '[Code generated - see preview panel →]')
                              ) : (
                                msg.content
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 p-4 rounded-xl">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                              <span className="ml-2 text-gray-600">Creating...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 p-4 flex-shrink-0">
                  <div className="max-w-3xl mx-auto flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                      placeholder="Describe what you want to create..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={isLoading}
                      className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Artifact Preview Panel */}
          {showArtifact && (
            <div className="w-1/2 border-l border-gray-200 flex flex-col bg-gray-50">
              <div className="border-b border-gray-200 p-4 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-6 h-6 rounded flex items-center justify-center ${activeRenderer === 'd3' ? 'bg-orange-500' : 'bg-black'}`}>
                    <Code size={14} className="text-white" />
                  </div>
                  <h3 className="font-semibold">{activeRenderer === 'd3' ? 'D3.js Visualization' : 'Canvas Artifact'}</h3>
                  {p5Code && (
                    <button
                      onClick={handleRunCode}
                      className="ml-auto flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <Play size={14} />
                      Run
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'preview' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('code')}
                    className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'code' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    Code
                  </button>
                  <button
                    onClick={() => setActiveTab('diff')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${activeTab === 'diff' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <GitCompare size={16} />
                    Diff
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4">
                {activeTab === 'preview' && (
                  <div className="h-full">
                    {p5Code && activeRenderer === 'd3' ? (
                      <D3Canvas code={p5Code} width={400} height={400} />
                    ) : p5Code ? (
                      <P5Canvas code={p5Code} width={400} height={400} />
                    ) : (
                      <div className="bg-gray-200 h-full flex items-center justify-center rounded-lg">
                        <div className="text-center text-gray-500">
                          <Wand2 size={48} className="mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-semibold">No preview yet</p>
                          <p className="text-sm">Ask AI to create something visual!</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'code' && (
                  <div className="h-full flex flex-col">
                    <textarea
                      value={editableCode}
                      onChange={(e) => setEditableCode(e.target.value)}
                      placeholder="// p5.js code will appear here..."
                      className="flex-1 w-full bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-600"
                      spellCheck={false}
                    />
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={handleRunCode}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <RefreshCw size={16} />
                        Update Preview
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'diff' && (
                  <div className="h-full">
                    <CodeDiff oldCode={previousCode} newCode={p5Code} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenesisApp;
