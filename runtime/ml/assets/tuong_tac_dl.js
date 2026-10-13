/* Khối TƯƠNG TÁC bổ sung cho khoá Deep Learning 11 (11/10/2026). Nạp sau tuong_tac.js, thêm loại mới vào ML1_TT.
 * Số liệu do notebook chạy thật tính sẵn (data.json); trang chỉ hiển thị.
 *
 *  pixel     chọn ảnh xám 28 × 28 -> rê/chạm một điểm ảnh: vùng 7 × 7 quanh đó hiện số 0 – 255; bật "làm phẳng"
 *            -> dải 784 số (shape (28, 28) -> (784,))
 *  xac_suat  chọn ảnh, chọn mạng "chưa học" / "đã học" -> xác suất softmax 10 lớp (cột ngang), lớp đúng có viền
 */
(function () {
  "use strict";
  if (!window.ML1_TT) return;
  var el = null;
  var CSS = getComputedStyle(document.documentElement);
  function v(n, d) { var x = CSS.getPropertyValue(n).trim(); return x || d; }
  var MAU = { chinh: v("--xanh-tuoi", "#2563EB"), dam: v("--xanh", "#0F172A"), teal: v("--teal", "#0D9488"),
    vang: "#F59E0B", vien: v("--vien", "#E2E8F0"), phu: v("--chu-phu", "#475569") };
  function E() { return el.apply(null, arguments); }
  function khung(k, loai) {
    var o = E("div", { class: "demo tt tt-" + loai }, [E("div", { class: "tieu-de-hop", text: "Tự thử: " + k.tieu_de })]);
    if (k.huong_dan) o.appendChild(E("p", { html: k.huong_dan }));
    return o;
  }
  function chonAnh(k, onChon) {
    var hang = E("div", { class: "tt-hang", role: "group", "aria-label": "Chọn ảnh" }), nut = [];
    k.anh.forEach(function (a, i) {
      var b = E("button", { type: "button", class: "nut phu", text: a.ten, "aria-pressed": i === 0 ? "true" : "false" });
      b.addEventListener("click", function () { nut.forEach(function (x, j) { x.setAttribute("aria-pressed", j === i ? "true" : "false"); x.style.opacity = j === i ? "1" : ".65"; }); onChon(i); });
      if (i) b.style.opacity = ".65";
      nut.push(b); hang.appendChild(b);
    });
    return hang;
  }

  // ---------------------------------------------------------------- pixel
  function pixel(k) {
    var o = khung(k, "pixel"), cur = 0, chon = [14, 14], N = 28, O = 12;
    o.appendChild(chonAnh(k, function (i) { cur = i; ve(); }));
    var vung = E("div", { class: "tt-hang" }), c = E("canvas", { width: N * O * 2, height: N * O * 2, class: "tt-ve", tabindex: "0",
      "aria-label": "Ảnh 28 × 28; dùng phím mũi tên để chọn điểm ảnh" });
    c.style.width = N * O + "px"; c.style.maxWidth = "100%"; c.style.touchAction = "none"; c.style.cursor = "crosshair";
    var g = c.getContext("2d"); g.scale(2, 2);
    var bang = E("table", { class: "bang tt-pixel-so" }); bang.style.width = "auto"; bang.style.fontVariantNumeric = "tabular-nums";
    var ben = E("div", {}, [bang, E("p", { class: "tt-ghi", html: "" })]);
    vung.style.alignItems = "flex-start"; vung.style.gap = "18px"; vung.style.flexWrap = "wrap";
    vung.appendChild(c); vung.appendChild(ben); o.appendChild(vung);
    var phang = E("label", { class: "tt-nhan-phu" }), hop = E("input", { type: "checkbox" });
    phang.appendChild(hop); phang.appendChild(document.createTextNode(" Làm phẳng: xếp 28 hàng thành một dải 784 số"));
    var dai = E("canvas", { width: 784 * 2, height: 40 * 2, class: "tt-ve" }); dai.style.width = "100%"; dai.style.height = "40px"; dai.hidden = true;
    var gd = dai.getContext("2d"); gd.scale(2, 2);
    var shape = E("p", { class: "tt-ghi" });
    o.appendChild(phang); o.appendChild(dai); o.appendChild(shape);
    if (k.ghi) o.appendChild(E("p", { class: "tt-ghi", html: k.ghi }));
    hop.addEventListener("change", ve);
    function tai(e) {
      var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * N, y = (e.clientY - r.top) / r.height * N;
      chon = [Math.max(0, Math.min(N - 1, Math.floor(y))), Math.max(0, Math.min(N - 1, Math.floor(x)))]; ve();
    }
    c.addEventListener("pointermove", tai); c.addEventListener("pointerdown", tai);
    c.addEventListener("keydown", function (e) {
      var d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key];
      if (!d) return; e.preventDefault();
      chon = [Math.max(0, Math.min(N - 1, chon[0] + d[0])), Math.max(0, Math.min(N - 1, chon[1] + d[1]))]; ve();
    });
    function ve() {
      var px = k.anh[cur].px;
      for (var r = 0; r < N; r++) for (var q = 0; q < N; q++) {
        var s = 255 - px[r * N + q]; g.fillStyle = "rgb(" + s + "," + s + "," + s + ")"; g.fillRect(q * O, r * O, O, O);
      }
      var r0 = Math.max(0, Math.min(N - 7, chon[0] - 3)), c0 = Math.max(0, Math.min(N - 7, chon[1] - 3));
      g.strokeStyle = "#DC2626"; g.lineWidth = 2; g.strokeRect(c0 * O, r0 * O, 7 * O, 7 * O);
      g.strokeStyle = MAU.chinh; g.lineWidth = 2; g.strokeRect(chon[1] * O, chon[0] * O, O, O);
      bang.innerHTML = "";
      for (r = r0; r < r0 + 7; r++) {
        var tr = E("tr");
        for (q = c0; q < c0 + 7; q++) {
          var val = px[r * N + q], td = E("td", { text: String(val) });
          td.style.padding = "3px 6px"; td.style.textAlign = "right";
          td.style.background = "rgb(" + (255 - val) + "," + (255 - val) + "," + (255 - val) + ")"; td.style.color = val > 128 ? "#fff" : MAU.dam;
          if (r === chon[0] && q === chon[1]) { td.style.outline = "3px solid " + MAU.chinh; td.style.fontWeight = "700"; }
          tr.appendChild(td);
        }
        bang.appendChild(tr);
      }
      ben.lastChild.innerHTML = "Điểm ảnh hàng <b>" + chon[0] + "</b>, cột <b>" + chon[1] + "</b>: giá trị <b>" + px[chon[0] * N + chon[1]] +
        "</b> (0 = trắng, 255 = đậm nhất). Vị trí trong dải phẳng: <b>" + (chon[0] * N + chon[1]) + "</b> = " + chon[0] + " × 28 + " + chon[1] + ".";
      dai.hidden = !hop.checked;
      if (hop.checked) {
        gd.clearRect(0, 0, 784, 40);
        for (var i = 0; i < 784; i++) { var s2 = 255 - px[i]; gd.fillStyle = "rgb(" + s2 + "," + s2 + "," + s2 + ")"; gd.fillRect(i, 0, 1, 40); }
        gd.fillStyle = MAU.chinh; gd.fillRect(chon[0] * N + chon[1] - 1, 0, 3, 40);
        shape.innerHTML = "shape <code>(28, 28)</code> → <code>(784,)</code>: vẫn đủ 784 số, chỉ đổi cách xếp.";
      } else shape.innerHTML = "shape <code>(28, 28)</code>: 28 hàng × 28 cột = <b>784</b> số.";
    }
    ve();
    return o;
  }

  // ---------------------------------------------------------------- xac_suat
  function xacSuat(k) {
    var o = khung(k, "xac-suat"), cur = 0, che = k.che_do[0].ma;
    var hangAnh = chonAnh(k, function (i) { cur = i; ve(); });
    var hangMang = E("div", { class: "tt-hang", role: "group", "aria-label": "Chọn mạng" }), nutM = [];
    k.che_do.forEach(function (m, i) {
      var b = E("button", { type: "button", class: "nut" + (i ? " phu" : ""), text: m.ten });
      b.addEventListener("click", function () { che = m.ma; nutM.forEach(function (x, j) { x.className = "nut" + (j === i ? "" : " phu"); }); ve(); });
      nutM.push(b); hangMang.appendChild(b);
    });
    var vung = E("div", { class: "tt-hang" }); vung.style.alignItems = "center"; vung.style.gap = "18px"; vung.style.flexWrap = "wrap";
    var c = E("canvas", { width: 28 * 5 * 2, height: 28 * 5 * 2, class: "tt-ve" }); c.style.width = "140px"; c.style.height = "140px";
    var g = c.getContext("2d"); g.scale(2, 2);
    var cot = E("div", { class: "tt-cot-ngang" }); cot.style.flex = "1"; cot.style.minWidth = "260px";
    var kq = E("p", { class: "tt-ghi" });
    vung.appendChild(c); vung.appendChild(cot);
    o.appendChild(hangAnh); o.appendChild(hangMang); o.appendChild(vung); o.appendChild(kq);
    if (k.ghi) o.appendChild(E("p", { class: "tt-ghi", html: k.ghi }));
    function ve() {
      var a = k.anh[cur], p = a.p[che];
      for (var r = 0; r < 28; r++) for (var q = 0; q < 28; q++) { var s = 255 - a.px[r * 28 + q]; g.fillStyle = "rgb(" + s + "," + s + "," + s + ")"; g.fillRect(q * 5, r * 5, 5, 5); }
      var lon = 0; p.forEach(function (x, i) { if (x > p[lon]) lon = i; });
      cot.innerHTML = "";
      k.lop.forEach(function (ten, i) {
        var dong = E("div"); dong.style.display = "grid"; dong.style.gridTemplateColumns = "110px 1fr 56px"; dong.style.alignItems = "center"; dong.style.gap = "8px"; dong.style.margin = "2px 0";
        var nen = E("div"); nen.style.height = "16px"; nen.style.background = MAU.vien; nen.style.borderRadius = "8px"; nen.style.overflow = "hidden";
        if (i === a.that) nen.style.outline = "2px solid " + MAU.teal;
        var thanh = E("div"); thanh.style.height = "100%"; thanh.style.width = Math.max(0.5, p[i]) + "%"; thanh.style.background = i === lon ? MAU.chinh : "#94A3B8"; thanh.style.transition = "width .35s";
        nen.appendChild(thanh);
        var nh = E("span", { text: ten + (i === a.that ? " ✓" : "") }); nh.style.fontSize = "13.5px"; if (i === a.that) nh.style.fontWeight = "700";
        var so = E("span", { text: p[i].toFixed(1).replace(".", ",") + "%" }); so.style.fontSize = "13px"; so.style.textAlign = "right"; so.style.fontVariantNumeric = "tabular-nums";
        dong.appendChild(nh); dong.appendChild(nen); dong.appendChild(so); cot.appendChild(dong);
      });
      kq.innerHTML = "Mạng chọn lớp có xác suất lớn nhất: <b>" + k.lop[lon] + "</b> (" + p[lon].toFixed(1).replace(".", ",") + "%) — " +
        (lon === a.that ? "<b>đúng</b>." : "<b>sai</b>, ảnh thật là “" + k.lop[a.that] + "”.") + " Mười xác suất cộng lại bằng 100%.";
    }
    ve();
    return o;
  }

  var goc = window.ML1_TT.init;
  window.ML1_TT.init = function (hamEl) { el = hamEl; return goc.apply(this, arguments); };
  window.ML1_TT.pixel = pixel;
  window.ML1_TT.xac_suat = xacSuat;
})();
