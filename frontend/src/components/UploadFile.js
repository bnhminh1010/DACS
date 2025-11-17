import React, { useState } from "react";
import axios from "axios";

const UploadFile = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile); // Log file được chọn
    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Lấy token từ localStorage (token được lưu sau khi đăng nhập)
      const token = localStorage.getItem("token");
      console.log("Token:", token); // Log token để kiểm tra

      if (!token) {
        throw new Error("Vui lòng đăng nhập để sử dụng tính năng này");
      }

      if (!file) {
        throw new Error("Vui lòng chọn file để tải lên");
      }

      // Tạo FormData object để gửi file
      const formData = new FormData();
      formData.append("file", file);

      // Log FormData để kiểm tra
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      // Gửi request với file và token
      console.log("Sending request to server..."); // Log trước khi gửi request
      const response = await axios.post(
        "http://localhost:3000/api/questions/generate",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Server response:", response.data); // Log response từ server
      setQuestions(response.data);
    } catch (err) {
      console.error("Error details:", err.response || err); // Log chi tiết lỗi
      setError(
        err.response?.data?.message ||
          err.message ||
          "Có lỗi xảy ra khi tạo câu hỏi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Tải lên tài liệu</h5>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="file" className="form-label">
                Chọn tệp hoặc kéo thả vào đây
              </label>
              <input
                type="file"
                className="form-control"
                id="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileChange}
                required
              />
              <div className="form-text">
                Định dạng được hỗ trợ: PDF, DOC, DOCX, TXT
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Đang xử lý...
                </>
              ) : (
                "Tải lên"
              )}
            </button>
          </form>

          {error && (
            <div className="alert alert-danger mt-3">
              <strong>Lỗi:</strong> {error}
            </div>
          )}

          {questions.length > 0 && (
            <div className="mt-4">
              <h6>Câu hỏi được tạo:</h6>
              <div className="list-group">
                {questions.map((q, index) => (
                  <div key={index} className="list-group-item">
                    <p className="mb-1">
                      <strong>Câu hỏi {index + 1}:</strong> {q.question}
                    </p>
                    <p className="mb-1">
                      <strong>Giải thích:</strong> {q.explanation}
                    </p>
                    <div className="ms-3">
                      {q.options.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className={`${opt.is_correct ? "text-success" : ""}`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {opt.text}
                          {opt.is_correct && " ✓"}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
