import { hotelTestData, updateReservationData, config } from "../testData/testModule.js";

document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/hotels";

    const hotelList = document.getElementById("search-hotel");
    const hotelSelectedBtn = document.getElementById("hotel-selected-btn");
    const hotelContainer = document.querySelector(".hotel-container");
    const reservationForm = document.querySelector(".reservation-form");
    const hotelImage = document.querySelector(".hotel-photo");
    const hotelDesc = document.querySelector(".full-description-section p");
    const reserveBtn = document.getElementById("reserve-hotel-btn");

    let hotelsData;

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
                const response = await fetch(API_URL, fullName, checkin, checkout, email, hotelId, hotelName, additional);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    async function fetchHotels() {
        try {
            if (config.TEST_MODE_ON) {
                hotelsData = hotelTestData;
            } else {
                const response = await fetch(API_URL);
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
            currentHotel.value = hotel.id;
            currentHotel.textContent = hotel.name;
            hotelList.appendChild(currentHotel);
        });
    }

    function loadHotelPic(selectedHotel) {
        const imgLoader = new Image();
        imgLoader.src = selectedHotel.photoLink;

        imgLoader.onload = () => {
            hotelImage.src = selectedHotel.photoLink;
        };

        imgLoader.onerror = () => {
            hotelImage.src = "../resources/default-error-photo.png";
        };
    }

    hotelSelectedBtn.addEventListener("click", () => {
        const selectedId = hotelList.value;
        const selectedHotel = hotelsData.find((hotel) => hotel.id === selectedId);

        hotelDesc.textContent = selectedHotel.description;
        hotelImage.src = "../resources/loading.png";

        if (config.TEST_MODE_ON) {
            setTimeout(() => loadHotelPic(selectedHotel), config.PIC_LOADING_TIME);
        } else {
            loadHotelPic(selectedHotel);
        }

        hotelContainer.classList.remove("is-hidden");
        reservationForm.classList.remove("is-hidden");
    });

    reserveBtn.addEventListener ("click", (event) => {
        event.preventDefault();

        
        const hotelSelect = event.target.closest("main").querySelector("#search-hotel");
        const hotelId = hotelSelect.value;
        const hotelName = hotelSelect.options[hotelSelect.selectedIndex].textContent;

        hotelReservation(hotelId, hotelName);
    });

    fetchHotels();
});
