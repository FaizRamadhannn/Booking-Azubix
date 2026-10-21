/**
 * The single English copy deck for the whole app. `de.ts` is typed against
 * this object (`satisfies Dictionary` there is checked against `typeof en`),
 * so the two can never silently drift out of structural sync.
 */
export const en = {
  common: {
    skipToBooking: "Skip to booking",
    languageSwitcherLabel: "Language",
    /** Shared between the picker (unavailable slot) and record views (a real booking's state). */
    status: {
      AVAILABLE: "Available",
      BOOKED: "Booked",
      EXPIRED: "Expired",
      CANCELLED: "Cancelled",
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
    level: "Level",
    back: "Back",
    close: "Close",
    retry: "Retry",
    tryAgain: "Try again",
  },

  site: {
    brandName: "Azubixbook",
    brandTagline: "German A1–B1 lessons",
    navAdmin: "Admin",
    navBookClass: "Book a class",
    navBookClassShort: "Book",
    footerTagline: "Azubixbook — German lessons for levels A1, A2 and B1.",
    footerTimezoneNote: "All class times are shown in {timezone}.",
    navFeatures: "Why us",
    navProcess: "How it works",
    navPrivate: "Private",
    navFaq: "FAQ",
  },

  hero: {
    badge: "German classes A1 · A2 · B1",
    headline: "Learn more comfortably",
    headlineAccent: "at the right time",
    subcopy:
      "Pick your level, choose a free weekday slot and tell your tutor what you covered last time. You will see straight away which times are still open.",
    cta: "Book a class",
    ctaPrivate: "See private packages",
    facts: {
      weekdays: {
        title: "Monday to Friday",
        detail: "Weekends are closed, so the schedule stays predictable.",
      },
      slots: {
        title: "{count} fixed slots a day",
        detail: "From {start} to {end}, {timezone}.",
      },
      levels: {
        title: "Levels {levels}",
        detail: "Book the level you are studying right now.",
      },
      qris: {
        title: "Pay instantly with QRIS",
        detail: "Scan with any mobile banking or e-wallet app.",
      },
    },
  },

  landing: {
    process: {
      heading: "Three steps to your class",
      subtext: "From choosing a class to paying, in a couple of minutes.",
      steps: [
        {
          title: "Choose your class",
          detail: "Regular per session, or a private package at a lower price per session.",
        },
        {
          title: "Pick a free slot",
          detail: "See live which weekday times are still open for your level.",
        },
        {
          title: "Pay with QRIS",
          detail: "Your slot is held while you pay, then the admin confirms it.",
        },
      ],
    },
    private: {
      eyebrow: "Private class",
      heading: "Choose your private package",
      subtext: "Cheaper per session, one-on-one with your tutor. The whole package is paid up front via QRIS.",
    },
    faq: {
      heading: "Frequently asked questions",
      items: [
        {
          question: "What is the difference between regular and private?",
          answer: "Regular classes are paid per session. Private packages cost less per session and include an e-book, exercises and class recordings, but the whole package is paid up front.",
        },
        {
          question: "How far in advance do I need to book?",
          answer: "Book at least one day (H-1) before the class. You can book up to {days} days ahead.",
        },
        {
          question: "How does payment work?",
          answer: "After you pick a slot it is held for {minutes} minutes. Scan the QRIS code, enter the amount shown, then tap \"Saya Sudah Bayar\". The admin confirms your transfer manually.",
        },
        {
          question: "Can I change my schedule?",
          answer: "Please contact the admin with your payment code. The admin can move your booking to another free slot.",
        },
      ],
    },
    cta: {
      heading: "Ready to start learning?",
      subtext: "Pick a slot that fits your week and lock it in today.",
      button: "Book a class now",
    },
  },

  levels: {
    A1: "Beginner — greetings, alphabet, present tense, everyday vocabulary.",
    A2: "Elementary — past tense, travel and daily-life conversation.",
    B1: "Intermediate — opinions, longer texts, exam-oriented practice.",
  },

  booking: {
    sectionHeading: "Book a class",
    sectionSubtext: "All times are shown in {timezone}.",

    terms: {
      heading: "Ketentuan Booking Class",
      item1: "Booking kelas dilakukan minimal **H-1** sebelum jadwal kelas.",
      item2: "Mohon pastikan waktu yang dipilih benar-benar tersedia dan tidak berbenturan dengan kegiatan lainnya.",
      item3: "Setelah booking dilakukan, kuota kelas akan **tetap terhitung**, meskipun peserta tidak hadir pada jadwal yang telah dipilih.",
      footer: "Mohon melakukan booking dengan memastikan jadwal sudah sesuai, agar kuota kelas dapat digunakan secara optimal. Terima kasih atas pengertiannya!",
    },

    stepper: {
      steps: {
        level: "Level",
        date: "Date",
        time: "Time",
        details: "Your details",
        review: "Review",
        payment: "Pembayaran",
        type: "Tipe kelas",
      },
      completedSuffix: " (completed)",
      srStepPrefix: "Step: {step}",
      srBookingConfirmed: "Booking confirmed",
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
      legend: "Which level are you booking?",
      description: "Pick the level you are currently studying.",
      srSelected: "Selected",
    },

    date: {
      legend: "Choose a date",
      description: "Classes run Monday to Friday. Times are in {timezone}.",
      emptyState: "Every weekday in the current booking window is fully booked. Please check again later.",
      today: "Today",
      closed: "Closed",
      full: "Full",
      freeCount: "{count} free",
      ariaWeekend: "{date} — no classes at the weekend",
      ariaOpen: "{date} — {available} of {total} slots free",
      ariaUnavailable: "{date} — fully booked or already passed",
      closedWeekend: "Classes run Monday to Friday only.",
      closedPast: "This date has already passed.",
      closedOutsideWindow: "Bookings open {days} days ahead, up to {date}.",
    },

    time: {
      legend: "Choose a time",
      loading: "Loading available times…",
      loadError: "We could not load the times for this date.",
      noTimesLeft: "No times are left on this date. Please go back and pick another day.",
      slotAriaLabel: "{start} to {end}. {reason}",
      reasons: {
        expired: "This class has already finished.",
        bookedForLevel: "Already booked for a {level} class.",
        available: "Available to book.",
      },
    },

    details: {
      legend: "Your details",
      description: "We only ask for what the tutor needs to prepare your class.",
      studentNameLabel: "Student name",
      whatsappGroupLabel: "WhatsApp group name",
      whatsappGroupHint: "The class group your tutor will send the meeting link to.",
      whatsappNumberLabel: "WhatsApp number",
      whatsappNumberHint: "Your personal number, e.g. 0812 3456 7890, so the tutor can message you directly.",
      lastMaterialLabel: "Last material",
      lastMaterialHint: "The last chapter or topic you covered, e.g. “Lektion 4 — Perfekt”.",
      fieldErrors: {
        studentName: "Enter the student's name (2–80 characters).",
        whatsappGroupName: "Enter the WhatsApp group name (2–80 characters).",
        lastMaterial: "Enter the last material covered (2–200 characters).",
        level: "Choose a class level.",
        date: "Choose a valid date.",
        timeSlot: "Choose one of the available time slots.",
        whatsappNumber: "Enter a valid WhatsApp number, e.g. 0812 3456 7890.",
        packageCode: "Enter a valid package code, e.g. PKG-7F3K2Q.",
        generic: "Please check this field.",
      },
    },

    review: {
      heading: "Review your booking",
      subtext: "Check everything is right, then confirm.",
      summaryLabels: {
        studentName: "Student name",
        level: "Level",
        date: "Date",
        time: "Time",
        whatsappGroupName: "WhatsApp group",
        lastMaterial: "Last material",
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
      confirmBooking: "Confirm booking",
      confirming: "Confirming…",
    },

    success: {
      title: "Pembayaran Dicatat",
      subtext: "Booking Anda berhasil dibuat. Pembayaran akan dikonfirmasi secara manual oleh admin.",
      statusLabel: "Status booking:",
      paymentStatusLabel: "Status pembayaran:",
      reference: "Referensi",
      bookAnother: "Booking kelas lain",
      packageTitle: "Booking Berhasil",
      packageSubtext: "Sesi ini memakai paket private Anda, jadi tidak perlu bayar lagi.",
      packageRemaining: "Sisa sesi paket: {remaining} dari {total}",
      packageCodeHeading: "Kode paket private Anda",
      packageCodeNote: "Simpan kode ini. Setelah admin mengonfirmasi pembayaran, booking sesi berikutnya cukup dengan kode ini dan nomor WhatsApp Anda, tanpa bayar lagi.",
      copy: "Salin",
      copied: "Tersalin",
    },

    networkError: "We could not reach the server. Please check your connection and try again.",
  },

  /**
   * Localised text for every {@link BookingErrorCode} the server can return,
   * plus a couple of client-only fallbacks (network/parse failures) that never
   * carry a server code. The server's own `message` field is never shown to
   * the user — only `code` is used to pick text here.
   */
  errors: {
    VALIDATION_FAILED: "Please correct the highlighted fields.",
    PAST_DATE: "That date has already passed.",
    WEEKEND: "Classes run Monday to Friday only. Please choose a weekday.",
    OUTSIDE_BOOKING_WINDOW: "That date is too far ahead. Please choose an earlier date.",
    SLOT_EXPIRED: "That time slot has already passed.",
    SLOT_TAKEN: "Someone just booked that slot. Please pick another time.",
    NOT_FOUND: "That booking no longer exists.",
    ALREADY_CANCELLED: "That booking is already cancelled.",
    ALREADY_CONFIRMED: "Pembayaran ini sudah dikonfirmasi.",
    PAYMENT_EXPIRED: "Waktu pembayaran habis dan jadwal sudah dilepas.",
    UNCHANGED: "That booking is already at this date and time.",
    PACKAGE_NOT_FOUND: "Kode paket dan nomor WhatsApp tidak cocok. Periksa kembali keduanya.",
    PACKAGE_NOT_CONFIRMED: "Pembayaran paket ini belum dikonfirmasi admin. Coba lagi setelah dikonfirmasi.",
    PACKAGE_USED_UP: "Semua sesi di paket ini sudah terpakai.",
    UNAUTHORIZED: "Your admin session has expired. Please sign in again.",
    INTERNAL: "Something went wrong. Please try again.",
    genericRetry: "That did not work. Please try again.",
    loadFailed: "The bookings could not be loaded.",
  },

  admin: {
    signIn: {
      title: "Admin sign in",
      subtitle: "Sign in with your tutor account to see student bookings.",
      emailLabel: "Email",
      passwordLabel: "Password",
      showPassword: "Show password",
      hidePassword: "Hide password",
      submit: "Sign in",
      submitting: "Signing in…",
      errors: {
        MISSING_FIELDS: "Enter your email and password.",
        INVALID_CREDENTIALS: "Those details are not correct.",
        NOT_ADMIN: "That account does not have admin access.",
      },
    },

    page: {
      heading: "Bookings",
      subtext: "Every class booked by students. Times are in {timezone}.",
      signOut: "Sign out",
    },

    tiles: {
      classesToday: "Classes today",
      upcomingClasses: "Upcoming classes",
      bookingsInView: "Bookings in view",
    },

    filters: {
      heading: "Filters",
      dateLabel: "Date",
      levelLabel: "Level",
      statusLabel: "Status",
      allLevels: "All levels",
      allStatuses: "All statuses",
      clear: "Clear filters",
    },

    list: {
      heading: "Bookings",
      refresh: "Refresh",
      loading: "Loading bookings…",
      emptyTitle: "No bookings found",
      emptyFiltered: "No booking matches the current filters.",
      emptyUnfiltered: "Bookings made by students will appear here.",
    },

    table: {
      date: "Date",
      time: "Time",
      level: "Level",
      student: "Student",
      whatsappGroup: "WhatsApp group",
      lastMaterial: "Last material",
      status: "Status",
      paymentStatus: "Status pembayaran",
      bookingType: "Tipe",
      paymentCode: "Kode bayar",
      payerName: "Atas nama",
      actions: "Actions",
      view: "View",
      viewDetails: "View details",
      srBookingFor: " booking for {name} on {date}",
      srFor: " for {name}",
      group: "Group",
    },

    detail: {
      titleDetails: "Booking details",
      titleReschedule: "Reschedule booking",
      titleConfirmCancel: "Cancel this booking?",
      noBookingSelected: "No booking selected.",
      reference: "Reference",
      createdUpdated: "Created {created} · last updated {updated}",
      cancelledNotice: "This booking was cancelled and its slot has been released.",
      confirmCancelBody:
        "The {level} class on {date} at {time} will be cancelled and the slot released for other students. This cannot be undone.",
      keepBooking: "Keep booking",
      cancelBooking: "Cancel booking",
      cancelling: "Cancelling…",
      reschedule: "Reschedule",
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
      currently: "Currently {date}, {time}.",
      newDate: "New date",
      newTime: "New time",
      noOpenDates: "No weekday in the booking window has a free slot.",
      chooseDate: "Choose a date…",
      dateOptionFree: "{date} — {count} free",
      loadTimesError: "Could not load times for this date.",
      back: "Back",
      moveBooking: "Move booking",
      moving: "Moving…",
    },
  },
};

/**
 * Deliberately not `typeof en` with an `as const` on the object above: that
 * would lock every leaf to its exact English string literal, so `de.ts`
 * could never `satisfies Dictionary` with different words. Widening every
 * leaf to `string` keeps the *shape* checked while leaving the wording free.
 */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
export type Dictionary = Widen<typeof en>;
