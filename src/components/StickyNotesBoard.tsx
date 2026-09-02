import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  StickyNote as StickyNoteIcon,
  Plus,
  Trash2,
  Pin,
  CheckCircle2,
  Clock,
  User,
  Sparkles,
} from 'lucide-react';
import type { StickyNote } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { useToast } from '../context/ToastContext';

interface StickyNotesBoardProps {
  notes: StickyNote[];
  onAddNote: (content: string, author: string, color: StickyNote['color']) => void;
  onToggleResolve: (id: string) => void;
  onDeleteNote: (id: string) => void;
  currentMemberName: string;
}

export const StickyNotesBoard: React.FC<StickyNotesBoardProps> = ({
  notes,
  onAddNote,
  onToggleResolve,
  onDeleteNote,
  currentMemberName,
}) => {
  const { success } = useToast();
  const [newContent, setNewContent] = useState('');
  const [author, setAuthor] = useState(currentMemberName || '媽媽');
  const [selectedColor, setSelectedColor] = useState<StickyNote['color']>('amber');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    onAddNote(newContent.trim(), author.trim() || '照護者', selectedColor);
    success('已貼上新交班叮嚀 📌', newContent.trim().slice(0, 30));
    setNewContent('');
  };

  const colorStyles = {
    amber: 'bg-[#FEF9E7] border-[#F9E79F] text-[#7D6608]',
    rose: 'bg-[#FDEDEC] border-[#FADBD8] text-[#78281F]',
    emerald: 'bg-[#EAFAF1] border-[#D5F5E3] text-[#196F3D]',
    sky: 'bg-[#EBF5FB] border-[#D4E6F1] text-[#1B4F72]',
    purple: 'bg-[#F4ECF7] border-[#E8DAEF] text-[#512E5F]',
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-[#F9F6F0] rounded-[32px] border border-[#D9D1C2] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <StickyNoteIcon className="w-5 h-5 text-amber-700" />
            <h2 className="text-xl font-serif font-bold text-[#2A2723]">
              家庭照護交班便利貼
            </h2>
          </div>
          <p className="text-xs text-[#6B6457] mt-1 font-sans">
            即時同步給爸爸、媽媽、月嫂或長輩的叮嚀事項（冷藏奶時間、用藥提醒、特別狀況）
          </p>
        </div>
      </div>

      {/* Add New Note Box */}
      <form
        onSubmit={handleAdd}
        className="bg-[#F9F6F0] rounded-[28px] border border-[#D9D1C2] p-5 shadow-xs space-y-3"
      >
        <textarea
          rows={2}
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="寫下交班叮嚀...（例如：冷藏母乳已放第一層、下午 4 點量體溫）"
          className="w-full bg-white rounded-2xl border border-[#D9D1C2] p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2723]"
        />

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#8C8475] font-sans">交班者:</span>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-white border border-[#D9D1C2] px-3 py-1 rounded-xl text-xs font-sans focus:outline-none"
              placeholder="您的稱呼"
            />
            
            {/* Color choices */}
            <div className="flex items-center space-x-1.5 ml-2">
              {(['amber', 'rose', 'emerald', 'sky', 'purple'] as StickyNote['color'][]).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                    c === 'amber'
                      ? 'bg-amber-300'
                      : c === 'rose'
                      ? 'bg-rose-300'
                      : c === 'emerald'
                      ? 'bg-emerald-300'
                      : c === 'sky'
                      ? 'bg-sky-300'
                      : 'bg-purple-300'
                  } ${selectedColor === c ? 'ring-2 ring-[#2A2723] scale-110' : 'hover:scale-105'}`}
                />
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#2A2723] text-[#F9F6F0] text-xs font-sans font-medium hover:bg-[#4A453E] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>貼上便箋</span>
          </motion.button>
        </div>
      </form>

      {/* Sticky Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full bg-[#F9F6F0] rounded-[28px] border border-[#D9D1C2] p-12 text-center text-[#8C8475] font-sans shadow-xs"
            >
              <StickyNoteIcon className="w-10 h-10 mx-auto mb-2 text-[#D1CEC4]" />
              <p className="text-sm font-semibold text-[#2A2723]">目前沒有交班便箋</p>
              <p className="text-xs text-[#8C8475] mt-1">在上方輸入內容即可即時同步到所有家庭成員手機與電腦</p>
            </motion.div>
          ) : (
            notes.map((note) => {
              const colorClass = colorStyles[note.color || 'amber'];
              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
                  transition={{ type: 'spring', damping: 26, stiffness: 350 }}
                  className={`p-5 rounded-[24px] border shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3.5 transition-shadow relative group ${colorClass} ${
                    note.isResolved ? 'opacity-55 line-through saturate-50' : ''
                  }`}
                >
                  {/* Visual Pin Icon */}
                  <div className="absolute -top-2 left-6 text-red-500 transform -rotate-12 opacity-80 group-hover:scale-110 transition-transform">
                    <Pin className="w-4 h-4 fill-red-500 text-red-700" />
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/5">
                        <User className="w-3 h-3" />
                        {note.author}
                      </span>
                      <span className="text-[10px] opacity-70 font-mono">
                        {formatDateTime(note.createdAt).slice(5)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap font-medium">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-black/10">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggleResolve(note.id)}
                      className="text-xs flex items-center gap-1 font-medium opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{note.isResolved ? '重啟待辦' : '完成交接'}</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 opacity-50 hover:opacity-100 hover:text-red-700 transition-colors cursor-pointer"
                      title="刪除便箋"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
