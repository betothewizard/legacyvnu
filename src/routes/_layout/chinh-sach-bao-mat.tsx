import { createFileRoute } from "@tanstack/react-router";
import { styles } from "~/src/styles";

export const Route = createFileRoute("/_layout/chinh-sach-bao-mat")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className={`${styles.paddingX} ${styles.flexCenter} ${styles.paddingY}`}>
      <div className={`${styles.boxWidth} space-y-6`}>

        <div className="space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl">Điều khoản &amp; Chính sách bảo mật</h1>
          <p className="text-sm text-muted-foreground">Cập nhật lần cuối: Ngày 1 tháng 1, 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">1. Giới thiệu</h2>
          <p className="text-muted-foreground leading-relaxed">
            Chào mừng bạn đến với LegacyVNU! Chúng tôi là nền tảng chia sẻ tài liệu học tập miễn phí dành riêng cho sinh viên Đại học Quốc gia Hà Nội, tập hợp đề cương, giáo trình, đề thi và tài liệu ôn tập từ nhiều trường thành viên — tất cả ở một nơi. Bằng việc truy cập và sử dụng website, bạn mặc nhiên đồng ý với toàn bộ các điều khoản được nêu dưới đây.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            LegacyVNU không yêu cầu đăng ký tài khoản. Mọi nội dung đều do cộng đồng đóng góp, chỉ mang tính tham khảo và không đại diện cho quan điểm của bất kỳ tổ chức hay cá nhân nào.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">2. Thông tin chúng tôi thu thập</h2>
          <p className="text-muted-foreground leading-relaxed">
            LegacyVNU không yêu cầu đăng ký tài khoản và không thu thập thông tin định danh cá nhân. Chúng tôi có thể thu thập các thông tin kỹ thuật tối thiểu sau:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Dữ liệu truy cập ẩn danh (trang đã xem, thời gian, thiết bị) qua PostHog Analytics</li>
            <li>Địa chỉ IP tạm thời để bảo vệ hệ thống khỏi spam và lạm dụng khi bạn đóng góp tài liệu — dữ liệu này được xóa định kỳ và không liên kết với nội dung bạn gửi</li>
            <li>Thông tin liên hệ bạn tự nguyện cung cấp qua form đóng góp</li>
            <li>File tài liệu bạn tải lên qua tính năng đóng góp</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">3. Mục đích sử dụng dữ liệu</h2>
          <p className="text-muted-foreground leading-relaxed">
            Thông tin thu thập được sử dụng để:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Cải thiện trải nghiệm người dùng và hiệu năng trang web</li>
            <li>Bảo vệ hệ thống khỏi spam, lạm dụng và các hành vi vi phạm</li>
            <li>Xem xét và đưa tài liệu đóng góp vào kho lưu trữ</li>
            <li>Phản hồi các góp ý, báo cáo lỗi từ người dùng</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            Chúng tôi cam kết không sử dụng bất kỳ dữ liệu kỹ thuật nào để xác định danh tính người dùng.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">4. Quảng cáo &amp; Cookie</h2>
          <p className="text-muted-foreground leading-relaxed">
            LegacyVNU sử dụng Google AdSense để hiển thị quảng cáo nhằm duy trì hoạt động của nền tảng. Google có thể dùng cookie để hiển thị quảng cáo phù hợp dựa trên lịch sử duyệt web của bạn. Bạn có thể tắt quảng cáo được cá nhân hoá tại{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:opacity-70"
            >
              adssettings.google.com
            </a>
            .
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Ngoài ra, chúng tôi sử dụng cookie kỹ thuật cần thiết để trang web hoạt động bình thường và cookie của PostHog cho mục đích phân tích ẩn danh. Bằng cách tiếp tục sử dụng trang web, bạn đồng ý với việc sử dụng cookie này.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">5. Chia sẻ thông tin</h2>
          <p className="text-muted-foreground leading-relaxed">
            Chúng tôi không bán, chia sẻ hoặc trao đổi thông tin cá nhân của bạn với bất kỳ bên thứ ba nào, ngoại trừ các nhà cung cấp dịch vụ hạ tầng cần thiết để vận hành trang web (Cloudflare, Google). Các nhà cung cấp này hoạt động theo chính sách bảo mật riêng của họ.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">6. Bản quyền nội dung</h2>
          <p className="text-muted-foreground leading-relaxed">
            Tài liệu trên LegacyVNU được chia sẻ bởi cộng đồng sinh viên với mục đích học tập phi thương mại. Chúng tôi tôn trọng quyền sở hữu trí tuệ. Nếu bạn là chủ sở hữu nội dung và muốn yêu cầu gỡ xuống, vui lòng liên hệ{" "}
            <a
              href="mailto:hello@wizards.foundation"
              className="underline underline-offset-4 hover:opacity-70"
            >
              hello@wizards.foundation
            </a>{" "}
            — chúng tôi sẽ xử lý trong thời gian sớm nhất.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Giao diện, logo và mã nguồn của LegacyVNU thuộc về Wizards Foundation. Mọi hành vi sao chép vì mục đích thương mại mà không có sự cho phép đều bị nghiêm cấm.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">7. Thay đổi điều khoản</h2>
          <p className="text-muted-foreground leading-relaxed">
            Chúng tôi có quyền cập nhật các điều khoản này vào bất kỳ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải. Việc bạn tiếp tục sử dụng website sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl">8. Liên hệ</h2>
          <p className="text-muted-foreground leading-relaxed">
            Mọi thắc mắc về điều khoản hoặc chính sách bảo mật, vui lòng liên hệ:{" "}
            <a
              href="mailto:hello@wizards.foundation"
              className="underline underline-offset-4 hover:opacity-70"
            >
              hello@wizards.foundation
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
