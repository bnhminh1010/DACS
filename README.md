# AI-Powered Quiz Generation System

## 📋 Tổng Quan

**Quiz Generation System** là một nền tảng giáo dục hiện đại cho phép giáo viên tạo bài thi trắc nghiệm tự động bằng AI từ các tài liệu (PDF, Word), và học sinh có thể làm bài thi trực tuyến. Hệ thống tích hợp các mô hình AI tiên tiến (OpenRouter, Google Gemini) để tạo câu hỏi chất lượng cao với các cấp độ khó khác nhau.

---

## 🎯 Tính Năng Chính

### Cho Giáo Viên
- ✅ **Tạo bài thi tự động** từ tài liệu PDF hoặc Word
- ✅ **Tùy chỉnh chuyên môn** (Toán, Vật lý, Hóa học, Lập trình, v.v.)
- ✅ **Chọn cấp độ khó** (Dễ, Trung bình, Khó)
- ✅ **Quản lý bài thi** - Xem danh sách, sửa, xóa, công khai bài thi
- ✅ **Xem kết quả học sinh** - Theo dõi điểm số, thời gian làm bài

### Cho Học Sinh
- ✅ **Tìm bài thi công khai** được các giáo viên tạo
- ✅ **Làm bài thi trực tuyến** với giao diện dễ sử dụng
- ✅ **Xem kết quả ngay lập tức** sau khi nộp bài
- ✅ **Xem giải thích chi tiết** cho mỗi câu hỏi
- ✅ **Lịch sử làm bài** - Theo dõi các bài thi đã làm

---

## 🛠️ Stack Công Nghệ

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt (Mã hóa mật khẩu)
- **File Processing**: 
  - pdf-parse (Xử lý PDF)
  - mammoth (Xử lý Word documents)
- **AI Integration**:
  - OpenRouter API (Mistral, DeepSeek, Qwen)
  - Google Gemini API
- **Utilities**: axios, cors, morgan, multer, dotenv

### Frontend
- **Framework**: React 19
- **Build Tool**: Create React App
- **UI/Styling**: CSS vanilla
- **Testing**: Jest, React Testing Library

### DevOps & Tools
- **Testing**: Playwright
- **Linting**: ESLint, TypeScript ESLint
- **Type Checking**: TypeScript
- **Environment Management**: dotenv

---

## 📁 Cấu Trúc Dự Án

\`\`\`
Do_an_co_so/
├── backend/                  # Backend Node.js Express
│   ├── config/              # Cấu hình (Database, Auth)
│   ├── controllers/         # Logic xử lý request
│   ├── models/              # Định nghĩa dữ liệu
│   ├── services/            # Logic nghiệp vụ
│   ├── routes/              # API endpoints
│   ├── middlewares/         # Authentication, Upload
│   ├── utils/               # Hàm tiện ích chung
│   ├── public/              # Static files
│   ├── uploads/             # Thư mục lưu file tạm
│   ├── scripts/             # Migration scripts
│   └── app.js               # Main application
│
├── frontend/                # Frontend HTML/CSS/JS
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── doexam.html
│   ├── exam_answers.html
│   ├── student-assignments.html
│   ├── teacher-assignments.html
│   └── styles.css
│
├── frontend-react/          # Frontend React (Hiện đại hóa)
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── assets/
│   │   └── styles/
│   └── package.json
│
├── database/
│   └── csdl.sql            # Database schema
│
└── playwright_test/        # E2E tests
\`\`\`

---

## 🗄️ Cơ Sở Dữ Liệu

### Schema Chính

**Users** (Người dùng)
- \`id\` - ID duy nhất
- \`email\` - Email đăng nhập (unique)
- \`password\` - Mật khẩu mã hóa bcrypt
- \`full_name\` - Họ tên
- \`role\` - Vai trò: \`teacher\` hoặc \`student\`
- \`created_at\`, \`updated_at\` - Timestamp

**Exams** (Bài thi)
- \`id\` - ID duy nhất
- \`title\` - Tên bài thi
- \`description\` - Mô tả
- \`teacher_id\` - Giáo viên tạo (FK Users)
- \`original_filename\` - Tên file gốc
- \`file_path\` - Đường dẫn file
- \`is_published\` - Đã công khai hay chưa
- \`created_at\`, \`updated_at\` - Timestamp

**Questions** (Câu hỏi)
- \`id\` - ID duy nhất
- \`exam_id\` - Bài thi (FK Exams)
- \`content\` - Nội dung câu hỏi
- \`explanation\` - Giải thích
- \`points\` - Điểm (mặc định 1)
- \`created_at\`, \`updated_at\` - Timestamp

**Options** (Đáp án)
- \`id\` - ID duy nhất
- \`question_id\` - Câu hỏi (FK Questions)
- \`content\` - Nội dung đáp án
- \`is_correct\` - Đáp án đúng hay sai
- \`created_at\` - Timestamp

**Attempts** (Lần làm bài)
- \`id\` - ID duy nhất
- \`student_id\` - Học sinh (FK Users)
- \`exam_id\` - Bài thi (FK Exams)
- \`start_time\` - Thời gian bắt đầu
- \`end_time\` - Thời gian kết thúc
- \`score\` - Điểm số
- \`is_completed\` - Hoàn thành hay chưa
- \`created_at\`, \`updated_at\` - Timestamp
- **Constraint**: Mỗi học sinh chỉ làm mỗi bài thi 1 lần

**Responses** (Câu trả lời)
- \`id\` - ID duy nhất
- \`attempt_id\` - Lần làm bài (FK Attempts)
- \`question_id\` - Câu hỏi (FK Questions)
- \`option_id\` - Đáp án được chọn (FK Options)
- \`created_at\` - Timestamp

---

## 🔌 API Endpoints

### Authentication (\`/api/auth\`)
- \`POST /register\` - Đăng ký tài khoản mới
- \`POST /login\` - Đăng nhập
- \`GET /profile\` - Lấy thông tin cá nhân (Yêu cầu JWT)

### Exams (\`/api/exams\`)
- \`POST /\` - Tạo bài thi mới (Giáo viên, upload file)
- \`GET /teacher\` - Danh sách bài thi của giáo viên (Giáo viên)
- \`GET /published\` - Danh sách bài thi công khai
- \`GET /:id\` - Chi tiết bài thi theo ID
- \`PATCH /:id/publish\` - Công khai bài thi (Giáo viên)

### Questions (\`/api/questions\`)
- \`GET /:examId\` - Danh sách câu hỏi trong bài thi
- \`POST /\` - Tạo câu hỏi mới
- \`PUT /:id\` - Sửa câu hỏi
- \`DELETE /:id\` - Xóa câu hỏi

### Attempts (\`/api/attempts\`)
- \`POST /\` - Bắt đầu làm bài thi
- \`GET /:id\` - Chi tiết lần làm bài
- \`PUT /:id\` - Cập nhật kết quả, nộp bài
- \`GET /student/:studentId\` - Danh sách bài thi đã làm của học sinh

---

## 🚀 Cách Chạy Dự Án

### Yêu Cầu
- Node.js >= 14
- PostgreSQL >= 12
- npm hoặc yarn

### Setup Backend

1. **Clone dự án**
\`\`\`bash
git clone <repository-url>
cd Do_an_co_so/backend
\`\`\`

2. **Cài đặt dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Cấu hình biến môi trường** (Tạo file \`.env\`)
\`\`\`env
# Database
DB_USER=postgres
DB_HOST=localhost
DB_NAME=quiz_db
DB_PASSWORD=yourpassword
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=7d

# Server
PORT=3000
NODE_ENV=development

# OpenRouter AI API
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
OPENROUTER_API_KEY=your_openrouter_key

# Google Gemini API
GOOGLE_AI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
GOOGLE_AI_API_KEY=your_gemini_key

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5500
\`\`\`

4. **Thiết lập database**
\`\`\`bash
# Tạo database
createdb quiz_db

# Chạy migration
npm run migrate
\`\`\`

5. **Khởi động server**
\`\`\`bash
npm start        # Production mode
npm run dev      # Development mode (nodemon)
\`\`\`

Server sẽ chạy trên \`http://localhost:3000\`

### Setup Frontend React

1. **Cài đặt dependencies**
\`\`\`bash
cd ../frontend-react
npm install
\`\`\`

2. **Khởi động React app**
\`\`\`bash
npm start
\`\`\`

App sẽ mở trên \`http://localhost:3000\` (hoặc port khác nếu 3000 bận)

---

## 📋 Luồng Xử Lý Chính

### 1. Tạo Bài Thi (Giáo Viên)
\`\`\`
Giáo viên upload file (PDF/Word)
    ↓
Middleware xác thực JWT + kiểm tra vai trò teacher
    ↓
Controller: examController.createExam
    ↓
Service: Chuyển file → text bằng pdf-parse/mammoth
    ↓
Gọi AI API (OpenRouter hoặc Google Gemini)
    ↓
AI trả về mảng JSON câu hỏi + đáp án
    ↓
Lưu bài thi + câu hỏi vào database
    ↓
Trả về response cho giáo viên
\`\`\`

### 2. Làm Bài Thi (Học Sinh)
\`\`\`
Học sinh chọn bài thi công khai
    ↓
Controller: attemptController.startAttempt
    ↓
Tạo record trong bảng Attempts
    ↓
Học sinh trả lời câu hỏi
    ↓
Lưu từng câu trả lời vào bảng Responses
    ↓
Học sinh nộp bài
    ↓
Backend tính điểm (so sánh với đáp án đúng)
    ↓
Cập nhật score + is_completed trong Attempts
    ↓
Trả về kết quả cho học sinh
\`\`\`

---

## 🔐 Bảo Mật

- **Authentication**: JWT token, hết hạn sau 7 ngày
- **Password**: Mã hóa bcrypt (salt rounds: 10)
- **Authorization**: Kiểm tra vai trò (teacher/student) ở middleware
- **CORS**: Giới hạn domain được phép truy cập
- **File Upload**: Kiểm tra loại file, giới hạn kích thước (10MB)
- **Input Validation**: Kiểm tra các trường bắt buộc ở controller

---

## 🧪 Testing

### E2E Tests (Playwright)
\`\`\`bash
npx playwright test
npx playwright test --ui    # Mở UI mode
\`\`\`

### Unit Tests
\`\`\`bash
npm test
\`\`\`

---

## 📝 Ghi Chú Kỹ Thuật

### AI Models Used
1. **OpenRouter** (Primary)
   - Mistral (Math)
   - DeepSeek (Physics)
   - Qwen (Programming)
   - Mistral 7B (General)

2. **Google Gemini** (Fallback)
   - Sử dụng nếu không có model phù hợp

### File Processing
- **PDF**: Dùng \`pdf-parse\` để trích text
- **Word (.docx)**: Dùng \`mammoth\` để trích text

### Error Handling
- Middleware catch-all ở \`app.js\` xử lý tất cả lỗi
- Logging chi tiết bằng \`morgan\` cho HTTP requests
- Console logging cho debug (có thể thay bằng logger thực)

---

## 🐛 Troubleshooting

### Database Connection Error
\`\`\`
Lỗi: "Lỗi kết nối PostgreSQL"
Giải pháp: Kiểm tra biến .env, chắc chắn PostgreSQL đang chạy
\`\`\`

### File Upload Error
\`\`\`
Lỗi: "Định dạng file không được hỗ trợ"
Giải pháp: Chỉ upload PDF hoặc Word (.docx), max 10MB
\`\`\`

### AI API Error
\`\`\`
Lỗi: "Thiếu cấu hình OpenRouter API"
Giải pháp: Thêm OPENROUTER_API_KEY và OPENROUTER_API_URL vào .env
\`\`\`

---

## 📞 Liên Hệ & Support

Nếu có câu hỏi hoặc báo cáo lỗi, vui lòng tạo issue trong repository.

---

## 📄 License