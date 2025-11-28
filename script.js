//
// CONFIGURAÇÕES 
const CONFIG = {
    EMAIL_DESTINO: 'psicologiaunialfa4@gmail.com',
    ANIMATION_DELAY: 100,
    SCROLL_OFFSET: 80,
    THROTTLE_DELAY: 16,
    DEBOUNCE_DELAY: 250,
    MESSAGE_TIMEOUT: 15000
};

// CLASSE PRINCIPAL
class UnilfaPsychology {
    constructor() {
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupHeaderScroll();
        this.setupFAQ();
        this.setupScrollAnimations();
        this.setupEntranceAnimations();
        this.setupForm();
        this.setupPhoneMask();
        
        console.log('🧠 UNIALFA Psicologia carregado!');
        console.log('📧 Email configurado:', CONFIG.EMAIL_DESTINO);
    }

    // EVENT LISTENERS
    setupEventListeners() {
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, CONFIG.THROTTLE_DELAY));
        
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, CONFIG.DEBOUNCE_DELAY));
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                this.closeAllFAQs();
            }
        });
    }

    // MENU MOBILE
    setupMobileMenu() {
        const mobileBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        
        if (!mobileBtn || !navLinks) return;
        
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && 
                !mobileBtn.contains(e.target) && 
                !navLinks.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        const mobileBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        mobileBtn.classList.toggle('active');
        navLinks.classList.toggle('mobile-open');
        document.body.style.overflow = this.mobileMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        const mobileBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.querySelector('.nav-links');
        
        if (!this.mobileMenuOpen) return;
        
        this.mobileMenuOpen = false;
        mobileBtn?.classList.remove('active');
        navLinks?.classList.remove('mobile-open');
        document.body.style.overflow = '';
    }

    // FORMULÁRIO DE TRIAGEM
    setupForm() {
        const form = document.getElementById('triagemForm');
        if (!form) return;

        this.setupMedicationToggle();
        this.setupFormValidation(form);
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit(form);
        });
    }

    setupMedicationToggle() {
        const medicacaoSelect = document.getElementById('medicacao');
        const medicacaoDetalhes = document.getElementById('medicacaoDetalhes');
        const qualMedicacao = document.getElementById('qualMedicacao');

        if (!medicacaoSelect || !medicacaoDetalhes) return;

        medicacaoSelect.addEventListener('change', (e) => {
            const shouldShow = e.target.value === 'sim';
            medicacaoDetalhes.style.display = shouldShow ? 'block' : 'none';
            
            if (shouldShow) {
                qualMedicacao.setAttribute('required', 'required');
            } else {
                qualMedicacao.removeAttribute('required');
                qualMedicacao.value = '';
            }
        });
    }

    setupFormValidation(form) {
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            field.addEventListener('input', () => {
                if (field.classList.contains('invalid')) {
                    this.validateField(field);
                }
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const isCheckbox = field.type === 'checkbox';
        const isValid = isCheckbox ? field.checked : value !== '';
        
        if (!isValid && field.hasAttribute('required')) {
            field.classList.add('invalid');
            field.classList.remove('valid');
            return false;
        } else {
            field.classList.remove('invalid');
            if (isCheckbox ? field.checked : value) {
                field.classList.add('valid');
            }
            return true;
        }
    }

    async handleFormSubmit(form) {
        const submitBtn = form.querySelector('.btn-submit');
        const formMessage = document.getElementById('formMessage');
        
        // Validar todos os campos obrigatórios
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showMessage('error', '⚠️ Por favor, preencha todos os campos obrigatórios.');
            const firstInvalid = form.querySelector('.invalid');
            if (firstInvalid) {
                this.scrollToElement(firstInvalid);
                firstInvalid.focus();
            }
            return;
        }

        // Coletar dados
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const emailBody = this.formatEmailBody(data);

        // Mostrar loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>⏳</span> Enviando...';

        try {
            const response = await fetch(`https://formsubmit.co/ajax/${CONFIG.EMAIL_DESTINO}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    _subject: `📋 Nova Triagem - ${data.nome}`,
                    _template: 'box',
                    _captcha: 'false',
                    ...data,
                    _formatted_data: emailBody
                })
            });

            if (response.ok) {
                this.showMessage('success', '✅ Formulário enviado com sucesso! Nossa equipe entrará em contato em breve através do email cadastrado.');
                form.reset();
                
                form.querySelectorAll('.valid, .invalid').forEach(field => {
                    field.classList.remove('valid', 'invalid');
                });
                
                setTimeout(() => {
                    this.scrollToElement(formMessage);
                }, 300);
                
                this.trackEvent('Form', 'Submit', 'Triagem Success');
            } else {
                throw new Error('Erro ao enviar formulário');
            }
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            this.showMessage('error', `❌ Erro ao enviar o formulário. Por favor, tente novamente ou entre em contato diretamente pelo email: ${CONFIG.EMAIL_DESTINO}`);
            this.trackEvent('Form', 'Error', 'Triagem Failed');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>📤</span> Enviar Formulário';
        }
    }

    formatEmailBody(data) {
        const formatDate = () => {
            const now = new Date();
            return now.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        return `
📋 FORMULÁRIO DE TRIAGEM - UNIALFA PSICOLOGIA
════════════════════════════════════════════════

👤 DADOS PESSOAIS
━━━━━━━━━━━━━━━━━━━━
Nome: ${data.nome}
Email: ${data.email}
Telefone: ${data.telefone}
Data de Nascimento: ${data.dataNascimento}
Idade: ${data.idade} anos

🎯 INFORMAÇÕES DO ATENDIMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tipo de Atendimento: ${this.formatTipoAtendimento(data.tipoAtendimento)}

Motivo da Procura:
${data.motivacao}

${data.sintomas ? `Sintomas/Dificuldades:\n${data.sintomas}\n` : ''}
Experiência Anterior: ${this.formatExperiencia(data.experienciaAnterior)}
Medicação Psiquiátrica: ${data.medicacao === 'sim' ? 'Sim' : 'Não'}
${data.qualMedicacao ? `Medicações em uso: ${data.qualMedicacao}` : ''}

📅 DISPONIBILIDADE
━━━━━━━━━━━━━━━━━━
Horários Disponíveis:
${data.disponibilidade}

Nível de Urgência: ${this.formatUrgencia(data.urgencia)}

${data.observacoes ? `💬 OBSERVAÇÕES\n━━━━━━━━━━━━━━\n${data.observacoes}\n` : ''}
════════════════════════════════════════════════
📅 Data do envio: ${formatDate()}
        `.trim();
    }

    formatTipoAtendimento(tipo) {
        const tipos = {
            'individual': 'Psicoterapia Individual',
            'casal': 'Terapia de Casal',
            'familiar': 'Terapia Familiar',
            'infantil': 'Psicologia Infantil',
            'vocacional': 'Orientação Vocacional',
            'grupo': 'Grupo Terapêutico'
        };
        return tipos[tipo] || tipo;
    }

    formatExperiencia(exp) {
        const experiencias = {
            'nao': 'Não, é minha primeira vez',
            'sim-passado': 'Sim, no passado',
            'sim-atual': 'Sim, estou em atendimento atualmente'
        };
        return experiencias[exp] || exp;
    }

    formatUrgencia(urg) {
        const urgencias = {
            'normal': 'Normal - Posso aguardar o processo regular',
            'preferencial': 'Preferencial - Gostaria de iniciar em breve',
            'urgente': 'Urgente - Necessito de atendimento com urgência'
        };
        return urgencias[urg] || urg;
    }

    showMessage(type, text) {
        const messageDiv = document.getElementById('formMessage');
        if (!messageDiv) return;

        const iconSpan = messageDiv.querySelector('.form-message-icon');
        const textSpan = messageDiv.querySelector('.form-message-text');
        
        messageDiv.className = `form-message ${type} show`;
        if (iconSpan) iconSpan.textContent = type === 'success' ? '✅' : '⚠️';
        if (textSpan) textSpan.textContent = text;
        
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.classList.remove('show');
            }, CONFIG.MESSAGE_TIMEOUT);
        }
    }

    // MÁSCARA DE TELEFONE
    setupPhoneMask() {
        const phoneInput = document.getElementById('telefone');
        if (!phoneInput) return;

        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                if (value.length <= 10) {
                    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
                } else {
                    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
                }
            }
            
            e.target.value = value;
        });

        phoneInput.addEventListener('keypress', (e) => {
            if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                e.preventDefault();
            }
        });
    }

    // SCROLL SUAVE
    setupSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    this.scrollToElement(targetElement);
                    this.closeMobileMenu();
                }
            });
        });
    }

    scrollToElement(element) {
        const targetPosition = element.offsetTop - CONFIG.SCROLL_OFFSET;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    // HEADER SCROLL
    setupHeaderScroll() {
        const header = document.getElementById('header');
        if (!header) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    handleScroll() {
        // Parallax nas bolhas de fundo
        const circles = document.querySelectorAll('.bg-circle');
        const scrollTop = window.pageYOffset;
        
        circles.forEach((circle, index) => {
            const speed = 0.5 + (index * 0.2);
            const yPos = -(scrollTop * speed);
            circle.style.transform = `translateY(${yPos}px)`;
        });
    }

    // FAQ
    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                this.toggleFAQItem(item);
            });
        });
    }

    toggleFAQItem(item) {
        const isActive = item.classList.contains('active');
        
        this.closeAllFAQs();
        
        if (!isActive) {
            item.classList.add('active');
            
            setTimeout(() => {
                const itemPosition = item.offsetTop - CONFIG.SCROLL_OFFSET - 20;
                window.scrollTo({
                    top: itemPosition,
                    behavior: 'smooth'
                });
            }, 300);
        }
    }

    closeAllFAQs() {
        document.querySelectorAll('.faq-item.active').forEach(item => {
            item.classList.remove('active');
        });
    }

    // ANIMAÇÕES NO SCROLL
    setupScrollAnimations() {
        if (!('IntersectionObserver' in window)) {
            document.querySelectorAll('.fade-in-up').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll(`
            .service-card, .step, .faq-item, 
            .services-header, .form-container
        `);
        
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.8s ease-out';
            observer.observe(el);
        });
    }

    // ANIMAÇÕES DE ENTRADA
    setupEntranceAnimations() {
        setTimeout(() => {
            const heroElements = document.querySelectorAll('.hero-text, .hero-image');
            heroElements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('fade-in-up');
                }, index * 200);
            });
        }, CONFIG.ANIMATION_DELAY);
    }

    // REDIMENSIONAMENTO
    handleResize() {
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    // TRACKING
    trackEvent(category, action, label = '') {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
        console.log(`📊 Event: ${category} - ${action} - ${label}`);
    }

    // UTILITÁRIOS
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// FUNCIONALIDADES ADICIONAIS

// Lazy Loading para imagens
function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                img.classList.remove('lazy');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        img.classList.add('lazy');
        imageObserver.observe(img);
    });
}

// Estilos dinâmicos
function addAnimationStyles() {
    const styles = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .lazy {
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .lazy.loaded {
            opacity: 1;
        }
        
        .keyboard-navigation *:focus {
            outline: 2px solid var(--primary-color) !important;
            outline-offset: 2px;
        }
        
        .btn.loading {
            opacity: 0.7;
            cursor: not-allowed;
        }
    `;

    if (!document.querySelector('#dynamic-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'dynamic-styles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Botão voltar ao topo
function createBackToTopButton() {
    const button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Voltar ao topo');
    button.setAttribute('title', 'Voltar ao topo');
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            button.style.opacity = '1';
            button.style.transform = 'translateY(0)';
        } else {
            button.style.opacity = '0';
            button.style.transform = 'translateY(100px)';
        }
    });
    
    document.body.appendChild(button);
}

// Acessibilidade
function setupAccessibility() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
    
    const skipLink = document.createElement('a');
    skipLink.href = '#inicio';
    skipLink.textContent = 'Pular para o conteúdo principal';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10000;
        transition: top 0.3s;
        font-weight: 600;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// INICIALIZAÇÃO
let app;

document.addEventListener('DOMContentLoaded', function() {
    try {
        app = new UnilfaPsychology();
        
        addAnimationStyles();
        setupLazyLoading();
        setupAccessibility();
        
        setTimeout(createBackToTopButton, 1000);
        
        console.log('✅ UNIALFA Psicologia carregado completamente!');
    } catch (error) {
        console.error('❌ Erro ao inicializar:', error);
    }
});

// Tratamento de erros global
window.addEventListener('error', function(e) {
    console.error('Erro capturado:', e.error);
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejeitada:', e.reason);
});

// Exportar para debug
window.UnilfaApp = app;
window.CONFIG = CONFIG;