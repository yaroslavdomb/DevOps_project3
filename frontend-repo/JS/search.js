import { reservationTestData, searchByName, searchByEmail, config } from "../testData/testModule.js";

document.addEventListener("DOMContentLoaded", () => {

    const BASE_URL =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://localhost:3000"
            : "";
    const RESERVATION_BASE_URL = `${BASE_URL}/api/v1/reservations`;

    const actReservationList = document.getElementById("active-reservations");
    const completedReservationList = document.getElementById("completed-reservations");
    const searchBtn = document.getElementById("check-reservation-btn");

    let reservationData;

    async function getReservations(params) {
        try {
            if (config.TEST_MODE_ON) {
                const savedData = localStorage.getItem("my_reservations");
                const currentData = savedData ? JSON.parse(savedData) : reservationTestData;

                if (type === "name") {
                    reservationData = searchByName(searchKey, currentData);
                } else {
                    reservationData = searchByEmail(searchKey, currentData);
                }
            } else {
                const response = await fetch(RESERVATION_BASE_URL + params);
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

    async function cancelReservation(id) {
        try {
            if (config.TEST_MODE_ON) {
                const savedData = localStorage.getItem("my_reservations");
                let currentData = savedData ? JSON.parse(savedData) : reservationTestData;

                currentData = currentData.filter((currentReservation) => String(currentReservation._id) !== id);
                localStorage.setItem("my_reservations", JSON.stringify(currentData));

                reservationData = reservationData.filter((currentReservation) => String(currentReservation._id) !== id);
                renderReservation(reservationData);
            } else {
                const response = await fetch(`${API_URL}/reservations/${id}`, {
                    method: "DELETE"
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                reservationData = reservationData.filter((currentReservation) => String(currentReservation._id) !== id);
                renderReservation(reservationData);
            }
        } catch (error) {
            console.error("Error canceling reservation:", error);
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
            const checkOutDate = new Date(reservation.checkOutDate);
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
                            <td>${reservation.hotelName}</td>
                            <td>${reservation.checkInDate}</td>
                            <td>${reservation.checkOutDate}</td>
                            <td>${reservation.additionalReq || "---"}</td>
                            <td><button class="delete-btn" data-id="${reservation._id}">Delete</button></td>
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
                            <th>Actions</th>                         
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
                            <td>${reservation.hotelName}</td>
                            <td>${reservation.checkInDate}</td>
                            <td>${reservation.checkOutDate}</td>
                            <td>${reservation.additionalReq || "---"}</td>
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

    function getReservationSearchParams() {
        const name = document.getElementById("guest-name").value.trim();
        const email = document.getElementById("guest-email").value.trim();
        const params = new URLSearchParams();

        if (name) params.append("fullName", name);
        if (email) params.append("email", email);

        const queryString = params.toString();
        return queryString ? `?${queryString}` : "";
    }

    searchBtn.addEventListener("click", (event) => {
        event.preventDefault();
        const params = getReservationSearchParams(event);
        getReservations(params);

        actReservationList.classList.remove("is-hidden");
        completedReservationList.classList.remove("is-hidden");
    });

    actReservationList.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const id = event.target.getAttribute("data-id");
            cancelReservation(id);
        }
    });
});
