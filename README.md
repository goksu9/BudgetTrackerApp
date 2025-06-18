GÜVENLİK SEBEBİYLE API KEY BULUNAN YERLER "XXXXXX" ILE DEGISTIRILDI, BU NEDENLE UYGULAMA SADECE .APK YUKLENDIGINDE CALISIR, EXPO GO'DA ÇALIŞMAZ. APK DOSYASI REPO'NUN İÇİNDE VERİLMİŞTİR.
# 📱 Budget Tracker App

Modern ve kullanıcı dostu bir bütçe takip uygulaması. React Native ile geliştirilmiş bu uygulama, kişisel finanslarınızı kolayca yönetmenizi sağlar.

## ✨ Özellikler

- 💰 **Gelir/Gider Takibi**: Tüm finansal işlemlerinizi kategorilere göre organize edin
- 📊 **İstatistikler**: Detaylı grafikler ve raporlarla harcama alışkanlıklarınızı analiz edin
- 🎯 **Bütçe Planlama**: Aylık bütçe hedefleri belirleyin ve takip edin
- 🌍 **Çoklu Dil Desteği**: Türkçe ve İngilizce dil seçenekleri
- 💱 **Çoklu Para Birimi**: Farklı para birimlerinde işlem yapabilme
- 🌙 **Karanlık/Aydınlık Tema**: Göz yorgunluğunu azaltan tema seçenekleri
- 🔐 **Güvenli Giriş**: Firebase Authentication ile güvenli hesap yönetimi
- ☁️ **Bulut Senkronizasyon**: Verileriniz Firebase'de güvenle saklanır
- 📤 **Veri Dışa Aktarma**: İşlemlerinizi CSV formatında dışa aktarın

## 🚀 Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- React Native CLI
- Android Studio (Android geliştirme için)


## 📱 Kullanım

### Ana Ekranlar

1. **Giriş/Kayıt**: Güvenli hesap oluşturma ve giriş
2. **Ana Sayfa**: Genel bütçe durumu ve hızlı işlem ekleme
3. **İşlemler**: Tüm gelir/gider kayıtlarını görüntüleme ve düzenleme
4. **İstatistikler**: Kategorilere göre harcama analizi ve grafikler
5. **Bütçe**: Aylık bütçe hedefleri ve takibi
6. **Ayarlar**: Dil, para birimi, tema ve hesap ayarları

### İşlem Ekleme

1. Ana sayfada "+" butonuna tıklayın
2. İşlem türünü seçin (Gelir/Gider)
3. Kategori seçin
4. Tutar ve açıklama girin
5. Tarih seçin (varsayılan: bugün)
6. Kaydet butonuna tıklayın

## 🛠️ Teknolojiler

- **Frontend**: React Native
- **Backend**: Firebase (Authentication, Firestore)
- **Navigasyon**: React Navigation
- **State Management**: React Context API
- **Veri Saklama**: AsyncStorage
- **UI Bileşenleri**: Expo Vector Icons
- **Grafikler**: React Native Chart Kit

## 📁 Proje Yapısı

```
BudgetTracker/
├── android/                 # Android native kodu
├── components/             # Yeniden kullanılabilir bileşenler
├── constants/              # Sabitler (kategoriler, çeviriler)
├── context/                # React Context providers
├── navigation/             # Navigasyon yapılandırması
├── screens/                # Uygulama ekranları
├── styles/                 # Global stiller
├── utils/                  # Yardımcı fonksiyonlar
├── App.js                  # Ana uygulama dosyası
└── package.json           # Bağımlılıklar
```

## 🔧 Yapılandırma

### Dil Değiştirme
- Ayarlar > Dil seçeneğinden Türkçe/İngilizce arasında geçiş yapabilirsiniz

### Para Birimi Değiştirme
- Ayarlar > Para Birimi bölümünden istediğiniz para birimini seçebilirsiniz

### Tema Değiştirme
- Ayarlar > Tema seçeneğinden Aydınlık/Karanlık tema arasında geçiş yapabilirsiniz

## 📊 Veri Dışa Aktarma

- İşlemler ekranında "Dışa Aktar" butonuna tıklayın
- CSV formatında tüm işlemleriniz indirilecektir
- Dosya cihazınızın Downloads klasörüne kaydedilir

## 🔒 Güvenlik

- Tüm kullanıcı verileri Firebase'de şifrelenmiş olarak saklanır
- API anahtarları güvenlik için gizlenmiştir
- Kullanıcı kimlik doğrulaması Firebase Authentication ile yapılır


## 📞 İletişim

- **Geliştirici**: Hüseyin Göksu Hacıoğlu
- **E-posta**: goksu.hacioglu@gmail.com
- **GitHub**: [github.com/goksu9]

## 🙏 Teşekkürler
