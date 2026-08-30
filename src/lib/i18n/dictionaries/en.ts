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
  },

  hero: {
    headline: "Learn more comfortably at the right time",
    subcopy:
      "Pick your level, choose a free weekday slot and tell your tutor what you covered last time. You will see straight away which times are still open.",
    cta: "Book a class",
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
      },
      completedSuffix: " (completed)",
      srStepPrefix: "Step: {step}",
      srBookingConfirmed: "Booking confirmed",
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
      lastMaterialLabel: "Last material",
      lastMaterialHint: "The last chapter or topic you covered, e.g. “Lektion 4 — Perfekt”.",
      fieldErrors: {
        studentName: "Enter the student's name (2–80 characters).",
        whatsappGroupName: "Enter the WhatsApp group name (2–80 characters).",
        lastMaterial: "Enter the last material covered (2–200 characters).",
        level: "Choose a class level.",
        date: "Choose a valid date.",
        timeSlot: "Choose one of the available time slots.",
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
      },
    },

    buttons: {
      reviewBooking: "Review booking",
      confirmBooking: "Confirm booking",
      confirming: "Confirming…",
    },

    success: {
      title: "Your class is booked",
      subtext: "Your tutor will confirm in the WhatsApp group before the lesson starts.",
      statusLabel: "Booking status:",
      reference: "Reference",
      bookAnother: "Book another class",
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
    UNCHANGED: "That booking is already at this date and time.",
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
