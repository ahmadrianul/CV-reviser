// MAIN APPLICATION LOGIC

// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// Application State
const state = {
    apiKey: localStorage.getItem('gemini_api_key') || '',
    activeModel: localStorage.getItem('gemini_active_model') || 'gemini-3.5-flash',
    cvText: '',
    cvFileName: '',
    jobTitle: '',
    jobText: '',
    jobImageBase64: '',
    jobImageMime: '',
    activeTab: 'tab-cv',
    previousTab: 'tab-cv',
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
    btnDownloadCv: document.getElementById('btn-download-cv'),
    btnCopyFullCv: document.getElementById('btn-copy-full-cv'),
    cvPaperName: document.getElementById('cv-paper-name'),
    cvPaperContact: document.getElementById('cv-paper-contact'),
    cvPaperSummary: document.getElementById('cv-paper-summary'),
    cvPaperExperience: document.getElementById('cv-paper-experience'),
    cvPaperSkills: document.getElementById('cv-paper-skills'),
    coverLetterText: document.getElementById('cover-letter-text'),
    
    // Settings Tab
    apiKeyInput: document.getElementById('api-key-input'),
    modelSelect: document.getElementById('model-select'),
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
        if (els.apiKeyInput) els.apiKeyInput.value = state.apiKey;
        updateApiStatus(true);
    } else {
        updateApiStatus(false);
    }
    
    // Load Saved Model Selector Value
    if (els.modelSelect) {
        els.modelSelect.value = state.activeModel;
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
    if (tabId === 'tab-settings' && state.activeTab !== 'tab-settings') {
        state.previousTab = state.activeTab;
    }

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
        if (els.btnTabSettings) els.btnTabSettings.classList.add('active');
    } else {
        if (els.btnTabSettings) els.btnTabSettings.classList.remove('active');
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
    // Click Settings Button (legacy compatibility)
    if (els.btnTabSettings) {
        els.btnTabSettings.addEventListener('click', () => {
            switchTab('tab-settings');
        });
    }
    
    // Toggle Access Password Visibility
    if (els.btnToggleAccessPassword) {
        els.btnToggleAccessPassword.addEventListener('click', () => {
            const type = els.accessPasswordInput.type === 'password' ? 'text' : 'password';
            els.accessPasswordInput.type = type;
            const icon = els.btnToggleAccessPassword.querySelector('i, svg');
            if (icon) {
                icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
                lucide.createIcons({ node: els.btnToggleAccessPassword });
            }
        });
    }

    // Access Password Validation
    if (els.accessPasswordInput) {
        els.accessPasswordInput.addEventListener('input', () => {
            const val = els.accessPasswordInput.value.trim();
            if (val === '@nakAyam12345') {
                state.isUnlocked = true;
                localStorage.setItem('access_password', '@nakAyam12345');
                if (els.apiKeyContainer) els.apiKeyContainer.classList.remove('hidden');
                if (els.optionGemini35) {
                    els.optionGemini35.disabled = false;
                    els.optionGemini35.textContent = 'Gemini 3.5 Flash (Terbaik & Akurat)';
                }
                showToast('Akses premium terverifikasi! Fitur terbuka.', 'success');
            } else {
                // Silently lock premium features while typing
                state.isUnlocked = false;
                localStorage.removeItem('access_password');
                if (els.apiKeyContainer) els.apiKeyContainer.classList.add('hidden');
                if (els.optionGemini35) {
                    els.optionGemini35.disabled = true;
                    els.optionGemini35.textContent = 'Gemini 3.5 Flash (Premium - Terkunci 🔒)';
                }
                
                if (state.activeModel === 'gemini-3.5-flash') {
                    state.activeModel = 'gemini-3.1-flash-lite';
                    localStorage.setItem('gemini_active_model', 'gemini-3.1-flash-lite');
                    if (els.modelSelect) els.modelSelect.value = 'gemini-3.1-flash-lite';
                }
            }
        });
        
        els.accessPasswordInput.addEventListener('change', () => {
            const val = els.accessPasswordInput.value.trim();
            if (val && val !== '@nakAyam12345') {
                showToast('Password akses salah. Silakan coba lagi.', 'error');
            }
        });
    }

    // Toggle API Key Visibility
    if (els.btnToggleKey) {
        els.btnToggleKey.addEventListener('click', () => {
            const type = els.apiKeyInput.type === 'password' ? 'text' : 'password';
            els.apiKeyInput.type = type;
            const icon = els.btnToggleKey.querySelector('i, svg');
            if (icon) {
                icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
                lucide.createIcons({ node: els.btnToggleKey });
            }
        });
    }
    
    // Auto-save & Verify API Key on change/blur
    if (els.apiKeyInput) {
        els.apiKeyInput.addEventListener('change', async () => {
            const newKey = els.apiKeyInput.value.trim();
            
            if (!newKey) {
                // Delete Key
                state.apiKey = '';
                localStorage.removeItem('gemini_api_key');
                updateApiStatus(false);
                showToast('API Key dihapus. Berjalan kembali dalam Mode Demo.', 'info');
                return;
            }
            
            showToast('Memverifikasi API Key...', 'info');
            els.apiKeyInput.disabled = true;
            
            const isValid = await checkApiKeyValid(newKey);
            els.apiKeyInput.disabled = false;
            
            if (isValid) {
                state.apiKey = newKey;
                localStorage.setItem('gemini_api_key', newKey);
                updateApiStatus(true);
                showToast('API Key valid dan berhasil disimpan!', 'success');
            } else {
                updateApiStatus(false);
                showToast('API Key tidak valid atau tidak bisa dihubungi. Silakan periksa kembali.', 'error');
            }
        });
    }
    
    // Auto-save Model Selection on change
    if (els.modelSelect) {
        els.modelSelect.addEventListener('change', () => {
            const selectedModel = els.modelSelect.value;
            state.activeModel = selectedModel;
            localStorage.setItem('gemini_active_model', selectedModel);
            showToast(`Model AI diubah ke: ${selectedModel === 'gemini-3.5-flash' ? 'Gemini 3.5 Flash' : 'Gemini 3.1 Flash Lite'}`, 'success');
        });
    }

    if (els.btnSaveSettings) {
        els.btnSaveSettings.addEventListener('click', () => {
            switchTab('tab-cv');
        });
    }
    
    if (els.btnCloseSettings) {
        els.btnCloseSettings.addEventListener('click', () => {
            switchTab(state.previousTab);
        });
    }
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
    
    // 10. Revisions - CV Preview Page Render
    if (els.cvPaperName) els.cvPaperName.textContent = res.candidateName || "NAMA LENGKAP";
    if (els.cvPaperContact) els.cvPaperContact.textContent = res.candidateContact || "Telepon | Email | LinkedIn | Lokasi";
    if (els.cvPaperSummary) els.cvPaperSummary.textContent = res.revisions?.summary?.recommended || "Ringkasan profil profesional.";
    
    if (els.cvPaperExperience) {
        els.cvPaperExperience.innerHTML = '';
        if (res.revisions?.experience?.length) {
            res.revisions.experience.forEach(exp => {
                const expItem = document.createElement('div');
                expItem.className = 'cv-paper-experience-item';
                
                const expHeader = document.createElement('div');
                expHeader.className = 'cv-paper-exp-header';
                expHeader.innerHTML = `<span>${exp.role.toUpperCase()}</span>`;
                
                const expCompany = document.createElement('div');
                expCompany.className = 'cv-paper-exp-company';
                expCompany.textContent = exp.company;
                
                const bulletList = document.createElement('ul');
                bulletList.className = 'cv-paper-bullets';
                
                if (exp.bullets?.length) {
                    exp.bullets.forEach(bullet => {
                        const bulletLi = document.createElement('li');
                        bulletLi.className = 'cv-paper-bullet-item';
                        bulletLi.textContent = bullet.recommended;
                        bulletList.appendChild(bulletLi);
                    });
                }
                
                expItem.appendChild(expHeader);
                expItem.appendChild(expCompany);
                expItem.appendChild(bulletList);
                els.cvPaperExperience.appendChild(expItem);
            });
        } else {
            els.cvPaperExperience.innerHTML = '<p class="cv-paper-text">Tidak ada riwayat kerja.</p>';
        }
    }
    
    if (els.cvPaperSkills) {
        els.cvPaperSkills.textContent = res.revisions?.skillsStructure || "Keahlian.";
    }
}

function initDownloadButton() {
    if (els.btnDownloadCv) {
        els.btnDownloadCv.addEventListener('click', () => {
            if (!state.analysisResult) {
                showToast('Jalankan analisis terlebih dahulu.', 'error');
                return;
            }
            const htmlContent = compileFullCvHtml(state.analysisResult);
            const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const filename = `${(state.analysisResult.candidateName || 'CV').replace(/\s+/g, '_')}_Revisi.doc`;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('CV berhasil diunduh sebagai dokumen Word!', 'success');
        });
    }
    
    if (els.btnCopyFullCv) {
        els.btnCopyFullCv.addEventListener('click', () => {
            if (!state.analysisResult) {
                showToast('Jalankan analisis terlebih dahulu.', 'error');
                return;
            }
            const text = compileFullCvPlainText(state.analysisResult);
            navigator.clipboard.writeText(text)
                .then(() => {
                    const origHtml = els.btnCopyFullCv.innerHTML;
                    els.btnCopyFullCv.innerHTML = `<i data-lucide="check" style="width:12px;height:12px;"></i> Berhasil!`;
                    lucide.createIcons({ node: els.btnCopyFullCv });
                    setTimeout(() => {
                        els.btnCopyFullCv.innerHTML = origHtml;
                        lucide.createIcons({ node: els.btnCopyFullCv });
                    }, 2000);
                    showToast('Teks CV berhasil disalin!', 'success');
                })
                .catch(() => showToast('Gagal menyalin teks.', 'error'));
        });
    }
}

function compileFullCvHtml(res) {
    const name = res.candidateName || "NAMA LENGKAP";
    const contact = res.candidateContact || "Telepon | Email | LinkedIn | Lokasi";
    const summary = res.revisions?.summary?.recommended || "";
    const skills = res.revisions?.skillsStructure || "";
    
    let expHtml = "";
    if (res.revisions?.experience?.length) {
        res.revisions.experience.forEach(exp => {
            let bulletsHtml = "";
            if (exp.bullets?.length) {
                exp.bullets.forEach(b => {
                    bulletsHtml += `<li style="font-size: 11pt; font-family: 'Calibri', Arial, sans-serif; line-height: 1.4; margin-bottom: 3pt; color: #18181b;">${b.recommended}</li>`;
                });
            }
            
            expHtml += `
            <div style="margin-bottom: 12pt; font-family: 'Calibri', Arial, sans-serif;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 2pt;">
                    <tr>
                        <td style="font-weight: bold; font-size: 11pt; color: #000000; font-family: 'Calibri', Arial, sans-serif;">${exp.role.toUpperCase()}</td>
                    </tr>
                </table>
                <div style="font-weight: bold; color: #52525b; font-size: 11pt; font-family: 'Calibri', Arial, sans-serif; margin-bottom: 4pt;">${exp.company}</div>
                <ul style="margin-top: 2pt; margin-bottom: 6pt; padding-left: 18pt; list-style-type: disc;">
                    ${bulletsHtml}
                </ul>
            </div>`;
        });
    }
    
    return `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset='utf-8'>
        <title>${name} - CV Teroptimalkan</title>
        <!--[if gte mso 9]>
        <xml>
            <w:WordDocument>
                <w:View>Print</w:View>
                <w:Zoom>100</w:Zoom>
                <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
            @page {
                size: 21cm 29.7cm;
                margin: 2.54cm 2.54cm 2.54cm 2.54cm;
            }
            body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #18181b; }
            .header { text-align: center; border-bottom: 2px solid #18181b; padding-bottom: 8pt; margin-bottom: 16pt; }
            .name { font-size: 18pt; font-weight: bold; text-transform: uppercase; margin: 0; color: #000000; font-family: 'Calibri', 'Arial', sans-serif; }
            .contact { font-size: 11px; color: #52525b; margin-top: 4pt; font-family: 'Calibri', 'Arial', sans-serif; }
            .section { margin-bottom: 18pt; font-family: 'Calibri', 'Arial', sans-serif; }
            .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; border-bottom: 1px solid #d4d4d8; padding-bottom: 2pt; margin-bottom: 8pt; color: #000000; font-family: 'Calibri', 'Arial', sans-serif; letter-spacing: 0.05em; }
            .text { font-size: 11pt; text-align: justify; margin: 0; color: #18181b; font-family: 'Calibri', 'Arial', sans-serif; }
            .pre { white-space: pre-wrap; font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; margin: 0; color: #18181b; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="name">${name}</div>
            <div class="contact">${contact}</div>
        </div>
        
        <div class="section">
            <div class="section-title">RINGKASAN PROFESIONAL</div>
            <p class="text">${summary}</p>
        </div>
        
        <div class="section">
            <div class="section-title">PENGALAMAN KERJA</div>
            ${expHtml}
        </div>
        
        <div class="section">
            <div class="section-title">KEAHLIAN & PERANGKAT LUNAK</div>
            <pre class="pre">${skills}</pre>
        </div>
    </body>
    </html>
    `.trim();
}

function compileFullCvPlainText(res) {
    let text = "";
    text += `${res.candidateName || 'NAMA LENGKAP'}\n`;
    text += `${res.candidateContact || 'Kontak'}\n\n`;
    
    text += `RINGKASAN PROFESIONAL\n`;
    text += `=====================\n`;
    text += `${res.revisions?.summary?.recommended || ''}\n\n`;
    
    text += `PENGALAMAN KERJA\n`;
    text += `================\n`;
    if (res.revisions?.experience?.length) {
        res.revisions.experience.forEach(exp => {
            text += `${exp.role.toUpperCase()}\n`;
            text += `${exp.company}\n`;
            if (exp.bullets?.length) {
                exp.bullets.forEach(b => {
                    text += `- ${b.recommended}\n`;
                });
            }
            text += `\n`;
        });
    }
    
    text += `KEAHLIAN & PERANGKAT LUNAK\n`;
    text += `==========================\n`;
    text += `${res.revisions?.skillsStructure || ''}\n`;
    
    return text.trim();
}
