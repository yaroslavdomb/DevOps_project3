import { testData, config } from "../testData/testModule.js";

document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8080/api/hotels";

    const hotelList = document.getElementById("search-hotel");
    const hotelSelectedBtn = document.getElementById("hotel-selected-btn");
    const hotelContainer = document.querySelector(".hotel-container");
    const reservationForm = document.querySelector(".reservation-form");
    const hotelImage = document.querySelector(".hotel-photo");
    const hotelDesc = document.querySelector(".full-description-section p");

    let hotelsData;

    async function fetchHotels() {
        try {
            if (config.TEST_MODE_ON) {
                hotelsData = testData;
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

    fetchHotels();
});
