const axios = require("axios");
const pdf = require("pdf-parse");
const mammoth = require("mammoth");
const { logModelEvaluation } = require("./log.service");

require("dotenv").config();

async function convertToText(fileName, base64Content) {
  try {
    const fileBuffer = Buffer.from(base64Content, "base64");
    console.log(
      "👉 Đang xử lý file:",
      fileName,
      "- Kích thước:",
      fileBuffer.length
    );

    if (fileName.toLowerCase().endsWith(".pdf")) {
      const data = await pdf(fileBuffer);
      return data.text;
    } else if (fileName.toLowerCase().match(/\.(doc|docx)$/)) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      if (!result.value) {
        throw new Error("Không thể trích xuất nội dung từ file Word");
      }
      return result.value;
    } else {
      throw new Error("❌ Định dạng file không được hỗ trợ");
    }
  } catch (error) {
    console.error("❌ Lỗi khi chuyển đổi file:", error);
    throw new Error(
      `Không thể đọc nội dung file ${fileName}: ${error.message}`
    );
  }
}

const generateQuestions = async (
  fileName,
  fileContent,
  specialty = "math",
  difficulty = "easy"
) => {
  try {
    console.log("🚀 Bắt đầu xử lý file:", fileName);
    const textContent = await convertToText(fileName, fileContent);
    if (!textContent || textContent.trim().length === 0) {
      throw new Error("❌ Không thể trích xuất nội dung text từ file");
    }
    console.log(
      "✅ Đã chuyển đổi file thành text, độ dài:",
      textContent.length
    );

    const openRouterModels = {
      math: "mistralai/devstral-small:free",
      physics: "deepseek/deepseek-r1:free",
      chemistry: "mistralai/mistral-7b-instruct:free",
      programming: "qwen/qwen-2.5-coder-32b-instruct:free",
    };

    const difficultyMap = {
      easy: "dễ",
      medium: "trung bình",
      hard: "khó",
    };
    const difficultyText = difficultyMap[difficulty] || "dễ";

    const prompt = `
Bạn là một trợ lý học tập thông minh. 
Hãy tạo 5 câu hỏi trắc nghiệm độ khó: ${difficultyText} từ nội dung sau:

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
    `.trim();

    const modelName = openRouterModels[specialty];

    if (modelName) {
      console.log(`📡 Gọi model OpenRouter: ${modelName}`);

      if (!process.env.OPENROUTER_API_KEY || !process.env.OPENROUTER_API_URL) {
        throw new Error("❌ Thiếu cấu hình OpenRouter API");
      }

      const startTime = Date.now();

      const response = await axios.post(
        process.env.OPENROUTER_API_URL,
        {
          model: modelName,
          max_tokens: 2048,
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: "Bạn là một trợ lý học tập thông minh.",
            },
            { role: "user", content: prompt },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          },
        }
      );

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`⏱️ Thời gian phản hồi từ model: ${responseTime}ms`);

      const rawText =
        response.data?.choices?.[0]?.message?.content ||
        response.data?.completion;
      if (!rawText) throw new Error("❌ Không có nội dung trả về từ model");

      console.log("📨 Phản hồi từ model:", rawText.slice(0, 300), "...");

      const cleanText = rawText
        .replace(/```(json)?\n?/gi, "")
        .replace(/^[^\[{]*([\[{])/s, "$1")
        .replace(/([\]}])[^}\]]*$/s, "$1")
        .replace(/(?:\\n)+/g, "\n")
        .trim();

      let questions;
      try {
        questions = JSON.parse(cleanText);
        if (!Array.isArray(questions))
          throw new Error("❌ Không phải là mảng JSON");
      } catch (parseErr) {
        console.error("❌ Lỗi parse JSON:", cleanText);
        throw new Error("Không thể parse JSON từ phản hồi model");
      }

      questions.forEach((q, i) => {
        if (!q.question || !q.explanation || !Array.isArray(q.options)) {
          throw new Error(`❌ Câu hỏi ${i + 1} thiếu thông tin bắt buộc`);
        }
        if (q.options.length < 2) {
          throw new Error(`❌ Câu hỏi ${i + 1} cần ít nhất 2 lựa chọn`);
        }
        const correctOptions = q.options.filter((opt) => opt.is_correct);
        if (correctOptions.length !== 1) {
          throw new Error(`❌ Câu hỏi ${i + 1} phải có đúng 1 đáp án đúng`);
        }
      });

      console.log(
        `✅ Đã tạo ${questions.length} câu hỏi từ model ${modelName}`
      );

      const resultData = {
        specialty,
        difficulty,
        inputLength: textContent.length,
        responseTime,
        questions: questions.length,
        errors: 0,
        summary: "OK",
      };

      
      return questions;
    }

    // Nếu không có model OpenRouter phù hợp thì gọi Google Gemini
    console.log("🤖 Gọi Google Gemini (chuyên môn 'other')");

    if (!process.env.GOOGLE_AI_API_KEY || !process.env.GOOGLE_AI_API_URL) {
      throw new Error("❌ Thiếu cấu hình API Gemini");
    }

    const geminiUrl = `${process.env.GOOGLE_AI_API_URL}?key=${process.env.GOOGLE_AI_API_KEY}`;
    const start = Date.now();

    const responseGemini = await axios.post(
      geminiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const end = Date.now();
    const responseTime = end - start;
    console.log(`⏱️ Thời gian phản hồi từ Gemini: ${responseTime}ms`);

    const rawTextGemini = responseGemini.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawTextGemini) throw new Error("❌ Không có phản hồi từ Gemini");

    const cleanTextGemini = rawTextGemini.replace(/```json\n|\n```/g, "").trim();
    const questionsGemini = JSON.parse(cleanTextGemini);

    if (!Array.isArray(questionsGemini))
      throw new Error("❌ Không phải là mảng JSON");

    questionsGemini.forEach((q, i) => {
      if (!q.question || !q.explanation || !Array.isArray(q.options)) {
        throw new Error(`❌ Câu hỏi ${i + 1} thiếu thông tin bắt buộc`);
      }
      if (q.options.length < 2) {
        throw new Error(`❌ Câu hỏi ${i + 1} cần ít nhất 2 lựa chọn`);
      }
      const correctOptions = q.options.filter((opt) => opt.is_correct);
      if (correctOptions.length !== 1) {
        throw new Error(`❌ Câu hỏi ${i + 1} phải có đúng 1 đáp án đúng`);
      }
    });

    console.log("✅ Đã tạo câu hỏi thành công với Gemini");

    const resultDataGemini = {
      specialty: "other",
      difficulty,
      inputLength: textContent.length,
      responseTime,
      questions: questionsGemini.length,
      errors: 0,
      summary: "OK",
    };

    

    return questionsGemini;

  } catch (error) {
    console.error("🔥 Chi tiết lỗi:", error);
    throw error;
  }
};

module.exports = { generateQuestions };
