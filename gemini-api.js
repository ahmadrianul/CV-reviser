// INTEGRATION WITH GEMINI API

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent";

/**
 * Checks if the Gemini API Key is valid by making a simple request
 * @param {string} apiKey 
 * @returns {Promise<boolean>}
 */
async function checkApiKeyValid(apiKey) {
    if (!apiKey) return false;
    try {
        const url = `${GEMINI_API_URL}?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });
        return response.ok;
    } catch (e) {
        console.error("API Key check error:", e);
        return false;
    }
}

/**
 * Extracts job description information from a base64 image (screenshot)
 * @param {string} base64Image 
 * @param {string} mimeType 
 * @param {string} apiKey 
 * @returns {Promise<{jobTitle: string, company: string, description: string}>}
 */
async function extractJobFromImage(base64Image, mimeType, apiKey) {
    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    
    const prompt = `Analisis gambar lowongan kerja ini. Ekstrak informasi lowongan kerja tersebut ke dalam format JSON dengan struktur berikut:
{
  "jobTitle": "Nama Posisi Pekerjaan",
  "company": "Nama Perusahaan (jika terdeteksi, default 'Lowongan Kerja')",
  "description": "Teks deskripsi lengkap, kualifikasi, tanggung jawab, dan persyaratan lowongan yang dibaca dari gambar."
}
Kembalikan HANYA objek JSON tersebut tanpa penanda Markdown markdown code blocks.`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menghubungi Gemini API: ${response.statusText} (${errorText})`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    return JSON.parse(responseText);
}

/**
 * Analyzes CV and Job description to calculate ATS score, match keywords, and suggest revisions
 * @param {string} cvText 
 * @param {string} jobTitle 
 * @param {string} jobDescription 
 * @param {string} apiKey 
 * @returns {Promise<object>}
 */
async function analyzeCVAndJob(cvText, jobTitle, jobDescription, apiKey) {
    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    
    const prompt = `
Kamu adalah seorang pakar rekrutmen profesional, konsultan karir, dan ahli sistem ATS (Applicant Tracking System).
Tugasmu adalah menganalisis kecocokan antara CV Pengguna dan Deskripsi Lowongan Kerja yang dituju, lalu memberikan umpan balik detail, saran revisi spesifik, serta membuat surat lamaran (Cover Letter).

CV Pengguna:
"""
${cvText}
"""

Posisi Pekerjaan: ${jobTitle}
Deskripsi & Kualifikasi Lowongan Kerja:
"""
${jobDescription}
"""

Analisis perbandingan keduanya dan berikan respons dalam bahasa Indonesia sebagai objek JSON dengan format berikut:
{
  "jobTitle": "Nama Posisi Pekerjaan yang dianalisis",
  "company": "Nama Perusahaan (jika terdeteksi, default 'Lowongan Kerja')",
  "score": [angka integer 0 sampai 100, mencerminkan persentase kecocokan ATS secara objektif],
  "stats": {
    "hardSkills": [angka integer 0 sampai 100, kecocokan keahlian teknis],
    "experience": [angka integer 0 sampai 100, kecocokan riwayat kerja],
    "softSkills": [angka integer 0 sampai 100, kecocokan soft skills & karakter]
  },
  "quickTip": "Satu tips singkat dan praktis tentang apa yang paling krusial untuk ditambahkan/diperbaiki pada CV guna meningkatkan skor ATS secara signifikan.",
  "keywords": {
    "matched": ["daftar", "skill/kata kunci", "yang", "sudah", "cocok", "di", "CV"],
    "missing": ["daftar", "skill/kata kunci", "penting", "yang", "ada", "di", "Lowongan", "tapi", "belum", "terdeteksi", "di", "CV"]
  },
  "revisions": {
    "summary": {
      "original": "Isi summary profil profesional asli dari CV pengguna (jika tidak ditemukan, tulis 'Tidak ditemukan summary di CV')",
      "recommended": "Versi revisi summary profil profesional yang sangat dioptimalkan untuk posisi ini, menonjolkan pencapaian dan kata kunci relevan"
    },
    "experience": [
      {
        "role": "Nama Jabatan Pekerjaan di CV",
        "company": "Nama Perusahaan & Masa Kerja di CV",
        "bullets": [
          {
            "original": "Poin deskripsi pekerjaan asli dari CV",
            "recommended": "Poin deskripsi kerja yang direvisi menggunakan formula 'Action Verb + Context + Result/Metric' agar sejalan dengan kualifikasi lowongan"
          }
        ]
      }
    ],
    "skillsStructure": "Teks rekomendasi pengelompokan skill di CV agar rapi dan ATS-friendly (pisahkan dengan baris baru untuk setiap kategori, contoh: Hard Skills: React, CSS)"
  },
  "coverLetter": "Teks surat lamaran kerja (Cover Letter) profesional, terstruktur, persuasif, ditulis dalam Bahasa Indonesia formal, yang disesuaikan dengan CV pengguna dan lowongan kerja ini."
}

PENTING:
- Poin deskripsi kerja (bullets) dalam "revisions.experience" harus merevisi poin-poin asli dari CV pengguna. Sesuaikan sebanyak mungkin poin agar relevan dengan deskripsi lowongan kerja tanpa memalsukan fakta (fokuskan pada penyusunan kalimat dan penekanan keahlian).
- Jika CV pengguna tidak memiliki bagian riwayat kerja yang jelas, kumpulkan info seadanya dan buat rekomendasi entri berdasarkan pengalaman akademis atau proyek pribadi.
- Jangan sertakan markdown wrapper pada respons. Kembalikan JSON murni.
`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json"
        }
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gagal menghubungi Gemini API: ${response.statusText} (${errorText})`);
    }

    const data = await response.json();
    const responseText = data.candidates[0].content.parts[0].text;
    
    return JSON.parse(responseText);
}
