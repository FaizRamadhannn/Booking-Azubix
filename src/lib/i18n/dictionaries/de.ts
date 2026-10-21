import type { Dictionary } from "./en";

/**
 * German copy. Typed with `satisfies Dictionary` so TypeScript rejects this
 * file the moment its shape drifts from `en.ts` — a missing or misspelled
 * key here is a compile error, not a silent runtime fallback.
 */
export const de = {
  common: {
    skipToBooking: "Zur Buchung springen",
    languageSwitcherLabel: "Sprache",
    status: {
      AVAILABLE: "Verfügbar",
      BOOKED: "Gebucht",
      EXPIRED: "Abgelaufen",
      CANCELLED: "Storniert",
    },
    packageStatus: {
      UNPAID: "Belum dibayar",
      PENDING: "Menunggu konfirmasi",
      CONFIRMED: "Aktif",
      CANCELLED: "Dibatalkan",
    },
    paymentStatus: {
      UNPAID: "Belum dibayar",
      PENDING: "Menunggu konfirmasi",
      CONFIRMED: "Dikonfirmasi admin",
    },
    bookingType: {
      REGULAR: "Regular",
      PRIVATE: "Private",
    },
    level: "Niveau",
    back: "Zurück",
    close: "Schließen",
    retry: "Erneut versuchen",
    tryAgain: "Erneut versuchen",
  },

  site: {
    brandName: "Azubixbook",
    brandTagline: "Deutschkurse A1–B1",
    navAdmin: "Admin",
    navBookClass: "Kurs buchen",
    navBookClassShort: "Buchen",
    footerTagline: "Azubixbook — Deutschkurse für die Niveaus A1, A2 und B1.",
    footerTimezoneNote: "Alle Kurszeiten werden in {timezone} angezeigt.",
    navFeatures: "Vorteile",
    navProcess: "So funktioniert's",
    navPrivate: "Privat",
    navFaq: "FAQ",
  },

  hero: {
    badge: "Deutschkurse A1 · A2 · B1",
    headline: "Bequemer lernen",
    headlineAccent: "zur richtigen Zeit",
    subcopy:
      "Wählen Sie Ihr Niveau, einen freien Termin an einem Wochentag und teilen Sie Ihrem Lehrer mit, was Sie zuletzt behandelt haben. Sie sehen sofort, welche Zeiten noch frei sind.",
    cta: "Kurs buchen",
    ctaPrivate: "Privatpakete ansehen",
    facts: {
      weekdays: {
        title: "Montag bis Freitag",
        detail: "Am Wochenende ist geschlossen, damit der Zeitplan verlässlich bleibt.",
      },
      slots: {
        title: "{count} feste Termine pro Tag",
        detail: "Von {start} bis {end} Uhr, {timezone}.",
      },
      levels: {
        title: "Niveaus {levels}",
        detail: "Buchen Sie das Niveau, das Sie gerade lernen.",
      },
      qris: {
        title: "Sofort per QRIS bezahlen",
        detail: "Mit jeder Mobile-Banking- oder E-Wallet-App scannen.",
      },
    },
  },

  landing: {
    process: {
      heading: "In drei Schritten zum Kurs",
      subtext: "Von der Kurswahl bis zur Zahlung in wenigen Minuten.",
      steps: [
        {
          title: "Kurs wählen",
          detail: "Regulär pro Termin oder ein Privatpaket mit günstigerem Preis pro Termin.",
        },
        {
          title: "Freien Termin wählen",
          detail: "Sehen Sie live, welche Zeiten an Wochentagen für Ihr Niveau frei sind.",
        },
        {
          title: "Per QRIS bezahlen",
          detail: "Ihr Termin wird während der Zahlung reserviert, danach bestätigt der Admin.",
        },
      ],
    },
    private: {
      eyebrow: "Privatunterricht",
      heading: "Wählen Sie Ihr Privatpaket",
      subtext: "Günstiger pro Termin, eins zu eins mit Ihrer Lehrkraft. Das ganze Paket wird vorab per QRIS bezahlt.",
    },
    faq: {
      heading: "Häufige Fragen",
      items: [
        {
          question: "Was ist der Unterschied zwischen regulär und privat?",
          answer: "Reguläre Kurse werden pro Termin bezahlt. Privatpakete sind pro Termin günstiger und enthalten E-Book, Übungen und Kursaufzeichnungen, werden aber vollständig im Voraus bezahlt.",
        },
        {
          question: "Wie früh muss ich buchen?",
          answer: "Buchen Sie mindestens einen Tag (H-1) vor dem Kurs. Sie können bis zu {days} Tage im Voraus buchen.",
        },
        {
          question: "Wie funktioniert die Zahlung?",
          answer: "Nach der Terminwahl wird der Termin {minutes} Minuten für Sie reserviert. Scannen Sie den QRIS-Code, geben Sie den angezeigten Betrag ein und tippen Sie auf \"Saya Sudah Bayar\". Der Admin bestätigt Ihre Überweisung manuell.",
        },
        {
          question: "Kann ich meinen Termin ändern?",
          answer: "Bitte wenden Sie sich mit Ihrem Zahlungscode an den Admin. Der Admin kann Ihre Buchung auf einen anderen freien Termin verschieben.",
        },
      ],
    },
    cta: {
      heading: "Bereit loszulegen?",
      subtext: "Wählen Sie einen Termin, der in Ihre Woche passt, und sichern Sie ihn sich noch heute.",
      button: "Jetzt Kurs buchen",
    },
  },

  levels: {
    A1: "Anfänger — Begrüßungen, Alphabet, Präsens, Alltagswortschatz.",
    A2: "Grundlegende Kenntnisse — Vergangenheit, Reisen und Alltagsgespräche.",
    B1: "Mittelstufe — Meinungen äußern, längere Texte, Prüfungsvorbereitung.",
  },

  booking: {
    sectionHeading: "Kurs buchen",
    sectionSubtext: "Alle Zeiten werden in {timezone} angezeigt.",

    terms: {
      heading: "Ketentuan Booking Class",
      item1: "Booking kelas dilakukan minimal **H-1** sebelum jadwal kelas.",
      item2: "Mohon pastikan waktu yang dipilih benar-benar tersedia dan tidak berbenturan dengan kegiatan lainnya.",
      item3: "Setelah booking dilakukan, kuota kelas akan **tetap terhitung**, meskipun peserta tidak hadir pada jadwal yang telah dipilih.",
      footer: "Mohon melakukan booking dengan memastikan jadwal sudah sesuai, agar kuota kelas dapat digunakan secara optimal. Terima kasih atas pengertiannya!",
    },

    stepper: {
      steps: {
        level: "Niveau",
        date: "Datum",
        time: "Uhrzeit",
        details: "Ihre Angaben",
        review: "Überprüfung",
        payment: "Pembayaran",
        type: "Tipe kelas",
      },
      completedSuffix: " (abgeschlossen)",
      srStepPrefix: "Schritt: {step}",
      srBookingConfirmed: "Buchung bestätigt",
    },

    bookingType: {
      legend: "Pilih tipe kelas",
      description: "Keduanya dibayar lewat QRIS. Regular dibayar per sesi; private lebih murah per sesi, tetapi paketnya dibayar penuh di awal.",
      options: {
        REGULAR: {
          title: "Regular",
          description: "Rp 50.000 – 80.000 per sesi sesuai level, bayar tiap sesi dengan scan QRIS.",
        },
        PRIVATE: {
          title: "Private",
          description: "Mulai Rp 30.000 per sesi. Paket dibayar penuh di awal lewat QRIS.",
        },
      },
      srSelected: "Dipilih",
    },

    privatePlans: {
      heading: "Pilih Paket Private",
      subtext: "Lebih hemat per sesi. Paket dibayar penuh di awal lewat QRIS.",
      featured: "Paling populer",
      perSession: "/sesi",
      sessions: "{sessions} sesi (90 menit/sesi)",
      total: "Total paket {total}",
      select: "Pilih {level}",
      extrasHeading: "Bonus paket",
      scheduleHeading: "Jadwal kelas (WIB)",
      schedule: "Senin – Jumat",
      scheduleFlexible: "Fleksibel",
    },

    pricing: {
      perSession: "{price}/sesi",
    },

    level: {
      legend: "Welches Niveau möchten Sie buchen?",
      description: "Wählen Sie das Niveau, das Sie gerade lernen.",
      srSelected: "Ausgewählt",
    },

    date: {
      legend: "Datum auswählen",
      description: "Der Unterricht findet von Montag bis Freitag statt. Die Zeiten werden in {timezone} angezeigt.",
      emptyState:
        "Alle Wochentage im aktuellen Buchungszeitraum sind ausgebucht. Bitte schauen Sie später noch einmal vorbei.",
      today: "Heute",
      closed: "Geschlossen",
      full: "Ausgebucht",
      freeCount: "{count} frei",
      ariaWeekend: "{date} — am Wochenende kein Unterricht",
      ariaOpen: "{date} — {available} von {total} Terminen frei",
      ariaUnavailable: "{date} — ausgebucht oder bereits vergangen",
      closedWeekend: "Der Unterricht findet nur von Montag bis Freitag statt.",
      closedPast: "Dieses Datum liegt bereits in der Vergangenheit.",
      closedOutsideWindow: "Buchungen sind {days} Tage im Voraus möglich, bis zum {date}.",
    },

    time: {
      legend: "Uhrzeit auswählen",
      loading: "Verfügbare Zeiten werden geladen…",
      loadError: "Die Zeiten für dieses Datum konnten nicht geladen werden.",
      noTimesLeft: "An diesem Tag sind keine Zeiten mehr frei. Bitte gehen Sie zurück und wählen Sie einen anderen Tag.",
      slotAriaLabel: "{start} bis {end} Uhr. {reason}",
      reasons: {
        expired: "Dieser Kurs ist bereits beendet.",
        bookedForLevel: "Bereits für einen {level}-Kurs gebucht.",
        available: "Verfügbar zur Buchung.",
      },
    },

    details: {
      legend: "Ihre Angaben",
      description: "Wir fragen nur das ab, was Ihr Lehrer zur Vorbereitung Ihres Kurses benötigt.",
      studentNameLabel: "Name des Schülers",
      whatsappGroupLabel: "Name der WhatsApp-Gruppe",
      whatsappGroupHint: "Die Kursgruppe, an die Ihr Lehrer den Link zum Treffen sendet.",
      whatsappNumberLabel: "WhatsApp-Nummer",
      whatsappNumberHint: "Ihre eigene Nummer, z. B. 0812 3456 7890, damit Ihr Lehrer Sie direkt anschreiben kann.",
      lastMaterialLabel: "Zuletzt behandeltes Material",
      lastMaterialHint: "Das letzte Kapitel oder Thema, das Sie behandelt haben, z. B. „Lektion 4 — Perfekt“.",
      fieldErrors: {
        studentName: "Geben Sie den Namen des Schülers ein (2–80 Zeichen).",
        whatsappGroupName: "Geben Sie den Namen der WhatsApp-Gruppe ein (2–80 Zeichen).",
        lastMaterial: "Geben Sie das zuletzt behandelte Material ein (2–200 Zeichen).",
        level: "Wählen Sie ein Kursniveau.",
        date: "Wählen Sie ein gültiges Datum.",
        timeSlot: "Wählen Sie eine der verfügbaren Uhrzeiten.",
        whatsappNumber: "Geben Sie eine gültige WhatsApp-Nummer ein, z. B. 0812 3456 7890.",
        packageCode: "Geben Sie einen gültigen Paketcode ein, z. B. PKG-7F3K2Q.",
        generic: "Bitte überprüfen Sie dieses Feld.",
      },
    },

    review: {
      heading: "Überprüfen Sie Ihre Buchung",
      subtext: "Prüfen Sie alle Angaben und bestätigen Sie dann.",
      summaryLabels: {
        studentName: "Name des Schülers",
        level: "Niveau",
        date: "Datum",
        time: "Uhrzeit",
        whatsappGroupName: "WhatsApp-Gruppe",
        lastMaterial: "Zuletzt behandeltes Material",
        price: "Harga per sesi",
        bookingType: "Tipe kelas",
        packageTotal: "Total paket (bayar di awal)",
        paymentCode: "Kode pembayaran",
        amountDue: "Nominal transfer",
        payerName: "Atas nama",
        whatsappNumber: "Nomor WhatsApp",
        packageCode: "Kode paket",
        packageSessions: "Sesi paket terpakai",
      },
    },

    payment: {
      heading: "Pembayaran QRIS",
      amountLabel: "Biaya per sesi",
      studentName: "Nama siswa",
      date: "Tanggal kelas",
      time: "Jam kelas",
      whatsappGroup: "Grup WhatsApp",
      lastMaterial: "Materi terakhir",
      qrisAlt: "QRIS pembayaran",
      scanInstruction: "Scan QR menggunakan mobile banking atau e-wallet Anda.",
      amountInstruction: "Masukkan nominal sesuai jumlah yang tertera; nominal tidak terisi otomatis di aplikasi pembayaran. Admin mencocokkan transfer dengan kode pembayaran dan nama pengirim.",
      paymentCodeLabel: "Kode pembayaran",
      countdownLabel: "Selesaikan pembayaran dalam",
      holdNote: "Jadwal ini ditahan untuk Anda selama {minutes} menit. Jika waktu habis sebelum Anda menekan \"Saya Sudah Bayar\", jadwal dilepas dan Anda perlu booking ulang.",
      expiredError: "Waktu pembayaran {minutes} menit habis dan jadwal sudah dilepas. Silakan pilih jadwal lagi. Jika Anda sempat transfer, hubungi admin dengan kode pembayaran Anda.",
      creating: "Menahan jadwal...",
      whatsappNumber: "Nomor WhatsApp",
      payerNameLabel: "Pembayaran atas nama",
      payerNameHint: "Nama pemilik rekening atau e-wallet yang dipakai untuk transfer.",
      payerNameError: "Isi nama pemilik rekening (2–80 karakter).",
      payButton: "Saya Sudah Bayar",
      privateAmountLabel: "Total paket — dibayar penuh di awal",
      privatePerSession: "{price}/sesi × {sessions} sesi",
      privatePackageHeading: "Paket Private",
      privateIncludesHeading: "Termasuk",
      privateExtrasHeading: "Bonus",
      processing: "Memproses...",
      invalidError: "Data booking belum lengkap. Periksa kembali nama, level, tanggal, dan jadwal.",
      slotError: "Jadwal ini baru saja dipesan atau sudah tidak tersedia. Silakan pilih jadwal lain.",
      genericError: "Booking belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi.",
    },

    package: {
      heading: "Sudah punya paket private?",
      description: "Masukkan kode paket dan nomor WhatsApp yang Anda pakai saat membeli paket. Sesi berikutnya langsung terbooking tanpa bayar lagi.",
      codeLabel: "Kode paket",
      whatsappLabel: "Nomor WhatsApp",
      submit: "Pakai paket",
      checking: "Memeriksa...",
      invalid: "Isi kode paket (PKG-XXXXXX) dan nomor WhatsApp yang valid.",
      active: "Paket {code} · Level {level} · sisa {remaining} dari {total} sesi",
      activeHint: "Sesi ini tidak perlu dibayar lagi.",
      remove: "Jangan pakai paket",
      buyNew: "Atau beli paket baru",
      bookButton: "Konfirmasi booking",
      booking: "Membooking...",
    },

    buttons: {
      reviewBooking: "Lanjut ke pembayaran",
      confirmBooking: "Buchung bestätigen",
      confirming: "Wird bestätigt…",
    },

    success: {
      title: "Pembayaran Dicatat",
      subtext: "Booking Anda berhasil dibuat. Pembayaran akan dikonfirmasi secara manual oleh admin.",
      statusLabel: "Buchungsstatus:",
      paymentStatusLabel: "Status pembayaran:",
      reference: "Referenz",
      bookAnother: "Weiteren Kurs buchen",
      packageTitle: "Booking Berhasil",
      packageSubtext: "Sesi ini memakai paket private Anda, jadi tidak perlu bayar lagi.",
      packageRemaining: "Sisa sesi paket: {remaining} dari {total}",
      packageCodeHeading: "Kode paket private Anda",
      packageCodeNote: "Simpan kode ini. Setelah admin mengonfirmasi pembayaran, booking sesi berikutnya cukup dengan kode ini dan nomor WhatsApp Anda, tanpa bayar lagi.",
      copy: "Salin",
      copied: "Tersalin",
    },

    networkError: "Der Server konnte nicht erreicht werden. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
  },

  errors: {
    VALIDATION_FAILED: "Bitte korrigieren Sie die markierten Felder.",
    PAST_DATE: "Dieses Datum liegt bereits in der Vergangenheit.",
    WEEKEND: "Der Unterricht findet nur von Montag bis Freitag statt. Bitte wählen Sie einen Wochentag.",
    OUTSIDE_BOOKING_WINDOW: "Dieses Datum liegt zu weit in der Zukunft. Bitte wählen Sie ein früheres Datum.",
    SLOT_EXPIRED: "Diese Uhrzeit ist bereits vergangen.",
    SLOT_TAKEN: "Dieser Termin wurde soeben von jemand anderem gebucht. Bitte wählen Sie eine andere Uhrzeit.",
    NOT_FOUND: "Diese Buchung existiert nicht mehr.",
    ALREADY_CANCELLED: "Diese Buchung wurde bereits storniert.",
    ALREADY_CONFIRMED: "Pembayaran ini sudah dikonfirmasi.",
    PAYMENT_EXPIRED: "Waktu pembayaran habis dan jadwal sudah dilepas.",
    UNCHANGED: "Diese Buchung findet bereits zu diesem Datum und dieser Uhrzeit statt.",
    PACKAGE_NOT_FOUND: "Kode paket dan nomor WhatsApp tidak cocok. Periksa kembali keduanya.",
    PACKAGE_NOT_CONFIRMED: "Pembayaran paket ini belum dikonfirmasi admin. Coba lagi setelah dikonfirmasi.",
    PACKAGE_USED_UP: "Semua sesi di paket ini sudah terpakai.",
    UNAUTHORIZED: "Ihre Admin-Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
    INTERNAL: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
    genericRetry: "Das hat nicht funktioniert. Bitte versuchen Sie es erneut.",
    loadFailed: "Die Buchungen konnten nicht geladen werden.",
  },

  admin: {
    signIn: {
      title: "Admin-Anmeldung",
      subtitle: "Melden Sie sich mit Ihrem Lehrerkonto an, um die Buchungen der Schüler zu sehen.",
      emailLabel: "E-Mail",
      passwordLabel: "Passwort",
      showPassword: "Passwort anzeigen",
      hidePassword: "Passwort verbergen",
      submit: "Anmelden",
      submitting: "Anmeldung läuft…",
      errors: {
        MISSING_FIELDS: "Geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.",
        INVALID_CREDENTIALS: "Diese Angaben sind nicht korrekt.",
        NOT_ADMIN: "Dieses Konto hat keinen Admin-Zugriff.",
      },
    },

    page: {
      heading: "Buchungen",
      subtext: "Alle von Schülern gebuchten Kurse. Die Zeiten werden in {timezone} angezeigt.",
      signOut: "Abmelden",
    },

    tiles: {
      classesToday: "Kurse heute",
      upcomingClasses: "Anstehende Kurse",
      bookingsInView: "Angezeigte Buchungen",
    },

    filters: {
      heading: "Filter",
      dateLabel: "Datum",
      levelLabel: "Niveau",
      statusLabel: "Status",
      allLevels: "Alle Niveaus",
      allStatuses: "Alle Status",
      clear: "Filter zurücksetzen",
    },

    list: {
      heading: "Buchungen",
      refresh: "Aktualisieren",
      loading: "Buchungen werden geladen…",
      emptyTitle: "Keine Buchungen gefunden",
      emptyFiltered: "Keine Buchung entspricht den aktuellen Filtern.",
      emptyUnfiltered: "Von Schülern vorgenommene Buchungen werden hier angezeigt.",
    },

    table: {
      date: "Datum",
      time: "Uhrzeit",
      level: "Niveau",
      student: "Schüler",
      whatsappGroup: "WhatsApp-Gruppe",
      lastMaterial: "Zuletzt behandelt",
      status: "Status",
      paymentStatus: "Status pembayaran",
      bookingType: "Tipe",
      paymentCode: "Kode bayar",
      payerName: "Atas nama",
      actions: "Aktionen",
      view: "Ansehen",
      viewDetails: "Details ansehen",
      srBookingFor: " Buchung von {name} am {date}",
      srFor: " von {name}",
      group: "Gruppe",
    },

    detail: {
      titleDetails: "Buchungsdetails",
      titleReschedule: "Buchung verschieben",
      titleConfirmCancel: "Diese Buchung stornieren?",
      noBookingSelected: "Keine Buchung ausgewählt.",
      reference: "Referenz",
      createdUpdated: "Erstellt am {created} · zuletzt aktualisiert am {updated}",
      cancelledNotice: "Diese Buchung wurde storniert und der Termin wieder freigegeben.",
      confirmCancelBody:
        "Der {level}-Kurs am {date} um {time} Uhr wird storniert und der Termin für andere Schüler freigegeben. Dies kann nicht rückgängig gemacht werden.",
      keepBooking: "Buchung behalten",
      cancelBooking: "Buchung stornieren",
      cancelling: "Wird storniert…",
      reschedule: "Verschieben",
      paymentStatusLabel: "Status pembayaran:",
      confirmPayment: "Konfirmasi pembayaran",
      confirmingPayment: "Mengonfirmasi...",
      chatWhatsapp: "Chat WhatsApp",
    },

    packages: {
      heading: "Paket private",
      subtext: "Kode paket aktif setelah pembayaran booking pertamanya dikonfirmasi.",
      empty: "Belum ada paket private.",
      code: "Kode",
      student: "Siswa",
      whatsapp: "WhatsApp",
      level: "Level",
      sessions: "Sesi terpakai",
      status: "Status",
      amount: "Dibayar",
      created: "Dibuat",
    },

    reschedule: {
      currently: "Aktuell {date}, {time} Uhr.",
      newDate: "Neues Datum",
      newTime: "Neue Uhrzeit",
      noOpenDates: "Kein Wochentag im Buchungszeitraum hat noch einen freien Termin.",
      chooseDate: "Datum wählen…",
      dateOptionFree: "{date} — {count} frei",
      loadTimesError: "Die Zeiten für dieses Datum konnten nicht geladen werden.",
      back: "Zurück",
      moveBooking: "Buchung verschieben",
      moving: "Wird verschoben…",
    },
  },
} satisfies Dictionary;
