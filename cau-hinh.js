/* ==================================================================
   CẤU HÌNH HỆ THỐNG — file duy nhất cần quan tâm khi đổi URL máy chủ
   ------------------------------------------------------------------
   Khi nào cần sửa file này?
   • Chỉ khi URL Web App Apps Script thay đổi (ví dụ lỡ tạo "New
     deployment" mới trong Apps Script thay vì "New version").
   • Các chỉnh sửa giao diện (tên trường, ghi chú, màu sắc, nhãn...)
     KHÔNG cần đụng file này — chỉ cần sửa index.html / admin.html
     rồi upload lên GitHub là xong.
   ================================================================== */
window.CAU_HINH = {
  SCRIPT_URL: "https://script.google.com/macros/s/AKfycbwHLQq8zV4cj59BDS1l9h8sAAqw4-wt7KPcmbxHPrFAvzm9_Fcl7V4uFDvTuws9kP_r/exec",
};
