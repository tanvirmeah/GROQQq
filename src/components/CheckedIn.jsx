import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CheckedIn.css';

const CheckedIn = () => {
  const [checkedInBookings, setCheckedInBookings] = useState([]);
    const [showCheckoutPopup, setShowCheckoutPopup] = useState(false);
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [minibarItems, setMinibarItems] = useState([]);
    const [selectedMinibarItems, setSelectedMinibarItems] = useState({}); // { [itemId]: quantity }
    const navigate = useNavigate();

  useEffect(() => {
    const storedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    // Filter for bookings where checkedIn is true
    const checkedIn = storedBookings.filter(booking => booking.checkedIn);
    setCheckedInBookings(checkedIn);

    // Load minibar items (for the popup)
    const storedMinibarItems = JSON.parse(localStorage.getItem('minibarItems')) || [];
    setMinibarItems(storedMinibarItems);

  }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = String(date.getFullYear()).slice(-2); // Use 2-digit year
        return `${day}-${month}-${year}`;
    };

    const handleCheckoutClick = (reservationId) => {
        setCurrentBookingId(reservationId);
        setShowCheckoutPopup(true);
        setSelectedMinibarItems({}); // Reset selected items
    };

  const handleCheckoutConfirm = () => {
    // 1. Find the booking
    const bookingIndex = checkedInBookings.findIndex(b => b.reservationId === currentBookingId);
    if (bookingIndex === -1) {
      console.error("Booking not found for checkout:", currentBookingId);
      return;
    }

    // 2. Update the booking: checkedIn = false, checkedOut = true, add minibar items
    const updatedBookings = [...checkedInBookings];
    updatedBookings[bookingIndex] = {
      ...updatedBookings[bookingIndex],
      checkedIn: false,
      checkedOut: true,
      minibarItems: selectedMinibarItems, // Add selected minibar items
    };

    // 3. Update minibar item stock in localStorage
    const updatedMinibarItems = minibarItems.map(item => {
      const consumedQuantity = selectedMinibarItems[item.id] || 0;
      return {
        ...item,
        stock: Math.max(0, item.stock - consumedQuantity), // Ensure stock doesn't go below 0
      };
    });
    localStorage.setItem('minibarItems', JSON.stringify(updatedMinibarItems));

    // 4. Update localStorage with the updated bookings
    const storedBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const updatedStoredBookings = storedBookings.map(booking => {
      if (booking.reservationId === currentBookingId) {
        return updatedBookings[bookingIndex];
      }
      return booking;
    });
    localStorage.setItem('bookings', JSON.stringify(updatedStoredBookings));

    // 5. Update state to remove from CheckedIn list
    setCheckedInBookings(updatedBookings.filter(b => b.reservationId !== currentBookingId));
    setShowCheckoutPopup(false);
    setCurrentBookingId(null);

    // 6. Navigate to Summary page
    navigate(`/booking-summary/${currentBookingId}`);
  };


    const handleCheckoutCancel = () => {
        setShowCheckoutPopup(false);
        setCurrentBookingId(null);
        setSelectedMinibarItems({}); // Clear selections
    };

    const handleMinibarSelect = (itemId, quantity) => {
      setSelectedMinibarItems(prevSelected => {
        const newSelected = { ...prevSelected };
        if (quantity > 0) {
          newSelected[itemId] = parseInt(quantity, 10); // Ensure it's a number
        } else {
          delete newSelected[itemId]; // Remove if quantity is 0 or less
        }
        return newSelected;
      });
    };

    // Calculate total due for a specific booking
    const calculateTotalDue = (booking) => {
        const totalPaid = (parseFloat(booking.advancePayment.amount) || 0) + (parseFloat(booking.totalReceived.amount) || 0);
        return Math.max(0, booking.totalAmount - totalPaid); // Ensure it's not negative
    };


  return (
    <div className="checked-in">
      <h2>Checked-In Guests</h2>
      {checkedInBookings.length === 0 ? (
        <p>No bookings have been checked in yet.</p>
      ) : (
        <table className="checked-in-table">
          <thead>
            <tr>
              <th>Reservation ID</th>
              <th>Guest Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Rooms</th>
              <th>Adults/Children</th>
              <th>Extras</th>
              <th>Total Amount (BDT)</th>
              <th>Advance (BDT)</th>
              <th>Received (BDT)</th>
              <th>Due (BDT)</th>
              <th>Checkout</th>
            </tr>
          </thead>
          <tbody>
            {checkedInBookings.map((booking) => (
              <tr key={booking.reservationId}>
                <td>{booking.reservationId}</td>
                <td>{booking.guestInfo.name}</td>
                <td>{booking.guestInfo.email}</td>
                <td>{booking.guestInfo.phone}</td>
                <td>{`${booking.guestInfo.address}, ${booking.guestInfo.city}, ${booking.guestInfo.country}`}</td>
                <td>
                  {booking.bookingDetails.map((roomDetail, index) => (
                    <div key={index}>{formatDate(roomDetail.checkInDate)}</div>
                  ))}
                </td>
                <td>
                  {booking.bookingDetails.map((roomDetail, index) => (
                    <div key={index}>{formatDate(roomDetail.checkOutDate)}</div>
                  ))}
                </td>
                <td>
                    {booking.bookingDetails.map((roomDetail, index) => (
                        <div key={index}>{roomDetail.room}</div>
                    ))}
                </td>
                <td>
                  {booking.bookingDetails.map((roomDetail, index) => (
                    <div key={index}>{roomDetail.adults} / {roomDetail.children}</div>
                  ))}
                </td>
                <td>
                    {booking.bookingDetails.map((roomDetail, index) => (
                        <div key={index}>
                        {roomDetail.extras.map((extra, extraIndex) => (
                            <div key={`extra-${index}-${extraIndex}`}>{extra.name} (Qty: {extra.quantity}, Price: {extra.price}{extra.nights && extra.nights > 1 ? `, Nights: ${extra.nights}` : ''})</div>
                        ))}
                        </div>
                    ))}
                </td>
                <td>{booking.totalAmount}</td>
                <td>{booking.advancePayment.amount}</td>
                <td>{booking.totalReceived.amount}</td>
                <td style={{ color: booking.totalDue > 0 ? '#ff6a6a' : 'inherit' }}>
                    {calculateTotalDue(booking)} {/* Use the function here */}
                </td>
                <td>
                    <span className="icon checkout-icon" onClick={() => handleCheckoutClick(booking.reservationId)}>
                        ❌
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
        {/* Checkout Popup */}
        {showCheckoutPopup && (
            <div className="popup">
                <div className="popup-content">
                    <h3>Select Minibar Items</h3>
                    <button className="close-button" onClick={handleCheckoutCancel}>X</button>
                    <div className="minibar-selection">
                        <div className='minibar-column'>
                            <h4>Amenities</h4>
                            {minibarItems.filter(item => item.category === 'Amenities').map(item => (
                                <div key={item.id} className="minibar-item">
                                    <label>
                                        {item.name} (BDT {item.price}):
                                        <input
                                            type="number"
                                            min="0"
                                            value={selectedMinibarItems[item.id] || 0}
                                            onChange={(e) => handleMinibarSelect(item.id, e.target.value)}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className='minibar-column'>
                            <h4>Minibar</h4>
                            {minibarItems.filter(item => item.category === 'Minibar').map(item => (
                                <div key={item.id} className="minibar-item">
                                    <label>
                                        {item.name} (BDT {item.price}):
                                        <input
                                            type="number"
                                            min="0"
                                            value={selectedMinibarItems[item.id] || 0}
                                            onChange={(e) => handleMinibarSelect(item.id, e.target.value)}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='popup-buttons'>
                        <button onClick={handleCheckoutConfirm}>Confirm Checkout</button>
                        <button onClick={handleCheckoutCancel}>Cancel</button>
                    </div>

                </div>
            </div>
        )}
    </div>
  );
};

export default CheckedIn;
