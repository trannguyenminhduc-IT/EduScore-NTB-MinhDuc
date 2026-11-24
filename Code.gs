/**
 * ============================================================================
 *  BACKEND TRA Cá»¨U ÄIá»‚M v2.0 â€” TRÆ¯á»œNG THCS NGUYá»„N THÃI BÃŒNH
 * ============================================================================
 *  MÃ” HÃŒNH PHÃ‚N TÃN (má»—i giÃ¡o viÃªn 1 tab, há»‡ thá»‘ng tá»± gá»™p):
 *
 *    GV ToÃ¡n 8A1 â”€â”  GV VÄƒn 8A1 â”€â”  GV ToÃ¡n 8A2 â”€â”   (má»—i GV nháº­p tab riÃªng
 *                 â”‚               â”‚               â”‚    "Lá»›p-MÃ´n" trong CÃ™NG
 *                 â–¼               â–¼               â–¼    má»™t Google Sheet)
 *           [Tab 8A1-ToÃ¡n]  [Tab 8A1-Ngá»¯ vÄƒn]  [Tab 8A2-ToÃ¡n]
 *                 â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 *                        onEdit Ä‘Ã¡nh dáº¥u "cÃ³ thay Ä‘á»•i"
 *                                 â–¼
 *              Äá»“ng bá»™ tá»± Ä‘á»™ng (má»—i 5 phÃºt) hoáº·c "Äá»“ng bá»™ ngay"
 *                                 â–¼
 *        [Tab DIEM_TONG] â€” lÆ°u theo thá»© tá»± KHá»I â†’ Lá»šP â†’ MÃ”N
 *                                 â–¼
 *                  Trang index.html tra cá»©u theo mÃ£ Ä‘á»‹nh danh
 *
 *  TRANG QUáº¢N TRá»Š admin.html (Ä‘Äƒng nháº­p báº±ng máº­t kháº©u):
 *    - Quáº£n lÃ½ danh má»¥c khá»‘i/lá»›p/mÃ´n/GV (tá»± táº¡o tab + khÃ³a tab cho GV)
 *    - Chá»‰nh cáº¥u hÃ¬nh trang cÃ´ng khai (tÃªn trÆ°á»ng, há»c ká»³, ghi chÃº...)
 *    - Äá»“ng bá»™ ngay, Ä‘á»•i máº­t kháº©u admin
 *
 *  CÃC BÆ¯á»šC TRIá»‚N KHAI (chi tiáº¿t HUONG-DAN.md):
 *    1. Táº¡o Google Sheet trung tÃ¢m â†’ dÃ¡n ID vÃ o SHEET_ID bÃªn dÆ°á»›i.
 *    2. Táº¡o Apps Script â†’ dÃ¡n file nÃ y â†’ cháº¡y caiDatHeThong() Má»˜T Láº¦N
 *       (táº¡o tab máº«u + máº­t kháº©u admin máº·c Ä‘á»‹nh + cÃ i trigger tá»± Ä‘á»™ng).
 *    3. Deploy â†’ Web app (Execute as: Me, Access: Anyone) â†’ copy URL
 *       Ä‘iá»n vÃ o SCRIPT_URL cá»§a index.html vÃ  admin.html.
 *    4. Chia sáº» Sheet trung cáº¥p cho giÃ¡o viÃªn vá»›i quyá»n "TrÃ¬nh chá»‰nh sá»­a";
 *       má»—i GV chá»‰ sá»­a Ä‘Æ°á»£c tab cá»§a mÃ¬nh (Ä‘Ã£ khÃ³a báº±ng Protection).
 * ============================================================================
 */

/* ========================= Cáº¤U HÃŒNH ========================= */

// ID Google Sheet trung tÃ¢m (tá»« URL: docs.google.com/spreadsheets/d/<ID>/edit)
const SHEET_ID = '1Bg7Iw9NidXyT_0407Vs_fs5UoGnsmAvXX7KXf-mcrvA';

const TAB = {
  DANH_MUC:  'DANH_MUC',   // Khoi|Lop|Mon|GiaoVien|Email|TabName|HocKy|SoHS|CapNhatCuoi|GhiChu
  DIEM_TONG: 'DIEM_TONG',  // Khoi|Lop|Mon|GiaoVien|HocKy|NamHoc|MaDinhDanh|HoTen|LoaiDiem|DiemSo|CapNhat
  HOSO:      'HOSO',       // MaDinhDanh|HoTen|NgaySinh|Lop|GVCN
  META:      'META',       // Khoa|GiaTri
  GVCN:      'GVCN',       // Lop|GVCN|Email|DienThoai â€” danh sÃ¡ch giÃ¡o viÃªn chá»§ nhiá»‡m theo lá»›p
  NHAT_KY:   'NHAT_KY',    // ThoiGian|HanhDong|ChiTiet|SoDong|Nguoi
};

const CAU_HINH_MAC_DINH = {
  TEN_TRUONG:  'TrÆ°á»ng THCS Nguyá»…n ThÃ¡i BÃ¬nh',
  PHU_DE:      'Cá»•ng tra cá»©u káº¿t quáº£ há»c táº­p',
  HOC_KY:      'Há»c ká»³ 1 â€” NÄƒm há»c 2026-2027',
  HOC_KY_LOC:  'HK1',
  NAM_HOC:     '2026-2027',
  GUI_EMAIL:   'false',
  GHI_CHU:     'MÃ£ Ä‘á»‹nh danh gá»“m cÃ¡c chá»¯ sá»‘ do giÃ¡o viÃªn chá»§ nhiá»‡m cung cáº¥p',
};

const CACHE_GIAY   = 600;  // bá»™ Ä‘á»‡m káº¿t quáº£ tra cá»©u: 10 phÃºt
const TOKEN_GIAY   = 6 * 3600; // phiÃªn Ä‘Äƒng nháº­p admin: 6 giá»
const TRANH_GIAY   = 5;    // má»—i mÃ£ Ä‘á»‹nh danh nghá»‰ 5 giÃ¢y giá»¯a 2 lÆ°á»£t tra
const GIOI_HAN_NGAY = 5000;
const MAT_KHAU_MAC_DINH = 'ntb2026'; // Ä‘á»•i ngay á»Ÿ trang admin sau khi triá»ƒn khai

/* ========================= ROUTER CHÃNH ========================= */

function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    if (p.action === 'config')     return json(layCauHinhCongKhai());
    if (p.action === 'login')      return json(dangNhapAdmin(p.pw || ''));
    if (p.action === 'dashboard')  return json(canBo(p.token, layDashboard));
    if (p.action === 'auditLog')   return json(canBo(p.token, layNhatKy));
    if (p.action === 'backupJson') return json(canBo(p.token, xuatBackupJson));
    if (p.action === 'exportCsv')  return json(canBo(p.token, () => xuatCsv(p.tab || '')));
    if (p.action === 'gvcnVerify') return json(canBo(p.token, () => xacMinhGvcn(p.text || '')));
    if (p.id)                      return json(traCuu(p.id, p.dob || ''));
    return json({ error: 'Thiáº¿u tham sá»‘ truy váº¥n.' });
  } catch (err) {
    console.error(err);
    return json({ error: 'Há»‡ thá»‘ng Ä‘ang báº­n, vui lÃ²ng thá»­ láº¡i sau Ã­t phÃºt.' });
  }
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      case 'registrySave':   return json(canBo(p.token, () => luuDanhMuc(anJson(p.data))));
      case 'registryDelete': return json(canBo(p.token, () => xoaDanhMuc(p.tabName, p.xoaTab === '1')));
      case 'configSave':     return json(canBo(p.token, () => luuCauHinh(anJson(p.data))));
      case 'syncNow':        return json(canBo(p.token, () => dongBoTatCa(true)));
      case 'napDiem':        return json(canBo(p.token, () => napDiemTuFile(anJson(p.data))));
      case 'changePassword': return json(canBo(p.token, () => doiMatKhau(p.oldPw || '', p.newPw || '')));
      case 'gvcnSave':       return json(canBo(p.token, () => luuGvcn(p.text || '')));
      case 'gvcnVerify':     return json(canBo(p.token, () => xacMinhGvcn(p.text || '')));
      case 'xoaToanBoDiem':  return json(canBo(p.token, xoaToanBoDiem));
      case 'backupDrive':    return json(canBo(p.token, saoLuuDrive));
      case 'restoreBackup':  return json(canBo(p.token, () => khoiPhuc(anJson(p.data))));
      default: return json({ error: 'KhÃ´ng rÃµ yÃªu cáº§u.' });
    }
  } catch (err) {
    console.error(err);
    return json({ error: 'Thao tÃ¡c tháº¥t báº¡i: ' + (err && err.message ? err.message : 'lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh') });
  }
}

/* ========================= 1) TRA Cá»¨U CÃ”NG KHAI ========================= */

function traCuu(idRaw, dobRaw) {
  const id = normId(idRaw);
  if (!id) return { error: 'Vui lÃ²ng cung cáº¥p mÃ£ Ä‘á»‹nh danh há»c sinh.' };
  if (!/^[\dA-Za-z]{8,20}$/.test(id)) return { error: 'MÃ£ Ä‘á»‹nh danh khÃ´ng há»£p lá»‡ (thÆ°á»ng gá»“m 10â€“12 chá»¯ sá»‘).' };
  if (!chongSpam(id)) return { error: 'Báº¡n tra cá»©u quÃ¡ nhanh. Vui lÃ²ng Ä‘á»£i vÃ i giÃ¢y rá»“i thá»­ láº¡i.' };

  const ss = moSheet();
  const hosoRow = timHocSinhRaw(ss, id);
  if (!hosoRow) return { error: 'KhÃ´ng tÃ¬m tháº¥y há»c sinh vá»›i mÃ£ Ä‘á»‹nh danh nÃ y. Vui lÃ²ng liÃªn há»‡ giÃ¡o viÃªn chá»§ nhiá»‡m.' };

  const hoso = chuyenHosoProfile(ss, hosoRow);
  const dobHs = chuanHoaNgay(hosoRow['NgaySinh'] || '');
  const dobNhap = chuanHoaNgay(dobRaw || '');

  // BÆ°á»›c xÃ¡c minh: báº¯t buá»™c nháº­p ngÃ y sinh trÃ¹ng vá»›i há»“ sÆ¡
  if (!dobNhap) {
    return { ok: false, needVerify: true, message: 'Vui lÃ²ng nháº­p ngÃ y sinh (dd/mm/yyyy) Ä‘á»ƒ xÃ¡c minh.' };
  }
  if (!dobHs || dobNhap !== dobHs) {
    return { ok: false, needVerify: true, error: 'NgÃ y sinh khÃ´ng khá»›p. Vui lÃ²ng kiá»ƒm tra láº¡i.' };
  }

  const meta = docMeta(ss);
  const namHocLoc = meta.NAM_HOC || CAU_HINH_MAC_DINH.NAM_HOC;
  const hocKyLoc = meta.HOC_KY_LOC || CAU_HINH_MAC_DINH.HOC_KY_LOC;

  const cache = CacheService.getScriptCache();
  const theHe = (PropertiesService.getScriptProperties().getProperty('CACHE_GEN') || '0');
  const cacheKey = 'G' + theHe + ':HS:' + id + ':' + namHocLoc + ':' + hocKyLoc;
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const payload = {
    ok: true,
    namHoc: namHocLoc,
    capNhat: meta.CAP_NHAT ? ('Dá»¯ liá»‡u cáº­p nháº­t: ' + meta.CAP_NHAT) : ('Há»c ká»³: ' + meta.HOC_KY),
    hocKy: meta.HOC_KY,
    data: { profile: hoso, subjects: docDiemTong(ss, id, hocKyLoc, namHocLoc) },
  };
  cache.put(cacheKey, JSON.stringify(payload), CACHE_GIAY);
  return payload;
}

function docDiemTong(ss, id, hocKyLoc, namHocLoc) {
  const rows = docSheet(ss, TAB.DIEM_TONG);
  const subjects = {};
  rows.forEach(function (r) {
    if (normId(r['MaDinhDanh'] || '') !== id) return;
    const hk = r['HocKy'] || '';
    if (hocKyLoc && hk && hk !== hocKyLoc) return;
    const nh = r['NamHoc'] || '';
    if (namHocLoc && nh && nh !== namHocLoc) return;
    const mon = chuanHoaMon(r['Mon']) || 'KhÃ¡c';
    const diem = r['DiemSo'] || '';
    if (diem === '' && !(r['LoaiDiem'] || '')) return;
    if (!subjects[mon]) subjects[mon] = [];
    subjects[mon].push({ loaiDiem: r['LoaiDiem'] || 'Äiá»ƒm', diemSo: diem });
  });
  // Tráº£ vá» theo Ä‘Ãºng thá»© tá»± mÃ´n chÆ°Æ¡ng trÃ¬nh (ká»ƒ cáº£ vá»›i dá»¯ liá»‡u cÅ© Ä‘Ã£ lÆ°u)
  const sapXep = Object.keys(subjects).sort(function (a, b) {
    return thuTuMon(a) - thuTuMon(b) || a.localeCompare(b, 'vi');
  });
  const ketQua = {};
  sapXep.forEach(function (m) { ketQua[m] = subjects[m]; });
  return ketQua;
}

function timHocSinhRaw(ss, id) {
  const rows = docSheet(ss, TAB.HOSO);
  return rows.filter(function (r) { return normId(r['MaDinhDanh'] || '') === id; })[0] || null;
}

function chuyenHosoProfile(ss, row) {
  if (!row) return null;
  const id = row['MaDinhDanh'];
  const p = {};
  if (row['HoTen'])    p['HoTen'] = row['HoTen'];
  if (row['NgaySinh']) p['NgaySinh'] = row['NgaySinh'];
  if (row['Lop'])      p['Lop'] = row['Lop'];
  if (row['GVCN'])     p['GVCN'] = row['GVCN'];
  if (p['Lop']) {
    try {
      const ct = docGvcnChiTiet(ss)[p['Lop']];
      if (ct) {
        if (!p['GVCN'] && ct.ten) p['GVCN'] = ct.ten;
        if (ct.phone) p['SDT_GVCN'] = ct.phone;
        if (ct.email) p['Email_GVCN'] = ct.email;
      }
    } catch (e) {}
  }
  if (!p['GVCN'] && p['Lop']) {
    try {
      const gvcn = docGvcn(ss)[p['Lop']];
      if (gvcn) p['GVCN'] = gvcn;
    } catch (e) {}
  }
  p['MaDinhDanh'] = row['MaDinhDanh'] || id;
  return p;
}

function timHocSinh(ss, id) {
  const row = timHocSinhRaw(ss, id);
  return row ? chuyenHosoProfile(ss, row) : null;
}

/* ---- Danh sÃ¡ch GVCN theo lá»›p (tab GVCN: Lop|GVCN) ---- */

function docGvcn(ss) {
  const map = {};
  docSheet(ss, TAB.GVCN).forEach(function (r) {
    const lop = String(r['Lop'] || '').trim();
    if (lop) map[lop] = String(r['GVCN'] || '').trim();
  });
  return map;
}

/** Nháº­n vÄƒn báº£n nhiá»u dÃ²ng dáº¡ng "8A1 - Tráº§n VÄƒn B" (phÃ¢n cÃ¡ch bá»Ÿi - , ; :) */
function luuGvcn(text) {
  const ss = moSheet();
  damBaoCotGvcn(ss);
  const sh = taoTabVoiHeader(ss, TAB.GVCN, ['Lop', 'GVCN', 'Email', 'DienThoai']);
  const dong = [];
  String(text || '').split(/\r?\n/).forEach(function (line) {
    if (!line.trim()) return;
    const parts = line.indexOf('|') >= 0 ? line.split('|') : line.split(/[-,;:]/);
    const lop = String(parts[0] || '').trim();
    const gv = String(parts[1] || '').trim();
    const email = String(parts[2] || '').trim();
    const phone = String(parts[3] || '').trim();
    if (lop && gv) dong.push([lop, gv, email, phone]);
  });
  sh.clearContents();
  sh.getRange(1, 1, 1, 4).setValues([['Lop', 'GVCN', 'Email', 'DienThoai']]);
  sh.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#dbeafe');
  if (dong.length) sh.getRange(2, 1, dong.length, 4).setValues(dong);
  sh.setFrozenRows(1);
  bumpTheHe();
  ghiNhatKy('GVCN', 'Cáº­p nháº­t danh sÃ¡ch giÃ¡o viÃªn chá»§ nhiá»‡m', dong.length);
  return { ok: true, msg: 'ÄÃ£ lÆ°u danh sÃ¡ch GVCN cho ' + dong.length + ' lá»›p.', soLop: dong.length };
}

/** XÃ³a toÃ n bá»™ Ä‘iá»ƒm (tab DIEM_TONG) â€” giá»¯ láº¡i há»“ sÆ¡ há»c sinh */
function xoaToanBoDiem() {
  const ss = moSheet();
  const shDt = ss.getSheetByName(TAB.DIEM_TONG);
  if (shDt) {
    shDt.clearContents();
    shDt.getRange(1, 1, 1, 11).setValues([['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'NamHoc', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']]);
    shDt.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#dbeafe');
    shDt.setFrozenRows(1);
  }
  bumpTheHe();
  ghiMeta(ss, 'CAP_NHAT', Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') + ' (Ä‘Ã£ xÃ³a toÃ n bá»™ Ä‘iá»ƒm)');
  ghiNhatKy('XÃ³a Ä‘iá»ƒm', 'XÃ³a toÃ n bá»™ Ä‘iá»ƒm há»c sinh', '');
  return { ok: true, msg: 'ÄÃ£ xÃ³a TOÃ€N Bá»˜ Ä‘iá»ƒm. Há»“ sÆ¡ há»c sinh (HOSO) Ä‘Æ°á»£c giá»¯ nguyÃªn.' };
}

/* ========================= 2) Cáº¤U HÃŒNH CÃ”NG KHAI ========================= */

function layCauHinhCongKhai() {
  const meta = docMeta(moSheet());
  return {
    ok: true,
    tenTruong: meta.TEN_TRUONG || CAU_HINH_MAC_DINH.TEN_TRUONG,
    phuDe:     meta.PHU_DE || CAU_HINH_MAC_DINH.PHU_DE,
    hocKy:     meta.HOC_KY || CAU_HINH_MAC_DINH.HOC_KY,
    namHoc:    meta.NAM_HOC || CAU_HINH_MAC_DINH.NAM_HOC,
    capNhat:   meta.CAP_NHAT || '',
    ghiChu:    meta.GHI_CHU || CAU_HINH_MAC_DINH.GHI_CHU,
  };
}

/* ========================= 3) XÃC THá»°C ADMIN ========================= */

function dangNhapAdmin(pw) {
  const cache = CacheService.getScriptCache();
  const soSai = Number(cache.get('SAI_MK') || '0');
  if (soSai >= 5) return { error: 'ÄÃ£ khÃ³a táº¡m thá»i do nháº­p sai nhiá»u láº§n. Thá»­ láº¡i sau 10 phÃºt.' };

  const props = PropertiesService.getScriptProperties();
  let dung = props.getProperty('ADMIN_PASSWORD');
  if (!dung) { dung = MAT_KHAU_MAC_DINH; props.setProperty('ADMIN_PASSWORD', dung); }

  if (pw !== dung) {
    cache.put('SAI_MK', String(soSai + 1), 600);
    return { error: 'Máº­t kháº©u khÃ´ng Ä‘Ãºng.' };
  }
  cache.remove('SAI_MK');
  const token = Utilities.getUuid();
  cache.put('ADMTOK:' + token, '1', TOKEN_GIAY);
  try { ghiNhatKy('ÄÄƒng nháº­p', 'ÄÄƒng nháº­p quáº£n trá»‹ thÃ nh cÃ´ng', ''); } catch (e) {}
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
  if (String(newPw).length < 6) return { error: 'Máº­t kháº©u má»›i pháº£i tá»« 6 kÃ½ tá»± trá»Ÿ lÃªn.' };
  const props = PropertiesService.getScriptProperties();
  const dung = props.getProperty('ADMIN_PASSWORD') || MAT_KHAU_MAC_DINH;
  if (oldPw !== dung) return { error: 'Máº­t kháº©u hiá»‡n táº¡i khÃ´ng Ä‘Ãºng.' };
  props.setProperty('ADMIN_PASSWORD', newPw);
  ghiNhatKy('Máº­t kháº©u', 'Äá»•i máº­t kháº©u quáº£n trá»‹', '');
  return { ok: true, msg: 'ÄÃ£ Ä‘á»•i máº­t kháº©u admin.' };
}

/* ========================= 4) DASHBOARD ADMIN ========================= */

function layDashboard() {
  const ss = moSheet();
  const dm = docDanhMuc(ss);
  const dt = docSheet(ss, TAB.DIEM_TONG);
  const hoso = docSheet(ss, TAB.HOSO);
  const meta = docMeta(ss);
  // Thá»‘ng kÃª láº¥y tá»« DIEM_TONG (bao gá»“m cáº£ Ä‘iá»ƒm náº¡p tá»« file, khÃ´ng chá»‰ tab GV)
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
      NAM_HOC: meta.NAM_HOC || CAU_HINH_MAC_DINH.NAM_HOC,
      GUI_EMAIL: meta.GUI_EMAIL || CAU_HINH_MAC_DINH.GUI_EMAIL,
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
 * Náº¡p hÃ ng loáº¡t Ä‘iá»ƒm tá»« file xuáº¥t ra (SMIS/Excel/CSV Ä‘Ã£ Ä‘á»c á»Ÿ trÃ¬nh duyá»‡t).
 * d = { khoi, lop, mon, giaoVien, hocKy, cheDo:'thay'|'them',
 *       rows: [{ ma, hoTen, ngaySinh, lop?, mon?, diem: [{loaiDiem, diemSo}] }] }
 * - Bá»‘ cá»¥c Rá»˜NG: khai bÃ¡o lop/mon chung á»Ÿ d; cÃ¡c cá»™t Ä‘iá»ƒm Ä‘Ã£ chuyá»ƒn thÃ nh máº£ng diem.
 * - Bá»‘ cá»¥c DÃ€I: má»—i dÃ²ng 1 Ä‘iá»ƒm; lop/mon cÃ³ thá»ƒ náº±m riÃªng á»Ÿ tá»«ng dÃ²ng (it.lop/it.mon).
 * Ghi trá»±c tiáº¿p vÃ o DIEM_TONG (cheDo='thay' â†’ thay toÃ n bá»™ cÃ¡c khá»‘i Lá»›pâ€“MÃ´nâ€“Há»c ká»³ liÃªn quan),
 * tá»± bá»• sung HOSO, lÆ°u thá»i Ä‘iá»ƒm cáº­p nháº­t.
 */
function napDiemTuFile(d) {
  if (!d || !d.rows || !d.rows.length) return { error: 'KhÃ´ng cÃ³ dÃ²ng dá»¯ liá»‡u nÃ o Ä‘á»ƒ náº¡p.' };

  const ss = moSheet();
  const meta = docMeta(ss);
  const namHoc = String(d.namHoc || meta.NAM_HOC || CAU_HINH_MAC_DINH.NAM_HOC).trim();
  const capNhat = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
  const hangMoi = [];
  const nhomThayThe = {}; // "lop|mon|hocKy" â†’ 1
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
      hangMoi.push([String(d.khoi || ''), lop, mon, String(it.giaoVien || d.giaoVien || ''), hocKy, namHoc, ma,
                    String(it.hoTen || '').trim(), String(x.loaiDiem || 'Äiá»ƒm').trim(), diem, capNhat]);
    });
  });
  if (!hangMoi.length) return { error: 'KhÃ´ng Ä‘á»c Ä‘Æ°á»£c dÃ²ng Ä‘iá»ƒm nÃ o há»£p lá»‡ (thiáº¿u MÃ£ Ä‘á»‹nh danh / Lá»›p / MÃ´n / giÃ¡ trá»‹ Ä‘iá»ƒm).' };

  // Tá»± táº¡o tab kho Ä‘iá»ƒm náº¿u chÆ°a tá»“n táº¡i (chá»‘ng lá»—i khi chÆ°a cháº¡y caiDatHeThong)
  const shDt = taoTabVoiHeader(ss, TAB.DIEM_TONG, ['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'NamHoc', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']);
  damBaoCotNamHoc(ss);
  let vals = shDt.getLastRow() > 1 ? shDt.getRange(2, 1, shDt.getLastRow() - 1, 11).getValues() : [];
  if ((d.cheDo || 'thay') === 'thay') {
    const thay = nhomThayThe;
    vals = vals.filter(function (r) {
      const key = String(r[1]).trim() + '|' + String(r[2]).trim() + '|' + String(r[4]).trim();
      return !thay[key];
    });
  }
  vals = vals.concat(hangMoi).sort(soSanhHangDiem);
  shDt.clearContents();
  shDt.getRange(1, 1, 1, 11).setValues([['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'NamHoc', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']]);
  if (vals.length) shDt.getRange(2, 1, vals.length, 11).setValues(vals);
  shDt.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#dbeafe');
  shDt.setFrozenRows(1);

  // Bá»• sung há»“ sÆ¡ (lá»›p ghi theo dÃ²ng dá»¯ liá»‡u náº¿u cÃ³)
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
  try { guiThongBaoDiemMoi(nhomThayThe, namHoc, String(d.hocKy || 'HK1'), ss); } catch (e) { console.error(e); }
  ghiNhatKy('Náº¡p Ä‘iá»ƒm', 'Náº¡p ' + hangMoi.length + ' Ä‘iá»ƒm (' + Object.keys(nhomThayThe).length + ' nhÃ³m)', hangMoi.length);
  const soNhom = Object.keys(nhomThayThe).length;
  return { ok: true, msg: 'ÄÃ£ náº¡p ' + hangMoi.length + ' Ä‘iá»ƒm (' + soNhom + ' nhÃ³m lá»›pâ€“mÃ´n) vÃ o há»‡ thá»‘ng.', soHang: hangMoi.length };
}

/** NhÆ° upsertHoso nhÆ°ng dÃ²ng Ä‘Ã£ tá»± kÃ¨m lá»›p (bá»‘ cá»¥c dÃ i cÃ³ thá»ƒ nhiá»u lá»›p trong 1 file) */
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
  if (!row) return { error: 'Thiáº¿u dá»¯ liá»‡u.' };
  const lop = String(row['Lop'] || '').trim();
  const mon = String(row['Mon'] || '').trim();
  if (!lop || !mon) return { error: 'Cáº§n nháº­p Ä‘á»§ Lá»›p vÃ  MÃ´n.' };

  const ss = moSheet();
  const dmRows = docDanhMuc(ss);
  let tabName = String(row['TabName'] || '').trim() || (lop + '-' + mon);

  // DÃ²ng Ä‘ang sá»­a (náº¿u cÃ³): láº¥y TabName cÅ© Ä‘á»ƒ Ä‘á»•i tÃªn tab tÆ°Æ¡ng á»©ng
  const sttSua = String(row['STT'] || '');
  const dongCu = sttSua ? dmRows.filter(function (r) { return r['STT'] === sttSua; })[0] : null;
  const tabCu = dongCu ? dongCu['TabName'] : '';

  // TrÃ¹ng tab khÃ¡c (khÃ¡c dÃ²ng Ä‘ang sá»­a) â†’ tá»± thÃªm háº­u sá»‘
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

  // Táº¡o tab má»›i HOáº¶C Ä‘á»•i tÃªn tab cÅ© cho khá»›p danh má»¥c
  const sh = ss.getSheetByName(tabName);
  if (!sh) {
    if (tabCu && ss.getSheetByName(tabCu)) ss.getSheetByName(tabCu).setName(tabName);
    else taoTabGiaoVien(ss, moi);
  }

  // Ghi láº¡i dÃ²ng danh má»¥c (sá»­a náº¿u khá»›p STT, ngÆ°á»£c láº¡i thÃªm)
  ghiDongDanhMuc(ss, moi, row['STT']);
  ghiNhatKy('Danh má»¥c', 'LÆ°u danh má»¥c ' + lop + ' Â· ' + mon, '');
  return { ok: true, msg: 'ÄÃ£ lÆ°u "' + lop + ' Â· ' + mon + '" (tab: ' + tabName + ')', danhMuc: docDanhMuc(ss) };
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
  if (xoaTai === -1) return { error: 'KhÃ´ng tÃ¬m tháº¥y dÃ²ng danh má»¥c.' };
  shDm.deleteRow(xoaTai);
  keoLaiSTT(shDm);

  // XÃ³a khá»‘i Ä‘iá»ƒm tÆ°Æ¡ng á»©ng trong DIEM_TONG
  xoaKhoiDiem(ss, String(tabName));

  if (xoaTab) {
    const sh = ss.getSheetByName(String(tabName));
    if (sh) ss.deleteSheet(sh);
  }
  ghiNhatKy('Danh má»¥c', 'XÃ³a danh má»¥c ' + tabName, '');
  return { ok: true, msg: 'ÄÃ£ xÃ³a "' + tabName + '" khá»i danh má»¥c.', danhMuc: docDanhMuc(ss) };
}

function luuCauHinh(d) {
  const ss = moSheet();
  const choPhep = ['TEN_TRUONG', 'PHU_DE', 'HOC_KY', 'HOC_KY_LOC', 'NAM_HOC', 'GUI_EMAIL', 'GHI_CHU'];
  choPhep.forEach(function (k) { if (d && d[k] !== undefined) ghiMeta(ss, k, String(d[k]).trim()); });
  bumpTheHe();
  ghiNhatKy('Cáº¥u hÃ¬nh', 'Cáº­p nháº­t cáº¥u hÃ¬nh trang cÃ´ng khai', '');
  return { ok: true, msg: 'ÄÃ£ lÆ°u cáº¥u hÃ¬nh trang cÃ´ng khai.' };
}

/* ========================= 5) Äá»’NG Bá»˜ Tá»° Äá»˜NG ========================= */

/** onEdit: chá»‰ ÄÃNH Dáº¤U tab bá»‹ sá»­a (nháº¹, cháº¡y ngay khi GV gÃµ) */
function onEdit(e) {
  try {
    const name = e.range.getSheet().getName();
    if (name === TAB.DANH_MUC || name === TAB.META || laTabGiaoVien(e.source, name)) {
      danhDauDirty(name);
    }
  } catch (err) { /* onEdit khÃ´ng Ä‘Æ°á»£c phÃ©p Ä‘á»• lá»—i */ }
}

/** Trigger má»—i 5 phÃºt: gá»™p cÃ¡c tab vá»«a bá»‹ sá»­a vÃ o DIEM_TONG */
function xuLyDongBo() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return; // cÃ³ láº§n cháº¡y khÃ¡c Ä‘ang gá»™p
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

/** Gá»™p láº¡i TOÃ€N Bá»˜ (nÃºt "Äá»“ng bá»™ ngay" + trigger an toÃ n má»—i 6 giá») */
function dongBoTatCa(ghiLog) {
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
    layVaXoaDirty(); // má»i thay Ä‘á»•i Ä‘Ã£ Ä‘Æ°á»£c gá»™p
    bumpTheHe();
    if (ghiLog) ghiNhatKy('Äá»“ng bá»™', 'Äá»“ng bá»™ táº¥t cáº£ tab: ' + soTab + ' tab', soTab);
    return { ok: true, msg: 'ÄÃ£ Ä‘á»“ng bá»™ ' + soTab + ' tab (khá»‘i/lá»›p/mÃ´n)' + (loi.length ? '. Lá»—i: ' + loi.join('; ') : '.'), soTab: soTab };
  } finally {
    lock.releaseLock();
  }
}

/** Gá»™p Má»˜T tab GV vÃ o DIEM_TONG (giá»¯ thá»© tá»± khá»‘i â†’ lá»›p â†’ mÃ´n) */
function dongBoBlock(ss, tabName) {
  const dm = docDanhMuc(ss).filter(function (r) { return r['TabName'] === String(tabName); })[0];
  if (!dm) return { error: 'KhÃ´ng cÃ³ trong danh má»¥c' };
  const sh = ss.getSheetByName(tabName);
  if (!sh) return { error: 'Tab khÃ´ng tá»“n táº¡i (Ä‘Ã£ bá»‹ Ä‘á»•i tÃªn?)' };

  // 1) Äá»c tab GV dáº¡ng lÆ°á»›i sá»• Ä‘iá»ƒm
  const items = docTabGiaoVien(sh);
  const capNhat = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm');
  const monChuan = chuanHoaMon(dm['Mon']);
  const namHoc = String((docMeta(ss).NAM_HOC) || CAU_HINH_MAC_DINH.NAM_HOC).trim();
  const hangMoi = [];
  items.forEach(function (it) {
    it.diem.forEach(function (d) {
      hangMoi.push([dm['Khoi'], dm['Lop'], monChuan, dm['GiaoVien'], dm['HocKy'], namHoc,
                    it.ma, it.hoTen, d.loaiDiem, d.diemSo, capNhat]);
    });
  });

  // 2) Thay khá»‘i cÅ© cá»§a (Lop, Mon, HocKy) trong DIEM_TONG rá»“i sáº¯p xáº¿p láº¡i toÃ n bá»™
  damBaoCotNamHoc(ss);
  const shDt = taoTabVoiHeader(ss, TAB.DIEM_TONG, ['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'NamHoc', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']);
  let vals = shDt.getLastRow() > 1 ? shDt.getRange(2, 1, shDt.getLastRow() - 1, 11).getValues() : [];
  vals = vals.filter(function (r) {
    return !(String(r[1]).trim() === dm['Lop'] && chuanHoaMon(String(r[2])) === monChuan && String(r[4]).trim() === dm['HocKy']);
  });
  vals = vals.concat(hangMoi).sort(soSanhHangDiem);
  shDt.clearContents();
  shDt.getRange(1, 1, 1, 11).setValues([['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'NamHoc', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']]);
  if (vals.length) shDt.getRange(2, 1, vals.length, 11).setValues(vals);
  shDt.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#dbeafe');
  shDt.setFrozenRows(1);

  // 3) Bá»• sung há»“ sÆ¡ há»c sinh tá»« tab GV (há» tÃªn, ngÃ y sinh náº¿u cÃ³)
  upsertHoso(ss, items, dm['Lop']);

  // 4) Cáº­p nháº­t tráº¡ng thÃ¡i dÃ²ng danh má»¥c + thá»i Ä‘iá»ƒm Ä‘á»“ng bá»™
  capNhatTrangThaiDanhMuc(ss, tabName, items.length, capNhat);
  ghiMeta(ss, 'CAP_NHAT', capNhat);
  return { ok: true, soHang: hangMoi.length };
}

/** Thá»© tá»± chuáº©n cÃ¡c mÃ´n theo chÆ°Æ¡ng trÃ¬nh (dÃ¹ng Ä‘á»ƒ sáº¯p xáº¿p) */
const DANH_SACH_MON = ['ToÃ¡n', 'Ngá»¯ vÄƒn', 'Ngoáº¡i ngá»¯ 1', 'Ngoáº¡i ngá»¯ 2', 'Ngoáº¡i ngá»¯ 3',
  'GiÃ¡o dá»¥c cÃ´ng dÃ¢n', 'CÃ´ng nghá»‡', 'Tin há»c', 'Khoa há»c tá»± nhiÃªn',
  'Lá»‹ch sá»­ vÃ  Äá»‹a lÃ½', 'GiÃ¡o dá»¥c thá»ƒ cháº¥t', 'Nghá»‡ thuáº­t',
  'Hoáº¡t Ä‘á»™ng tráº£i nghiá»‡m', 'GiÃ¡o dá»¥c Ä‘á»‹a phÆ°Æ¡ng', 'GiÃ¡o dá»¥c kinh táº¿ vÃ  phÃ¡p luáº­t'];

/** Bá» dáº¥u tiáº¿ng Viá»‡t (Ä‘á»ƒ so khá»›p tÃªn mÃ´n khÃ´ng phá»¥ thuá»™c dáº¥u/chá»¯ hoa/cÃ¡ch viáº¿t liá»n) */
function boDau(s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/Ä‘/g, 'd').replace(/Ä/g, 'D');
}

/** Chuáº©n hÃ³a tÃªn mÃ´n vá» tÃªn hiá»ƒn thá»‹ chuáº©n: "Ngoáº¡ingá»¯1", "NGOáº I NGá»® 1", "NN1"... â†’ "Ngoáº¡i ngá»¯ 1" */
function chuanHoaMon(raw) {
  const k = boDau(raw).toLowerCase().replace(/[^a-z0-9]/g, '');
  const bang = {
    'toan': 'ToÃ¡n',
    'nguvan': 'Ngá»¯ vÄƒn',
    'ngoaingu': 'Ngoáº¡i ngá»¯ 1',
    'ngoaingu1': 'Ngoáº¡i ngá»¯ 1',
    'ngoaingu2': 'Ngoáº¡i ngá»¯ 2',
    'ngoaingu3': 'Ngoáº¡i ngá»¯ 3',
    'nn1': 'Ngoáº¡i ngá»¯ 1',
    'nn2': 'Ngoáº¡i ngá»¯ 2',
    'gdcd': 'GiÃ¡o dá»¥c cÃ´ng dÃ¢n',
    'giaoduccongdan': 'GiÃ¡o dá»¥c cÃ´ng dÃ¢n',
    'congnghe': 'CÃ´ng nghá»‡',
    'tinhoc': 'Tin há»c',
    'khtn': 'Khoa há»c tá»± nhiÃªn',
    'khoahoctunhien': 'Khoa há»c tá»± nhiÃªn',
    'lichsuvadiali': 'Lá»‹ch sá»­ vÃ  Äá»‹a lÃ½',
    'lichsuvadialy': 'Lá»‹ch sá»­ vÃ  Äá»‹a lÃ½',
    'gdtc': 'GiÃ¡o dá»¥c thá»ƒ cháº¥t',
    'giaoducthechat': 'GiÃ¡o dá»¥c thá»ƒ cháº¥t',
    'giaoductheechat': 'GiÃ¡o dá»¥c thá»ƒ cháº¥t',
    'nghethuat': 'Nghá»‡ thuáº­t',
    'amnhac': 'Nghá»‡ thuáº­t', 'mithuat': 'Nghá»‡ thuáº­t',
    'hdtn': 'Hoáº¡t Ä‘á»™ng tráº£i nghiá»‡m',
    'hoatdongtrainghiem': 'Hoáº¡t Ä‘á»™ng tráº£i nghiá»‡m',
    'hoatdongtrainghiemhuongnghiep': 'Hoáº¡t Ä‘á»™ng tráº£i nghiá»‡m',
    'gddp': 'GiÃ¡o dá»¥c Ä‘á»‹a phÆ°Æ¡ng',
    'giaoducdiaphuong': 'GiÃ¡o dá»¥c Ä‘á»‹a phÆ°Æ¡ng',
    'gdktpl': 'GiÃ¡o dá»¥c kinh táº¿ vÃ  phÃ¡p luáº­t',
    'giaoduckinhtephapluat': 'GiÃ¡o dá»¥c kinh táº¿ vÃ  phÃ¡p luáº­t',
    'giaoduckinhtevaphapluat': 'GiÃ¡o dá»¥c kinh táº¿ vÃ  phÃ¡p luáº­t',
  };
  return bang[k] || String(raw || '').trim();
}

/** Vá»‹ trÃ­ sáº¯p xáº¿p cá»§a má»™t mÃ´n (mÃ´n láº¡ xáº¿p sau cÃ¹ng, giá»¯ tÃªn gá»‘c) */
function thuTuMon(ten) {
  const i = DANH_SACH_MON.indexOf(chuanHoaMon(ten));
  return i === -1 ? 100 : i;
}

/** So sÃ¡nh Ä‘á»ƒ sáº¯p xáº¿p: KHá»I â†’ Lá»šP â†’ MÃ”N (theo thá»© tá»± chÆ°Æ¡ng trÃ¬nh) â†’ Há»ŒC Ká»² */
function soSanhHangDiem(a, b) {
  const ka = parseInt(a[0], 10) || 0, kb = parseInt(b[0], 10) || 0;
  if (ka !== kb) return ka - kb;
  const l = String(a[1]).localeCompare(String(b[1]), 'vi', { numeric: true });
  if (l) return l;
  const ma = thuTuMon(a[2]), mb = thuTuMon(b[2]);
  if (ma !== mb) return ma - mb;
  return String(a[4]).localeCompare(String(b[4]));
}

/** Äá»c 1 tab GV: cá»™t MaDinhDanh|HoTen(|NgaySinh)|cÃ¡c cá»™t Ä‘iá»ƒm (tÃªn cá»™t = loáº¡i Ä‘iá»ƒm) */
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
  let vals = shDt.getRange(2, 1, shDt.getLastRow() - 1, 11).getValues();
  vals = vals.filter(function (r) {
    return !(String(r[1]).trim() === dm['Lop'] && chuanHoaMon(String(r[2])) === chuanHoaMon(dm['Mon']) && String(r[4]).trim() === dm['HocKy']);
  });
  shDt.clearContents();
  shDt.getRange(1, 1, 1, 11).setValues([['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'NamHoc', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']]);
  if (vals.length) shDt.getRange(2, 1, vals.length, 11).setValues(vals);
  shDt.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#dbeafe');
  bumpTheHe();
}

/* ---- danh sÃ¡ch tab "báº©n" (danh dáº¥u trong onEdit) ---- */

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

/* ========================= 6) CÃ€I Äáº¶T BAN Äáº¦U ========================= */

/** CHáº Y Má»˜T Láº¦N duy nháº¥t khi báº¯t Ä‘áº§u: táº¡o tab máº«u, máº­t kháº©u admin, trigger tá»± Ä‘á»™ng */
function caiDatHeThong() {
  const ss = moSheet();
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_PASSWORD')) props.setProperty('ADMIN_PASSWORD', MAT_KHAU_MAC_DINH);

  // Tab quáº£n trá»‹
  taoTabVoiHeader(ss, TAB.DANH_MUC, ['STT', 'Khoi', 'Lop', 'Mon', 'GiaoVien', 'Email', 'TabName', 'HocKy', 'SoHS', 'CapNhatCuoi', 'GhiChu']);
  taoTabVoiHeader(ss, TAB.DIEM_TONG, ['Khoi', 'Lop', 'Mon', 'GiaoVien', 'HocKy', 'NamHoc', 'MaDinhDanh', 'HoTen', 'LoaiDiem', 'DiemSo', 'CapNhat']);
  taoTabVoiHeader(ss, TAB.HOSO, ['MaDinhDanh', 'HoTen', 'NgaySinh', 'Lop', 'GVCN']);
  taoTabVoiHeader(ss, TAB.GVCN, ['Lop', 'GVCN', 'Email', 'DienThoai']);
  taoTabVoiHeader(ss, TAB.NHAT_KY, ['ThoiGian', 'HanhDong', 'ChiTiet', 'SoDong', 'Nguoi']);

  const meta = ss.getSheetByName(TAB.META) || ss.insertSheet(TAB.META);
  if (meta.getLastRow() === 0) {
    meta.getRange(1, 1, 8, 2).setValues([
      ['Khoa', 'GiaTri'],
      ['TEN_TRUONG', CAU_HINH_MAC_DINH.TEN_TRUONG],
      ['PHU_DE', CAU_HINH_MAC_DINH.PHU_DE],
      ['HOC_KY', CAU_HINH_MAC_DINH.HOC_KY],
      ['HOC_KY_LOC', CAU_HINH_MAC_DINH.HOC_KY_LOC],
      ['NAM_HOC', CAU_HINH_MAC_DINH.NAM_HOC],
      ['GUI_EMAIL', CAU_HINH_MAC_DINH.GUI_EMAIL],
      ['GHI_CHU', CAU_HINH_MAC_DINH.GHI_CHU],
    ]);
    meta.getRange('A1:B1').setFontWeight('bold');
  }

  // Dá»¯ liá»‡u máº«u: 1 lá»›p 8A1 vá»›i 2 mÃ´n â€” cháº¡y thá»­ toÃ n há»‡ thá»‘ng
  if (docDanhMuc(ss).length === 0) {
    luuDanhMuc({ Khoi: '8', Lop: '8A1', Mon: 'ToÃ¡n', GiaoVien: 'GV máº«u A', TabName: '8A1-ToÃ¡n', HocKy: 'HK1' });
    luuDanhMuc({ Khoi: '8', Lop: '8A1', Mon: 'Ngá»¯ vÄƒn', GiaoVien: 'GV máº«u B', TabName: '8A1-Ngá»¯ vÄƒn', HocKy: 'HK1' });
    const t1 = ss.getSheetByName('8A1-ToÃ¡n');
    t1.getRange(2, 1, 3, 7).setValues([
      ['012345678901', 'Nguyá»…n VÄƒn An (máº«u)', '05/03/2012', '8.5', '9', '8', '9'],
      ['012345678902', 'Trá»‹nh Thá»‹ BÃ¬nh (máº«u)', '12/09/2012', '7', '7.5', '6', '8'],
      ['012345678903', 'LÃª VÄƒn CÆ°á»ng (máº«u)', '21/11/2012', '9', '8.5', '9', '10'],
    ]);
    const t2 = ss.getSheetByName('8A1-Ngá»¯ vÄƒn');
    t2.getRange(2, 1, 3, 7).setValues([
      ['012345678901', 'Nguyá»…n VÄƒn An (máº«u)', '05/03/2012', '7.5', '8', '7', '8.5'],
      ['012345678902', 'Trá»‹nh Thá»‹ BÃ¬nh (máº«u)', '12/09/2012', '8', '8', '8.5', '9'],
      ['012345678903', 'LÃª VÄƒn CÆ°á»ng (máº«u)', '21/11/2012', '6.5', '7', '6', '7.5'],
    ]);
  }

  // KÃ©o láº¡i dÃ²ng STT cho DANH_MUC
  keoLaiSTT(ss.getSheetByName(TAB.DANH_MUC));

  // Trigger tá»± Ä‘á»™ng: gá»™p má»—i 5 phÃºt + gá»™p láº¡i toÃ n cá»¥c má»—i 6 giá»
  caiTrigger();

  // Cháº¡y gá»™p láº§n Ä‘áº§u + khÃ³a cÃ¡c tab quáº£n trá»‹ (chá»‰ admin sá»­a Ä‘Æ°á»£c)
  dongBoTatCa();
  khoaTabQuanTri(ss);

  Logger.log('CÃ i Ä‘áº·t xong! Máº­t kháº©u admin máº·c Ä‘á»‹nh: ' + MAT_KHAU_MAC_DINH + ' â€” hÃ£y Ä‘á»•i trong trang admin.');
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

/** Táº¡o tab GV má»›i vá»›i header sá»• Ä‘iá»ƒm + khÃ³a tab: chá»‰ GV (theo email) + admin Ä‘Æ°á»£c sá»­a */
function taoTabGiaoVien(ss, dm) {
  const sh = ss.insertSheet(dm['TabName']);
  sh.getRange(1, 1, 1, 7).setValues([['MaDinhDanh', 'HoTen', 'NgaySinh', 'TX1', 'TX2', 'GK', 'CK']]);
  sh.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#dcfce7');
  sh.setFrozenRows(1);
  sh.getRange('A:B').setHorizontalAlignment('left');

  const p = sh.protect().setDescription('Tab Ä‘iá»ƒm cá»§a ' + (dm['GiaoVien'] || dm['TabName']));
  p.setWarningOnly(false);
  String(dm['Email'] || '').split(/[;,\s]+/).forEach(function (email) {
    email = email.trim();
    if (email) { try { p.addEditor(email); } catch (err) { /* email khÃ´ng há»£p lá»‡: bá» qua */ } }
  });
  return sh;
}

function khoaTabQuanTri(ss) {
  [TAB.DANH_MUC, TAB.DIEM_TONG, TAB.HOSO, TAB.META].forEach(function (ten) {
    const sh = ss.getSheetByName(ten);
    if (!sh) return;
    try {
      const p = sh.protect().setDescription('Chá»‰ admin Ä‘Æ°á»£c chá»‰nh tab ' + ten);
      p.setWarningOnly(false);
      // khÃ´ng thÃªm editor nÃ o ngoÃ i chá»§ sá»Ÿ há»¯u
    } catch (err) { /* Ä‘Ã£ báº£o vá»‡ tá»« trÆ°á»›c */ }
  });
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
    // kÃ©o STT
    const n = sh.getLastRow();
    sh.getRange(n, 1).setValue(String(n - 1));
  }
}

/** ÄÃ¡nh láº¡i sá»‘ thá»© tá»± cá»™t STT cá»§a tab DANH_MUC sau khi thÃªm/xÃ³a dÃ²ng */
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

/* ---- chá»‘ng spam & bá»™ Ä‘á»‡m tháº¿ há»‡ ---- */

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

/** TÄƒng "tháº¿ há»‡" bá»™ Ä‘á»‡m â†’ má»i káº¿t quáº£ tra cá»©u cÅ© máº¥t hiá»‡u lá»±c ngay */
function lamMoiCache() { bumpTheHe(); }
function bumpTheHe() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('CACHE_GEN', String((Number(props.getProperty('CACHE_GEN') || '0') + 1)));
}

/* ========================= Há»– TRá»¢ Má»šI: NAM HOC, NGAY SINH, NHAT KY ========================= */

function chuanHoaNgay(s) {
  s = String(s || '').trim();
  if (!s) return '';
  let m;
  if ((m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/))) {
    return pad2(m[1]) + pad2(m[2]) + m[3];
  }
  if ((m = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/))) {
    return pad2(m[3]) + pad2(m[2]) + m[1];
  }
  const digits = s.replace(/\D/g, '');
  return digits;
}
function pad2(x) { return String(x).padStart(2, '0'); }

function metaNamHoc(ss) {
  const m = docMeta(ss);
  return m.NAM_HOC || CAU_HINH_MAC_DINH.NAM_HOC;
}

function damBaoCotNamHoc(ss) {
  const sh = ss.getSheetByName(TAB.DIEM_TONG);
  if (!sh) return;
  if (sh.getLastColumn() < 11) {
    sh.getRange(1, 11).setValue('NamHoc');
  } else {
    const h = String(sh.getRange(1, 11).getValue() || '').trim();
    if (h !== 'NamHoc') sh.getRange(1, 11).setValue('NamHoc');
  }
  const lr = sh.getLastRow();
  if (lr >= 2) {
    const rng = sh.getRange(2, 11, lr - 1, 1);
    const vals = rng.getValues();
    const def = metaNamHoc(ss);
    let changed = false;
    for (let i = 0; i < vals.length; i++) {
      if (!String(vals[i][0] || '').trim()) { vals[i][0] = def; changed = true; }
    }
    if (changed) rng.setValues(vals);
  }
}

function damBaoCotGvcn(ss) {
  const sh = ss.getSheetByName(TAB.GVCN);
  if (!sh) return;
  if (sh.getLastColumn() < 3) sh.getRange(1, 3).setValue('Email');
  if (sh.getLastColumn() < 4) sh.getRange(1, 4).setValue('DienThoai');
  const h3 = String(sh.getRange(1, 3).getValue() || '').trim();
  const h4 = String(sh.getRange(1, 4).getValue() || '').trim();
  if (h3 !== 'Email') sh.getRange(1, 3).setValue('Email');
  if (h4 !== 'DienThoai') sh.getRange(1, 4).setValue('DienThoai');
}

function docGvcnChiTiet(ss) {
  const map = {};
  docSheet(ss, TAB.GVCN).forEach(function (r) {
    const lop = String(r['Lop'] || '').trim();
    if (lop) map[lop] = { ten: r['GVCN'] || '', email: r['Email'] || '', phone: r['DienThoai'] || '' };
  });
  return map;
}

function ghiNhatKy(hanhDong, chiTiet, soDong) {
  const ss = moSheet();
  const sh = taoTabVoiHeader(ss, TAB.NHAT_KY, ['ThoiGian', 'HanhDong', 'ChiTiet', 'SoDong', 'Nguoi']);
  sh.appendRow([Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss'), hanhDong, chiTiet, soDong === undefined ? '' : soDong, 'admin']);
}

function layNhatKy() {
  const ss = moSheet();
  const sh = ss.getSheetByName(TAB.NHAT_KY);
  if (!sh || sh.getLastRow() < 2) return { ok: true, rows: [] };
  const vals = sh.getDataRange().getValues();
  const rows = vals.slice(1).map(function (r) {
    return { thoiGian: r[0], hanhDong: r[1], chiTiet: r[2], soDong: r[3] };
  }).reverse().slice(0, 50);
  return { ok: true, rows: rows };
}

/* ========================= SAO LUU / KHOI PHUC / XUAT ========================= */

function saoLuuDrive() {
  const ss = moSheet();
  const file = DriveApp.getFileById(ss.getId());
  const copy = file.makeCopy('BACKUP_' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd_HHmm') + '_' + ss.getName());
  ghiNhatKy('Sao lÆ°u', 'Sao lÆ°u lÃªn Google Drive: ' + copy.getName(), '');
  return { ok: true, url: copy.getUrl(), name: copy.getName() };
}

function xuatBackupJson() {
  const ss = moSheet();
  const tabs = [TAB.DIEM_TONG, TAB.HOSO, TAB.DANH_MUC, TAB.GVCN, TAB.META, TAB.NHAT_KY];
  const out = {};
  tabs.forEach(function (t) {
    const sh = ss.getSheetByName(t);
    out[t] = sh ? sh.getDataRange().getValues() : [];
  });
  ghiNhatKy('Xuáº¥t dá»¯ liá»‡u', 'Xuáº¥t báº£n sao lÆ°u JSON', '');
  return { ok: true, data: out, time: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') };
}

function xuatCsv(tabName) {
  const allowed = [TAB.DIEM_TONG, TAB.HOSO, TAB.NHAT_KY, TAB.GVCN, TAB.DANH_MUC];
  if (allowed.indexOf(tabName) === -1) return { error: 'Tab khÃ´ng Ä‘Æ°á»£c phÃ©p xuáº¥t.' };
  const ss = moSheet();
  const sh = ss.getSheetByName(tabName);
  if (!sh) return { error: 'Tab khÃ´ng tá»“n táº¡i.' };
  const vals = sh.getDataRange().getValues();
  const csv = vals.map(function (row) {
    return row.map(function (c) {
      const s = String(c === undefined || c === null ? '' : c);
      if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    }).join(',');
  }).join('\n');
  return { ok: true, filename: tabName + '.csv', csv: csv };
}

function khoiPhuc(backup) {
  const ss = moSheet();
  const data = (backup && backup.data) ? backup.data : backup;
  if (!data) return { error: 'Dá»¯ liá»‡u khÃ´i phá»¥c khÃ´ng há»£p lá»‡.' };
  let soDong = 0;
  if (data[TAB.DIEM_TONG]) { ghiLaiTab(ss, TAB.DIEM_TONG, data[TAB.DIEM_TONG]); soDong += Math.max(0, data[TAB.DIEM_TONG].length - 1); }
  if (data[TAB.HOSO]) { ghiLaiTab(ss, TAB.HOSO, data[TAB.HOSO]); }
  if (data[TAB.GVCN]) { ghiLaiTab(ss, TAB.GVCN, data[TAB.GVCN]); }
  damBaoCotNamHoc(ss);
  damBaoCotGvcn(ss);
  bumpTheHe();
  ghiMeta(ss, 'CAP_NHAT', Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') + ' (khÃ´i phá»¥c tá»« báº£n sao lÆ°u)');
  ghiNhatKy('KhÃ´i phá»¥c', 'KhÃ´i phá»¥c dá»¯ liá»‡u tá»« báº£n sao lÆ°u', soDong);
  return { ok: true, msg: 'ÄÃ£ khÃ´i phá»¥c dá»¯ liá»‡u tá»« báº£n sao lÆ°u.' };
}

function ghiLaiTab(ss, ten, values) {
  const sh = ss.getSheetByName(ten) || ss.insertSheet(ten);
  sh.clearContents();
  if (values && values.length && values[0].length) {
    sh.getRange(1, 1, values.length, values[0].length).setValues(values);
  }
}

/* ========================= THONG BAO EMAIL ========================= */

function guiThongBaoDiemMoi(nhomThayThe, namHoc, hocKy, ss) {
  const meta = docMeta(ss);
  if (String(meta.GUI_EMAIL || '').toLowerCase() !== 'true') return;
  const danhMuc = docDanhMuc(ss);
  const gvcnCt = docGvcnChiTiet(ss);
  const theoEmail = {};
  Object.keys(nhomThayThe).forEach(function (key) {
    const parts = key.split('|');
    const lop = parts[0], mon = parts[1];
    const dm = danhMuc.filter(function (r) { return r['Lop'] === lop && chuanHoaMon(r['Mon']) === chuanHoaMon(mon); })[0];
    let email = dm ? dm['Email'] : '';
    if (!email && gvcnCt[lop]) email = gvcnCt[lop].email;
    if (!email) return;
    if (!theoEmail[email]) theoEmail[email] = { lop: lop, mons: [] };
    theoEmail[email].mons.push(mon);
  });
  const emails = Object.keys(theoEmail);
  if (!emails.length) return;
  const tenTruong = meta.TEN_TRUONG || CAU_HINH_MAC_DINH.TEN_TRUONG;
  const subject = '[' + tenTruong + '] ÄÃ£ cáº­p nháº­t Ä‘iá»ƒm ' + (hocKy || '') + ' ' + (namHoc || '');
  const body = 'Há»‡ thá»‘ng tra cá»©u Ä‘iá»ƒm vá»«a Ä‘Æ°á»£c cáº­p nháº­t.\n\n' +
    emails.map(function (e) {
      return '- ' + theoEmail[e].lop + ': ' + theoEmail[e].mons.join(', ');
    }).join('\n') +
    '\n\nVui lÃ²ng kiá»ƒm tra vÃ  thÃ´ng bÃ¡o cho há»c sinh.\n' +
    'Trang tra cá»©u: xem cáº¥u hÃ¬nh há»‡ thá»‘ng.';
  try {
    if (emails.length === 1) MailApp.sendEmail(emails[0], subject, body);
    else MailApp.sendEmail(emails[0], subject, body, { bcc: emails.slice(1).join(',') });
  } catch (e) { console.error('Gui email that bai: ' + e); }
}

/* ========================= XAC MINH GVCN ========================= */

function xacMinhGvcn(text) {
  const nhap = {};
  String(text || '').split(/\r?\n/).forEach(function (line) {
    if (!line.trim()) return;
    const parts = line.indexOf('|') >= 0 ? line.split('|') : line.split(/[-,;:]/);
    const lop = String(parts[0] || '').trim();
    const gv = String(parts[1] || '').trim();
    if (lop && gv) nhap[lop] = gv;
  });
  const ss = moSheet();
  const hienTai = docGvcnChiTiet(ss);
  const khac = [], thieu = [], duThua = [];
  Object.keys(hienTai).forEach(function (lop) {
    if (!nhap[lop]) { thieu.push(lop); return; }
    if (chuanHoaTen(nhap[lop]) !== chuanHoaTen(hienTai[lop].ten)) khac.push({ lop: lop, cu: hienTai[lop].ten, moi: nhap[lop] });
  });
  Object.keys(nhap).forEach(function (lop) {
    if (!hienTai[lop]) duThua.push(lop);
  });
  return {
    ok: true,
    tongNhap: Object.keys(nhap).length,
    tongHienTai: Object.keys(hienTai).length,
    khop: Object.keys(hienTai).length - khac.length - thieu.length,
    khac: khac,
    thieu: thieu,
    duThua: duThua
  };
}
function chuanHoaTen(s) { return String(s || '').trim().toLowerCase().replace(/\s+/g, ' '); }

/* ========================= MO SHEET + DAM BAO COT ========================= */

function moSheet() {
  if (!SHEET_ID || SHEET_ID.indexOf('DAN_SHEET_ID') === 0) {
    throw new Error('ChÆ°a cáº¥u hÃ¬nh SHEET_ID trong Code.gs');
  }
  const ss = SpreadsheetApp.openById(SHEET_ID);
  ss.getSheets();
  try { damBaoCotNamHoc(ss); } catch (e) {}
  try { damBaoCotGvcn(ss); } catch (e) {}
  return ss;
}

/* ========================= TRáº¢ Káº¾T QUáº¢ ========================= */

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** DÃ¹ng ná»™i bá»™ khi doPost nháº­n data dáº¡ng chuá»—i JSON */
function anJson(s) {
  try { return typeof s === 'string' ? JSON.parse(s || '{}') : (s || {}); }
  catch (e) { return {}; }
}
