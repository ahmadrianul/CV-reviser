// MAIN APPLICATION LOGIC

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Application State
const state = {
    apiKey: localStorage.getItem('gemini_api_key') || '',
    cvText: '',
    cvFileName: '',
    jobTitle: '',
    jobText: '',
    jobImageBase64: '',
    jobImageMime: '',
    activeTab: 'tab-cv',
    activeOptionTab: 'opt-text',
    activeSubTab: 'rev-summary',
    analysisResult: null,
    isAnalyzing: false
};

// UI Elements
const els = {
    // Navigation
    tabs: document.querySelectorAll('.nav-tab'),
    panels: document.querySelectorAll('.tab-panel'),
    statusBadge: document.getElementById('status-badge'),
    btnTabSettings: document.getElementById('btn-tab-settings'),
    
    // CV Tab
    cvUploadZone: document.getElementById('cv-upload-zone'),
    cvFileInput: document.getElementById('cv-file-input'),
    cvFileDetails: document.getElementById('cv-file-details'),
    cvFilename: document.getElementById('cv-filename'),
    cvFilesize: document.getElementById('cv-filesize'),
    btnRemoveCv: document.getElementById('btn-remove-cv'),
    cvTextInput: document.getElementById('cv-text-input'),
    cvCharCount: document.getElementById('cv-char-count'),
    btnNextToJob: document.getElementById('btn-next-to-job'),
    
    // Job Tab
    optionTabs: document.querySelectorAll('.option-tab'),
    optionContents: document.querySelectorAll('.option-content'),
    jobTitleInput: document.getElementById('job-title-input'),
    jobTextInput: document.getElementById('job-text-input'),
    jobCharCount: document.getElementById('job-char-count'),
    jobUploadZone: document.getElementById('job-upload-zone'),
    jobFileInput: document.getElementById('job-file-input'),
    jobImagePreviewContainer: document.getElementById('job-image-preview-container'),
    jobImagePreview: document.getElementById('job-image-preview'),
    jobImageName: document.getElementById('job-image-name'),
    btnRemoveImage: document.getElementById('btn-remove-image'),
    btnBackToCv: document.getElementById('btn-back-to-cv'),
    btnRunMatch: document.getElementById('btn-run-match'),
    
    // Dashboard Tab
    navTabDashboard: document.getElementById('nav-tab-dashboard'),
    resultDot: document.getElementById('result-dot'),
    loadingState: document.getElementById('loading-state'),
    loadingTitle: document.getElementById('loading-title'),
    loadingSub: document.getElementById('loading-sub'),
    emptyState: document.getElementById('empty-state'),
    resultsContent: document.getElementById('results-content'),
    btnGoToUpload: document.getElementById('btn-go-to-upload'),
    
    // Results elements
    matchScore: document.getElementById('match-score'),
    gaugePath: document.getElementById('gauge-path'),
    matchRating: document.getElementById('match-rating'),
    matchSummaryDesc: document.getElementById('match-summary-desc'),
    resultJobTitle: document.getElementById('result-job-title'),
    resultCompany: document.getElementById('result-company'),
    barHardSkills: document.getElementById('bar-hard-skills'),
    barExperience: document.getElementById('bar-experience'),
    barSoftSkills: document.getElementById('bar-soft-skills'),
    quickTipText: document.getElementById('quick-tip-text'),
    matchedSkillsChips: document.getElementById('matched-skills-chips'),
    missingSkillsChips: document.getElementById('missing-skills-chips'),
    
    // Revisions
    subTabs: document.querySelectorAll('.sub-tab'),
    subTabContents: document.querySelectorAll('.subtab-content'),
    origSummary: document.getElementById('orig-summary'),
    newSummaryText: document.getElementById('new-summary-text'),
    experienceRevisionsList: document.getElementById('experience-revisions-list'),
    skillsStructureText: document.getElementById('skills-structure-text'),
    fullCvText: document.getElementById('full-cv-text'),
    btnDownloadCv: document.getElementById('btn-download-cv'),
    coverLetterText: document.getElementById('cover-letter-text'),
    
    // Settings Tab
    apiKeyInput: document.getElementById('api-key-input'),
    btnToggleKey: document.getElementById('btn-toggle-key'),
    btnSaveSettings: document.getElementById('btn-save-settings'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastIcon: document.getElementById('toast-icon'),
    toastMessage: document.getElementById('toast-message')
};

// INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    // Render Icons
    lucide.createIcons();
    
    // Load Saved API Key & Check Status
    if (state.apiKey) {
        els.apiKeyInput.value = state.apiKey;
        updateApiStatus(true);
    } else {
        updateApiStatus(false);
    }
    
    // Setup Event Listeners
    initNavigation();
    initCvUpload();
    initJobInput();
    initSettings();
    initCopyButtons();
    initDownloadButton();
});

// TOAST NOTIFICATIONS
function showToast(message, type = 'info') {
    els.toastMessage.textContent = message;
    
    // Reset classes
    els.toast.className = 'toast';
    els.toastIcon.removeAttribute('data-lucide');
    
    let iconName = 'info';
    if (type === 'success') {
        els.toast.classList.add('toast-success');
        iconName = 'check-circle';
    } else if (type === 'error') {
        els.toast.classList.add('toast-error');
        iconName = 'x-circle';
    } else {
        els.toast.classList.add('toast-info');
    }
    
    // Update icon via Lucide
    els.toastIcon.setAttribute('data-lucide', iconName);
    lucide.createIcons({ node: els.toast });
    
    // Show toast
    els.toast.classList.remove('hidden');
    
    // Hide after 3 seconds
    if (window.toastTimeout) clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        els.toast.classList.add('hidden');
    }, 3000);
}

// UPDATE API KEY BADGE STATUS
function updateApiStatus(isValid) {
    const badgeText = els.statusBadge.querySelector('.badge-text');
    if (isValid) {
        els.statusBadge.className = 'badge badge-active';
        badgeText.textContent = 'API Key Aktif';
    } else {
        els.statusBadge.className = 'badge badge-demo';
        badgeText.textContent = 'Mode Demo (Tanpa API Key)';
    }
}

// NAVIGATION SETUP
function initNavigation() {
    // Main Tabs Switching
    els.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    // Next/Back Actions
    els.btnNextToJob.addEventListener('click', () => {
        // Validate CV input
        if (!state.cvText.trim()) {
            showToast('Silakan unggah file CV PDF atau tempel teks CV terlebih dahulu.', 'error');
            return;
        }
        switchTab('tab-job');
    });
    
    els.btnBackToCv.addEventListener('click', () => {
        switchTab('tab-cv');
    });
    
    els.btnGoToUpload.addEventListener('click', () => {
        switchTab('tab-cv');
    });
    
    // Sub-Tabs Switching (Revisions Summary/Experience/Skills)
    els.subTabs.forEach(subtab => {
        subtab.addEventListener('click', () => {
            els.subTabs.forEach(s => s.classList.remove('active'));
            subtab.classList.add('active');
            
            const targetSubtab = subtab.getAttribute('data-subtab');
            els.subTabContents.forEach(content => {
                if (content.id === targetSubtab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            state.activeSubTab = targetSubtab;
        });
    });
}

function switchTab(tabId) {
    els.panels.forEach(panel => {
        if (panel.id === tabId) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
    
    els.tabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    state.activeTab = tabId;
    
    // If settings button was clicked directly
    if (tabId === 'tab-settings') {
        els.btnTabSettings.classList.add('active');
    } else {
        els.btnTabSettings.classList.remove('active');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// CV UPLOAD SETUP
function initCvUpload() {
    // Textarea character count
    els.cvTextInput.addEventListener('input', (e) => {
        state.cvText = e.target.value;
        els.cvCharCount.textContent = `${state.cvText.length} karakter`;
        
        // Clear file input if text is entered
        if (state.cvText.trim() && state.cvFileName) {
            clearCvFile();
        }
    });
    
    // Drag & Drop
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        els.cvUploadZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        els.cvUploadZone.addEventListener(eventName, () => {
            els.cvUploadZone.classList.add('dragover');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        els.cvUploadZone.addEventListener(eventName, () => {
            els.cvUploadZone.classList.remove('dragover');
        }, false);
    });
    
    els.cvUploadZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleCvFile(files[0]);
        }
    });
    
    els.cvUploadZone.addEventListener('click', () => {
        els.cvFileInput.click();
    });
    
    els.cvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleCvFile(e.target.files[0]);
        }
    });
    
    els.btnRemoveCv.addEventListener('click', (e) => {
        e.stopPropagation();
        clearCvFile();
    });
}

async function handleCvFile(file) {
    if (file.type !== 'application/pdf') {
        showToast('Format file tidak didukung. Mohon unggah file PDF.', 'error');
        return;
    }
    
    state.cvFileName = file.name;
    els.cvFilename.textContent = file.name;
    els.cvFilesize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
    
    els.cvUploadZone.classList.add('hidden');
    els.cvFileDetails.classList.remove('hidden');
    
    // Extract text from PDF
    showToast('Mengekstrak teks dari PDF...', 'info');
    try {
        const text = await extractTextFromPdf(file);
        state.cvText = text;
        els.cvTextInput.value = text;
        els.cvCharCount.textContent = `${text.length} karakter`;
        showToast('Teks CV berhasil diekstrak!', 'success');
    } catch (e) {
        console.error(e);
        showToast('Gagal membaca PDF secara lokal. Silakan tempel teks CV secara manual.', 'error');
    }
}

function clearCvFile() {
    state.cvFileName = '';
    state.cvText = els.cvTextInput.value; // Keep whatever is in textarea
    els.cvFileInput.value = '';
    
    els.cvUploadZone.classList.remove('hidden');
    els.cvFileDetails.classList.add('hidden');
}

// Local PDF.js extraction
function extractTextFromPdf(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function () {
            try {
                const typedarray = new Uint8Array(this.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = "";
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(" ");
                    fullText += pageText + "\n";
                }
                resolve(fullText);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
    });
}

// JOB DETAILS SETUP
function initJobInput() {
    // Option Tabs (Text vs Screenshot)
    els.optionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            els.optionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const option = tab.getAttribute('data-option');
            els.optionContents.forEach(content => {
                if (content.id === option) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
            state.activeOptionTab = option;
        });
    });
    
    // Job textarea char count
    els.jobTextInput.addEventListener('input', (e) => {
        state.jobText = e.target.value;
        els.jobCharCount.textContent = `${state.jobText.length} karakter`;
    });
    
    // Screenshot Upload Listeners
    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        els.jobUploadZone.addEventListener(eventName, preventDefaults, false);
    });
    
    els.jobUploadZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleJobImage(files[0]);
        }
    });
    
    els.jobUploadZone.addEventListener('click', () => {
        els.jobFileInput.click();
    });
    
    els.jobFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleJobImage(e.target.files[0]);
        }
    });
    
    els.btnRemoveImage.addEventListener('click', (e) => {
        e.stopPropagation();
        clearJobImage();
    });
    
    // RUN MATCH BUTTON
    els.btnRunMatch.addEventListener('click', () => {
        runAnalysis();
    });
}

async function handleJobImage(file) {
    if (!file.type.startsWith('image/')) {
        showToast('Format file tidak didukung. Mohon unggah file gambar.', 'error');
        return;
    }
    
    state.jobImageMime = file.type;
    els.jobImageName.textContent = file.name;
    
    // Preview image locally
    const reader = new FileReader();
    reader.onload = async function (e) {
        const base64Data = e.target.result.split(',')[1];
        state.jobImageBase64 = base64Data;
        els.jobImagePreview.src = e.target.result;
        
        els.jobUploadZone.classList.add('hidden');
        els.jobImagePreviewContainer.classList.remove('hidden');
        
        // If API Key is configured, run OCR automatically via Gemini
        if (state.apiKey) {
            try {
                showToast('Membaca informasi lowongan dari gambar (AI OCR)...', 'info');
                // Temporarily disable match button during OCR
                els.btnRunMatch.disabled = true;
                
                const extracted = await extractJobFromImage(state.jobImageBase64, state.jobImageMime, state.apiKey);
                
                if (extracted.jobTitle) {
                    els.jobTitleInput.value = extracted.jobTitle;
                    state.jobTitle = extracted.jobTitle;
                }
                if (extracted.description) {
                    els.jobTextInput.value = extracted.description;
                    state.jobText = extracted.description;
                    els.jobCharCount.textContent = `${state.jobText.length} karakter`;
                }
                
                showToast('Informasi lowongan berhasil diekstrak!', 'success');
            } catch (e) {
                console.error(e);
                showToast('Gagal memproses gambar lowongan via AI. Silakan tulis deskripsi secara manual.', 'error');
            } finally {
                els.btnRunMatch.disabled = false;
            }
        } else {
            // Demo Mode: Autofill with Tokopedia job for testing
            showToast('Mode Demo: Memuat contoh lowongan kerja terkait gambar...', 'info');
            els.jobTitleInput.value = "Senior Frontend Engineer";
            els.jobTextInput.value = `Posisi: Senior Frontend Engineer
Perusahaan: Tokopedia
Kualifikasi:
- 5+ tahun pengalaman pengembangan web dengan React
- Mahir dalam JavaScript (ES6+), TypeScript, dan Next.js
- Memiliki pengalaman optimasi performa web (Core Web Vitals)
- Terbiasa memimpin tim kecil, code review, dan merancang micro-frontend
- Berpengalaman menggunakan GraphQL, Redux, Docker, dan Jest`;
            state.jobTitle = "Senior Frontend Engineer";
            state.jobText = els.jobTextInput.value;
            els.jobCharCount.textContent = `${state.jobText.length} karakter`;
        }
    };
    reader.readAsDataURL(file);
}

function clearJobImage() {
    state.jobImageBase64 = '';
    state.jobImageMime = '';
    els.jobFileInput.value = '';
    
    els.jobUploadZone.classList.remove('hidden');
    els.jobImagePreviewContainer.classList.add('hidden');
}

// SETTINGS KEY SETUP
function initSettings() {
    // Click Settings Button
    els.btnTabSettings.addEventListener('click', () => {
        switchTab('tab-settings');
    });
    
    // Toggle Visibility
    els.btnToggleKey.addEventListener('click', () => {
        const type = els.apiKeyInput.type === 'password' ? 'text' : 'password';
        els.apiKeyInput.type = type;
        const icon = els.btnToggleKey.querySelector('i, svg');
        if (icon) {
            icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
            lucide.createIcons({ node: els.btnToggleKey });
        }
    });
    
    // Save Settings
    els.btnSaveSettings.addEventListener('click', async () => {
        const newKey = els.apiKeyInput.value.trim();
        
        if (!newKey) {
            // Delete Key
            state.apiKey = '';
            localStorage.removeItem('gemini_api_key');
            updateApiStatus(false);
            showToast('API Key dihapus. Berjalan kembali dalam Mode Demo.', 'info');
            switchTab('tab-cv');
            return;
        }
        
        showToast('Memverifikasi API Key...', 'info');
        els.btnSaveSettings.disabled = true;
        
        const isValid = await checkApiKeyValid(newKey);
        els.btnSaveSettings.disabled = false;
        
        if (isValid) {
            state.apiKey = newKey;
            localStorage.setItem('gemini_api_key', newKey);
            updateApiStatus(true);
            showToast('API Key berhasil disimpan dan aktif!', 'success');
            switchTab('tab-cv');
        } else {
            showToast('API Key tidak valid atau tidak bisa dihubungi. Silakan periksa kembali.', 'error');
        }
    });
    
    els.btnCloseSettings.addEventListener('click', () => {
        switchTab('tab-cv');
    });
}

// COPY CLIPBOARD IMPLEMENTATION
function initCopyButtons() {
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            
            if (targetEl) {
                let textToCopy = targetEl.textContent || targetEl.innerText;
                
                // For preformatted code
                if (targetEl.tagName === 'PRE') {
                    textToCopy = targetEl.textContent;
                }
                
                navigator.clipboard.writeText(textToCopy.trim())
                    .then(() => {
                        const origHtml = btn.innerHTML;
                        btn.innerHTML = `<i data-lucide="check" style="width:12px;height:12px;"></i> Berhasil!`;
                        lucide.createIcons({ node: btn });
                        
                        setTimeout(() => {
                            btn.innerHTML = origHtml;
                            lucide.createIcons({ node: btn });
                        }, 2000);
                        
                        showToast('Berhasil disalin ke clipboard!', 'success');
                    })
                    .catch(err => {
                        console.error('Copy failed:', err);
                        showToast('Gagal menyalin teks.', 'error');
                    });
            }
        });
    });
}

// RUN MATCH ANALYSIS LOGIC
async function runAnalysis() {
    // Validate inputs
    if (!state.cvText.trim()) {
        showToast('Harap unggah CV atau tempel teks CV Anda terlebih dahulu.', 'error');
        switchTab('tab-cv');
        return;
    }
    
    // Check if we have job details (text or screenshot)
    let jobDescription = state.jobText.trim();
    let jobTitle = els.jobTitleInput.value.trim() || 'Lowongan Terkait';
    
    if (state.activeOptionTab === 'opt-screenshot' && !state.jobImageBase64 && !jobDescription) {
        showToast('Harap unggah gambar screenshot lowongan kerja terlebih dahulu.', 'error');
        return;
    } else if (state.activeOptionTab === 'opt-text' && !jobDescription) {
        showToast('Harap tempel deskripsi lowongan kerja terlebih dahulu.', 'error');
        return;
    }
    
    // Setup state
    state.isAnalyzing = true;
    switchTab('tab-dashboard');
    
    // UI state for loading
    els.emptyState.classList.add('hidden');
    els.resultsContent.classList.add('hidden');
    els.loadingState.classList.remove('hidden');
    els.resultDot.classList.add('hidden');
    
    try {
        if (state.apiKey) {
            // Live AI Analysis
            showToast('Menganalisis kecocokan dengan Gemini AI...', 'info');
            
            // If screenshot is selected but OCR description is empty, run OCR first
            if (state.activeOptionTab === 'opt-screenshot' && !jobDescription && state.jobImageBase64) {
                els.loadingTitle.textContent = "Membaca screenshot lowongan kerja...";
                const ocrResult = await extractJobFromImage(state.jobImageBase64, state.jobImageMime, state.apiKey);
                jobDescription = ocrResult.description || '';
                jobTitle = ocrResult.jobTitle || 'Lowongan Kerja';
                els.jobTitleInput.value = jobTitle;
                els.jobTextInput.value = jobDescription;
                state.jobText = jobDescription;
                state.jobTitle = jobTitle;
            }
            
            els.loadingTitle.textContent = "Mengevaluasi keselarasan CV (ATS Matching)...";
            const results = await analyzeCVAndJob(state.cvText, jobTitle, jobDescription, state.apiKey);
            state.analysisResult = results;
            renderResults(results);
            showToast('Analisis selesai!', 'success');
        } else {
            // DEMO MODE (Simulate delay)
            showToast('Menjalankan Simulasi (Mode Demo)...', 'info');
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                if (progress === 40) {
                    els.loadingTitle.textContent = "Membandingkan keahlian teknis...";
                } else if (progress === 80) {
                    els.loadingTitle.textContent = "Menghitung skor ATS & merevisi bullet points...";
                }
            }, 500);
            
            await new Promise(resolve => setTimeout(resolve, 2500));
            clearInterval(interval);
            
            state.analysisResult = window.mockAnalysisResult;
            renderResults(window.mockAnalysisResult);
            showToast('Analisis Simulasi Selesai!', 'success');
        }
    } catch (e) {
        console.error(e);
        els.emptyState.classList.remove('hidden');
        els.loadingState.classList.add('hidden');
        showToast(`Terjadi kesalahan: ${e.message}`, 'error');
    } finally {
        state.isAnalyzing = false;
    }
}

// RENDER ANALYSIS RESULTS
function renderResults(res) {
    els.loadingState.classList.add('hidden');
    els.resultsContent.classList.remove('hidden');
    els.resultDot.classList.remove('hidden');
    
    // 1. Render ATS Score
    const scoreVal = res.score || 0;
    els.matchScore.textContent = scoreVal;
    
    // SVG circular progress calculation
    // Radius is 40, Circumference is 2 * PI * r = 251.2
    const circumference = 251.2;
    const offset = circumference - (scoreVal / 100) * circumference;
    els.gaugePath.style.strokeDashoffset = offset;
    
    // Gauge color dynamically based on score
    if (scoreVal >= 80) {
        els.gaugePath.style.stroke = 'var(--accent-emerald)';
        els.matchRating.textContent = 'Kecocokan Sangat Baik';
        els.matchRating.className = 'text-emerald';
    } else if (scoreVal >= 60) {
        els.gaugePath.style.stroke = 'var(--accent-amber)';
        els.matchRating.textContent = 'Kecocokan Cukup Baik';
        els.matchRating.className = 'text-amber';
    } else {
        els.gaugePath.style.stroke = 'var(--accent-red)';
        els.matchRating.textContent = 'Kecocokan Kurang Selaras';
        els.matchRating.className = 'text-red';
    }
    
    // Match Description
    els.matchSummaryDesc.textContent = `Analisis kecocokan CV Anda menunjukkan skor ATS sebesar ${scoreVal}%. ${res.quickTip ? 'Saran utama: ' + res.quickTip : ''}`;
    
    // 2. Job Title & Company
    els.resultJobTitle.textContent = res.jobTitle || 'Lowongan Kerja';
    els.resultCompany.textContent = res.company || 'Peluang Terkait';
    
    // 3. Stats bars
    els.barHardSkills.style.width = `${res.stats?.hardSkills || 50}%`;
    els.barExperience.style.width = `${res.stats?.experience || 50}%`;
    els.barSoftSkills.style.width = `${res.stats?.softSkills || 50}%`;
    
    // 4. Quick tip box
    els.quickTipText.textContent = res.quickTip || "Revisi kata kunci di bagian skills Anda untuk menaikkan relevansi.";
    
    // 5. Render Skills chips (Matched & Missing)
    els.matchedSkillsChips.innerHTML = '';
    if (res.keywords?.matched?.length) {
        res.keywords.matched.forEach(skill => {
            const chip = document.createElement('span');
            chip.className = 'chip chip-success';
            chip.textContent = skill;
            els.matchedSkillsChips.appendChild(chip);
        });
    } else {
        els.matchedSkillsChips.innerHTML = '<span class="text-muted text-xs">Tidak ditemukan kecocokan keahlian</span>';
    }
    
    els.missingSkillsChips.innerHTML = '';
    if (res.keywords?.missing?.length) {
        res.keywords.missing.forEach(skill => {
            const chip = document.createElement('span');
            chip.className = 'chip chip-warning';
            chip.textContent = skill;
            els.missingSkillsChips.appendChild(chip);
        });
    } else {
        els.missingSkillsChips.innerHTML = '<span class="text-muted text-xs">Hebat! Semua keahlian penting terpenuhi</span>';
    }
    
    // 6. Revisions - Summary
    els.origSummary.textContent = res.revisions?.summary?.original || state.cvText.substring(0, 150) + "...";
    els.newSummaryText.textContent = res.revisions?.summary?.recommended || "Rekomendasi summary profil baru.";
    
    // 7. Revisions - Experience
    els.experienceRevisionsList.innerHTML = '';
    if (res.revisions?.experience?.length) {
        res.revisions.experience.forEach(exp => {
            const expItem = document.createElement('div');
            expItem.className = 'experience-revision-item';
            
            const title = document.createElement('h4');
            title.className = 'exp-role-title text-white';
            title.textContent = exp.role || 'Jabatan Terkait';
            
            const meta = document.createElement('p');
            meta.className = 'exp-company-meta';
            meta.textContent = exp.company || 'Perusahaan';
            
            expItem.appendChild(title);
            expItem.appendChild(meta);
            
            if (exp.bullets?.length) {
                exp.bullets.forEach(bullet => {
                    const bulletDiv = document.createElement('div');
                    bulletDiv.className = 'bullet-revision';
                    
                    const origDiv = document.createElement('div');
                    origDiv.className = 'bullet-orig';
                    origDiv.textContent = bullet.original;
                    
                    const newDiv = document.createElement('div');
                    newDiv.className = 'bullet-new';
                    
                    const newSpan = document.createElement('span');
                    newSpan.textContent = bullet.recommended;
                    
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'btn btn-secondary btn-xs';
                    copyBtn.innerHTML = '<i data-lucide="copy"></i> Salin';
                    copyBtn.addEventListener('click', () => {
                        navigator.clipboard.writeText(bullet.recommended)
                            .then(() => showToast('Poin deskripsi disalin!', 'success'))
                            .catch(() => showToast('Gagal menyalin', 'error'));
                    });
                    
                    newDiv.appendChild(newSpan);
                    newDiv.appendChild(copyBtn);
                    
                    bulletDiv.appendChild(origDiv);
                    bulletDiv.appendChild(newDiv);
                    
                    expItem.appendChild(bulletDiv);
                });
            }
            
            els.experienceRevisionsList.appendChild(expItem);
        });
    } else {
        els.experienceRevisionsList.innerHTML = '<p class="text-muted text-xs">Tidak ada riwayat kerja yang perlu direvisi secara mendalam.</p>';
    }
    
    // Re-create lucide icons inside dynamically added copy buttons
    lucide.createIcons({ node: els.experienceRevisionsList });
    
    // 8. Revisions - Skills Structure
    els.skillsStructureText.textContent = res.revisions?.skillsStructure || "Rekomendasi penataan skill.";
    
    // 9. Cover Letter
    els.coverLetterText.textContent = res.coverLetter || "Rancangan surat lamaran kerja.";
    
    // 10. Revisions - Full CV Compile
    const fullCvMd = compileFullCvMarkdown(res);
    if (els.fullCvText) {
        els.fullCvText.textContent = fullCvMd;
    }
}

function initDownloadButton() {
    if (els.btnDownloadCv) {
        els.btnDownloadCv.addEventListener('click', () => {
            const text = els.fullCvText.textContent;
            if (!text || text.includes('[Teks CV lengkap')) {
                showToast('Jalankan analisis terlebih dahulu.', 'error');
                return;
            }
            const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'CV_Revised.md');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('CV berhasil diunduh sebagai Markdown!', 'success');
        });
    }
}

function compileFullCvMarkdown(res) {
    let md = "";
    md += `# CV TEROPTIMALISASI (REVISI AI)\n\n`;
    
    if (res.revisions?.summary?.recommended) {
        md += `## RINGKASAN PROFESIONAL\n\n`;
        md += `${res.revisions.summary.recommended}\n\n`;
    }
    
    if (res.revisions?.experience?.length) {
        md += `## PENGALAMAN KERJA\n\n`;
        res.revisions.experience.forEach(exp => {
            md += `### ${exp.role}\n`;
            md += `*${exp.company}*\n\n`;
            if (exp.bullets?.length) {
                exp.bullets.forEach(bullet => {
                    md += `- ${bullet.recommended}\n`;
                });
            }
            md += `\n`;
        });
    }
    
    if (res.revisions?.skillsStructure) {
        md += `## KEAHLIAN & PERANGKAT LUNAK\n\n`;
        md += `${res.revisions.skillsStructure}\n\n`;
    }
    
    return md.trim();
}
