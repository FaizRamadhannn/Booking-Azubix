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
  },

  hero: {
    headline: "Bequemer lernen zur richtigen Zeit",
    subcopy:
      "Wählen Sie Ihr Niveau, einen freien Termin an einem Wochentag und teilen Sie Ihrem Lehrer mit, was Sie zuletzt behandelt haben. Sie sehen sofort, welche Zeiten noch frei sind.",
    cta: "Kurs buchen",
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
      lastMaterialLabel: "Zuletzt behandeltes Material",
      lastMaterialHint: "Das letzte Kapitel oder Thema, das Sie behandelt haben, z. B. „Lektion 4 — Perfekt“.",
      fieldErrors: {
        studentName: "Geben Sie den Namen des Schülers ein (2–80 Zeichen).",
        whatsappGroupName: "Geben Sie den Namen der WhatsApp-Gruppe ein (2–80 Zeichen).",
        lastMaterial: "Geben Sie das zuletzt behandelte Material ein (2–200 Zeichen).",
        level: "Wählen Sie ein Kursniveau.",
        date: "Wählen Sie ein gültiges Datum.",
        timeSlot: "Wählen Sie eine der verfügbaren Uhrzeiten.",
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
