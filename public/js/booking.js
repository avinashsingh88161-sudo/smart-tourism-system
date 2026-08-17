document.addEventListener("DOMContentLoaded", function () {
  const checkInInput = document.getElementById("checkInDate");
  const checkOutInput = document.getElementById("checkOutDate");
  const roomsInput = document.getElementById("numberOfRooms");
  const pricePerNightEl = document.getElementById("bookingPricePerNight");
  const nightsCountEl = document.getElementById("calcNightsCount");
  const subtotalEl = document.getElementById("calcSubtotal");
  const taxEl = document.getElementById("calcTax");
  const totalAmountEl = document.getElementById("calcTotalAmount");
  const summaryBox = document.getElementById("bookingSummaryBox");
  const bookingForm = document.getElementById("propertyBookingForm");
  const submitBtn = document.getElementById("confirmBookingBtn");

  if (!checkInInput || !checkOutInput || !pricePerNightEl) return;

  // Set Minimum Check-In Date to Today
  const todayStr = new Date().toISOString().split("T")[0];
  checkInInput.min = todayStr;

  function updateBookingCalculation() {
    const checkInVal = checkInInput.value;
    const checkOutVal = checkOutInput.value;
    const pricePerNight = parseFloat(pricePerNightEl.getAttribute("data-price")) || 0;
    const rooms = roomsInput ? parseInt(roomsInput.value) || 1 : 1;

    if (checkInVal) {
      // Set Check-Out min date to Check-In date + 1 day
      const checkInDateObj = new Date(checkInVal);
      const minCheckOutObj = new Date(checkInDateObj);
      minCheckOutObj.setDate(minCheckOutObj.getDate() + 1);
      const minCheckOutStr = minCheckOutObj.toISOString().split("T")[0];
      checkOutInput.min = minCheckOutStr;

      if (checkOutVal && new Date(checkOutVal) <= checkInDateObj) {
        checkOutInput.value = minCheckOutStr;
      }
    }

    if (checkInVal && checkOutInput.value) {
      const checkIn = new Date(checkInVal);
      const checkOut = new Date(checkOutInput.value);

      if (checkOut > checkIn) {
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const subtotal = pricePerNight * nights * rooms;
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + tax;

        if (nightsCountEl) nightsCountEl.textContent = `${nights} Night${nights > 1 ? "s" : ""}`;
        if (subtotalEl) subtotalEl.textContent = `₹ ${subtotal.toLocaleString("en-IN")}`;
        if (taxEl) taxEl.textContent = `₹ ${tax.toLocaleString("en-IN")}`;
        if (totalAmountEl) totalAmountEl.textContent = `₹ ${total.toLocaleString("en-IN")}`;
        if (summaryBox) summaryBox.style.display = "block";
        return;
      }
    }

    if (summaryBox) summaryBox.style.display = "none";
  }

  checkInInput.addEventListener("change", updateBookingCalculation);
  checkOutInput.addEventListener("change", updateBookingCalculation);
  if (roomsInput) roomsInput.addEventListener("input", updateBookingCalculation);

  // Initial call
  updateBookingCalculation();

  if (bookingForm) {
    bookingForm.addEventListener("submit", function () {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing Booking...`;
      }
    });
  }
});
