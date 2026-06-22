export const config = {
    TEST_MODE_ON: true,
    PIC_LOADING_TIME: 1000
};

export const hotelTestData = [
    { id: "1", name: "Grand Ho-ho Hotel", photoLink: "../resources/hotel-1.jpg", description: "asd" },
    { id: "2", name: "Santa-Clause Resort & Spa", photoLink: "../resources/hotel-2.jpg", description: "" },
    { id: "3", name: "The Archive Inn", photoLink: "../resources/hotel-3.jpg", description: "" },
    { id: "4", name: "The My All Include", photoLink: "../resources/hotel-4.jpg", description: "" }
];

export const reservationTestData = [
    {
        _id: 123456789,
        hotel_id: 1,
        hotel_name: "Grand Ho-ho Hotel",
        guest_full_name: "John Doe",
        guest_email: "john.doe@example.com",
        check_in_date: "2024-07-01",
        check_out_date: "2024-07-10",
        special_requests: "High floor room and early check-in if possible."
    },
    {
        _id: 123456789000,
        hotel_id: 1,
        hotel_name: "Grand Ho-ho Hotel",
        guest_full_name: "John Doe",
        guest_email: "john.doe@example.com",
        check_in_date: "2027-07-01",
        check_out_date: "2027-07-10",
        special_requests: "High floor room and early check-in if possible."
    },
    {
        _id: 123456789888,
        hotel_id: 2,
        hotel_name: "Santa-Clause Resort & Spa",
        guest_full_name: "John Doe",
        guest_email: "john.doe@example.com",
        check_in_date: "2027-07-01",
        check_out_date: "2027-07-10",
        special_requests: "High floor room and early check-in if possible."
    },
    {
        _id: 123456789999,
        hotel_id: 2,
        hotel_name: "Santa-Clause Resort & Spa",
        guest_full_name: "Emma Watson",
        guest_email: "emma.w@example.net",
        check_in_date: "2026-07-05",
        check_out_date: "2026-07-12",
        special_requests: "Allergies to feathers, please provide synthetic pillows."
    },
    {
        _id: 1234567897788,
        hotel_id: 1,
        hotel_name: "Grand Ho-ho Hotel",
        guest_full_name: "Michael Smith",
        guest_email: "m.smith@example.org",
        check_in_date: "2026-03-15",
        check_out_date: "2026-03-20",
        special_requests: "None"
    },
    {
        _id: 123456789456456,
        hotel_id: 3,
        hotel_name: "The Archive Inn",
        guest_full_name: "Sarah Connor",
        guest_email: "elena.p@example.com",
        check_in_date: "2026-08-01",
        check_out_date: "2026-08-05",
        special_requests: "Quiet room away from the elevator."
    },
    {
        _id: 14423456789,
        hotel_id: 4,
        hotel_name: "The My All Include",
        guest_full_name: "David Kim",
        guest_email: "kim.david@example.com",
        check_in_date: "2026-08-12",
        check_out_date: "2026-08-15",
        special_requests: "Late check-out around 3 PM."
    },
    {
        _id: 1233434456789,
        hotel_id: 2,
        hotel_name: "Santa-Clause Resort & Spa",
        guest_full_name: "Anna Muller",
        guest_email: "anna.m@example.de",
        check_in_date: "2025-12-20",
        check_out_date: "2026-01-27",
        special_requests: ""
    },
    {
        _id: 123456780009,
        hotel_id: 4,
        hotel_name: "The My All Include",
        guest_full_name: "James Bond",
        guest_email: "carlos.s@example.es",
        check_in_date: "2026-09-01",
        check_out_date: "2026-09-14",
        special_requests: "Vegetarian meals during the stay."
    },
    {
        _id: 1123456789000,
        hotel_id: 3,
        hotel_name: "The Archive Inn",
        guest_full_name: "Elena Petrova",
        guest_email: "elena.p@example.com",
        check_in_date: "2026-09-10",
        check_out_date: "2026-09-15",
        special_requests: "Extra towels and a bottle of champagne upon arrival."
    },
    {
        _id: 12345678998982,
        hotel_id: 1,
        hotel_name: "Grand Ho-ho Hotel",
        guest_full_name: "James Bond",
        guest_email: "007@example.co.uk",
        check_in_date: "2026-10-05",
        check_out_date: "2026-10-07",
        special_requests: ""
    },
    {
        _id: 12345678923231,
        hotel_id: 4,
        hotel_name: "The My All Include",
        guest_full_name: "Linda Taylor",
        guest_email: "linda.t@example.com",
        check_in_date: "2026-10-22",
        check_out_date: "2026-10-25",
        special_requests: "Twin beds instead of one double bed."
    }
];

export function searchByName(searchKey, currentData) {
    return currentData.filter((reservation) => searchKey === reservation.guest_full_name);
}

export function searchByEmail(searchKey, currentData) {
    return currentData.filter((reservation) => searchKey === reservation.guest_email);
}

export function updateReservationData(fullName, checkin, checkout, email, hotelId, hotelName, addition) {
    const reservation = {
        hotel_id: hotelId,
        hotel_name: hotelName,
        guest_full_name: fullName,
        guest_email: email,
        check_in_date: checkin,
        check_out_date: checkout,
        special_requests: addition
    };

    const savedData = localStorage.getItem("my_reservations");
    const currentReservations = savedData ? JSON.parse(savedData) : [...reservationTestData];

    currentReservations.push(reservation);

    reservationTestData.length = 0;
    reservationTestData.push(...currentReservations);

    localStorage.setItem("my_reservations", JSON.stringify(currentReservations));
}
