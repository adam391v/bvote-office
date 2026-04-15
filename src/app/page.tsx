import Link from "next/link";
import {
  Target,
  MessageSquare,
  Star,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Users,
  Zap,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="glass fixed top-0 left-0 right-0 z-50 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="gradient-bg w-9 h-9 rounded-lg flex items-center justify-center">
            <Target size={20} color="white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Bvote</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="btn btn-ghost">
            Đăng nhập
          </Link>
          <Link href="/register" className="btn btn-primary">
            Bắt đầu miễn phí
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 text-center relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)]" />

        <div className="animate-fade-in max-w-[800px] mx-auto px-8 relative">
          <div className="badge badge-primary mb-6 py-2 px-4 text-[0.8125rem]">
            <Zap size={14} />
            Continuous Performance Management
          </div>
          <h1 className="text-[3.5rem] font-extrabold leading-[1.1] tracking-tight mb-6">
            Quản lý hiệu suất
            <br />
            <span className="gradient-text">liên tục &amp; thông minh</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-[560px] mx-auto mb-10 leading-relaxed">
            Thiết lập mục tiêu, check-in 1:1 hàng tuần, phản hồi 360° và
            gamification. Biến quản lý hiệu suất thành thói quen tạo đột phá.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="btn btn-primary btn-lg">
              Tạo tài khoản miễn phí
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Đã có tài khoản
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-8 max-w-[1200px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 tracking-tight">
            Tính năng nổi bật
          </h2>
          <p className="text-[var(--text-secondary)] text-[1.0625rem]">
            Tất cả công cụ bạn cần để xây dựng đội ngũ hiệu suất cao
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Target size={28} />,
              title: "Quản lý Mục tiêu",
              desc: "Tạo, liên kết và theo dõi mục tiêu OKR theo chu kỳ. Minh bạch toàn tổ chức.",
              color: "var(--color-primary)",
            },
            {
              icon: <MessageSquare size={28} />,
              title: "Check-in 1:1",
              desc: "Họp định kỳ với 4 câu hỏi vàng: Tiến độ, Rủi ro, Nguyên nhân, Giải pháp.",
              color: "var(--color-secondary)",
            },
            {
              icon: <Users size={28} />,
              title: "Phản hồi 360°",
              desc: "Gửi & nhận phản hồi đa chiều. Rating sao và nhận xét chi tiết từ đồng nghiệp.",
              color: "var(--color-success)",
            },
            {
              icon: <Star size={28} />,
              title: "Gamification",
              desc: "Tích sao qua hoạt động, đổi quà hấp dẫn. Tạo động lực và thói quen tốt.",
              color: "var(--color-accent)",
            },
            {
              icon: <BarChart3 size={28} />,
              title: "Dashboard Thông minh",
              desc: "Bảng điều khiển trực quan: tỉ lệ hoàn thành, xu hướng và cảnh báo kịp thời.",
              color: "var(--color-info)",
            },
            {
              icon: <CheckCircle2 size={28} />,
              title: "Tự động nhắc nhở",
              desc: "Email & thông báo tự động khi đến hạn check-in hoặc có phản hồi mới.",
              color: "var(--color-danger)",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className={`card animate-fade-in stagger-${i + 1} opacity-0`}
            >
              <div
                className="w-[52px] h-[52px] rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: `${feature.color}15`,
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>
              <h3 className="font-semibold text-[1.0625rem] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-8 text-center">
        <div className="card-static max-w-[700px] mx-auto p-12 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">
            Sẵn sàng nâng tầm hiệu suất?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
            Bắt đầu miễn phí ngay hôm nay. Không cần thẻ tín dụng.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Tạo tài khoản miễn phí
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-8 text-center border-t border-[var(--border-color)] text-[var(--text-muted)] text-[0.8125rem]">
        <p>© 2026 Bvote. Quản lý Hiệu suất Liên tục.</p>
      </footer>
    </div>
  );
}
