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
 * Gửi nội dung file tới AI để tạo câu hỏi trắc nghiệm.
 * @param {string} fileName Tên file
 * @param {string} fileContent Nội dung file dưới dạng base64
 * @param {string} specialty Chuyên môn (math, physics, ...)
 * @param {string} difficulty Độ khó (easy, medium, hard)
 * @returns {Promise<Array>}
 */
const generateQuestions = async (
  fileName,
  fileContent,
  specialty = "math",
  difficulty = "easy"

) => {
  try {
    console.log("Bắt đầu xử lý file:", fileName);
    const textContent = await convertToText(fileName, fileContent);
    if (!textContent || textContent.trim().length === 0) {
      throw new Error("Không thể trích xuất nội dung text từ file");
    }
    console.log("Đã chuyển đổi file thành text, độ dài:", textContent.length);

    // Map specialty sang model OpenRouter
    const openRouterModels = {
      math: "mistralai/devstral-small:free",
      physics: "deepseek/deepseek-r1:free",
      chemistry: "mistralai/mistral-7b-instruct:free",
      programming: "qwen/qwen-2.5-coder-32b-instruct:free",
    };

    // Map difficulty sang tiếng Việt cho prompt
    const difficultyMap = {
      easy: "dễ",
      medium: "trung bình",
      hard: "khó",
    };
    const difficultyText = difficultyMap[difficulty] || "dễ";
    

    if (specialty in openRouterModels) {
      // Gọi OpenRouter API với model tương ứng
      if (!process.env.OPENROUTER_API_KEY || !process.env.OPENROUTER_API_URL) {
        throw new Error("Thiếu cấu hình OpenRouter API");
      }
      const apiUrl = process.env.OPENROUTER_API_URL;
      const prompt = `\nBạn là một trợ lý học tập thông minh. 
                      Hãy tạo 5 câu hỏi trắc nghiệm độ khó: ${difficultyText} từ nội dung sau:\n\n"${textContent}"\n
                      \nMỗi câu hỏi có định dạng JSON như sau:\n{\n  "question": "...",\n  "explanation": "...",\n  "options": [\n    { "text": "...", "is_correct": true/false },\n    ...\n  ]\n}\n
                      \nChỉ trả về một mảng JSON chứa 5 câu hỏi như ví dụ trên.\n`;
      try {
        
        const response = await axios.post(
          apiUrl,
          {
            model: openRouterModels[specialty],
            max_tokens: 2048,
            temperature: 0.7,
            messages: [
              {
                role: "system",
                content: "Bạn là một trợ lý học tập thông minh.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
          }
        );
        const rawText =
          response.data?.choices?.[0]?.message?.content ||
          response.data?.completion;

        if (!rawText) {
          throw new Error(
            "Không tìm thấy nội dung trong phản hồi từ OpenRouter API"
          );
        }

        const cleanText = rawText
          .replace(/```(json)?\n?/gi, "")
          .replace(/^[^\[{]*([\[{])/s, "$1")
          .replace(/([\]}])[^}\]]*$/s, "$1")
          .replace(/(?:\\n)+/g, "\n")
          .trim();

        const questions = JSON.parse(cleanText);
        if (!Array.isArray(questions)) {
          throw new Error("Dữ liệu không đúng định dạng mảng");
        }
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
      } catch (err) {
        console.error(
          "Lỗi khi gọi OpenRouter API:",
          err.response?.data || err.message
        );
        throw new Error(
          "Lỗi khi gọi OpenRouter API: " +
            (err.response?.data?.error?.message || err.message)
        );
      }
    }

    // Nếu là 'other' thì dùng Google Gemini như cũ
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("Thiếu cấu hình GOOGLE_AI_API_KEY");
    }
    if (!process.env.GOOGLE_AI_API_URL) {
      throw new Error("Thiếu cấu hình GOOGLE_AI_API_URL");
    }
    const apiUrl = `${process.env.GOOGLE_AI_API_URL}?key=${process.env.GOOGLE_AI_API_KEY}`;
    const prompt = `\nBạn là một trợ lý học tập thông minh. Hãy tạo 5 câu hỏi trắc nghiệm độ khó: ${difficultyText} từ nội dung sau:\n\n"${textContent}"\n\nMỗi câu hỏi có định dạng JSON như sau:\n{\n  "question": "...",\n  "explanation": "...",\n  "options": [\n    { "text": "...", "is_correct": true/false },\n    ...\n  ]\n}\n\nChỉ trả về một mảng JSON chứa 5 câu hỏi như ví dụ trên.\n`;
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
      const rawText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Không tìm thấy nội dung trong phản hồi từ API");
      }
      const cleanText = rawText.replace(/```json\n|\n```/g, "").trim();
      const questions = JSON.parse(cleanText);
      if (!Array.isArray(questions)) {
        throw new Error("Dữ liệu không đúng định dạng mảng");
      }
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
