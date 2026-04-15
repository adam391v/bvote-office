"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Textarea } from "@/components/ui";
import { createFeedbackRequestAction, sendFeedbackAction } from "@/actions/feedback-actions";
import ReactSelect from "react-select";
import {
  MessageCircle,
  Send,
  Star,
  X,
  Clock,
  CheckCircle2,
  User,
} from "lucide-react";

// ===== TYPES =====
interface FeedbackUser {
  id: number;
  name: string;
  avatar?: string | null;
}

interface FeedbackItem {
  id: number;
  fromUser: FeedbackUser;
  toUser: FeedbackUser;
  performanceRate?: number | null;
  effortRate?: number | null;
  criteria?: string | null;
  criteriaStars?: number | null;
  rating?: number | null;
  comments: string;
  category: string;
  createdAt: string;
}

interface FeedbackRequestItem {
  id: number;
  fromUser: FeedbackUser;
  category: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  recipients?: any[];
}

interface GoalItem {
  id: number;
  title: string;
  metric: string;
  targetValue: number;
  unit: string;
  period: string;
  cycleValue?: string | null;
  owner: { id: number; name: string };
}

interface Props {
  feedbackHistory: { received: FeedbackItem[]; sent: FeedbackItem[] } | null;
  feedbackRequests: {
    requestsSent: FeedbackRequestItem[];
    requestsReceived: (FeedbackRequestItem & { recipients: { hasReplied: boolean }[] })[];
  } | null;
  users: { id: number; name: string; email: string }[];
  goals: GoalItem[];
  currentUserId: number;
}

// ===== HELPERS =====
const categories = [
  { value: "GOAL", label: "Mục tiêu", color: "var(--color-info)" },
  { value: "CULTURE", label: "Văn hóa", color: "var(--color-success)" },
  { value: "PROJECT", label: "Dự án", color: "var(--color-warning)" },
  { value: "WORK", label: "Công việc", color: "var(--color-primary)" },
] as const;

const performanceOptions = [
  { label: "Rất tốt", stars: 10, color: "var(--color-success)" },
  { label: "Tốt", stars: 5, color: "#34d399" },
  { label: "Bình thường", stars: 3, color: "var(--color-warning)" },
  { label: "Không tốt", stars: 0, color: "#f97316" },
  { label: "Thực sự chưa tốt", stars: 0, color: "var(--color-danger)" },
];

const effortOptions = [
  { label: "Rất nỗ lực", stars: 10, color: "var(--color-success)" },
  { label: "Nỗ lực", stars: 5, color: "#34d399" },
  { label: "Bình thường", stars: 3, color: "var(--color-warning)" },
  { label: "Chưa nỗ lực", stars: 0, color: "#f97316" },
  { label: "Rất không nỗ lực", stars: 0, color: "var(--color-danger)" },
];

const criteriaOptions = [
  { label: "Bạn đã làm rất tốt", defaultStars: 10 },
  { label: "Bạn là người cam kết", defaultStars: 10 },
  { label: "Bạn rất sáng tạo", defaultStars: 10 },
  { label: "Bạn là người chủ động", defaultStars: 10 },
  { label: "Bạn rất đúng hẹn", defaultStars: 10 },
  { label: "Cảm ơn bạn đã lắng nghe", defaultStars: 5 },
  { label: "Cảm ơn bạn đã hỗ trợ", defaultStars: 5 },
  { label: "Bạn có tinh thần đồng đội cao", defaultStars: 10 },
  { label: "Bạn giao tiếp rất tốt", defaultStars: 10 },
  { label: "Bạn luôn tìm cách cải thiện", defaultStars: 10 },
  { label: "Bạn rất có trách nhiệm", defaultStars: 10 },
  { label: "Bạn có khả năng lãnh đạo tốt", defaultStars: 10 },
  { label: "Bạn làm việc rất chỉn chu", defaultStars: 5 },
  { label: "Bạn cần cố gắng thêm", defaultStars: 3 },
];

const criteriaSelectOptions = criteriaOptions.map(c => ({
  value: c.label,
  label: `${c.label}  (${c.defaultStars} ⭐)`,
  defaultStars: c.defaultStars,
}));

const starsSelectOptions = [0, 1, 2, 3, 5, 10].map(v => ({ value: v, label: `${v} ⭐` }));

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function StarDisplay({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-[var(--color-accent)] font-bold">
      <Star size={14} fill="#f59e0b" color="#f59e0b" />
      {count}
    </span>
  );
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    backgroundColor: "var(--bg-input)",
    borderColor: "var(--border-color)",
    minHeight: 42,
  }),
  menu: (base: any) => ({ ...base, backgroundColor: "var(--bg-card)", zIndex: 100 }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "var(--bg-card-hover)" : "transparent",
    color: "var(--text-primary)",
  }),
  multiValue: (base: any) => ({ ...base, backgroundColor: "rgba(5, 190, 117, 0.12)", borderRadius: 4 }),
  multiValueLabel: (base: any) => ({ ...base, color: "var(--color-primary-light)", fontSize: "0.8125rem", fontWeight: 500 }),
};

// ===== TAB BUTTON =====
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-transparent border-none cursor-pointer font-[inherit] py-2 px-4 rounded-lg text-[0.8125rem] transition-colors duration-150 ${
        active
          ? "font-semibold text-[var(--color-primary)] bg-primary/[0.08]"
          : "font-normal text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]"
      }`}
    >
      {children}
    </button>
  );
}

// ===== RATING BUTTON =====
function RatingButton({
  label,
  stars,
  color,
  selected,
  onClick,
}: {
  label: string;
  stars: number;
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-[0.8125rem] cursor-pointer transition-all duration-150"
      style={{
        border: `1.5px solid ${selected ? color : "var(--border-color)"}`,
        background: selected ? `${color}18` : "transparent",
        color: selected ? color : "var(--text-secondary)",
        fontWeight: selected ? 600 : 400,
      }}
    >
      {label}
      <span className="inline-flex items-center gap-0.5 opacity-80">
        {stars} <Star size={11} fill="#f59e0b" color="#f59e0b" />
      </span>
    </button>
  );
}

// ===== CATEGORY BUTTON =====
function CategoryButton({
  category,
  currentCategory,
  onClick,
}: {
  category: (typeof categories)[number];
  currentCategory: string;
  onClick: () => void;
}) {
  const isActive = currentCategory === category.value;
  return (
    <button
      type="button"
      onClick={onClick}
      className="py-2 px-4 rounded-lg text-[0.8125rem] cursor-pointer transition-all duration-150"
      style={{
        border: `1.5px solid ${isActive ? category.color : "var(--border-color)"}`,
        background: isActive ? `${category.color}15` : "transparent",
        color: isActive ? category.color : "var(--text-secondary)",
        fontWeight: isActive ? 600 : 400,
      }}
    >
      {category.label}
    </button>
  );
}

// ==================== MAIN COMPONENT ====================

export default function FeedbackPageClient({
  feedbackHistory,
  feedbackRequests,
  users,
  goals,
  currentUserId,
}: Props) {
  const router = useRouter();

  // Tab states
  const [mainTab, setMainTab] = useState<"history" | "requests">("history");
  const [historyTab, setHistoryTab] = useState<"received" | "sent">("received");
  const [requestTab, setRequestTab] = useState<"received" | "sent">("received");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState<FeedbackRequestItem | null>(null);

  const received = feedbackHistory?.received || [];
  const sent = feedbackHistory?.sent || [];
  const reqSent = feedbackRequests?.requestsSent || [];
  const reqReceived = feedbackRequests?.requestsReceived || [];

  const pendingCount = reqReceived.filter(r => r.recipients?.[0] && !r.recipients[0].hasReplied).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">Phản hồi 360°</h1>
          <p className="page-subtitle">Nhận và gửi phản hồi để cải thiện hiệu suất</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowDirectModal(true)} icon={<MessageCircle size={18} />}>
            Tạo phản hồi
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)} icon={<Send size={18} />}>
            Tạo yêu cầu phản hồi
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMainTab("history")}
          className={`btn ${mainTab === "history" ? "btn-primary" : "btn-secondary"}`}
        >
          <MessageCircle size={16} /> Lịch sử phản hồi
        </button>
        <button
          onClick={() => setMainTab("requests")}
          className={`btn ${mainTab === "requests" ? "btn-primary" : "btn-secondary"} relative`}
        >
          <Send size={16} /> Lịch sử yêu cầu
          {pendingCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[var(--color-danger)] text-white rounded-full w-5 h-5 flex items-center justify-center text-[0.6875rem] font-bold">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ===== TAB: LỊCH SỬ PHẢN HỒI ===== */}
      {mainTab === "history" && (
        <div className="card-static animate-fade-in">
          <div className="flex gap-4 mb-6 border-b border-[var(--border-color)] pb-3">
            <TabButton active={historyTab === "received"} onClick={() => setHistoryTab("received")}>
              📥 Phản hồi nhận được ({received.length})
            </TabButton>
            <TabButton active={historyTab === "sent"} onClick={() => setHistoryTab("sent")}>
              📤 Phản hồi gửi đi ({sent.length})
            </TabButton>
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-4">
            {(historyTab === "received" ? received : sent).length === 0 ? (
              <div className="empty-state !p-12">
                <MessageCircle size={40} />
                <p className="mt-3">Chưa có phản hồi nào</p>
              </div>
            ) : (
              (historyTab === "received" ? received : sent).map((fb) => (
                <FeedbackBubble key={fb.id} fb={fb} isSent={historyTab === "sent"} />
              ))
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: LỊCH SỬ YÊU CẦU ===== */}
      {mainTab === "requests" && (
        <div className="card-static animate-fade-in">
          <div className="flex gap-4 mb-6 border-b border-[var(--border-color)] pb-3">
            <TabButton active={requestTab === "received"} onClick={() => setRequestTab("received")}>
              📩 Yêu cầu nhận được
              {pendingCount > 0 && (
                <span className="badge badge-danger ml-2 text-[0.6875rem]">{pendingCount}</span>
              )}
            </TabButton>
            <TabButton active={requestTab === "sent"} onClick={() => setRequestTab("sent")}>
              📨 Yêu cầu gửi đi ({reqSent.length})
            </TabButton>
          </div>

          <div className="flex flex-col gap-4">
            {requestTab === "received" ? (
              reqReceived.length === 0 ? (
                <div className="empty-state !p-12">
                  <Send size={40} />
                  <p className="mt-3">Không có yêu cầu nào</p>
                </div>
              ) : (
                reqReceived.map((req) => {
                  const hasReplied = req.recipients?.[0]?.hasReplied;
                  return (
                    <div
                      key={req.id}
                      className={`p-5 rounded-xl border ${
                        hasReplied
                          ? "border-[var(--border-color)] bg-transparent"
                          : "border-red-500/30 bg-red-500/[0.03]"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {req.fromUser.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-sm">{req.fromUser.name}</span>
                            <span className="text-xs text-[var(--text-muted)] ml-2">{timeAgo(req.createdAt)}</span>
                          </div>
                        </div>
                        {hasReplied ? (
                          <span className="badge badge-success flex items-center gap-1">
                            <CheckCircle2 size={12} /> Đã phản hồi
                          </span>
                        ) : (
                          <span className="badge badge-danger flex items-center gap-1">
                            <Clock size={12} /> Chờ phản hồi
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold mb-1">
                        Yêu cầu phản hồi {categories.find(c => c.value === req.category)?.label}
                      </p>
                      <p className="text-[0.8125rem] text-[var(--text-muted)] mb-1">
                        {req.subject}
                      </p>
                      <p className="text-[0.8125rem] text-[var(--text-secondary)] p-3 bg-[var(--bg-card-hover)] rounded-lg mt-2">
                        &quot;{req.message}&quot;
                      </p>
                      {!hasReplied && (
                        <button
                          className="btn btn-primary mt-3"
                          onClick={() => setShowReplyModal(req)}
                        >
                          <MessageCircle size={16} /> Phản hồi
                        </button>
                      )}
                    </div>
                  );
                })
              )
            ) : (
              reqSent.length === 0 ? (
                <div className="empty-state !p-12">
                  <Send size={40} />
                  <p className="mt-3">Chưa gửi yêu cầu nào</p>
                </div>
              ) : (
                reqSent.map((req) => {
                  const repliedCount = req.recipients?.filter((r: any) => r.hasReplied).length || 0;
                  const totalCount = req.recipients?.length || 0;
                  return (
                    <div key={req.id} className="p-5 rounded-xl border border-[var(--border-color)]">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-[var(--text-muted)]">{timeAgo(req.createdAt)}</span>
                        <span className={`badge ${req.status === "COMPLETED" ? "badge-success" : "badge-warning"}`}>
                          {req.status === "COMPLETED" ? "Hoàn thành" : `${repliedCount}/${totalCount} đã trả lời`}
                        </span>
                      </div>
                      <p className="font-semibold text-sm mb-1">{req.subject}</p>
                      <p className="text-[0.8125rem] text-[var(--text-muted)]">&quot;{req.message}&quot;</p>
                      <div className="flex gap-1.5 flex-wrap mt-3">
                        {req.recipients?.map((r: any) => (
                          <span key={r.user.id} className={`badge flex items-center gap-1 ${r.hasReplied ? "badge-success" : ""}`}>
                            <User size={10} />
                            {r.user.name}
                            {r.hasReplied && <CheckCircle2 size={10} />}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      )}

      {/* ===== MODAL: TẠO YÊU CẦU PHẢN HỒI ===== */}
      {showCreateModal && (
        <CreateFeedbackRequestModal
          users={users}
          goals={goals}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); router.refresh(); }}
        />
      )}

      {/* ===== MODAL: GỬI PHẢN HỒI TRỰC TIẾP ===== */}
      {showDirectModal && (
        <DirectFeedbackModal
          users={users}
          goals={goals}
          onClose={() => setShowDirectModal(false)}
          onSuccess={() => { setShowDirectModal(false); router.refresh(); }}
        />
      )}

      {/* ===== MODAL: GỬI PHẢN HỒI (Reply) ===== */}
      {showReplyModal && (
        <SendFeedbackModal
          request={showReplyModal}
          onClose={() => setShowReplyModal(null)}
          onSuccess={() => { setShowReplyModal(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

// ==================== SUB-COMPONENTS ====================

function FeedbackBubble({ fb, isSent }: { fb: FeedbackItem; isSent: boolean }) {
  const personName = isSent ? fb.toUser.name : fb.fromUser.name;
  const totalStars = (fb.rating || 0);

  return (
    <div className={`flex gap-3 ${isSent ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-white text-[0.8125rem] font-semibold ${
          isSent ? "bg-[var(--color-secondary)]" : "bg-[var(--color-primary)]"
        }`}
      >
        {personName.charAt(0)}
      </div>
      <div
        className={`max-w-[70%] p-4 rounded-xl ${
          isSent
            ? "bg-primary/[0.08] border border-primary/15"
            : "bg-[var(--bg-card-hover)] border border-[var(--border-color)]"
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[var(--text-muted)]">{timeAgo(fb.createdAt)}</span>
          {totalStars > 0 && <StarDisplay count={totalStars} />}
        </div>
        <p className="text-sm leading-relaxed text-[var(--text-primary)]">
          {fb.comments}
        </p>
        {(fb.performanceRate !== null || fb.effortRate !== null) && (
          <div className="flex gap-3 mt-3 text-xs text-[var(--text-muted)]">
            {fb.performanceRate !== null && <span>Hiệu suất: ⭐{fb.performanceRate}</span>}
            {fb.effortRate !== null && <span>Nỗ lực: ⭐{fb.effortRate}</span>}
          </div>
        )}
        {fb.criteria && (
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            Tiêu chí: {fb.criteria} {fb.criteriaStars ? `⭐${fb.criteriaStars}` : ""}
          </p>
        )}
        <div className={`mt-2 ${isSent ? "text-left" : "text-right"}`}>
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            — {personName}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL: TẠO YÊU CẦU PHẢN HỒI ====================

function CreateFeedbackRequestModal({
  users,
  goals,
  onClose,
  onSuccess,
}: {
  users: { id: number; name: string; email: string }[];
  goals: GoalItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [category, setCategory] = useState<"GOAL" | "CULTURE" | "PROJECT" | "WORK">("WORK");
  const [subject, setSubject] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [recipientIds, setRecipientIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goalOptions = goals.map(g => ({
    value: g.id,
    label: `${g.cycleValue || g.period} | ${g.title} (${g.owner.name})`,
  }));

  const userOptions = users.map((u) => ({ value: u.id, label: u.name }));

  const handleSubmit = async () => {
    const finalSubject = category === "GOAL" && selectedGoalId
      ? goals.find(g => g.id === selectedGoalId)?.title || subject
      : subject;
    if (!finalSubject.trim() || recipientIds.length === 0 || !message.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await createFeedbackRequestAction({
      category,
      subject: finalSubject,
      message,
      recipientIds,
      goalId: category === "GOAL" ? (selectedGoalId || undefined) : undefined,
    });
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-[var(--bg-card)] rounded-xl w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-bold">Tạo yêu cầu phản hồi</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={20} /></button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Loại phản hồi */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-2">Bạn muốn yêu cầu phản hồi về cái gì? *</label>
            <div className="flex gap-2">
              {categories.map((c) => (
                <CategoryButton key={c.value} category={c} currentCategory={category} onClick={() => setCategory(c.value as any)} />
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-1.5">
              {category === "GOAL" ? "Chọn mục tiêu *" : "Chọn hoặc nhập mô tả công việc *"}
            </label>
            {category === "GOAL" ? (
              <ReactSelect
                options={goalOptions}
                placeholder="-- Chọn mục tiêu cần phản hồi --"
                onChange={(opt) => {
                  setSelectedGoalId(opt?.value || null);
                  setSubject(opt?.label || "");
                }}
                styles={selectStyles}
                isClearable
              />
            ) : (
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={category === "PROJECT" ? "Ví dụ: Dự án AI Chatbot..." : category === "CULTURE" ? "Ví dụ: Văn hóa làm việc nhóm..." : "Ví dụ: In ấn sách, Viết báo cáo..."}
                className="form-input"
              />
            )}
          </div>

          {/* Chọn người */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-1.5">Chọn người yêu cầu phản hồi *</label>
            <ReactSelect
              isMulti
              options={userOptions}
              placeholder="-- Chọn người phản hồi --"
              onChange={(opts) => setRecipientIds(opts.map((o) => o.value))}
              styles={selectStyles}
            />
          </div>

          {/* Lời nhắn */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-1.5">Lời nhắn *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Mọi người phản hồi cho em với, em làm việc này đã tốt chưa..."
              className="form-input resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end">
          <Button variant="primary" onClick={handleSubmit} loading={loading} icon={<Send size={16} />}>
            Gửi yêu cầu
          </Button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL: GỬI PHẢN HỒI ====================

function SendFeedbackModal({
  request,
  onClose,
  onSuccess,
}: {
  request: FeedbackRequestItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [performanceRate, setPerformanceRate] = useState<number | null>(null);
  const [effortRate, setEffortRate] = useState<number | null>(null);
  const [criteria, setCriteria] = useState("");
  const [criteriaStars, setCriteriaStars] = useState(10);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (performanceRate === null || effortRate === null || !comments.trim()) {
      setError("Vui lòng đánh giá hiệu suất, nỗ lực và nhập lời nhắn.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await sendFeedbackAction({
      toUserId: request.fromUser.id,
      requestId: request.id,
      performanceRate,
      effortRate,
      criteria: criteria || undefined,
      criteriaStars: criteria ? criteriaStars : undefined,
      comments,
      category: request.category as any,
    });
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-[var(--bg-card)] rounded-xl w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-bold">Gửi phản hồi</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={20} /></button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Context info */}
          <div className="p-4 bg-emerald-500/[0.06] rounded-lg border border-emerald-500/20">
            <p className="text-sm text-[var(--color-success)]">
              <strong>{request.fromUser.name}</strong> đã yêu cầu phản hồi, hãy phản hồi cho họ.
            </p>
            <p className="text-[0.8125rem] text-[var(--text-muted)] mt-1.5">
              {request.subject}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Đánh giá hiệu suất */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-2">Đánh giá hiệu suất *</label>
            <div className="flex gap-1.5 flex-wrap">
              {performanceOptions.map((opt) => (
                <RatingButton
                  key={opt.label}
                  label={opt.label}
                  stars={opt.stars}
                  color={opt.color}
                  selected={performanceRate === opt.stars}
                  onClick={() => setPerformanceRate(opt.stars)}
                />
              ))}
            </div>
          </div>

          {/* Đánh giá nỗ lực */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-2">Đánh giá nỗ lực *</label>
            <div className="flex gap-1.5 flex-wrap">
              {effortOptions.map((opt) => (
                <RatingButton
                  key={opt.label}
                  label={opt.label}
                  stars={opt.stars}
                  color={opt.color}
                  selected={effortRate === opt.stars}
                  onClick={() => setEffortRate(opt.stars)}
                />
              ))}
            </div>
          </div>

          {/* Tiêu chí phản hồi */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-1.5">Tiêu chí phản hồi</label>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <ReactSelect
                  options={criteriaSelectOptions}
                  placeholder="-- Chọn tiêu chí --"
                  value={criteriaSelectOptions.find(c => c.value === criteria) || null}
                  onChange={(opt) => {
                    setCriteria(opt?.value || "");
                    if (opt) setCriteriaStars(opt.defaultStars);
                  }}
                  styles={selectStyles}
                  isClearable
                />
              </div>
              <div className="min-w-[100px]">
                <ReactSelect
                  options={starsSelectOptions}
                  value={starsSelectOptions.find(s => s.value === criteriaStars)}
                  onChange={(opt) => setCriteriaStars(opt?.value ?? 10)}
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>

          {/* Lời nhắn */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-1.5">Lời nhắn *</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Anh nghĩ em đã thực hiện rất tốt cam kết của mình..."
              className="form-input resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end">
          <Button variant="primary" onClick={handleSubmit} loading={loading} icon={<Send size={16} />}>
            Gửi phản hồi
          </Button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL: GỬI PHẢN HỒI TRỰC TIẾP ====================

function DirectFeedbackModal({
  users,
  goals,
  onClose,
  onSuccess,
}: {
  users: { id: number; name: string; email: string }[];
  goals: GoalItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [category, setCategory] = useState<"GOAL" | "CULTURE" | "PROJECT" | "WORK">("GOAL");
  const [toUserId, setToUserId] = useState<number | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [performanceRate, setPerformanceRate] = useState<number | null>(null);
  const [effortRate, setEffortRate] = useState<number | null>(null);
  const [criteria, setCriteria] = useState("");
  const [criteriaStars, setCriteriaStars] = useState(10);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userOptions = users.map(u => ({ value: u.id, label: u.name }));
  const goalOptions = goals.map(g => ({
    value: g.id,
    label: `${g.cycleValue || g.period} | ${g.title} (${g.owner.name})`,
  }));

  const handleSubmit = async () => {
    if (!toUserId || performanceRate === null || effortRate === null || !comments.trim()) {
      setError("Vui lòng chọn người nhận, đánh giá và nhập lời nhắn.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await sendFeedbackAction({
      toUserId,
      performanceRate,
      effortRate,
      criteria: criteria || undefined,
      criteriaStars: criteria ? criteriaStars : undefined,
      comments,
      category,
    });
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-[var(--bg-card)] rounded-xl w-[620px] max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-bold">Tạo phản hồi</h2>
          <button onClick={onClose} className="btn btn-ghost btn-icon"><X size={20} /></button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Chọn người nhận */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-1.5">Gửi phản hồi đến *</label>
            <ReactSelect
              options={userOptions}
              placeholder="-- Chọn người nhận phản hồi --"
              onChange={(opt) => setToUserId(opt?.value || null)}
              styles={selectStyles}
              isClearable
            />
          </div>

          {/* Loại phản hồi */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-2">Phản hồi về *</label>
            <div className="flex gap-2">
              {categories.map((c) => (
                <CategoryButton key={c.value} category={c} currentCategory={category} onClick={() => setCategory(c.value as any)} />
              ))}
            </div>
          </div>

          {/* Subject */}
          {category === "GOAL" ? (
            <div>
              <label className="block text-[0.8125rem] font-semibold mb-1.5">Chọn mục tiêu</label>
              <ReactSelect
                options={goalOptions}
                placeholder="-- Chọn mục tiêu liên quan --"
                onChange={(opt) => {
                  setSelectedGoalId(opt?.value || null);
                  setSubject(opt?.label || "");
                }}
                styles={selectStyles}
                isClearable
              />
            </div>
          ) : (
            <div>
              <label className="block text-[0.8125rem] font-semibold mb-1.5">Mô tả</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={category === "PROJECT" ? "Ví dụ: Dự án AI Chatbot..." : category === "CULTURE" ? "Ví dụ: Văn hóa làm việc nhóm..." : "Ví dụ: Báo cáo tuần..."}
                className="form-input"
              />
            </div>
          )}

          {/* Đánh giá hiệu suất */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-2">Đánh giá hiệu suất *</label>
            <div className="flex gap-1.5 flex-wrap">
              {performanceOptions.map((opt) => (
                <RatingButton
                  key={opt.label}
                  label={opt.label}
                  stars={opt.stars}
                  color={opt.color}
                  selected={performanceRate === opt.stars}
                  onClick={() => setPerformanceRate(opt.stars)}
                />
              ))}
            </div>
          </div>

          {/* Đánh giá nỗ lực */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-2">Đánh giá nỗ lực *</label>
            <div className="flex gap-1.5 flex-wrap">
              {effortOptions.map((opt) => (
                <RatingButton
                  key={opt.label}
                  label={opt.label}
                  stars={opt.stars}
                  color={opt.color}
                  selected={effortRate === opt.stars}
                  onClick={() => setEffortRate(opt.stars)}
                />
              ))}
            </div>
          </div>

          {/* Tiêu chí */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-1.5">Tiêu chí phản hồi</label>
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <ReactSelect
                  options={criteriaSelectOptions}
                  placeholder="-- Chọn tiêu chí --"
                  value={criteriaSelectOptions.find(c => c.value === criteria) || null}
                  onChange={(opt) => {
                    setCriteria(opt?.value || "");
                    if (opt) setCriteriaStars(opt.defaultStars);
                  }}
                  styles={selectStyles}
                  isClearable
                />
              </div>
              <div className="min-w-[100px]">
                <ReactSelect
                  options={starsSelectOptions}
                  value={starsSelectOptions.find(s => s.value === criteriaStars)}
                  onChange={(opt) => setCriteriaStars(opt?.value ?? 10)}
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>

          {/* Lời nhắn */}
          <div>
            <label className="block text-[0.8125rem] font-semibold mb-1.5">Lời nhắn *</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder="Anh nghĩ em đã thực hiện rất tốt cam kết của mình..."
              className="form-input resize-y"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end">
          <Button variant="primary" onClick={handleSubmit} loading={loading} icon={<Send size={16} />}>
            Gửi phản hồi
          </Button>
        </div>
      </div>
    </div>
  );
}
