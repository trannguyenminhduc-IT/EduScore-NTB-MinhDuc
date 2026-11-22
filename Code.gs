/**
 * ============================================================================
 *  BACKEND TRA CỨU ĐIỂM v2.0 — TRƯỜNG THCS NGUYỄN THÁI BÌNH
 * ============================================================================
 *  MÔ HÌNH PHÂN TÁN (mỗi giáo viên 1 tab, hệ thống tự gộp):
 *
 *    GV Toán 8A1 ─┐  GV Văn 8A1 ─┐  GV Toán 8A2 ─┐   (mỗi GV nhập tab riêng
 *                 │               │               │    "Lớp-Môn" trong CÙNG
 *                 ▼               ▼               ▼    một Google Sheet)
 *           [Tab 8A1-Toán]  [Tab 8A1-Ngữ văn]  [Tab 8A2-Toán]
 *                 └───────────────┼───────────────┘
 *                        onEdit đánh dấu "có thay đổi"
 *                                 ▼
 *              Đồng bộ tự động (mỗi 5 phút) hoặc "Đồng bộ ngay"
 *                                 ▼
 *        [Tab DIEM_TONG] — lưu theo thứ tự KHỐI → LỚP → MÔN
 *                                 ▼
 *                  Trang index.html tra cứu theo mã định danh
 *
 *  TRANG QUẢN TRỊ admin.html (đăng nhập bằng mật khẩu):
 *    - Quản lý danh mục khối/lớp/môn/GV (tự tạo tab + khóa tab cho GV)
 *    - Chỉnh cấu hình trang công khai (tên trường, học kỳ, ghi chú...)
 *    - Đồng bộ ngay, đổi mật khẩu admin
 *
 *  CÁC BƯỚC TRIỂN KHAI (chi tiết HUONG-DAN.md):
 *    1. Tạo Google Sheet trung tâm → dán ID vào SHEET_ID bên dưới.
 *    2. Tạo Apps Script → dán file này → chạy caiDatHeThong() MỘT LẦN
 *       (tạo tab mẫu + mật khẩu admin mặc định + cài trigger tự động).
 *    3. Deploy → Web app (Execute as: Me, Access: Anyone) → copy URL
 *       điền vào SCRIPT_URL của index.html và admin.html.
 *    4. Chia sẻ Sheet trung cấp cho giáo viên với quyền "Trình chỉnh sửa";
 *       mỗi GV chỉ sửa được tab của mình (đã khóa bằng Protection).
 * ============================================================================
 */

/* ========================= CẤU HÌNH ========================= */

// ID Google Sheet trung tâm (từ URL: docs.google.com/spreadsheets/d/<ID>/edit)
const SHEET_ID = '1Bg7Iw9NidXyT_0407Vs_fs5UoGnsmAvXX7KXf-mcrvA';

const TAB = {
  DANH_MUC:  'DANH_MUC',   // Khoi|Lop|Mon|GiaoVien|Email|TabName|HocKy|SoHS|CapNhatCuoi|GhiChu
  DIEM_TONG: 'DIEM_TONG',  // Khoi|Lop|Mon|GiaoVien|HocKy|MaDinhDanh|HoTen|LoaiDiem|DiemSo|CapNhat
  HOSO:      'HOSO',       // MaDinhDanh|HoTen|NgaySinh|Lop|GVCN
  META:      'META',       // Khoa|GiaTri
  GVCN:      'GVCN',       // Lop|GVCN — danh sách giáo viên chủ nhiệm theo lớp
};

const CAU_HINH_MAC_DINH = {
  TEN_TRUONG:  'Trường THCS Nguyễn Thái Bình',
  PHU_DE:      'Cổng tra cứu kết quả học tập',
  HOC_KY:      'Học kỳ 1 — Năm học 2026-2027',
  HOC_KY_LOC:  'HK1',
  GHI_CHU:     'Mã định danh gồm các chữ số do giáo viên chủ nhiệm cung cấp',
};

const CACHE_GIAY   = 600;  // bộ đệm kết quả tra cứu: 10 phút
const TOKEN_GIAY   = 6 * 3600; // phiên đăng nhập admin: 6 giờ
const TRANH_GIAY   = 5;    // mỗi mã định danh nghỉ 5 giây giữa 2 lượt tra
const GIOI_HAN_NGAY = 5000;
const MAT_KHAU_MAC_DINH = 'ntb2026'; // đổi ngay ở trang admin sau khi triển khai

/* ========================= ROUTER CHÍNH ========================= */

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'config')    return json(layCauHinhCongKhai());
    if (p.action === 'login')     return json(dangNhapAdmin(p.pw || ''));
    if (p.action === 'dashboard') return json(canBo(p.token, layDashboard));
    if (p.id)                     return json(traCuu(p.id));
    return json({ error: 'Thiếu tham số truy vấn.' });
  } catch (err) {
    console.error(err);
    return json({ error: 'Hệ thống đang bận, vui lòng thử lại sau ít phút.' });
  }
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      case 'registrySave':   return json(canBo(p.token, () => luuDanhMuc(anJson(p.data))));
      case 'registryDelete': return json(canBo(p.token, () => xoaDanhMuc(p.tabName, p.xoaTab === '1')));
      case 'configSave':     return json(canBo(p.token, () => luuCauHinh(anJson(p.data))));
      case 'syncNow':        return json(canBo(p.token, dongBoTatCa));
      case 'napDiem':        return json(canBo(p.token, () => napDiemTuFile(anJson(p.data))));
      case 'changePassword': return json(canBo(p.token, () => doiMatKhau(p.oldPw || '', p.newPw || '')));
      case 'gvcnSave':       return json(canBo(p.token, () => luuGvcn(p.text || '')));
      case 'xoaToanBoDiem':  return json(canBo(p.token, xoaToanBoDiem));
      default: return json({ error: 'Không rõ yêu cầu.' });
    }
  } catch (err) {
    console.error(err);
    return json({ error: 'Thao tác thất bại: ' + (err && err.message ? err.message : 'lỗi không xác định') });
  }
}

/* ========================= 1) TRA CỨU CÔNG KHAI ========================= */

function traCuu(idRaw) {
  const id = normId(idRaw);
  if (!id) return { error: 'Vui lòng cung cấp mã định danh học sinh.' };
  if (!/^[\dA-Za-z]{8,20}$/.test(id)) return { error: 'Mã định danh không hợp lệ (thường gồm 10–12 chữ số).' };
  if (!chongSpam(id)) return { error: 'Bạn tra cứu quá nhanh. Vui lòng đợi vài giây rồi thử lại.' };

  const cache = CacheService.getScriptCache();
  const theHe = (PropertiesService.getScriptProperties().getProperty('CACHE_GEN') || '0');
  const cached = cache.get('G' + theHe + ':HS:' + id);
  if (cached) return JSON.parse(cached);

  const ss = moSheet();
  const meta = docMeta(ss);
  const hoso = timHocSinh(ss, id);
  if (!hoso) return { error: 'Không tìm thấy học sinh với mã định danh này. Vui lòng liên hệ giáo viên chủ nhiệm.' };

  const payload = {
    ok: true,
    capNhat: meta.CAP_NHAT ? ('Dữ liệu cập nhật: ' + meta.CAP_NHAT) : ('Học kỳ: ' + meta.HOC_KY),
    hocKy: meta.HOC_KY,
    data: { profile: hoso, subjects: docDiemTong(ss, id, meta.HOC_KY_LOC) },
  };
  cache.put('G' + theHe + ':HS:' + id, JSON.stringify(payload), CACHE_GIAY);
  return payload;
}

function docDiemTong(ss, id, hocKyLoc) {
  const rows = docSheet(ss, TAB.DIEM_TONG);
  const subjects = {};
  rows.forEach(function (r) {
    if (normId(r['MaDinhDanh'] || '') !== id) return;
    const hk = r['HocKy'] || '';
    if (hocKyLoc && hk && hk !== hocKyLoc) return;
    const mon = chuanHoaMon(r['Mon']) || 'Khác';
    const diem = r['DiemSo'] || '';
    if (diem === '' && !(r['LoaiDiem'] || '')) return;
    if (!subjects[mon]) subjects[mon] = [];
    subjects[mon].push({ loaiDiem: r['LoaiDiem'] || 'Điểm', diemSo: diem });
  });
  // Trả về theo đúng thứ tự môn chương trình (kể cả với dữ liệu cũ đã lưu)
  const sapXep = Object.keys(subjects).sort(function (a, b) {
    return thuTuMon(a) - thuTuMon(b) || a.localeCompare(b, 'vi');
  });
  const ketQua = {};
  sapXep.forEach(function (m) { ketQua[m] = subjects[m]; });
  return ketQua;
}

function timHocSinh(ss, id) {
  const rows = docSheet(ss, TAB.HOSO);
  const row = rows.filter(function (r) { return normId(r['MaDinhDanh'] || '') === id; })[0];
  if (!row) return null;
  const p = {};
  if (row['HoTen'])    p['Họ và tên'] = row['HoTen'];
  if (row['NgaySinh']) p['Ngày sinh'] = row['NgaySinh'];
  if (row['Lop'])      p['Lớp'] = row['Lop'];
  if (row['GVCN'])     p['GVCN'] = row['GVCN'];
  if (!p['GVCN'] && p['Lớp']) {
    const gvcn = docGvcn(ss)[p['Lớp']];
    if (gvcn) p['GVCN'] = gvcn;
  }
  p['Mã định danh'] = row['MaDinhDanh'] || id;
  return p;
}

/* ---- Danh sách GVCN theo lớp (tab GVCN: Lop|GVCN) ---- */

function docGvcn(ss) {
  const map = {};
  docSheet(ss, TAB.GVCN).forEach(function (r) {
    const lop = String(r['Lop'] || '').trim();
    if (lop) map[lop] = String(r['GVCN'] || '').trim();
  });
  return map;
}

/** Nhận văn bản nhiều dòng dạng "8A1 - Trần Văn B" (phân cách bởi - , ; :) */
function luuGvcn(text) {
  const ss = moSheet();
  const sh = taoTabVoiHeader(ss, TAB.GVCN, ['Lop', 'GVCN']);
  const dong = [];
  String(text || '').split(/\r?\n/).forEach(function (line) {
    if (!line.trim()) return;
    const parts = line.split(/[-,;:]/);
    const lop = String(parts[0] || '').trim();
    const gv = String(parts.slice(1).join('-') || '').trim();
    if (lop && gv) dong.push([lop, gv]);
  });
  sh.clearContents();
  sh.getRange(1, 1, 1, 2).setValues([['Lop', 'GVCN']]);
  sh.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#dbeafe');
  if (dong.length) sh.getRange(2, 1, dong.length, 2).setValues(dong);
  sh.setFrozenRows(1);
  bumpTheHe();
  return { ok: true, msg: 'Đã lưu danh sách GVCN cho ' + dong.length + ' lớp.', soLop: dong.length };
}

/** Xóa toàn bộ điểm (tab DIEM_TONG) — giữ lại hồ sơ học sinh */
function xoaToanBoDiem() {
  const ss = moSheet();
  const shDt = ss.getSheetByName(TAB.DIEM_TONG);
  if (shDt) {
    shDt.clearContents();
    shDt.getRange(1, 1, 1, 10).setValues([['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']]);
    shDt.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#dbeafe');
    shDt.setFrozenRows(1);
  }
  bumpTheHe();
  ghiMeta(ss, 'CAP_NHAT', Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') + ' (đã xóa toàn bộ điểm)');
  return { ok: true, msg: 'Đã xóa TOÀN BỘ điểm. Hồ sơ học sinh (HOSO) được giữ nguyên.' };
}

/* ========================= 2) CẤU HÌNH CÔNG KHAI ========================= */

function layCauHinhCongKhai() {
  const meta = docMeta(moSheet());
  return {
    ok: true,
    tenTruong: meta.TEN_TRUONG || CAU_HINH_MAC_DINH.TEN_TRUONG,
    phuDe:     meta.PHU_DE || CAU_HINH_MAC_DINH.PHU_DE,
    hocKy:     meta.HOC_KY || CAU_HINH_MAC_DINH.HOC_KY,
    capNhat:   meta.CAP_NHAT || '',
    ghiChu:    meta.GHI_CHU || CAU_HINH_MAC_DINH.GHI_CHU,
  };
}

/* ========================= 3) XÁC THỰC ADMIN ========================= */

function dangNhapAdmin(pw) {
  const cache = CacheService.getScriptCache();
  const soSai = Number(cache.get('SAI_MK') || '0');
  if (soSai >= 5) return { error: 'Đã khóa tạm thời do nhập sai nhiều lần. Thử lại sau 10 phút.' };

  const props = PropertiesService.getScriptProperties();
  let dung = props.getProperty('ADMIN_PASSWORD');
  if (!dung) { dung = MAT_KHAU_MAC_DINH; props.setProperty('ADMIN_PASSWORD', dung); }

  if (pw !== dung) {
    cache.put('SAI_MK', String(soSai + 1), 600);
    return { error: 'Mật khẩu không đúng.' };
  }
  cache.remove('SAI_MK');
  const token = Utilities.getUuid();
  cache.put('ADMTOK:' + token, '1', TOKEN_GIAY);
  return { ok: true, token: token, macDinh: dung === MAT_KHAU_MAC_DINH };
}

function kiemTraToken(token) {
  return !!(token && CacheService.getScriptCache().get('ADMTOK:' + token));
}

function canBo(token, fn) {
  if (!kiemTraToken(token)) return { error: 'PHIEN_HET_HAN' };
  return fn();
}

function doiMatKhau(oldPw, newPw) {
  if (String(newPw).length < 6) return { error: 'Mật khẩu mới phải từ 6 ký tự trở lên.' };
  const props = PropertiesService.getScriptProperties();
  const dung = props.getProperty('ADMIN_PASSWORD') || MAT_KHAU_MAC_DINH;
  if (oldPw !== dung) return { error: 'Mật khẩu hiện tại không đúng.' };
  props.setProperty('ADMIN_PASSWORD', newPw);
  return { ok: true, msg: 'Đã đổi mật khẩu admin.' };
}

/* ========================= 4) DASHBOARD ADMIN ========================= */

function layDashboard() {
  const ss = moSheet();
  const dm = docDanhMuc(ss);
  const dt = docSheet(ss, TAB.DIEM_TONG);
  const hoso = docSheet(ss, TAB.HOSO);
  const meta = docMeta(ss);
  // Thống kê lấy từ DIEM_TONG (bao gồm cả điểm nạp từ file, không chỉ tab GV)
  const khois = {}, lops = {}, lopMon = {};
  dt.forEach(function (r) {
    if (!r['Lop'] || !r['Mon']) return;
    khois[r['Khoi']] = 1; lops[r['Lop']] = 1; lopMon[r['Lop'] + '|' + r['Mon']] = 1;
  });
  return {
    ok: true,
    danhMuc: dm,
    meta: {
      TEN_TRUONG: meta.TEN_TRUONG || CAU_HINH_MAC_DINH.TEN_TRUONG,
      PHU_DE: meta.PHU_DE || CAU_HINH_MAC_DINH.PHU_DE,
      HOC_KY: meta.HOC_KY || CAU_HINH_MAC_DINH.HOC_KY,
      HOC_KY_LOC: meta.HOC_KY_LOC || CAU_HINH_MAC_DINH.HOC_KY_LOC,
      GHI_CHU: meta.GHI_CHU || CAU_HINH_MAC_DINH.GHI_CHU,
      CAP_NHAT: meta.CAP_NHAT || '',
    },
    sheetUrl: 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/edit',
    gvcnText: (function () {
      const m = docGvcn(ss);
      return Object.keys(m).sort(function (a, b) {
        return String(a).localeCompare(String(b), 'vi', { numeric: true });
      }).map(function (l) { return l + ' - ' + m[l]; }).join('\n');
    })(),
    thongKe: {
      soKhoi: Object.keys(khois).length,
      soLop: Object.keys(lops).length,
      soMon: Object.keys(lopMon).length,
      soHocSinh: hoso.length,
    },
  };
}

/**
 * Nạp hàng loạt điểm từ file xuất ra (SMIS/Excel/CSV đã đọc ở trình duyệt).
 * d = { khoi, lop, mon, giaoVien, hocKy, cheDo:'thay'|'them',
 *       rows: [{ ma, hoTen, ngaySinh, lop?, mon?, diem: [{loaiDiem, diemSo}] }] }
 * - Bố cục RỘNG: khai báo lop/mon chung ở d; các cột điểm đã chuyển thành mảng diem.
 * - Bố cục DÀI: mỗi dòng 1 điểm; lop/mon có thể nằm riêng ở từng dòng (it.lop/it.mon).
 * Ghi trực tiếp vào DIEM_TONG (cheDo='thay' → thay toàn bộ các khối Lớp–Môn–Học kỳ liên quan),
 * tự bổ sung HOSO, lưu thời điểm cập nhật.
 */
function napDiemTuFile(d) {
  if (!d || !d.rows || !d.rows.length) return { error: 'Không có dòng dữ liệu nào để nạp.' };

  const ss = moSheet();
  const capNhat = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
  const hangMoi = [];
  const nhomThayThe = {}; // "lop|mon|hocKy" → 1
  d.rows.forEach(function (it) {
    const ma = normId(it.ma || '');
    if (!ma) return;
    const lop = String(it.lop || d.lop || '').trim();
    const mon = chuanHoaMon(String(it.mon || d.mon || ''));
    if (!lop || !mon) return;
    const hocKy = String(it.hocKy || d.hocKy || 'HK1').trim();
    nhomThayThe[lop + '|' + mon + '|' + hocKy] = 1;
    (it.diem || []).forEach(function (x) {
      const diem = String(x.diemSo === undefined ? '' : x.diemSo).trim();
      if (diem === '') return;
      hangMoi.push([String(d.khoi || ''), lop, mon, String(it.giaoVien || d.giaoVien || ''), hocKy, ma,
                    String(it.hoTen || '').trim(), String(x.loaiDiem || 'Điểm').trim(), diem, capNhat]);
    });
  });
  if (!hangMoi.length) return { error: 'Không đọc được dòng điểm nào hợp lệ (thiếu Mã định danh / Lớp / Môn / giá trị điểm).' };

  // Tự tạo tab kho điểm nếu chưa tồn tại (chống lỗi khi chưa chạy caiDatHeThong)
  const shDt = taoTabVoiHeader(ss, TAB.DIEM_TONG, ['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']);
  let vals = shDt.getLastRow() > 1 ? shDt.getRange(2, 1, shDt.getLastRow() - 1, 10).getValues() : [];
  if ((d.cheDo || 'thay') === 'thay') {
    const thay = nhomThayThe;
    vals = vals.filter(function (r) {
      const key = String(r[1]).trim() + '|' + String(r[2]).trim() + '|' + String(r[4]).trim();
      return !thay[key];
    });
  }
  vals = vals.concat(hangMoi).sort(soSanhHangDiem);
  shDt.clearContents();
  shDt.getRange(1, 1, 1, 10).setValues([['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']]);
  shDt.getRange(2, 1, vals.length, 10).setValues(vals);
  shDt.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#dbeafe');
  shDt.setFrozenRows(1);

  // Bổ sung hồ sơ (lớp ghi theo dòng dữ liệu nếu có)
  const daGhi = {};
  const hosoMoi = [];
  d.rows.forEach(function (it) {
    const ma = normId(it.ma || '');
    if (!ma || daGhi[ma]) return;
    daGhi[ma] = 1;
    hosoMoi.push({ ma: ma, hoTen: it.hoTen || '', ngaySinh: it.ngaySinh || '', diem: [], lop: it.lop || d.lop || '' });
  });
  upsertHosoDaCoLop(ss, hosoMoi);

  ghiMeta(ss, 'CAP_NHAT', capNhat);
  bumpTheHe();
  const soNhom = Object.keys(nhomThayThe).length;
  return { ok: true, msg: 'Đã nạp ' + hangMoi.length + ' điểm (' + soNhom + ' nhóm lớp–môn) vào hệ thống.', soHang: hangMoi.length };
}

/** Như upsertHoso nhưng dòng đã tự kèm lớp (bố cục dài có thể nhiều lớp trong 1 file) */
function upsertHosoDaCoLop(ss, items) {
  const sh = taoTabVoiHeader(ss, TAB.HOSO, ['MaDinhDanh', 'HoTen', 'NgaySinh', 'Lop', 'GVCN']);
  const vals = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues() : [];
  const chiSo = {};
  vals.forEach(function (r, i) { chiSo[normId(r[0])] = i; });
  items.forEach(function (it) {
    if (chiSo[it.ma] === undefined) {
      vals.push([it.ma, it.hoTen, it.ngaySinh, it.lop || '', '']);
    } else {
      const r = vals[chiSo[it.ma]];
      if (it.hoTen && !r[1]) r[1] = it.hoTen;
      if (it.ngaySinh && !r[2]) r[2] = it.ngaySinh;
      if (it.lop && !r[3]) r[3] = it.lop;
    }
  });
  vals.sort(function (a, b) {
    const l = String(a[3]).localeCompare(String(b[3]), 'vi', { numeric: true });
    if (l) return l;
    return String(a[1]).localeCompare(String(b[1]), 'vi');
  });
  sh.clearContents();
  sh.getRange(1, 1, 1, 5).setValues([['MaDinhDanh', 'HoTen', 'NgaySinh', 'Lop', 'GVCN']]);
  sh.getRange(2, 1, vals.length, 5).setValues(vals);
  sh.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#dbeafe');
  sh.setFrozenRows(1);
}

function luuDanhMuc(row) {
  if (!row) return { error: 'Thiếu dữ liệu.' };
  const lop = String(row['Lop'] || '').trim();
  const mon = String(row['Mon'] || '').trim();
  if (!lop || !mon) return { error: 'Cần nhập đủ Lớp và Môn.' };

  const ss = moSheet();
  const dmRows = docDanhMuc(ss);
  let tabName = String(row['TabName'] || '').trim() || (lop + '-' + mon);

  // Dòng đang sửa (nếu có): lấy TabName cũ để đổi tên tab tương ứng
  const sttSua = String(row['STT'] || '');
  const dongCu = sttSua ? dmRows.filter(function (r) { return r['STT'] === sttSua; })[0] : null;
  const tabCu = dongCu ? dongCu['TabName'] : '';

  // Trùng tab khác (khác dòng đang sửa) → tự thêm hậu số
  const trung = dmRows.filter(function (r) { return r['TabName'] === tabName && r['STT'] !== sttSua; });
  if (trung.length) tabName = tabName + '-2';

  const moi = {
    'Khoi': String(row['Khoi'] || '').trim(),
    'Lop': lop,
    'Mon': mon,
    'GiaoVien': String(row['GiaoVien'] || '').trim(),
    'Email': String(row['Email'] || '').trim(),
    'TabName': tabName,
    'HocKy': String(row['HocKy'] || '').trim() || (docMeta(ss).HOC_KY_LOC || 'HK1'),
    'GhiChu': String(row['GhiChu'] || '').trim(),
  };

  // Tạo tab mới HOẶC đổi tên tab cũ cho khớp danh mục
  const sh = ss.getSheetByName(tabName);
  if (!sh) {
    if (tabCu && ss.getSheetByName(tabCu)) ss.getSheetByName(tabCu).setName(tabName);
    else taoTabGiaoVien(ss, moi);
  }

  // Ghi lại dòng danh mục (sửa nếu khớp STT, ngược lại thêm)
  ghiDongDanhMuc(ss, moi, row['STT']);
  return { ok: true, msg: 'Đã lưu "' + lop + ' · ' + mon + '" (tab: ' + tabName + ')', danhMuc: docDanhMuc(ss) };
}

function xoaDanhMuc(tabName, xoaTab) {
  const ss = moSheet();
  const shDm = ss.getSheetByName(TAB.DANH_MUC);
  const vals = shDm.getDataRange().getValues();
  const header = vals[0].map(function (c) { return String(c).trim(); });
  const colTab = header.indexOf('TabName');
  let xoaTai = -1;
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][colTab]).trim() === String(tabName)) { xoaTai = i + 1; break; }
  }
  if (xoaTai === -1) return { error: 'Không tìm thấy dòng danh mục.' };
  shDm.deleteRow(xoaTai);
  keoLaiSTT(shDm);

  // Xóa khối điểm tương ứng trong DIEM_TONG
  xoaKhoiDiem(ss, String(tabName));

  if (xoaTab) {
    const sh = ss.getSheetByName(String(tabName));
    if (sh) ss.deleteSheet(sh);
  }
  return { ok: true, msg: 'Đã xóa "' + tabName + '" khỏi danh mục.', danhMuc: docDanhMuc(ss) };
}

function luuCauHinh(d) {
  const ss = moSheet();
  const choPhep = ['TEN_TRUONG', 'PHU_DE', 'HOC_KY', 'HOC_KY_LOC', 'GHI_CHU'];
  choPhep.forEach(function (k) { if (d && d[k] !== undefined) ghiMeta(ss, k, String(d[k]).trim()); });
  bumpTheHe();
  return { ok: true, msg: 'Đã lưu cấu hình trang công khai.' };
}

/* ========================= 5) ĐỒNG BỘ TỰ ĐỘNG ========================= */

/** onEdit: chỉ ĐÁNH DẤU tab bị sửa (nhẹ, chạy ngay khi GV gõ) */
function onEdit(e) {
  try {
    const name = e.range.getSheet().getName();
    if (name === TAB.DANH_MUC || name === TAB.META || laTabGiaoVien(e.source, name)) {
      danhDauDirty(name);
    }
  } catch (err) { /* onEdit không được phép đổ lỗi */ }
}

/** Trigger mỗi 5 phút: gộp các tab vừa bị sửa vào DIEM_TONG */
function xuLyDongBo() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // có lần chạy khác đang gộp
  try {
    const dirty = layVaXoaDirty();
    if (!dirty.length) return;
    const ss = moSheet();
    dirty.forEach(function (name) { if (name !== TAB.DANH_MUC && name !== TAB.META) dongBoBlock(ss, name); });
    bumpTheHe();
  } finally {
    lock.releaseLock();
  }
}

/** Gộp lại TOÀN BỘ (nút "Đồng bộ ngay" + trigger an toàn mỗi 6 giờ) */
function dongBoTatCa() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = moSheet();
    const dm = docDanhMuc(ss);
    let soTab = 0, loi = [];
    dm.forEach(function (r) {
      const kq = dongBoBlock(ss, r['TabName']);
      if (kq && kq.error) loi.push(r['TabName'] + ': ' + kq.error); else soTab++;
    });
    layVaXoaDirty(); // mọi thay đổi đã được gộp
    bumpTheHe();
    return { ok: true, msg: 'Đã đồng bộ ' + soTab + ' tab (khối/lớp/môn)' + (loi.length ? '. Lỗi: ' + loi.join('; ') : '.'), soTab: soTab };
  } finally {
    lock.releaseLock();
  }
}

/** Gộp MỘT tab GV vào DIEM_TONG (giữ thứ tự khối → lớp → môn) */
function dongBoBlock(ss, tabName) {
  const dm = docDanhMuc(ss).filter(function (r) { return r['TabName'] === String(tabName); })[0];
  if (!dm) return { error: 'Không có trong danh mục' };
  const sh = ss.getSheetByName(tabName);
  if (!sh) return { error: 'Tab không tồn tại (đã bị đổi tên?)' };

  // 1) Đọc tab GV dạng lưới sổ điểm
  const items = docTabGiaoVien(sh);
  const capNhat = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
  const monChuan = chuanHoaMon(dm['Mon']);
  const hangMoi = [];
  items.forEach(function (it) {
    it.diem.forEach(function (d) {
      hangMoi.push([dm['Khoi'], dm['Lop'], monChuan, dm['GiaoVien'], dm['HocKy'],
                    it.ma, it.hoTen, d.loaiDiem, d.diemSo, capNhat]);
    });
  });

  // 2) Thay khối cũ của (Lop, Mon, HocKy) trong DIEM_TONG rồi sắp xếp lại toàn bộ
  const shDt = taoTabVoiHeader(ss, TAB.DIEM_TONG, ['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']);
  let vals = shDt.getLastRow() > 1 ? shDt.getRange(2, 1, shDt.getLastRow() - 1, 10).getValues() : [];
  vals = vals.filter(function (r) {
    return !(String(r[1]).trim() === dm['Lop'] && chuanHoaMon(String(r[2])) === monChuan && String(r[4]).trim() === dm['HocKy']);
  });
  vals = vals.concat(hangMoi).sort(soSanhHangDiem);
  shDt.clearContents();
  shDt.getRange(1, 1, 1, 10).setValues([['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']]);
  if (vals.length) shDt.getRange(2, 1, vals.length, 10).setValues(vals);
  shDt.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#dbeafe');
  shDt.setFrozenRows(1);

  // 3) Bổ sung hồ sơ học sinh từ tab GV (họ tên, ngày sinh nếu có)
  upsertHoso(ss, items, dm['Lop']);

  // 4) Cập nhật trạng thái dòng danh mục + thời điểm đồng bộ
  capNhatTrangThaiDanhMuc(ss, tabName, items.length, capNhat);
  ghiMeta(ss, 'CAP_NHAT', capNhat);
  return { ok: true, soHang: hangMoi.length };
}

/** Thứ tự chuẩn các môn theo chương trình (dùng để sắp xếp) */
const DANH_SACH_MON = ['Toán', 'Ngữ văn', 'Ngoại ngữ 1', 'Ngoại ngữ 2', 'Ngoại ngữ 3',
  'Giáo dục công dân', 'Công nghệ', 'Tin học', 'Khoa học tự nhiên',
  'Lịch sử và Địa lý', 'Giáo dục thể chất', 'Nghệ thuật',
  'Hoạt động trải nghiệm', 'Giáo dục địa phương', 'Giáo dục kinh tế và pháp luật'];

/** Bỏ dấu tiếng Việt (để so khớp tên môn không phụ thuộc dấu/chữ hoa/cách viết liền) */
function boDau(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

/** Chuẩn hóa tên môn về tên hiển thị chuẩn: "Ngoạingữ1", "NGOẠI NGỮ 1", "NN1"... → "Ngoại ngữ 1" */
function chuanHoaMon(raw) {
  const k = boDau(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
  const bang = {
    'toan': 'Toán',
    'nguvan': 'Ngữ văn',
    'ngoaingu': 'Ngoại ngữ 1',
    'ngoaingu1': 'Ngoại ngữ 1',
    'ngoaingu2': 'Ngoại ngữ 2',
    'ngoaingu3': 'Ngoại ngữ 3',
    'nn1': 'Ngoại ngữ 1',
    'nn2': 'Ngoại ngữ 2',
    'gdcd': 'Giáo dục công dân',
    'giaoduccongdan': 'Giáo dục công dân',
    'congnghe': 'Công nghệ',
    'tinhoc': 'Tin học',
    'khtn': 'Khoa học tự nhiên',
    'khoahoctunhien': 'Khoa học tự nhiên',
    'lichsuvadiali': 'Lịch sử và Địa lý',
    'lichsuvadialy': 'Lịch sử và Địa lý',
    'gdtc': 'Giáo dục thể chất',
    'giaoducthechat': 'Giáo dục thể chất',
    'giaoductheechat': 'Giáo dục thể chất',
    'nghethuat': 'Nghệ thuật',
    'amnhac': 'Nghệ thuật', 'mithuat': 'Nghệ thuật',
    'hdtn': 'Hoạt động trải nghiệm',
    'hoatdongtrainghiem': 'Hoạt động trải nghiệm',
    'hoatdongtrainghiemhuongnghiep': 'Hoạt động trải nghiệm',
    'gddp': 'Giáo dục địa phương',
    'giaoducdiaphuong': 'Giáo dục địa phương',
    'gdktpl': 'Giáo dục kinh tế và pháp luật',
    'giaoduckinhtephapluat': 'Giáo dục kinh tế và pháp luật',
    'giaoduckinhtevaphapluat': 'Giáo dục kinh tế và pháp luật',
  };
  return bang[k] || String(raw || '').trim();
}

/** Vị trí sắp xếp của một môn (môn lạ xếp sau cùng, giữ tên gốc) */
function thuTuMon(ten) {
  const i = DANH_SACH_MON.indexOf(chuanHoaMon(ten));
  return i === -1 ? 100 : i;
}

/** So sánh để sắp xếp: KHỐI → LỚP → MÔN (theo thứ tự chương trình) → HỌC KỲ */
function soSanhHangDiem(a, b) {
  const ka = parseInt(a[0], 10) || 0, kb = parseInt(b[0], 10) || 0;
  if (ka !== kb) return ka - kb;
  const l = String(a[1]).localeCompare(String(b[1]), 'vi', { numeric: true });
  if (l) return l;
  const ma = thuTuMon(a[2]), mb = thuTuMon(b[2]);
  if (ma !== mb) return ma - mb;
  return String(a[4]).localeCompare(String(b[4]));
}

/** Đọc 1 tab GV: cột MaDinhDanh|HoTen(|NgaySinh)|các cột điểm (tên cột = loại điểm) */
function docTabGiaoVien(sh) {
  const vals = sh.getDataRange().getDisplayValues();
  if (vals.length < 2) return [];
  const headers = vals[0].map(function (c) { return String(c).trim(); });
  const colMa = headers.indexOf('MaDinhDanh');
  const colTen = headers.indexOf('HoTen');
  const colNs = headers.indexOf('NgaySinh');
  if (colMa === -1) return [];
  const items = [];
  for (let i = 1; i < vals.length; i++) {
    const ma = normId(vals[i][colMa]);
    if (!ma) continue;
    const diem = [];
    headers.forEach(function (h, c) {
      if (!h || c === colMa || c === colTen || c === colNs) return;
      const v = String(vals[i][c]).trim();
      if (v !== '') diem.push({ loaiDiem: h, diemSo: v });
    });
    items.push({
      ma: ma,
      hoTen: colTen >= 0 ? String(vals[i][colTen]).trim() : '',
      ngaySinh: colNs >= 0 ? String(vals[i][colNs]).trim() : '',
      diem: diem,
    });
  }
  return items;
}

function upsertHoso(ss, items, lop) {
  const sh = taoTabVoiHeader(ss, TAB.HOSO, ['MaDinhDanh', 'HoTen', 'NgaySinh', 'Lop', 'GVCN']);
  const vals = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 5).getValues() : [];
  const chiSo = {};
  vals.forEach(function (r, i) { chiSo[normId(r[0])] = i; });
  items.forEach(function (it) {
    if (it.ma === '') return;
    if (chiSo[it.ma] === undefined) {
      vals.push([it.ma, it.hoTen, it.ngaySinh, lop, '']);
    } else {
      const r = vals[chiSo[it.ma]];
      if (it.hoTen && !r[1]) r[1] = it.hoTen;
      if (it.ngaySinh && !r[2]) r[2] = it.ngaySinh;
      if (lop && !r[3]) r[3] = lop;
    }
  });
  vals.sort(function (a, b) {
    const l = String(a[3]).localeCompare(String(b[3]), 'vi', { numeric: true });
    if (l) return l;
    return String(a[1]).localeCompare(String(b[1]), 'vi');
  });
  sh.clearContents();
  sh.getRange(1, 1, 1, 5).setValues([['MaDinhDanh', 'HoTen', 'NgaySinh', 'Lop', 'GVCN']]);
  if (vals.length) sh.getRange(2, 1, vals.length, 5).setValues(vals);
  sh.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#dbeafe');
  sh.setFrozenRows(1);
}

function xoaKhoiDiem(ss, tabName) {
  const dm = docDanhMuc(ss).filter(function (r) { return r['TabName'] === tabName; })[0];
  const shDt = ss.getSheetByName(TAB.DIEM_TONG);
  if (!dm || !shDt || shDt.getLastRow() < 2) return;
  let vals = shDt.getRange(2, 1, shDt.getLastRow() - 1, 10).getValues();
  vals = vals.filter(function (r) {
    return !(String(r[1]).trim() === dm['Lop'] && chuanHoaMon(String(r[2])) === chuanHoaMon(dm['Mon']) && String(r[4]).trim() === dm['HocKy']);
  });
  shDt.clearContents();
  shDt.getRange(1, 1, 1, 10).setValues([['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']]);
  if (vals.length) shDt.getRange(2, 1, vals.length, 10).setValues(vals);
  shDt.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#dbeafe');
  bumpTheHe();
}

/* ---- danh sách tab "bẩn" (danh dấu trong onEdit) ---- */

function danhDauDirty(name) {
  const cache = CacheService.getScriptCache();
  const danhSach = JSON.parse(cache.get('DIRTY_LIST') || '[]');
  if (danhSach.indexOf(name) === -1) {
    danhSach.push(name);
    cache.put('DIRTY_LIST', JSON.stringify(danhSach), 21600);
  }
}

function layVaXoaDirty() {
  const cache = CacheService.getScriptCache();
  const ds = JSON.parse(cache.get('DIRTY_LIST') || '[]');
  cache.remove('DIRTY_LIST');
  return ds;
}

function laTabGiaoVien(ss, name) {
  const cache = CacheService.getScriptCache();
  let ds = cache.get('TAB_LIST');
  if (!ds) {
    ds = JSON.stringify(docDanhMuc(ss).map(function (r) { return r['TabName']; }));
    cache.put('TAB_LIST', ds, 600);
  }
  return JSON.parse(ds).indexOf(name) !== -1;
}

/* ========================= 6) CÀI ĐẶT BAN ĐẦU ========================= */

/** CHẠY MỘT LẦN duy nhất khi bắt đầu: tạo tab mẫu, mật khẩu admin, trigger tự động */
function caiDatHeThong() {
  const ss = moSheet();
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_PASSWORD')) props.setProperty('ADMIN_PASSWORD', MAT_KHAU_MAC_DINH);

  // Tab quản trị
  taoTabVoiHeader(ss, TAB.DANH_MUC, ['STT', 'Khoi', 'Lop', 'Mon', 'GiaoVien', 'Email', 'TabName', 'HocKy', 'SoHS', 'CapNhatCuoi', 'GhiChu']);
  taoTabVoiHeader(ss, TAB.DIEM_TONG, ['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']);
  taoTabVoiHeader(ss, TAB.HOSO, ['MaDinhDanh', 'HoTen', 'NgaySinh', 'Lop', 'GVCN']);

  const meta = ss.getSheetByName(TAB.META) || ss.insertSheet(TAB.META);
  if (meta.getLastRow() === 0) {
    meta.getRange(1, 1, 6, 2).setValues([
      ['Khoa', 'GiaTri'],
      ['TEN_TRUONG', CAU_HINH_MAC_DINH.TEN_TRUONG],
      ['PHU_DE', CAU_HINH_MAC_DINH.PHU_DE],
      ['HOC_KY', CAU_HINH_MAC_DINH.HOC_KY],
      ['HOC_KY_LOC', CAU_HINH_MAC_DINH.HOC_KY_LOC],
      ['GHI_CHU', CAU_HINH_MAC_DINH.GHI_CHU],
    ]);
    meta.getRange('A1:B1').setFontWeight('bold');
  }

  // Dữ liệu mẫu: 1 lớp 8A1 với 2 môn — chạy thử toàn hệ thống
  if (docDanhMuc(ss).length === 0) {
    luuDanhMuc({ Khoi: '8', Lop: '8A1', Mon: 'Toán', GiaoVien: 'GV mẫu A', TabName: '8A1-Toán', HocKy: 'HK1' });
    luuDanhMuc({ Khoi: '8', Lop: '8A1', Mon: 'Ngữ văn', GiaoVien: 'GV mẫu B', TabName: '8A1-Ngữ văn', HocKy: 'HK1' });
    const t1 = ss.getSheetByName('8A1-Toán');
    t1.getRange(2, 1, 3, 7).setValues([
      ['012345678901', 'Nguyễn Văn An (mẫu)', '05/03/2012', '8.5', '9', '8', '9'],
      ['012345678902', 'Trịnh Thị Bình (mẫu)', '12/09/2012', '7', '7.5', '6', '8'],
      ['012345678903', 'Lê Văn Cường (mẫu)', '21/11/2012', '9', '8.5', '9', '10'],
    ]);
    const t2 = ss.getSheetByName('8A1-Ngữ văn');
    t2.getRange(2, 1, 3, 7).setValues([
      ['012345678901', 'Nguyễn Văn An (mẫu)', '05/03/2012', '7.5', '8', '7', '8.5'],
      ['012345678902', 'Trịnh Thị Bình (mẫu)', '12/09/2012', '8', '8', '8.5', '9'],
      ['012345678903', 'Lê Văn Cường (mẫu)', '21/11/2012', '6.5', '7', '6', '7.5'],
    ]);
  }

  // Kéo lại dòng STT cho DANH_MUC
  keoLaiSTT(ss.getSheetByName(TAB.DANH_MUC));

  // Trigger tự động: gộp mỗi 5 phút + gộp lại toàn cục mỗi 6 giờ
  caiTrigger();

  // Chạy gộp lần đầu + khóa các tab quản trị (chỉ admin sửa được)
  dongBoTatCa();
  khoaTabQuanTri(ss);

  Logger.log('Cài đặt xong! Mật khẩu admin mặc định: ' + MAT_KHAU_MAC_DINH + ' — hãy đổi trong trang admin.');
}

function caiTrigger() {
  const cu = ScriptApp.getProjectTriggers();
  cu.forEach(function (t) {
    if (t.getHandlerFunction() === 'xuLyDongBo' || t.getHandlerFunction() === 'dongBoTatCa') {
      ScriptApp.deleteTrigger(t);
    }
  });
  ScriptApp.newTrigger('xuLyDongBo').timeBased().everyMinutes(5).create();
  ScriptApp.newTrigger('dongBoTatCa').timeBased().everyHours(6).create();
}

/** Tạo tab GV mới với header sổ điểm + khóa tab: chỉ GV (theo email) + admin được sửa */
function taoTabGiaoVien(ss, dm) {
  const sh = ss.insertSheet(dm['TabName']);
  sh.getRange(1, 1, 1, 7).setValues([['MaDinhDanh', 'HoTen', 'NgaySinh', 'TX1', 'TX2', 'GK', 'CK']]);
  sh.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#dcfce7');
  sh.setFrozenRows(1);
  sh.getRange('A:B').setHorizontalAlignment('left');

  const p = sh.protect().setDescription('Tab điểm của ' + (dm['GiaoVien'] || dm['TabName']));
  p.setWarningOnly(false);
  String(dm['Email'] || '').split(/[;,\s]+/).forEach(function (email) {
    email = email.trim();
    if (email) { try { p.addEditor(email); } catch (err) { /* email không hợp lệ: bỏ qua */ } }
  });
  return sh;
}

function khoaTabQuanTri(ss) {
  [TAB.DANH_MUC, TAB.DIEM_TONG, TAB.HOSO, TAB.META].forEach(function (ten) {
    const sh = ss.getSheetByName(ten);
    if (!sh) return;
    try {
      const p = sh.protect().setDescription('Chỉ admin được chỉnh tab ' + ten);
      p.setWarningOnly(false);
      // không thêm editor nào ngoài chủ sở hữu
    } catch (err) { /* đã bảo vệ từ trước */ }
  });
}

/* ========================= TIỆN ÍCH DỮ LIỆU ========================= */

function moSheet() {
  if (!SHEET_ID || SHEET_ID.indexOf('DAN_SHEET_ID') === 0) {
    throw new Error('Chưa cấu hình SHEET_ID trong Code.gs');
  }
  const ss = SpreadsheetApp.openById(SHEET_ID);
  ss.getSheets();
  return ss;
}

function docSheet(ss, ten) {
  const sh = ss.getSheetByName(ten);
  if (!sh) return [];
  const giaTri = sh.getDataRange().getDisplayValues();
  if (giaTri.length < 2) return [];
  const dau = giaTri[0].map(function (c) { return String(c).trim(); });
  return giaTri.slice(1).map(function (row) {
    const obj = {};
    dau.forEach(function (cot, i) { obj[cot || ('cot' + i)] = row[i] === undefined ? '' : String(row[i]).trim(); });
    return obj;
  });
}

function docDanhMuc(ss) {
  const rows = docSheet(ss, TAB.DANH_MUC).filter(function (r) { return r['TabName']; });
  return rows.sort(function (a, b) {
    const ka = parseInt(a['Khoi'], 10) || 0, kb = parseInt(b['Khoi'], 10) || 0;
    if (ka !== kb) return ka - kb;
    const l = String(a['Lop']).localeCompare(String(b['Lop']), 'vi', { numeric: true });
    if (l) return l;
    return String(a['Mon']).localeCompare(String(b['Mon']), 'vi');
  });
}

function docMeta(ss) {
  const rows = docSheet(ss, TAB.META);
  const m = {};
  rows.forEach(function (r) { if (r['Khoa']) m[r['Khoa']] = r['GiaTri'] || ''; });
  return m;
}

function ghiMeta(ss, khoa, giaTri) {
  const sh = ss.getSheetByName(TAB.META) || ss.insertSheet(TAB.META);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 2).setValues([['Khoa', 'GiaTri']]).setFontWeight('bold');
  }
  const khoaTab = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues() : [];
  for (let i = 0; i < khoaTab.length; i++) {
    if (String(khoaTab[i][0]).trim() === khoa) {
      sh.getRange(i + 2, 2).setValue(giaTri);
      return;
    }
  }
  sh.getRange(sh.getLastRow() + 1, 1, 1, 2).setValues([[khoa, giaTri]]);
}

function ghiDongDanhMuc(ss, moi, stt) {
  const sh = ss.getSheetByName(TAB.DANH_MUC) || (function () {
    const s = ss.insertSheet(TAB.DANH_MUC);
    s.getRange(1, 1, 1, 11).setValues([['STT', 'Khoi', 'Lop', 'Mon', 'GiaoVien', 'Email', 'TabName', 'HocKy', 'SoHS', 'CapNhatCuoi', 'GhiChu']]);
    return s;
  })();

  const dong = [moi['STT'] || '', moi['Khoi'], moi['Lop'], moi['Mon'], moi['GiaoVien'], moi['Email'], moi['TabName'], moi['HocKy'], moi['SoHS'] || '', moi['CapNhatCuoi'] || '', moi['GhiChu']];

  if (stt !== undefined && stt !== '') {
    sh.getRange(Number(stt) + 1, 2, 1, 10).setValues([dong.slice(1)]);
  } else {
    sh.appendRow([''].concat(dong.slice(1)));
    // kéo STT
    const n = sh.getLastRow();
    sh.getRange(n, 1).setValue(String(n - 1));
  }
}

/** Đánh lại số thứ tự cột STT của tab DANH_MUC sau khi thêm/xóa dòng */
function keoLaiSTT(shDm) {
  const n = shDm.getLastRow();
  if (n < 2) return;
  const stt = [];
  for (let i = 1; i <= n - 1; i++) stt.push([String(i)]);
  shDm.getRange(2, 1, stt.length, 1).setValues(stt);
}

function capNhatTrangThaiDanhMuc(ss, tabName, soHS, capNhat) {  const sh = ss.getSheetByName(TAB.DANH_MUC);
  const vals = sh.getDataRange().getValues();
  const header = vals[0].map(function (c) { return String(c).trim(); });
  const colTab = header.indexOf('TabName');
  for (let i = 1; i < vals.length; i++) {
    if (String(vals[i][colTab]).trim() === String(tabName)) {
      sh.getRange(i + 1, header.indexOf('SoHS') + 1).setValue(soHS ? String(soHS) : '');
      sh.getRange(i + 1, header.indexOf('CapNhatCuoi') + 1).setValue(capNhat);
      return;
    }
  }
}

function taoTabVoiHeader(ss, ten, header) {
  let sh = ss.getSheetByName(ten);
  if (!sh) sh = ss.insertSheet(ten);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, header.length).setValues([header]);
    sh.getRange(1, 1, 1, header.length).setFontWeight('bold').setBackground('#dbeafe');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ---- chống spam & bộ đệm thế hệ ---- */

function normId(s) { return String(s || '').replace(/\s+/g, '').toUpperCase(); }

function chongSpam(id) {
  const cache = CacheService.getScriptCache();
  if (cache.get('LAN:' + id)) return false;
  cache.put('LAN:' + id, '1', TRANH_GIAY);
  const props = PropertiesService.getScriptProperties();
  const homNay = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd');
  const ngayCu = props.getProperty('NGAY_DEM') || '';
  let so = Number(props.getProperty('SO_LUOT') || '0');
  if (ngayCu !== homNay) { so = 0; props.setProperty('NGAY_DEM', homNay); }
  so++;
  props.setProperty('SO_LUOT', String(so));
  return so <= GIOI_HAN_NGAY;
}

/** Tăng "thế hệ" bộ đệm → mọi kết quả tra cứu cũ mất hiệu lực ngay */
function lamMoiCache() { bumpTheHe(); }
function bumpTheHe() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('CACHE_GEN', String((Number(props.getProperty('CACHE_GEN') || '0') + 1)));
}

/* ========================= TRẢ KẾT QUẢ ========================= */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Dùng nội bộ khi doPost nhận data dạng chuỗi JSON */
function anJson(s) {
  try { return typeof s === 'string' ? JSON.parse(s || '{}') : (s || {}); }
  catch (e) { return {}; }
}
