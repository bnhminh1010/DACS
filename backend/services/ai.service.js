const axios = require("axios");
const pdf = require("pdf-parse"); // Đọc file pdf
const mammoth = require("mammoth"); // Đọc file word
require("dotenv").config();

/**
 * Chuyển đổi nội dung file thành text thuần túy
 * @param {string} fileName Tên file
 * @param {string} base64Content Nội dung file dưới dạng base64
 * @returns {Promise<string>} Nội dung text
 */
async function convertToText(fileName, base64Content) {
  try {
    // Chuyển base64 thành buffer
    const fileBuffer = Buffer.from(base64Content, "base64");

    console.log("Đang xử lý file:", fileName, "kích thước:", fileBuffer.length);

    if (fileName.toLowerCase().endsWith(".pdf")) {
      const data = await pdf(fileBuffer);
      return data.text;
    } else if (fileName.toLowerCase().match(/\.(doc|docx)$/)) {
      try {
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        if (!result.value) {
          throw new Error("Không thể trích xuất nội dung từ file Word");
        }
        return result.value;
      } catch (docError) {
        console.error("Lỗi khi xử lý file Word:", docError);
        throw new Error(`Lỗi khi đọc file Word: ${docError.message}`);
      }
    } else {
      throw new Error("Định dạng file không được hỗ trợ");
    }
  } catch (error) {
    console.error("Lỗi khi chuyển đổi file:", error);
    throw new Error(
      `Không thể đọc nội dung file ${fileName}: ${error.message}`
    );
  }
}

/**
 * Gửi nội dung file tới Gemini để tạo câu hỏi trắc nghiệm.
 * @param {string} fileName Tên file
 * @param {string} fileContent Nội dung file dưới dạng base64
 * @returns {Promise<Array>}
 */
const generateQuestions = async (fileName, fileContent) => {
  try {
    console.log("Bắt đầu xử lý file:", fileName);

    // Chuyển đổi nội dung file thành text
    const textContent = await convertToText(fileName, fileContent);

    if (!textContent || textContent.trim().length === 0) {
      throw new Error("Không thể trích xuất nội dung text từ file");
    }

    console.log("Đã chuyển đổi file thành text, độ dài:", textContent.length);

    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Thiếu cấu hình GOOGLE_AI_API_KEY");
    }

    if (!process.env.GOOGLE_AI_API_URL) {
      throw new Error("Thiếu cấu hình GOOGLE_AI_API_URL");
    }

    const apiUrl = `${process.env.GOOGLE_AI_API_URL}?key=${process.env.GOOGLE_AI_API_KEY}`;

    const prompt = `
Bạn là một trợ lý học tập thông minh. Hãy tạo 5 câu hỏi trắc nghiệm từ nội dung sau:

"${textContent}"

Mỗi câu hỏi có định dạng JSON như sau:
{
  "question": "...",
  "explanation": "...",
  "options": [
    { "text": "...", "is_correct": true/false },
    ...
  ]
}

Chỉ trả về một mảng JSON chứa 5 câu hỏi như ví dụ trên.
`;

    console.log("Đang gửi yêu cầu tới API...");

    try {
      const response = await axios.post(
        apiUrl,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Nhận được phản hồi từ API");

      // Kiểm tra response
      if (!response.data) {
        throw new Error("Không nhận được dữ liệu từ API");
      }

      // Lấy response text (dạng chuỗi JSON)
      const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        console.error("Response data:", JSON.stringify(response.data, null, 2));
        throw new Error("Không tìm thấy nội dung trong phản hồi từ API");
      }

      try {
        // Loại bỏ markdown code block nếu có
        const cleanText = rawText.replace(/```json\n|\n```/g, "").trim();
        console.log("Clean text:", cleanText);

        // Parse JSON trả về
        const questions = JSON.parse(cleanText);

        // Validate cấu trúc dữ liệu
        if (!Array.isArray(questions)) {
          throw new Error("Dữ liệu không đúng định dạng mảng");
        }

        // Validate từng câu hỏi
        questions.forEach((q, index) => {
          if (!q.question || !q.explanation || !Array.isArray(q.options)) {
            throw new Error(`Câu hỏi ${index + 1} thiếu thông tin bắt buộc`);
          }
          if (q.options.length < 2) {
            throw new Error(`Câu hỏi ${index + 1} cần ít nhất 2 lựa chọn`);
          }
          const correctOptions = q.options.filter((opt) => opt.is_correct);
          if (correctOptions.length !== 1) {
            throw new Error(`Câu hỏi ${index + 1} phải có đúng 1 đáp án đúng`);
          }
        });

        return questions;
      } catch (parseError) {
        console.error("Lỗi parse JSON:", rawText);
        throw new Error(`Lỗi khi xử lý dữ liệu: ${parseError.message}`);
      }
    } catch (apiError) {
      console.error(
        "Lỗi khi gọi API:",
        apiError.response?.data || apiError.message
      );
      if (apiError.response?.status === 400) {
        throw new Error(
          "Yêu cầu không hợp lệ. Vui lòng kiểm tra nội dung đầu vào."
        );
      }
      if (
        apiError.response?.status === 401 ||
        apiError.response?.status === 403
      ) {
        throw new Error(
          "Lỗi xác thực API key. Vui lòng kiểm tra lại cấu hình."
        );
      }
      throw new Error(
        "Lỗi khi gọi API Gemini: " +
          (apiError.response?.data?.error?.message || apiError.message)
      );
    }
  } catch (error) {
    console.error("Chi tiết lỗi:", error);
    throw error;
  }
};

module.exports = {
  generateQuestions,
};
