const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '..', 'docs', 'model.log');

/**
 * Ghi log đánh giá model theo format nhiều dòng.
 * @param {string} modelName
 * @param {string} inputFile
 * @param {object} result
 * @param {string} rawPreview Chuỗi raw preview (nếu có)
 */
function logModelEvaluation(modelName, inputFile, result, rawPreview = '') {
    const timestamp = new Date().toISOString();

    const messageLines = [
        `[${timestamp}]`,
        `Model: ${modelName}`,
        `File: ${inputFile}`,
        `Specialty: ${result.specialty}`,
        `Difficulty: ${result.difficulty}`,
        `Input length: ${result.inputLength}`,
        `Response time: ${result.responseTime}ms`,
        `Questions: ${result.questions}`,
        `Errors: ${result.errors}`,
        `Summary: ${result.summary}`,
        `Raw preview: ${rawPreview}`,
        '' // thêm dòng trống để dễ đọc log
    ];

    const message = messageLines.join('\n');

    fs.appendFile(logPath, message, (err) => {
        if (err) {
            console.error('Lỗi khi ghi log đánh giá model:', err);
        }
    });
}

module.exports = { logModelEvaluation };
