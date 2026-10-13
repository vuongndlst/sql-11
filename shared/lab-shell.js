/* Giao diện "lab" cho trang vào và trang khoá (11/10/2026).
 * Chỉ bật khi course.js có ui:'lab'. Từ 12/10/2026 cả năm khoá dùng (ML, DL, Python, SQL, C++); chữ riêng từng khoá
 * lấy từ cfg.fact, cfg.card_note, cfg.cover_icon (thiếu thì dùng chữ của ML).
 * Chỉ dựng HTML: shell.js vẫn gắn sự kiện theo đúng các ID cũ (#identity, #person, #end-session, #edit,
 * #course-cert, #course-search, #course-topic, #course-kind, #course-status, #filter-count, .card, #no-results, #resume).
 */
(function () {
  'use strict';

  // Mạng nơ-ron / đám điểm dữ liệu làm nền động — tất định theo tên khoá để mỗi lần mở giống nhau.
  function nenMang(seedText, so) {
    var h = 2166136261;
    for (var i = 0; i < seedText.length; i++) h = Math.imul(h ^ seedText.charCodeAt(i), 16777619) >>> 0;
    var r = function () { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
    var nut = [], w = 1200, ht = 700;
    for (var k = 0; k < so; k++) nut.push([Math.round(r() * w), Math.round(r() * ht), 2 + Math.round(r() * 4)]);
    var duong = '';
    for (var a = 0; a < nut.length; a++) {
      for (var b = a + 1; b < nut.length; b++) {
        var dx = nut[a][0] - nut[b][0], dy = nut[a][1] - nut[b][1];
        if (dx * dx + dy * dy < 190 * 190) {
          duong += '<line x1="' + nut[a][0] + '" y1="' + nut[a][1] + '" x2="' + nut[b][0] + '" y2="' + nut[b][1] +
            '" style="animation-delay:' + ((a * 7 + b) % 40) / 10 + 's"/>';
        }
      }
    }
    var cham = nut.map(function (n, i) {
      return '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + n[2] + '" style="animation-delay:' + (i % 30) / 10 + 's"/>';
    }).join('');
    return '<svg class="lab-net" viewBox="0 0 ' + w + ' ' + ht + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<g class="lab-net-lines">' + duong + '</g><g class="lab-net-dots">' + cham + '</g></svg>';
  }

  function vong(phan, tong, nhan) {
    var p = tong ? phan / tong : 0, c = 2 * Math.PI * 52;
    return '<div class="lab-ring" role="img" aria-label="' + nhan + '"><svg viewBox="0 0 120 120">' +
      '<circle class="lab-ring-bg" cx="60" cy="60" r="52"/>' +
      '<circle class="lab-ring-fg" cx="60" cy="60" r="52" stroke-dasharray="' + (c * p).toFixed(1) + ' ' + c.toFixed(1) + '"/>' +
      '</svg><div class="lab-ring-text"><b>' + phan + '<small>/' + tong + '</small></b><span>bài xong</span></div></div>';
  }

  function trangThai(S, pid, key) {
    var p = S.state(pid, key), done = !!(p.completed || p.completedAt || p.dat), started = Object.keys(p).length > 0;
    return { done: done, started: started };
  }

  var LabShell = {
    gate: function (o) {
      var cfg = o.cfg, esc = o.esc, sel = o.selected;
      var tieuDe = sel ? esc(sel.title) : (cfg.tagline || 'Khám phá. Thực hành.<br>Tự làm được.');
      var nhom = [];
      cfg.lessons.forEach(function (l) { if (l.topic && nhom.indexOf(l.topic) < 0) nhom.push(l.topic); });
      return '<header class="header lab-header">' + o.brand() + '</header>' +
        '<main class="lab-gate">' + nenMang(cfg.course, 46) +
        '<div class="lab-gate-inner"><section class="lab-gate-text">' +
        '<p class="eyebrow">' + esc(cfg.label) + '</p><h1>' + tieuDe + '</h1>' +
        '<p class="lab-lead">' + (sel ? 'Nhập hoặc xác nhận tên và lớp để vào đúng bài học.' :
          esc(cfg.intro || 'Nhập tên và lớp để bắt đầu. Con có thể chọn bài học; các chặng mở theo tiến độ hoàn thành.')) + '</p>' +
        '<div class="intro-symbols">' + cfg.symbols.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div>' +
        '<dl class="lab-facts"><div><dt>' + cfg.lessons.length + '</dt><dd>bài học</dd></div><div><dt>' + nhom.length +
        '</dt><dd>chủ đề</dd></div><div><dt>' + esc((cfg.fact || ['5'])[0]) + '</dt><dd>' + esc((cfg.fact || [0, 'chặng mỗi bài'])[1]) + '</dd></div></dl></section>' +
        '<section class="panel lab-panel"><p class="eyebrow">SẴN SÀNG HỌC</p><h2>Con học với tên nào?</h2>' +
        '<form id="identity">' + (o.list.length ? '<label class="field">Người học trên máy này<select name="saved"><option value="">Người học mới</option>' +
          o.list.map(function (p) {
            return '<option value="' + p.id + '" ' + (p.id === (o.last && o.last.id) ? 'selected' : '') + '>' + esc(p.display_name + ' · ' + p.class_label) + '</option>';
          }).join('') + '</select></label>' : '') + o.form(o.last) +
        '<p class="error hidden" id="error" role="alert"></p><button class="primary" style="width:100%">Vào học →</button></form>' +
        '<p class="hint">Tiến độ và bài làm lưu trên trình duyệt này. Không cần tài khoản.</p></section></div></main>';
    },

    home: function (o) {
      var cfg = o.cfg, esc = o.esc, S = o.S, pid = o.profile.id, s = o.s;
      var base = o.base;
      var cover = function (l) { return l.cover ? new URL(l.cover, base).href : ''; };
      var bai = function (key) { return cfg.lessons.find(function (l) { return l.key === key; }); };
      var tiep = cfg.lessons.find(function (l) { return !trangThai(S, pid, l.key).done; });
      var nhom = [];
      cfg.lessons.forEach(function (l) { var t = l.topic || 'Bài học'; if (nhom.indexOf(t) < 0) nhom.push(t); });

      var the = function (l) {
        var st = trangThai(S, pid, l.key), loai = l.kind === 'activity' ? 'activity' : 'lesson', hinh = cover(l);
        return '<a class="card lab-card" data-key="' + esc(l.key) + '" data-topic="' + esc(l.topic || '') + '" data-kind="' + loai +
          '" data-done="' + st.done + '" data-started="' + st.started + '" href="' + o.lessonUrl(l.key) + '">' +
          '<div class="lab-cover' + (hinh ? '' : ' lab-cover-empty') + '"' + (hinh ? ' style="background-image:url(\'' + hinh + '\')"' : '') + '>' +
          '<span class="lab-num">' + esc(l.badge || l.position) + '</span><span class="lab-kind lab-kind-' + loai + '">' +
          (loai === 'activity' ? 'Thực hành' : 'Bài học') + '</span>' + (hinh ? '' : '<span class="lab-cover-icon">' + (loai === 'activity' ? '⚗' : esc((cfg.icons && cfg.icons[l.key]) || cfg.cover_icon || '◆')) + '</span>') + '</div>' +
          '<div class="lab-card-body"><span class="eyebrow">' + (l.label ? esc(l.label) : (loai === 'activity' ? 'Thực hành' : 'Bài') + ' ' + l.position + ' · ' + esc(l.topic || '')) + '</span>' +
          '<h2>' + esc(l.title) + '</h2><p>' + (loai === 'activity' ? 'Notebook nhóm · sản phẩm và minh chứng' : esc(cfg.card_note || '5 chặng · đảo 3D · checkpoint')) + '</p>' +
          '<div class="card-bottom"><span class="lab-state ' + (st.done ? 'is-done' : st.started ? 'is-started' : '') + '">' +
          (st.done ? '✓ Đã hoàn thành' : st.started ? '● Đang học' : 'Bắt đầu') + '</span><b>Vào học ↗</b></div></div></a>';
      };

      var modules = nhom.map(function (t, i) {
        var ds = cfg.lessons.filter(function (l) { return (l.topic || 'Bài học') === t; });
        var xong = ds.filter(function (l) { return trangThai(S, pid, l.key).done; }).length;
        return '<section class="lab-module" data-topic="' + esc(t) + '"><header class="lab-module-head">' +
          '<span class="lab-module-no">' + (i + 1) + '</span><div><p class="eyebrow">Chủ đề ' + (i + 1) + '</p><h2>' + esc(t) + '</h2></div>' +
          '<div class="lab-module-progress"><span>' + xong + '/' + ds.length + ' bài</span><i style="--p:' + (ds.length ? xong / ds.length : 0) + '"></i></div></header>' +
          '<div class="grid lab-grid">' + ds.map(the).join('') + '</div></section>';
      }).join('');

      var resume = '';
      if (o.last && bai(o.last.lesson)) {
        var lb = bai(o.last.lesson), hl = cover(lb);
        resume = '<section class="resume lab-resume">' + (hl ? '<div class="lab-resume-img" style="background-image:url(\'' + hl + '\')"></div>' : '') +
          '<div class="lab-resume-text"><span class="eyebrow">HỌC TIẾP THEO NHỊP CỦA CON</span><h2>' + esc(lb.title) + '</h2><p>' +
          esc(o.last.title || 'Bài gần nhất') + ' · tiến độ lưu trên máy này</p></div><a id="resume" class="button primary" href="' +
          o.visitURL(o.last) + '">Học tiếp →</a></section>';
      } else if (tiep) {
        var ht = cover(tiep);
        resume = '<section class="resume lab-resume">' + (ht ? '<div class="lab-resume-img" style="background-image:url(\'' + ht + '\')"></div>' : '') +
          '<div class="lab-resume-text"><span class="eyebrow">GỢI Ý BẮT ĐẦU</span><h2>' + esc(tiep.title) + '</h2><p>Bài ' + tiep.position +
          ' · ' + esc(tiep.topic || '') + '</p></div><a id="start-next" class="button primary" href="' + o.lessonUrl(tiep.key) + '">Bắt đầu →</a></section>';
      }

      return '<header class="header lab-header">' + o.brand() + '<div class="actions"><button id="person" class="lab-chip">👤 ' +
        esc(o.profile.display_name) + ' · ' + esc(o.profile.class_label) + '</button><button id="end-session">Kết thúc buổi học</button></div></header>' +
        '<main class="container lab-home"><section class="lab-hero">' + nenMang(cfg.course + '-home', 30) +
        '<div class="lab-hero-text"><p class="eyebrow">' + esc(cfg.label) + '</p><h1>Hôm nay con muốn học gì?</h1>' +
        '<p>Chọn bài học. Hoàn thành từng chặng để mở chặng tiếp theo. Trên lớp, dừng để trao đổi khi thầy/cô nhắc.</p>' +
        '<div class="actions"><button id="edit">Sửa tên/lớp</button>' + (s.done === cfg.lessons.length ? '<button id="course-cert" class="primary">Tải chứng chỉ toàn khóa</button>' : '') + '</div></div>' +
        '<div class="lab-hero-stats">' + vong(s.done, cfg.lessons.length, s.done + ' trên ' + cfg.lessons.length + ' bài đã xong') +
        '<div class="stats"><div><b>' + s.done + '/' + cfg.lessons.length + '</b><small>Bài hoàn thành</small></div><div><b>' + s.xp +
        '</b><small>XP trên máy này</small></div></div></div></section>' + resume +
        '<aside class="notice lab-notice">' + esc(o.profile.display_name) + ' · ' + esc(o.profile.class_label) +
        ' — dữ liệu chỉ ở trình duyệt này. Không cần tài khoản.</aside>' +
        '<details class="lab-filters"><summary>🔎 Tìm và lọc bài</summary><section class="course-filters" aria-label="Tìm bài học">' +
        '<label>Tìm bài<input id="course-search" type="search" placeholder="Tên bài hoặc chủ đề"></label><label>Chủ đề<select id="course-topic"><option value="">Mọi chủ đề</option>' +
        o.topics.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join('') + '</select></label>' +
        '<label>Loại bài<select id="course-kind"><option value="">Tất cả</option><option value="activity">Thực hành</option><option value="lesson">Bài học</option></select></label>' +
        '<label>Tiến độ<select id="course-status"><option value="">Tất cả</option><option value="unfinished">Chưa hoàn thành</option><option value="started">Đang học</option><option value="done">Hoàn thành</option></select></label>' +
        '</section></details><p class="hint" id="filter-count" role="status"></p>' +
        '<div class="lab-journey">' + modules + '</div><p id="no-results" class="hidden">Chưa có bài khớp bộ lọc. Thử từ khóa khác hoặc chọn Tất cả.</p></main>' +
        '<footer class="footer">THCS & THPT Đinh Thiện Lý · Học tự do, lưu trên trình duyệt</footer>';
    }
  };
  window.LabShell = LabShell;
})();
