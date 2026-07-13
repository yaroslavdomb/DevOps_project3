import { hotelShortTestData, hotelFullTestData, updateReservationData, config } from "../testData/testModule.js";

document.addEventListener("DOMContentLoaded", () => {
    const BASE_URL =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://localhost:3000"
            : "";

    const HOTEL_BASE_URL = `${BASE_URL}/api/v1/hotels`;
    const RESERVATION_BASE_URL = `${BASE_URL}/api/v1/reservations`;

    const hotelList = document.getElementById("search-hotel");
    const hotelSelectedBtn = document.getElementById("hotel-selected-btn");
    const checkInInput = document.getElementById("check-in-date");
    const checkOutInput = document.getElementById("check-out-date");
    const totalSumOutput = document.getElementById("total-sum");
    const hotelContainer = document.querySelector(".hotel-container");
    const reservationForm = document.querySelector(".reservation-form");
    const hotelImage = document.querySelector(".hotel-photo");
    const hotelDesc = document.querySelector(".full-description-section p");
    const reserveBtn = document.getElementById("reserve-hotel-btn");

    let hotelsData;
    let currentHotelPrice = 0;

    async function hotelReservation(hotelId, hotelName) {
        const fullName = document.getElementById("guest-name").value;
        const checkin = document.getElementById("check-in-date").value;
        const checkout = document.getElementById("check-out-date").value;
        const email = document.getElementById("guest-email").value;
        const additional = document.getElementById("additional-request").value;

        try {
            if (config.TEST_MODE_ON) {
                updateReservationData(fullName, checkin, checkout, email, hotelId, hotelName, additional);
            } else {
                const body = JSON.stringify({
                    fullName: fullName,
                    email: email,
                    hotelId: hotelId,
                    hotelName: hotelName,
                    checkIn: checkin,
                    checkOut: checkout,
                    additionalReq: additional
                });

                const headers = {
                    "Content-Type": "application/json"
                };

                const method = "POST";
                const response = await fetch(RESERVATION_BASE_URL, { method, headers, body });
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    async function getAllHotelsShortData() {
        try {
            if (config.TEST_MODE_ON) {
                hotelsData = hotelShortTestData;
            } else {
                const response = await fetch(HOTEL_BASE_URL);
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                hotelsData = await response.json();
            }
            renderHotels(hotelsData);
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    function renderHotels(hotels) {
        if (hotels.length === 0) {
            hotelList.innerHTML = '<option disabled selected hidden value="">No hotels found</option>';
            return;
        }

        hotels.forEach((hotel) => {
            const currentHotel = document.createElement("option");
            currentHotel.value = hotel.hotelId;
            currentHotel.textContent = hotel.name;
            hotelList.appendChild(currentHotel);
        });
    }

    function calculateTotalSum() {
        const checkInValue = checkInInput.value;
        const checkOutValue = checkOutInput.value;

        if (!checkInValue || !checkOutValue) {
            if (config.LOGGING) {
                console.log("One of the date (checkIn/checkOut) is not selected!");
            }
            totalSumOutput.textContent = "0.0";
            return;
        }

        const dateIn = new Date(checkInValue);
        dateIn.setHours(0, 0, 0, 0);

        const dateOut = new Date(checkOutValue);
        dateOut.setHours(0, 0, 0, 0);

        const totalVisitingDays = (dateOut - dateIn) / 86400000;

        if (totalVisitingDays <= 0) {
            totalSumOutput.textContent = "0.0";
            return;
        }

        const totalSum = totalVisitingDays * currentHotelPrice;
        if (config.LOGGING) {
            console.log("totalSum = " + totalSum);
            console.log("currentHotelPrice = " + currentHotelPrice);
            console.log("totalVisitingDays = " + totalVisitingDays);
        }
        totalSumOutput.textContent = totalSum.toFixed(2);
    }

    hotelSelectedBtn.addEventListener("click", async () => {
        const hotelId = +hotelList.value;
        const selectedHotel = hotelsData.find((hotel) => hotel.hotelId === hotelId);
        let currentHotel;

        if (config.TEST_MODE_ON) {
            currentHotel = hotelFullTestData.find((hotel) => hotel.hotelId === hotelId);
        } else {
            try {
                const params = new URLSearchParams({
                    name: selectedHotel.name
                });
                const response = await fetch(`${HOTEL_BASE_URL}/${hotelId}?${params}`);
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }
                currentHotel = await response.json();
            } catch (error) {
                console.error("Error getting hotel details: ", error);
                return;
            }
        }

        if (!currentHotel) {
            console.error("Hotel not found!");
            return;
        }

        if (currentHotel.photoLink) {
            hotelImage.src = currentHotel.photoLink;
            hotelImage.alt = currentHotel.name;
        }

        hotelDesc.innerHTML = `
            <strong>Description: </strong> ${currentHotel.description || "No description available"}<br />
            <strong>Location: </strong> ${currentHotel.location || "N/A"}<br />
            <strong>Total rooms: </strong> ${currentHotel.rooms}<br />
            <strong>Price per 1 night: </strong> ${currentHotel.price}
        `;

        currentHotelPrice = currentHotel.price;
        hotelContainer.classList.remove("is-hidden");
        reservationForm.classList.remove("is-hidden");
    });

    reserveBtn.addEventListener("click", (event) => {
        event.preventDefault();

        const hotelSelect = event.target.closest("main").querySelector("#search-hotel");
        const hotelId = hotelSelect.value;
        const hotelName = hotelSelect.options[hotelSelect.selectedIndex].textContent;

        hotelReservation(hotelId, hotelName);
    });

    checkInInput.addEventListener("input", calculateTotalSum);
    checkOutInput.addEventListener("input", calculateTotalSum);

    getAllHotelsShortData();
});
