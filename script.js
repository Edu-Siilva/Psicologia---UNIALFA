// MODIFIQUE ESTE NÚMERO PARA SEU WHATSAPP
        const WHATSAPP_NUMBER = '5562999999999'; // Formato: código do país + DDD + número
        
        // MODIFIQUE ESTA MENSAGEM PADRÃO
        const DEFAULT_MESSAGE = 'Olá! Gostaria de agendar um atendimento psicológico na UniAlfa.';

        // ==========================================
        // FUNÇÕES UTILITÁRIAS
        // ==========================================
        
        // Função para criar URL do WhatsApp
        function createWhatsAppURL(message = DEFAULT_MESSAGE) {
            const encodedMessage = encodeURIComponent(message);
            return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        }
        
        // Função para scroll suave nos links do menu
        function smoothScroll(target) {
            const element = document.querySelector(target);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        
        // Função para adicionar classe quando elemento entra na viewport
        function handleIntersection(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }

        // ==========================================
        // INICIALIZAÇÃO QUANDO DOM CARREGAR
        // ==========================================
        
        document.addEventListener('DOMContentLoaded', function() {
            // Configurar botões do WhatsApp
            setupWhatsAppButtons();
            
            // Configurar navegação suave
            setupSmoothNavigation();
            
            // Configurar header scroll
            setupHeaderScroll();
            
            // Configurar animações na viewport
            setupScrollAnimations();
            
            // Configurar menu mobile
            setupMobileMenu();
            
            // Mostrar console log para debug
            console.log('🧠 Landing Page UniAlfa Psicologia carregada com sucesso!');
            console.log('📱 WhatsApp configurado para:', WHATSAPP_NUMBER);
        });

        // ==========================================
        // CONFIGURAÇÃO DOS BOTÕES WHATSAPP
        // ==========================================
        
        function setupWhatsAppButtons() {
            const whatsappBtns = document.querySelectorAll('#whatsappBtn, #whatsappCta');
            
            whatsappBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Adicionar animação de clique
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 150);
                    
                    // Abrir WhatsApp com mensagem personalizada
                    const customMessage = 'Olá! Vi o site do atendimento psicológico da UniAlfa e gostaria de agendar uma consulta. Podem me ajudar?';
                    
                    const whatsappURL = createWhatsAppURL(customMessage);
                    window.open(whatsappURL, '_blank');
                    
                    // Analytics (se você usar Google Analytics, descomente a linha abaixo)
                    // gtag('event', 'click', { 'event_category': 'WhatsApp', 'event_label': 'CTA Button' });
                    
                    console.log('🚀 Redirecionando para WhatsApp...');
                });
            });
        }

        // ==========================================
        // NAVEGAÇÃO SUAVE
        // ==========================================
        
        function setupSmoothNavigation() {
            const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
            
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    smoothScroll(targetId);
                    
                    // Fechar menu mobile se estiver aberto
                    const mobileMenu = document.querySelector('.nav-links');
                    if (mobileMenu.classList.contains('mobile-open')) {
                        toggleMobileMenu();
                    }
                });
            });
        }

        // ==========================================
        // HEADER COM SCROLL
        // ==========================================
        
        function setupHeaderScroll() {
            const header = document.getElementById('header');
            let lastScrollY = window.scrollY;
            
            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;
                
                // Adicionar classe quando scroll > 100px
                if (currentScrollY > 100) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                
                lastScrollY = currentScrollY;
            });
        }

        // ==========================================
        // ANIMAÇÕES NO SCROLL
        // ==========================================
        
        function setupScrollAnimations() {
            // Verificar se browser suporta Intersection Observer
            if ('IntersectionObserver' in window) {
                const observerOptions = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };
                
                const observer = new IntersectionObserver(handleIntersection, observerOptions);
                
                // Observar todos os elementos com classe fade-in-up
                const animatedElements = document.querySelectorAll('.fade-in-up');
                animatedElements.forEach(el => {
                    el.style.opacity = '0';
                    el.style.transform = 'translateY(30px)';
                    observer.observe(el);
                });
            } else {
                // Fallback para browsers antigos - mostrar todos os elementos
                const animatedElements = document.querySelectorAll('.fade-in-up');
                animatedElements.forEach(el => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                });
            }
        }

        // ==========================================
        // MENU MOBILE
        // ==========================================
        
        function setupMobileMenu() {
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const navLinks = document.querySelector('.nav-links');
            
            if (mobileMenuBtn && navLinks) {
                mobileMenuBtn.addEventListener('click', toggleMobileMenu);
            }
        }
        
        function toggleMobileMenu() {
            const navLinks = document.querySelector('.nav-links');
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            
            navLinks.classList.toggle('mobile-open');
            mobileMenuBtn.classList.toggle('active');
            
            // Prevenir scroll do body quando menu estiver aberto
            if (navLinks.classList.contains('mobile-open')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }

        // ==========================================
        // OTIMIZAÇÕES DE PERFORMANCE
        // ==========================================
        
        // Debounce function para eventos de scroll
        function debounce(func, wait) {
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
        
        // Lazy loading para imagens (se necessário)
        function setupLazyLoading() {
            const images = document.querySelectorAll('img[loading="lazy"]');
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src || img.src;
                            img.classList.remove('lazy-load');
                            imageObserver.unobserve(img);
                        }
                    });
                });
                
                images.forEach(img => imageObserver.observe(img));
            }
        }

        // ==========================================
        // ADICIONAR ESTILOS MOBILE MENU VIA JS
        // ==========================================
        
        // Adicionar estilos do menu mobile dinamicamente
        const mobileMenuStyles = `
            @media (max-width: 768px) {
                .nav-links {
                    position: fixed;
                    top: 70px;
                    left: 0;
                    width: 100%;
                    height: calc(100vh - 70px);
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(10px);
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    padding: 2rem;
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                    z-index: 999;
                    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                }
                
                .nav-links.mobile-open {
                    display: flex;
                    transform: translateX(0);
                }
                
                .nav-links li {
                    margin: 1rem 0;
                }
                
                .nav-links a {
                    font-size: 1.2rem;
                    padding: 1rem;
                    display: block;
                    width: 100%;
                    text-align: center;
                }
                
                .mobile-menu-btn.active span:nth-child(1) {
                    transform: rotate(45deg) translate(5px, 5px);
                }
                
                .mobile-menu-btn.active span:nth-child(2) {
                    opacity: 0;
                }
                
                .mobile-menu-btn.active span:nth-child(3) {
                    transform: rotate(-45deg) translate(7px, -6px);
                }
            }
        `;
        
        // Injetar estilos na página
        const styleSheet = document.createElement('style');
        styleSheet.textContent = mobileMenuStyles;
        document.head.appendChild(styleSheet);

        // ==========================================
        // ANALYTICS E TRACKING (OPCIONAL)
        // ==========================================
        
        // Função para trackear eventos (descomente se usar Google Analytics)
        /*
        function trackEvent(action, category, label) {
            if (typeof gtag !== 'undefined') {
                gtag('event', action, {
                    'event_category': category,
                    'event_label': label
                });
            }
        }
        */

        // ==========================================
        // FORMULÁRIO DE CONTATO (OPCIONAL)
        // ==========================================
        
        // Se você quiser adicionar um formulário de contato, descomente e modifique:
        /*
        function setupContactForm() {
            const contactForm = document.getElementById('contactForm');
            if (contactForm) {
                contactForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const formData = new FormData(this);
                    const name = formData.get('name');
                    const phone = formData.get('phone');
                    const message = formData.get('message');
                    
                    const whatsappMessage = `Olá! Meu nome é ${name}.
Telefone: ${phone}
Mensagem: ${message}
                    
Gostaria de agendar um atendimento psicológico na UniAlfa.`;
                    
                    const whatsappURL = createWhatsAppURL(whatsappMessage);
                    window.open(whatsappURL, '_blank');
                });
            }
        }
        */
       //teste git//