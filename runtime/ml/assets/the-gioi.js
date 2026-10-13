/* Tên và dấu hiệu thị giác cho các bài ML lớp 10. Giữ độc lập với data.js. */
window.THE_GIOI = {
  bai01:{ten:"AI quanh ta",mo_ta:"Nhận ra AI trong đời sống và cách nó đưa ra dự đoán.",kieu:"network",mau:"#68D9F0",mau_phu:"#FFD07A",bieu_tuong:"AI",ky_hieu:["AI","dữ liệu","mẫu","dự đoán"]},
  bai02:{ten:"Máy học từ ví dụ",mo_ta:"Đi theo dữ liệu: từ ví dụ có đáp án đến dự đoán.",kieu:"factory",mau:"#79E2B6",mau_phu:"#F7C978",bieu_tuong:"ML",ky_hieu:["x","y","train","test"]},
  bai03:{ten:"Python trên Colab",mo_ta:"Viết và chạy những dòng Python đầu tiên.",kieu:"code",mau:"#8BC7FF",mau_phu:"#FFC47F",bieu_tuong:"Py",ky_hieu:["print()","x = 3","if","list"]},
  bai04:{ten:"Bảng, mảng, biểu đồ",mo_ta:"Dùng NumPy, pandas, matplotlib để xem dữ liệu.",kieu:"tools",mau:"#70DBE4",mau_phu:"#C6A8FF",bieu_tuong:"[ ]",ky_hieu:["NumPy","pandas","plot","df"]},
  bai05:{ten:"Thống kê và xác suất",mo_ta:"Mô tả dữ liệu bằng con số, ước lượng khả năng xảy ra.",kieu:"statistics",mau:"#B69CFF",mau_phu:"#54E1C1",bieu_tuong:"Σ",ky_hieu:["μ","σ","P(A)","x̄"]},
  bai06:{ten:"Vector và khoảng cách",mo_ta:"Biểu diễn mỗi học sinh bằng vector, đo độ giống nhau.",kieu:"vector",mau:"#38D5F4",mau_phu:"#FFCB6B",bieu_tuong:"→",ky_hieu:["→","d","x′","0–1"]},
  bai07:{ten:"Hiểu bảng dữ liệu",mo_ta:"Nạp bảng Titanic, xem cấu trúc, tìm ô trống và giá trị lạ.",kieu:"clean",mau:"#75E2D3",mau_phu:"#F8CE7A",bieu_tuong:"✓",ky_hieu:["NaN","info()","shape","describe()"]},
  bai08:{ten:"Làm sạch dữ liệu",mo_ta:"Bỏ, điền, sửa có lý do và ghi lại từng việc.",kieu:"feature",mau:"#8CE0A8",mau_phu:"#95B9FF",bieu_tuong:"x₁",ky_hieu:["fillna","drop","copy()","NaN"]},
  bai09:{ten:"Đọc biểu đồ",mo_ta:"Chọn biểu đồ theo câu hỏi, so sánh các nhóm hành khách.",kieu:"charts",mau:"#F2BC7B",mau_phu:"#7DD9EE",bieu_tuong:"▥",ky_hieu:["hist","bar","groupby","%"]},
  bai10:{ten:"Tương quan và kết luận",mo_ta:"Đo hai cột cùng thay đổi, chuẩn bị dữ liệu cho mô hình.",kieu:"correlation",mau:"#E2A6CD",mau_phu:"#78DBD4",bieu_tuong:"r",ky_hieu:["r","corr","get_dummies","X, y"]},
  bai12:{ten:"Học có giám sát",mo_ta:"Học từ ví dụ có đáp án, so với mốc, nhận ra học vẹt.",kieu:"labels",mau:"#89B9FF",mau_phu:"#F5CC7E",bieu_tuong:"y",ky_hieu:["X","y","fit","score"]},
  bai13:{ten:"K láng giềng",mo_ta:"Hỏi K hành khách giống nhất rồi bỏ phiếu.",kieu:"neighbors",mau:"#9EDBB8",mau_phu:"#C4A9FF",bieu_tuong:"K",ky_hieu:["K","d","1 phiếu","?"]},
  bai15:{ten:"Hồi quy tuyến tính",mo_ta:"Tìm đường thẳng để ước lượng một con số.",kieu:"linear",mau:"#80C8F5",mau_phu:"#F9C27A",bieu_tuong:"ŷ",ky_hieu:["x","y","ŷ","sai số"]},
  bai16:{ten:"Hồi quy logistic",mo_ta:"Đổi điểm số thành xác suất cho hai nhãn.",kieu:"logistic",mau:"#A7A4F1",mau_phu:"#8FE4CB",bieu_tuong:"P",ky_hieu:["P(y=1)","0–1","ngưỡng","sigmoid"]},
  bai18:{ten:"Cây quyết định",mo_ta:"Hỏi các câu có / không để đi tới kết luận.",kieu:"tree",mau:"#8BDC9E",mau_phu:"#F8D287",bieu_tuong:"Y?",ky_hieu:["if","else","nút","lá"]},
  bai20:{ten:"Rừng ngẫu nhiên",mo_ta:"Cho nhiều cây cùng bỏ phiếu.",kieu:"forest",mau:"#6FCB9C",mau_phu:"#B9C8FF",bieu_tuong:"RF",ky_hieu:["cây 1","cây 2","vote","RF"]},
  bai21:{ten:"Naïve Bayes",mo_ta:"Đếm, nhân xác suất từng cột để đoán nhãn.",kieu:"bayes",mau:"#D3A8F7",mau_phu:"#8BE2D0",bieu_tuong:"P",ky_hieu:["P(A)","P(B|A)","prior","evidence"]},
  bai22:{ten:"SVM",mo_ta:"Tìm đường chia hai nhóm có lề rộng nhất.",kieu:"boundary",mau:"#E5A5C9",mau_phu:"#8CCEEE",bieu_tuong:"±",ky_hieu:["+1","−1","margin","SVM"]},
  bai24:{ten:"Kiểm định chéo",mo_ta:"Đo mô hình qua nhiều lần chia cho công bằng.",kieu:"evaluate",mau:"#F0C27C",mau_phu:"#79D9CF",bieu_tuong:"✓",ky_hieu:["fold 1","fold 2","score","mean"]},
  bai25:{ten:"Chọn mô hình",mo_ta:"Cân nhắc độ chính xác, tốc độ và khả năng giải thích.",kieu:"compare",mau:"#E9B68D",mau_phu:"#A6BCFF",bieu_tuong:"≟",ky_hieu:["A","B","metric","trade-off"]},
  bai26:{ten:"K-Means",mo_ta:"Để máy tự chia nhóm khi chưa có nhãn.",kieu:"cluster",mau:"#8CD9D2",mau_phu:"#F2B8D5",bieu_tuong:"●",ky_hieu:["K","cụm 1","cụm 2","tâm"]},
  bai28:{ten:"Học tăng cường",mo_ta:"Thử, nhận điểm thưởng, chọn cách đi tốt hơn.",kieu:"reward",mau:"#A5D789",mau_phu:"#F3CF81",bieu_tuong:"↻",ky_hieu:["state","action","reward","policy"]},
  bai29:{ten:"Mạng nơ-ron",mo_ta:"Ghép nhiều nơ-ron thành các lớp để học.",kieu:"neural",mau:"#BFABF7",mau_phu:"#78D9E3",bieu_tuong:"◎",ky_hieu:["input","hidden","output","weight"]},
  bai30:{ten:"Dự báo chuỗi thời gian",mo_ta:"Dự báo bụi mịn PM2.5 của ngày tiếp theo.",kieu:"time",mau:"#8ABEF5",mau_phu:"#F4C891",bieu_tuong:"t",ky_hieu:["t−1","t","t+1","PM2.5"]},
  bai31:{ten:"Làm app cho model",mo_ta:"Đưa model thành app có thanh trượt để người khác thử.",kieu:"deploy",mau:"#8DDBE5",mau_phu:"#F8C57B",bieu_tuong:"↗",ky_hieu:["model","input","output","app"]}
};

window.KHU_ML = [
  {ten:"Bắt đầu",mo_ta:"AI quanh ta, máy học, Python và công cụ dữ liệu",mau:"#68D9F0",bieu_tuong:"AI",bai:[1,2,3,4]},
  {ten:"Toán và dữ liệu",mo_ta:"Thống kê, vector, hiểu và làm sạch dữ liệu",mau:"#AFA3FF",bieu_tuong:"Σ",bai:[5,6,7,8]},
  {ten:"EDA và học có giám sát",mo_ta:"Biểu đồ, tương quan, học có giám sát, KNN",mau:"#F2BC7B",bieu_tuong:"▥",bai:[9,10,12,13]},
  {ten:"Hồi quy và cây",mo_ta:"Hồi quy tuyến tính, logistic, cây, rừng",mau:"#8BDC9E",bieu_tuong:"ŷ",bai:[15,16,18,20]},
  {ten:"Phân loại và đánh giá",mo_ta:"Naïve Bayes, SVM, kiểm định chéo, chọn mô hình, K-Means",mau:"#D3A8F7",bieu_tuong:"✓",bai:[21,22,24,25,26]},
  {ten:"Học tăng cường và mạng nơ-ron",mo_ta:"Thử và sai, mạng nơ-ron, dự báo, làm app",mau:"#8ABEF5",bieu_tuong:"↗",bai:[28,29,30,31]}
];
