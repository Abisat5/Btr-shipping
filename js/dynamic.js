// Sayfada birden fazla yerde kullanılan fonksiyonları ve global değişkenleri tanımlarız.

// Fiyatlandırma ve Duyuru verisini çeken ana fonksiyon
async function fetchAndRenderData() {
    try {
        // --- 1. FİYAT VERİSİNİ ÇEKME ---
        // packages.json dosyasını sitenin kökünden çeker
        const pricingResponse = await fetch('/_data/packages.json');
        
        if (pricingResponse.ok) {
            const pricingData = await pricingResponse.json();
            updatePricingSection(pricingData);
        } else {
            console.warn('Fiyat verisi (_data/packages.json) bulunamadı veya yolu hatalı. Sabit veriler kullanılıyor olabilir.');
        }
        
        // --- 2. DUYURU VERİSİNİ ÇEKME ---
        fetchAnnouncements();

    } catch (error) {
        console.error("Veri çekme hatası:", error);
    }
}

// Fiyatlandırma bölümünü güncelleyen fonksiyon
function updatePricingSection(data) {
    if (!data || Object.keys(data).length === 0) return;

    // config.yml'deki field'lar ile HTML'deki sütunları eşleştir
    const packages = [
        { name: 'bronze', elementIndex: 1 },
        { name: 'silver', elementIndex: 2 },
        { name: 'gold', elementIndex: 3 }
    ];

    packages.forEach(pkg => {
        const packageElement = document.querySelector(`.row.g-4 .col-lg-4:nth-child(${pkg.elementIndex}) .price-item`);
        if (!packageElement) return;

        // Fiyat Adını ve Fiyatı Güncelle
        packageElement.querySelector('h5').textContent = data[`${pkg.name}_name`];
        packageElement.querySelector('.display-5 small:nth-child(2)').textContent = data[`${pkg.name}_price`];

        // Özellikleri Güncelle (Mevcut HTML'i temizle ve yeniden oluştur)
        const featuresContainer = packageElement.querySelector('.p-4.pt-0');
        featuresContainer.querySelectorAll('p').forEach(p => p.remove()); 
        
        const features = data[`${pkg.name}_features`];
        const quoteButton = featuresContainer.querySelector('.btn-slide').parentNode;
        
        if (features && Array.isArray(features) && features.length > 0) {
            features.forEach(feature => {
                const p = document.createElement('p');
                p.innerHTML = `<i class="fa fa-check text-success me-3"></i>${feature.feature_item}`;
                // "Teklif alın" butonunun hemen öncesine ekle
                featuresContainer.insertBefore(p, quoteButton); 
            });
        }
    });
}


// Duyuru verilerini çeken ve Ana sayfaya render eden fonksiyon
async function fetchAnnouncements() {
    // Netlify CMS, duyuruları tek tek dosyalara (.md veya .json) kaydettiği için,
    // bunları çekmek için GitHub API'si veya site içeriğini listeleyen ek bir servis gerekir.
    // Şimdilik, CMS'in ürettiği statik dosyaların yolunu tahmin ederek demo verisi kullanalım.
    
    // Gerçek kullanımda buraya, CMS'in kaydettiği dosya isimlerini okuyan bir API çağrısı gelir.
    
    // Geçici Demo/Örnek Veri Yapısı (Siz Admin Panelinden veri girdiğinizde bu dosyalar oluşur)
    const demoPosts = [
        { title: "Yeni Yükleme Kısıtlamaları", summary: "Limanlarda uygulanan yeni yükleme ve boşaltma kısıtlamaları hakkında.", slug: "yeni-kisitlamalar", date: "2025-12-04" },
        { title: "Mürettebat Değişiminde Yeni Kurallar", summary: "Kış dönemi için personel değişiminde yeni güvenlik prosedürleri.", slug: "personel-degisimi", date: "2025-12-03" },
        { title: "Yakıt Fiyatlarında Düşüş", summary: "Bölgesel olarak yakıt (bunker) fiyatlarında önemli düşüşler.", slug: "yakit-fiyatlari", date: "2025-12-01" }
        // Admin Panelinden 3'ten fazla duyuru girerseniz, CMS 3. duyurudan sonrasını ana sayfada göstermez.
    ];

    renderAnnouncements(demoPosts);
}

// Duyuruları HTML'e yerleştiren fonksiyon
function renderAnnouncements(posts) {
    const listContainer = document.getElementById('duyuru-listesi');
    if (!listContainer || !posts || posts.length === 0) {
        listContainer.innerHTML = `<div class="col-12 text-center py-5"><p class="text-muted">Güncel duyuru bulunmamaktadır.</p></div>`;
        return;
    }

    listContainer.innerHTML = ''; 
    const recentPosts = posts.slice(0, 3); // Ana sayfada sadece son 3 duyuruyu göster

    recentPosts.forEach(post => {
        const postHtml = `
            <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.3s">
                <div class="service-item p-4">
                    <div class="overflow-hidden mb-4">
                        <img class="img-fluid" src="/img/default-duyuru.jpg" alt="${post.title}"> 
                    </div>
                    <h4 class="mb-3">${post.title}</h4>
                    <p>Yayın Tarihi: ${new Date(post.date).toLocaleDateString('tr-TR')}</p>
                    <a class="btn-slide mt-2" href="#" data-bs-toggle="modal" data-bs-target="#duyuruModal" data-slug="${post.slug}">
                        <i class="fa fa-arrow-right"></i><span>Detayları Gör</span>
                    </a>
                </div>
            </div>
        `;
        listContainer.innerHTML += postHtml;
    });
}

// Sayfa yüklendiğinde ana fonksiyonu çalıştır
fetchAndRenderData();