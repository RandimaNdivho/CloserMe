const INITIAL_STATE = {
  schemaVersion: "v5_complete_production",
  registeredUsers: [],
  currentUser: null,
  posts: [
    {
      id: "p_day_1",
      authorName: "Campus Sports Hub",
      username: "campus_sports",
      institution: "University of Limpopo",
      avatar: "Assets/Jason.jpg",
      image: "Assets/5 Football.jpg",
      alt: "Students playing 5-a-side football on campus astro turf",
      caption: "Friday afternoon 5-a-side on the main turf! Need 2 more players to lock in the teams before kick-off.",
      timestamp: "10 mins ago",
      isResNights: false,
      waved: false,
      saved: false,
      boostedUntil: null,
      comments: [
        { id: "c_1", user: "campus_sports", text: "Bring Astro boots or trainers, kick-off is sharp at 16:30." }
      ],
      activity: {
        title: "Campus 5-a-Side Football Match",
        location: "North Astro Pitch",
        time: "Today, 16:30",
        maxParticipants: 4,
        participants: ["campus_sports", "sipho_k"],
        status: "open"
      }
    },
    {
      id: "p_day_2",
      authorName: "Study Pod Collective",
      username: "study_pods",
      institution: "IIE Varsity College",
      avatar: "Assets/Black Girl.jpg",
      image: "Assets/Library.jpg",
      alt: "Quiet university library study desks with laptops",
      caption: "Deep focus session on Level 2 before next week's database practical. Quiet study table reserved.",
      timestamp: "32 mins ago",
      isResNights: false,
      waved: false,
      saved: false,
      boostedUntil: null,
      comments: [],
      activity: {
        title: "SQL & Systems Analysis Study Pod",
        location: "Main Library, Level 2 Pod B",
        time: "Today, 14:00 - 17:00",
        maxParticipants: 3,
        participants: ["study_pods", "naledi_s", "karabo_m"],
        status: "full"
      }
    },
    {
      id: "p_day_3",
      authorName: "RI Campus Media",
      username: "ri_media",
      institution: "University of Pretoria",
      avatar: "Assets/View Guy.jpg",
      image: "Assets/RI.jpg",
      alt: "Campus photography showcase",
      caption: "Daytime around the quad between lectures. Drop a Wave if you're on campus today.",
      timestamp: "2 hours ago",
      isResNights: false,
      waved: false,
      saved: false,
      boostedUntil: null,
      comments: [],
      activity: null
    },
    {
      id: "p_night_1",
      authorName: "Res Life Committee",
      username: "res_nights_hq",
      institution: "University of Johannesburg",
      avatar: "Assets/Me.jpg",
      image: "Assets/Girls Night.png",
      alt: "Students celebrating at an evening residence social",
      caption: "Res Nights rooftop social & games night! Pull through with your floor mates 🌙✨",
      timestamp: "45 mins ago",
      isResNights: true,
      waved: false,
      saved: false,
      boostedUntil: null,
      comments: [],
      activity: {
        title: "Res Nights Rooftop Chill & Games",
        location: "Protea Residence Common Deck",
        time: "Tonight, 20:00",
        maxParticipants: 30,
        participants: ["res_nights_hq"],
        status: "open"
      }
    },
    {
      id: "p_night_2",
      authorName: "Campus Drama Society",
      username: "campus_drama",
      institution: "Wits University",
      avatar: "Assets/View Guy.jpg",
      image: "Assets/Drama.webp",
      alt: "Stage lighting in university auditorium",
      caption: "Tonight's late open-mic rehearsal in the Main Auditorium has been postponed due to sound equipment maintenance.",
      timestamp: "1 hour ago",
      isResNights: true,
      waved: false,
      saved: false,
      boostedUntil: null,
      comments: [],
      activity: {
        title: "Late Night Open-Mic Rehearsal",
        location: "Main Auditorium",
        time: "Tonight, 21:00",
        maxParticipants: 25,
        participants: ["campus_drama"],
        status: "cancelled"
      }
    },
    {
      id: "p_night_3",
      authorName: "24Hr Lab Crew",
      username: "night_owls",
      institution: "University of Limpopo",
      avatar: "Assets/Black Girl.jpg",
      image: "Assets/Night View.webp",
      alt: "City and campus lights at night",
      caption: "Walking back from the 24-hour lab after pushing the final commit. Campus hits different at night.",
      timestamp: "3 hours ago",
      isResNights: true,
      waved: false,
      saved: false,
      boostedUntil: null,
      comments: [],
      activity: null
    }
  ],
  stories: [
    { id: "s1", user: "study_pods", avatar: "Assets/Black Girl.jpg", caption: "Library level 3 is packed 📚" },
    { id: "s2", user: "campus_sports", avatar: "Assets/Jason.jpg", caption: "Astro turf ready for 16:30 ⚽" },
    { id: "s3", user: "res_nights_hq", avatar: "Assets/Me.jpg", caption: "Res Nights starts at 20:00 🌙" }
  ],
  notifications: [],
  messages: [],
  reports: []
};