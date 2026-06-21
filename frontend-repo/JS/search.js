import { reservationTestData, config } from "../testData/testModule.js";

document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/hotels";

    const actReservationList = document.getElementById("active-reservations");
    const completedReservationList = document.getElementById("completed-reservations");
    const searchBtn = document.getElementById("check-reservation-btn");

    let reservationData;

    async function fetchReservations() {
        try {
            if (config.TEST_MODE_ON) {
                reservationData = reservationTestData;
            } else {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                reservationData = await response.json();
            }
            renderReservation(reservationData);
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    function renderReservation(reservations) {
        if (reservations.length === 0) {
            actReservationList.innerHTML = `
            <h3>Active:</h3>
            <p>No reservations found</p>
            `;

            completedReservationList.innerHTML = `
            <h3>Completed:</h3>
            <p>No reservations found</p>
            `;

            return;
        }

        const activeRes = [];
        const completedRes = [];
        const today = new Date();
        reservations.forEach((reservation) => {
            const checkOutDate = new Date(reservation.check_out_date);
            if (checkOutDate > today) {
                activeRes.push(reservation);
            } else {
                completedRes.push(reservation);
            }
        });

        if (activeRes.length !== 0) {
            const activeRows = activeRes
                .map(
                    (reservation) => `
                        <tr>
                            <td>${reservation.hotel_name}</td>
                            <td>${reservation.check_in_date}</td>
                            <td>${reservation.check_out_date}</td>
                            <td>${reservation.special_requests || "---"}</td>
                        </tr>
                    `
                )
                .join("");
            actReservationList.innerHTML = `
                <h3>Active:</h3>
                <table class="reservations-table">
                    <thead>
                        <tr>
                            <th>Hotel Name</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Guest special request</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeRows}
                    </tbody>
                </table>
            `;
        } else {
            actReservationList.innerHTML = `
            <h3>Active:</h3>
            <p>No reservations found</p>
            `;
        }

        if (completedRes.length !== 0) {
            const completedRows = completedRes
                .map(
                    (reservation) => `
                        <tr>
                            <td>${reservation.hotel_name}</td>
                            <td>${reservation.check_in_date}</td>
                            <td>${reservation.check_out_date}</td>
                            <td>${reservation.special_requests || "---"}</td>
                        </tr>
                    `
                )
                .join("");
            completedReservationList.innerHTML = `
                <h3>Completed:</h3>
                <table class="reservations-table">
                    <thead>
                        <tr>
                            <th>Hotel Name</th>
                            <th>Check-in</th>
                            <th>Check-out</th>
                            <th>Guest special request</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${completedRows}
                    </tbody>
                </table>
            `;
        } else {
            completedReservationList.innerHTML = `
            <h3>Completed:</h3>
            <p>No reservations found</p>
            `;
        }
    }

    searchBtn.addEventListener("click", (event) => {
        event.preventDefault();
        fetchReservations();

        actReservationList.classList.remove("is-hidden");
        completedReservationList.classList.remove("is-hidden");
    });
});
